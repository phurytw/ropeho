/**
 * @file Socket.IO based application to send and receive files
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="typings.d.ts" />
import * as socketIo from "socket.io";
import { Server } from "http";
import { SocketState, Roles, MediaTypes, EntityType } from "../enum";
import mediaManager from "./media/mediaManager";
import GenericRepository from "./dal/genericRepository";
import GlobalRepository from "./dal/globalRepository";
import { map, filter, without, sumBy, isArray, isEmpty, head, cloneDeep, identity, includes } from "lodash";
import * as _ from "lodash";
import config from "../config";
import { deserializeCookie } from "./accounts/authorize";
import { createFileUploadTask, createProcessImageTask, createProcessVideoTask } from "./media/taskQueue";
import { createHash } from "crypto";
import { isMD5, isUUID } from "validator";
import { getMedias, getMediaFromEntity, getSourceFromMedia, getEntityType, updateMediaInEntity, updateSourceInMedia } from "./helpers/entityUtilities";
import uriFriendlyFormat from "./helpers/uriFriendlyFormat";
import { join, basename, extname } from "path";

import DownloadOptions = Ropeho.Socket.DownloadOptions;
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
const authPath: string = `https://localhost:${process.env.PORT || 8000}/auth`;
let io: SocketIO.Server;
const clients: { [key: string]: SocketClient } = {};

export const socketEvents: Ropeho.Socket.SocketEvents = {
    BadRequest: "bad_request",
    Connection: "connection",
    Disconnect: "disconnect",
    Download: "download",
    DownloadEnd: "download_end",
    DownloadInit: "download_init",
    Exception: "exception",
    Upload: "upload",
    UploadEnd: "upload_end",
    UploadInit: "upload_init"
};

export const init: (server: Server) => SocketIO.Server =
    (server: Server): SocketIO.Server => attach(socketIo(server));

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
        io.on(socketEvents.Connection, (client: SocketIO.Socket) => {
            clients[client.id] = {
                socket: client,
                state: SocketState.Idle,
                downloading: []
            };
            client.on(socketEvents.Exception, () => setState(client, SocketState.Idle));
            client.on(socketEvents.Disconnect, () => delete clients[client.id]);
            client.on(socketEvents.DownloadInit, async (downloadOptions: DownloadOptions) => {
                try {
                    if (!downloadOptions) {
                        client.emit(socketEvents.BadRequest, "Empty request");
                        return;
                    }
                    const { targets, cookie }: DownloadOptions = downloadOptions;

                    // Client must be authenticated
                    if (typeof cookie !== "string" || !cookie) {
                        client.emit(socketEvents.BadRequest, "Authentication is required");
                        return;
                    }

                    if (!isArray<SourceTargetOptions>(targets) ||
                        filter<SourceTargetOptions>(targets, (t: SourceTargetOptions) => !t.mainId || !t.mediaId || !t.sourceId || !isUUID(t.mainId) || !isUUID(t.mediaId) || !isUUID(t.sourceId)).length > 0) {
                        client.emit(socketEvents.BadRequest, "Invalid parameters");
                        return;
                    }

                    // Fobidden if client is already doing something
                    if (clients[client.id].state !== SocketState.Idle) {
                        client.emit(socketEvents.BadRequest, "Cannot perform download if client is busy");
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
                        client.emit(socketEvents.BadRequest, "Failed to authenticate");
                        setState(client, SocketState.Idle);
                        return;
                    }

                    // Check if resources exist
                    let productions: Production[];
                    try {
                        productions = await globalRepository.getById(_(targets).map<string>((t: SourceTargetOptions) => `${config.database.productions.namespace}${t.mainId}`).uniq().value()) as Production[];
                    } catch (error) {
                        client.emit(socketEvents.BadRequest, (error as Error).message);
                        setState(client, SocketState.Idle);
                        return;
                    }

                    // Check if user is allowed to download
                    if (user.role !== Roles.Administrator && _(productions).map<string>((p: Production) => p._id).difference(user.productionIds || []).value().length !== 0) {
                        client.emit(socketEvents.BadRequest, "User is not allowed to download medias of this entity");
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
                        client.emit(socketEvents.BadRequest, "No file to download was found");
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
                        data: Buffer;
                    }[] = [];
                    for (const path of paths) {
                        files = [...files, { path, data: await mediaManager.download(path) }];
                    }

                    // Calculate total size
                    const totalSize: number = sumBy<{
                        path: string;
                        data: Buffer;
                    }>(files, (file: {
                        path: string;
                        data: Buffer;
                    }) => file.data.length);

                    // Sending files
                    for (const file of files) {
                        client.emit(socketEvents.DownloadInit, {
                            file: file.path,
                            fileSize: file.data.length,
                            totalSize,
                            hash: createHash("md5").update(file.data).digest("hex")
                        });
                        for (let i: number = 0; i < file.data.length; i += chunkSize) {
                            if (clients[client.id] && clients[client.id].state === SocketState.Downloading) {
                                client.emit(socketEvents.Download, file.data.slice(i, i + chunkSize));
                            } else {
                                // If client is no longer downloading terminate
                                client.emit(socketEvents.DownloadEnd);
                                setState(client, SocketState.Idle);
                                return;
                            }
                        }
                    }

                    // Notify that download has been successful
                    clients[client.id].downloading = without<string>(clients[client.id].downloading, ...prodToBeLocked);
                    client.emit(socketEvents.DownloadEnd);
                    setState(client, SocketState.Idle);
                } catch (error) {
                    client.emit(socketEvents.Exception, "An unexpected error has occured");
                    setState(client, SocketState.Idle);
                }
            });
            client.on(socketEvents.UploadInit, async (uploadOptions: UploadOptions) => {
                try {
                    if (!uploadOptions) {
                        client.emit(socketEvents.BadRequest, "Empty request");
                        return;
                    }
                    const { hash, target, cookie, filename }: UploadOptions = uploadOptions;

                    // Client must be admin
                    if (typeof cookie !== "string" || !cookie) {
                        client.emit(socketEvents.BadRequest, "Authentication is required");
                        return;
                    }

                    // Fobidden if client is already doing something
                    if (clients[client.id].state !== SocketState.Idle) {
                        client.emit(socketEvents.BadRequest, "Cannot perform upload if client is busy");
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
                        client.emit(socketEvents.BadRequest, "Failed to authenticate");
                        setState(client, SocketState.Idle);
                        return;
                    }

                    // Check if user is admin
                    if (!user || user.role !== Roles.Administrator) {
                        client.emit(socketEvents.BadRequest, "Only administrators can perform this action");
                        setState(client, SocketState.Idle);
                        return;
                    }

                    // Check if request is valid
                    if (!target || !target.mainId || !target.mediaId || !target.sourceId || !isUUID(target.mainId) || !isUUID(target.mediaId) || !isUUID(target.sourceId) || !hash || !isMD5(hash)) {
                        client.emit(socketEvents.BadRequest, "Media requested is not valid");
                        setState(client, SocketState.Idle);
                        return;
                    }

                    // Check if resource exist
                    const resource: Production | Category | PresentationContainer = await globalRepository.getById(target.mainId);
                    let source: Source;
                    if (resource) {
                        const media: Media = _(getMedias(resource)).filter((m: Media) => m._id === target.mediaId).head();
                        if (media) {
                            source = _(media.sources).filter((s: Source) => s._id === target.sourceId).head();
                        }
                    }
                    if (!resource || !source) {
                        client.emit(socketEvents.BadRequest, "Requested file could not be found");
                        setState(client, SocketState.Idle);
                        return;
                    }

                    // Can't upload a file if someone is already uploading to it
                    if (includes<string>(getUploading(), resource._id)) {
                        client.emit(socketEvents.BadRequest, "Somebody is already uploading a file for that entity");
                        setState(client, SocketState.Idle);
                        return;
                    }

                    // Please send the file !!
                    clients[client.id].filename = filename;
                    clients[client.id].target = target;
                    clients[client.id].data = new Buffer(0);
                    clients[client.id].hash = hash;
                    client.emit(socketEvents.UploadInit);
                } catch (error) {
                    client.emit(socketEvents.Exception, "An unexpected error has occured");
                    setState(client, SocketState.Idle);
                }
            });
            client.on(socketEvents.Upload, (data: Buffer) => {
                if (clients[client.id].state !== SocketState.Uploading) {
                    client.emit(socketEvents.BadRequest, "User must initiate upload first");
                    return;
                }
                clients[client.id].data = Buffer.concat([clients[client.id].data, data]);
            });
            client.on(socketEvents.UploadEnd, async () => {
                if (clients[client.id].state !== SocketState.Uploading) {
                    client.emit(socketEvents.BadRequest, "User must initiate upload first");
                    return;
                }
                const { data, target, hash }: SocketClient = clients[client.id];
                clients[client.id].target = undefined;
                setState(client, SocketState.Idle);
                // MD5 Check
                // tslint:disable-next-line:possible-timing-attack
                if (createHash("md5").update(data).digest("hex") !== hash) {
                    client.emit(socketEvents.Exception, "A problem occured while receiving data");
                    return;
                }

                // Create new name if necessary
                const entity: Production | Category | PresentationContainer = await globalRepository.getById(target.mainId),
                    media: Media = getMediaFromEntity(entity, target.mediaId),
                    source: Source = getSourceFromMedia(media, target.sourceId),
                    entityType: EntityType = getEntityType(entity);
                let dest: string,
                    prevDest: string,
                    fallbackDest: string,
                    directory: string,
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
                        client.emit(socketEvents.Exception, "Cannot store media for this type of entity");
                        break;
                }
                if (!config.media.overwrite) {
                    if (!source.src) {
                        const filename: string = clients[client.id].filename || "";
                        if ((entity as Production | Category).name) {
                            subDir = uriFriendlyFormat((entity as Production | Category).name);
                        }
                        if (process.env.NODE_ENV === "production") {
                            // Use slashes for AWS
                            dest = source.src = `${directory}/${subDir}/${uriFriendlyFormat(`${source._id}_${filename}`)}`;
                            prevDest = source.preview = `${directory}/${subDir}/${uriFriendlyFormat(`${source._id}_${basename(filename, extname(filename))}_preview${extname(filename)}`)}`;
                            fallbackDest = source.fallback = `${directory}/${subDir}${uriFriendlyFormat(`${source._id}_${basename(filename, extname(filename))}_fallback${extname(filename)}`)}`;
                        } else {
                            // Use file system in development
                            dest = source.src = join(config.media.localDirectory, directory, subDir, uriFriendlyFormat(`${source._id}_${filename}`));
                            prevDest = source.preview = join(config.media.localDirectory, directory, subDir, uriFriendlyFormat(`${source._id}_${basename(filename, extname(filename))}_preview${extname(filename)}`));
                            fallbackDest = source.fallback = join(config.media.localDirectory, directory, subDir, uriFriendlyFormat(`${source._id}_${basename(filename, extname(filename))}_fallback${extname(filename)}`));
                        }
                    }
                    dest = source.src = await mediaManager.newName(source.src);
                    prevDest = source.preview = await mediaManager.newName(source.preview);
                    fallbackDest = source.fallback = await mediaManager.newName(source.fallback);
                } else {
                    dest = source.src;
                    prevDest = source.preview;
                    fallbackDest = source.fallback;
                }
                // Update the entity
                await globalRepository.update(updateMediaInEntity(entity, updateSourceInMedia(media, source)));
                // Fallback media only used in videos
                if (media.type !== MediaTypes.Video) {
                    fallbackDest = source.fallback = "";
                }
                // Upload / create WebM WebP
                switch (media.type) {
                    case MediaTypes.Video:
                        createProcessVideoTask({ data, dest: prevDest, fallbackDest });
                        break;
                    case MediaTypes.Slideshow:
                    case MediaTypes.Image:
                        createProcessImageTask({ data, dest: prevDest });
                        break;
                    default:
                        client.emit(socketEvents.Exception, "Unknown media type");
                        setState(client, SocketState.Idle);
                        return;
                }
                createFileUploadTask({
                    data,
                    dest
                });
                client.emit(socketEvents.UploadEnd);
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
