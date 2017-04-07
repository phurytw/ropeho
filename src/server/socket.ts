/**
 * @file Socket.IO based application to send and receive files
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="typings.d.ts" />
import * as socketIo from "socket.io";
import { Server as HttpsServer } from "https";
import { Server as HttpServer } from "http";
import { SocketState, Roles, MediaTypes, EntityType, SocketEvents } from "../enum";
import mediaManager from "./media/mediaManager";
import tempMediaManager from "./media/tempMediaManager";
import GenericRepository from "./dal/genericRepository";
import GlobalRepository from "./dal/globalRepository";
import { map, filter, without, sumBy, isArray, isEmpty, cloneDeep, identity, includes } from "lodash";
import * as _ from "lodash";
import config from "../config";
import { deserializeCookie } from "./accounts/authorize";
import { createFileUploadTask, createProcessImageTask, createProcessVideoTask } from "./media/taskQueue";
import { createHash, Hash } from "crypto";
import { isMD5, isUUID } from "validator";
import { getMedias, getMediaFromEntity, getSourceFromMedia, getEntityType, updateMediaInEntity, updateSourceInMedia } from "../common/helpers/entityUtilities";
import uriFriendlyFormat from "../common/helpers/uriFriendlyFormat";
import { basename, extname, dirname } from "path";

import DownloadOptions = Ropeho.Socket.DownloadOptions;
import DownloadHashes = Ropeho.Socket.DownloadHashes;
import UploadOptions = Ropeho.Socket.UploadOptions;
import SourceTargetOptions = Ropeho.Socket.SourceTargetOptions;
import SocketClient = Ropeho.Socket.SocketClient;
import User = Ropeho.Models.User;
import Production = Ropeho.Models.Production;
import PresentationContainer = Ropeho.Models.PresentationContainer;
import Category = Ropeho.Models.Category;
import Source = Ropeho.Models.Source;
import Media = Ropeho.Models.Media;

const globalRepository: Ropeho.Models.IGenericRepository<Production> = new GlobalRepository({
    ...config.redis,
    idProperty: config.database.defaultIdProperty
});
const userRepository: Ropeho.Models.IGenericRepository<User> = new GenericRepository<User>({
    ...config.redis,
    ...config.database.users
});
const chunkSize: number = config.media.chunkSize;
let io: SocketIO.Server;
const clients: { [key: string]: SocketClient } = {};

export const init: (server: HttpsServer | HttpServer) => SocketIO.Server =
    (server: HttpsServer | HttpServer): SocketIO.Server => attach(socketIo(server));

export const attach: (incomingIo: SocketIO.Server) => SocketIO.Server =
    (incomingIo: SocketIO.Server): SocketIO.Server => {
        io = incomingIo;
        const setState: (client: SocketIO.Socket, state: number) => void =
            (client: SocketIO.Socket, state: number) => {
                const { id }: SocketIO.Socket = client;
                if (clients[id]) {
                    clients[id].state = state;
                }
            };
        io.on(SocketEvents.Connection, (client: SocketIO.Socket) => {
            clients[client.id] = {
                socket: client,
                state: SocketState.Idle,
                downloading: []
            };
            client.on(SocketEvents.Exception, () => setState(client, SocketState.Idle));
            client.on(SocketEvents.Disconnect, () => delete clients[client.id]);
            client.on(SocketEvents.DownloadInit, async (downloadOptions: DownloadOptions) => {
                try {
                    if (!downloadOptions) {
                        client.emit(SocketEvents.BadRequest, "Empty request");
                        return;
                    }
                    const { targets }: DownloadOptions = downloadOptions;

                    // Client must be authenticated
                    const cookie: string = clients[client.id].cookie;
                    if (typeof cookie !== "string" || !cookie) {
                        client.emit(SocketEvents.BadRequest, "Authentication is required");
                        return;
                    }

                    if (!isArray<SourceTargetOptions>(targets) ||
                        filter<SourceTargetOptions>(targets, (t: SourceTargetOptions) => !t.mainId || !t.mediaId || !t.sourceId || !isUUID(t.mainId) || !isUUID(t.mediaId) || !isUUID(t.sourceId)).length > 0) {
                        client.emit(SocketEvents.BadRequest, "Invalid parameters");
                        return;
                    }

                    // Fobidden if client is already doing something
                    if (clients[client.id].state !== SocketState.Idle) {
                        client.emit(SocketEvents.BadRequest, "Cannot perform download if client is busy");
                        return;
                    }
                    clients[client.id].state = SocketState.Downloading;

                    // Authenticate user
                    let user: User;
                    try {
                        const userId: string = await deserializeCookie(cookie);
                        user = await userRepository.getById(userId);
                        if (!user) {
                            throw new Error(`Failed to authenticate ${userId}`);
                        }
                    } catch (error) {
                        client.emit(SocketEvents.BadRequest, "Failed to authenticate");
                        setState(client, SocketState.Idle);
                        return;
                    }

                    // Check if resources exist
                    let productions: Production[];
                    try {
                        productions = await globalRepository.getById(_(targets).map<string>((t: SourceTargetOptions) => `${config.database.productions.namespace}${t.mainId}`).uniq().value()) as Production[];
                    } catch (error) {
                        client.emit(SocketEvents.BadRequest, (error as Error).message);
                        setState(client, SocketState.Idle);
                        return;
                    }

                    // Check if user is allowed to download
                    if (user.role !== Roles.Administrator && _(productions).map<string>((p: Production) => p._id).difference(user.productionIds || []).value().length !== 0) {
                        client.emit(SocketEvents.BadRequest, "User is not allowed to download medias of this entity");
                        setState(client, SocketState.Idle);
                        return;
                    }

                    // Find target sources
                    let sources: Source[] = [];
                    let prodToBeLocked: string[] = [];
                    for (const t of targets) {
                        const prod: Production = _(productions).filter(identity).filter((p: Production) => p._id === t.mainId).head();
                        if (prod) {
                            const media: Media = getMediaFromEntity(prod, t.mediaId);
                            if (media) {
                                const source: Source = getSourceFromMedia(media, t.sourceId);
                                if (source) {
                                    sources = [...sources, source];
                                    prodToBeLocked = [...prodToBeLocked, prod._id];
                                }
                            }
                        }
                    }
                    if (isEmpty(sources)) {
                        client.emit(SocketEvents.BadRequest, "No file to download was found");
                        setState(client, SocketState.Idle);
                        return;
                    }

                    // Get paths
                    const paths: string[] = map<Source, string>(sources, (s: Source) => s.src);

                    // Lock files while downloading
                    clients[client.id].downloading = [...clients[client.id].downloading, ...prodToBeLocked];

                    // Getting files
                    let files: {
                        path: string;
                        size: number;
                    }[] = [];
                    for (const path of paths) {
                        files = [...files, { path, size: await mediaManager.filesize(path) }];
                    }

                    // Calculate total size
                    const totalSize: number = sumBy<{
                        path: string;
                        size: number;
                    }>(files, (file: {
                        path: string;
                        size: number;
                    }) => file.size);

                    // MD5 hashes
                    const md5Hashes: DownloadHashes = {};

                    // Sending files
                    for (const file of files) {
                        client.emit(SocketEvents.DownloadInit, {
                            file: file.path,
                            fileSize: file.size,
                            totalSize
                        });
                        const stream: NodeJS.ReadableStream = mediaManager.startDownload(file.path);
                        const hash: Hash = createHash("md5");
                        let data: Buffer;
                        do {
                            data = stream.read(chunkSize) as Buffer;
                            if (data) {
                                if (clients[client.id] && clients[client.id].state === SocketState.Downloading) {
                                    hash.update(data);
                                    client.emit(SocketEvents.Download, data);
                                } else {
                                    // If client is no longer downloading terminate
                                    client.emit(SocketEvents.DownloadEnd);
                                    setState(client, SocketState.Idle);
                                    return;
                                }
                            }
                        } while (data);
                        md5Hashes[file.path] = hash.digest("hex");
                    }

                    // Notify that download has been successful
                    clients[client.id].downloading = without<string>(clients[client.id].downloading, ...prodToBeLocked);
                    client.emit(SocketEvents.DownloadEnd, md5Hashes);
                    setState(client, SocketState.Idle);
                } catch (error) {
                    client.emit(SocketEvents.Exception, "An unexpected error has occured");
                    setState(client, SocketState.Idle);
                }
            });
            client.on(SocketEvents.UploadInit, async (uploadOptions: UploadOptions) => {
                try {
                    if (!uploadOptions) {
                        client.emit(SocketEvents.BadRequest, "Empty request");
                        return;
                    }
                    const { target }: UploadOptions = uploadOptions;

                    // Client must be admin
                    const cookie: string = clients[client.id].cookie;
                    if (typeof cookie !== "string" || !cookie) {
                        client.emit(SocketEvents.BadRequest, "Authentication is required");
                        return;
                    }

                    // Fobidden if client is already doing something
                    if (clients[client.id].state !== SocketState.Idle) {
                        client.emit(SocketEvents.BadRequest, "Cannot perform upload if client is busy");
                        return;
                    }
                    clients[client.id].state = SocketState.Uploading;

                    // Authenticate user
                    let user: User;
                    try {
                        const userId: string = await deserializeCookie(cookie);
                        user = await userRepository.getById(userId);
                        if (!user) {
                            throw new Error(`Failed to authenticate ${userId}`);
                        }
                    } catch (error) {
                        client.emit(SocketEvents.BadRequest, "Failed to authenticate");
                        setState(client, SocketState.Idle);
                        return;
                    }

                    // Check if user is admin
                    if (!user || user.role !== Roles.Administrator) {
                        client.emit(SocketEvents.BadRequest, "Only administrators can perform this action");
                        setState(client, SocketState.Idle);
                        return;
                    }

                    // Check if request is valid
                    if (!target || !target.mainId || !target.mediaId || !target.sourceId || !isUUID(target.mainId) || !isUUID(target.mediaId) || !isUUID(target.sourceId)) {
                        client.emit(SocketEvents.BadRequest, "Media requested is not valid");
                        setState(client, SocketState.Idle);
                        return;
                    }

                    // Check if resource exist
                    const resource: Production | Category | PresentationContainer = await globalRepository.getById(target.mainId);
                    let media: Media;
                    let source: Source;
                    if (resource) {
                        media = _(getMedias(resource)).filter((m: Media) => m._id === target.mediaId).head();
                        if (media) {
                            source = _(media.sources).filter((s: Source) => s._id === target.sourceId).head();
                        }
                    }
                    if (!resource || !source) {
                        client.emit(SocketEvents.BadRequest, "Requested file could not be found");
                        setState(client, SocketState.Idle);
                        return;
                    }

                    // Can't upload a file if someone is already uploading to it
                    if (includes<string>(getUploading(), resource._id)) {
                        client.emit(SocketEvents.BadRequest, "Somebody is already uploading a file for that entity");
                        setState(client, SocketState.Idle);
                        return;
                    }

                    // Compute file name
                    const entityType: EntityType = getEntityType(resource);
                    let directory: string,
                        subDir: string = "";
                    // Find which directory to use
                    switch (entityType) {
                        case EntityType.Production:
                            directory = "productions";
                            break;
                        case EntityType.Category:
                            directory = "categories";
                            break;
                        case EntityType.PresentationContainer:
                            directory = "home";
                            break;
                        default:
                            client.emit(SocketEvents.Exception, "Cannot store media for this type of entity");
                            break;
                    }
                    // Use the name of the Production/Category when possible
                    if ((resource as Production | Category).name) {
                        subDir = uriFriendlyFormat((resource as Production | Category).name);
                    }
                    // Create a unique filename
                    const filename: string = uploadOptions.filename || "";
                    source.src = `${directory}/${subDir}/${uriFriendlyFormat(`${source._id}_${filename}`)}`;
                    source.preview = `${directory}/${subDir}/${uriFriendlyFormat(`${source._id}_${basename(filename, extname(filename))}_preview${extname(filename)}`)}`;
                    source.fallback = `${directory}/${subDir}/${uriFriendlyFormat(`${source._id}_${basename(filename, extname(filename))}_fallback${extname(filename)}`)}`;
                    source.src = await mediaManager.newName(source.src);
                    source.preview = await mediaManager.newName(source.preview);
                    source.fallback = await mediaManager.newName(source.fallback);

                    // Please send the file !!
                    clients[client.id].target = target;
                    clients[client.id].uploadStream = tempMediaManager.startUpload(source.src);
                    clients[client.id].hash = createHash("md5");
                    clients[client.id].sourceTarget = source;
                    clients[client.id].entityTarget = resource;
                    clients[client.id].mediaTarget = media;
                    client.emit(SocketEvents.UploadInit);
                } catch (error) {
                    client.emit(SocketEvents.Exception, "An unexpected error has occured");
                    setState(client, SocketState.Idle);
                }
            });
            client.on(SocketEvents.Upload, (data: ArrayBuffer) => {
                try {
                    if (clients[client.id].state !== SocketState.Uploading) {
                        client.emit(SocketEvents.BadRequest, "User must initiate upload first");
                        return;
                    }
                    const buffer: Buffer = Buffer.from(data);
                    clients[client.id].uploadStream.write(buffer);
                    (clients[client.id].hash as Hash).update(buffer);
                } catch (error) {
                    client.emit(SocketEvents.Exception, "An unexpected error has occured");
                    setState(client, SocketState.Idle);
                }
            });
            client.on(SocketEvents.UploadEnd, async (expectedHash: string) => {
                try {
                    if (clients[client.id].state !== SocketState.Uploading) {
                        client.emit(SocketEvents.BadRequest, "User must initiate upload first");
                        return;
                    }
                    const { uploadStream, hash, sourceTarget, entityTarget, mediaTarget }: SocketClient = clients[client.id];
                    clients[client.id].target = undefined;
                    setState(client, SocketState.Idle);
                    // MD5 Check
                    // tslint:disable-next-line:possible-timing-attack
                    if (!expectedHash || !isMD5(expectedHash) || (hash as Hash).digest("hex") !== expectedHash) {
                        client.emit(SocketEvents.Exception, "A problem occured while receiving data");
                        return;
                    }

                    // Close the stream
                    uploadStream.end();

                    // File size
                    sourceTarget.fileSize = await tempMediaManager.filesize(sourceTarget.src);

                    // Start converting tasks
                    createFileUploadTask({
                        source: sourceTarget.src,
                        dest: sourceTarget.src
                    });

                    // Upload / create WebM WebP
                    switch (mediaTarget.type) {
                        case MediaTypes.Video:
                            // Add extensions to converted files
                            sourceTarget.preview = `${dirname(sourceTarget.preview)}/${basename(sourceTarget.preview, extname(sourceTarget.preview))}.webm`;
                            sourceTarget.fallback = `${dirname(sourceTarget.fallback)}/${basename(sourceTarget.fallback, extname(sourceTarget.fallback))}.webp`;
                            // Create video conversion task
                            createProcessVideoTask({
                                source: sourceTarget.src,
                                dest: sourceTarget.preview,
                                fallbackDest: sourceTarget.fallback
                            });
                            break;
                        case MediaTypes.Slideshow:
                        case MediaTypes.Image:
                            // Add extensions to converted files
                            sourceTarget.preview = `${dirname(sourceTarget.preview)}/${basename(sourceTarget.preview, extname(sourceTarget.preview))}.webp`;
                            // Create image conversion task
                            createProcessImageTask({
                                source: sourceTarget.src,
                                dest: sourceTarget.preview
                            });
                            break;
                        default:
                            client.emit(SocketEvents.Exception, "Unknown media type");
                            setState(client, SocketState.Idle);
                            return;
                    }

                    // Update source with the real paths
                    sourceTarget.src = `${config.endPoints.api.host}:${config.endPoints.api.port}/${sourceTarget.src}`;
                    sourceTarget.preview = `${config.endPoints.api.host}:${config.endPoints.api.port}/${sourceTarget.preview}`;
                    sourceTarget.fallback = `${config.endPoints.api.host}:${config.endPoints.api.port}/${sourceTarget.fallback}`;

                    // Fallback media only used in videos
                    if (mediaTarget.type !== MediaTypes.Video) {
                        sourceTarget.fallback = "";
                    }

                    // Update the entity
                    await globalRepository.update(updateMediaInEntity(entityTarget, updateSourceInMedia(mediaTarget, sourceTarget)));

                    client.emit(SocketEvents.UploadEnd);
                } catch (error) {
                    client.emit(SocketEvents.Exception, "An unexpected error has occured");
                    setState(client, SocketState.Idle);
                }
            });
        });
        return io;
    };

export const getLocked: () => string[] =
    (): string[] => _(clients).values<SocketClient>().flatMap<string>((c: SocketClient) => [...(c.target ? [c.target.mainId] : []), ...c.downloading]).uniq().value();

export const getUploading: () => string[] =
    (): string[] => _(clients).values<SocketClient>().flatMap<string>((c: SocketClient) => c.target ? [c.target.mainId] : []).uniq().value();

export const getDownloading: () => string[] =
    (): string[] => _(clients).values<SocketClient>().flatMap<string>((c: SocketClient) => c.downloading).uniq().value();

export const getClients: () => { [key: string]: SocketClient } = (): { [key: string]: SocketClient } => cloneDeep(clients);

export const kickClient: (clientId: string) => void =
    (clientId: string): void => {
        if (clients[clientId]) {
            clients[clientId].socket.disconnect(true);
            delete clients[clientId];
        } else {
            throw new Error(`Client with ID ${clientId} could not be found`);
        }
    };

export const assignCookieToClient: (clientId: string, cookie?: string) => void =
    (clientId: string, cookie?: string): void => {
        if (clients[clientId]) {
            clients[clientId].cookie = cookie;
        }
    };
