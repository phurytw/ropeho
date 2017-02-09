/**
 * @file Socket.IO based application to send and receive files
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="typings.d.ts" />
import * as socketIo from "socket.io";
import { Server } from "http";
import fetch from "node-fetch";
import { Response } from "node-fetch";
import { SocketState, MediaTypes } from "../enum";
import mediaManager from "./media/mediaManager";
import genericRepository from "./dal/genericRepository";
import { map, filter, flatten, sumBy } from "lodash";
import * as _ from "lodash";
import config from "../config";
import * as redis from "redis";

import DownloadOptions = Ropeho.Socket.DownloadOptions;
import UploadOptions = Ropeho.Socket.UploadOptions;
import DownloadData = Ropeho.Socket.DownloadData;
import User = Ropeho.Models.User;
import Production = Ropeho.Models.Production;
import Source = Ropeho.Models.Source;
import Media = Ropeho.Models.Media;

const productionRepository: Ropeho.IGenericRepository<Production> = new genericRepository<Production>({
    ...config.redis,
    ...config.database.productions
});
const redisClient: redis.RedisClient = redis.createClient(config.redis);
const chunkSize: number = config.media.chunkSize;
const authPath: string = `https://localhost:${process.env.PORT || 8000}/auth`;

export const socketEvents: Ropeho.Socket.SocketEvents = {
    BadRequest: "bad_request",
    Connection: "connection",
    Disconnect: "disconnect",
    Download: "download",
    DownloadEnd: "download_end",
    DownloadInit: "download_init",
    Error: "error",
    Upload: "upload",
    UploadEnd: "upload_end",
    UploadInit: "upload_init"
};

export const init: (server: Server) => SocketIO.Server =
    (server: Server): SocketIO.Server => attach(socketIo(server));

export const attach: (io: SocketIO.Server) => SocketIO.Server =
    (io: SocketIO.Server): SocketIO.Server => {
        const clients: {
            [key: string]: {
                socket: SocketIO.Socket,
                state: SocketState
            }
        } = {};
        io.on(socketEvents.Connection, (client: SocketIO.Socket) => {
            clients[client.id] = {
                socket: client,
                state: SocketState.Idle
            };
            client.on(socketEvents.Disconnect, () => delete clients[client.id]);
            client.on(socketEvents.DownloadInit, async (downloadOptions: DownloadOptions) => {
                try {
                    // Authenticate user
                    const response: Response = await fetch(authPath, {
                        headers: { "Cookie": `${config.session.name}=${downloadOptions.cookie}` }
                    });
                    const user: User = await response.json();
                    if (response.status !== 200 || !user._id) {
                        client.emit(socketEvents.BadRequest, "Authentication is required");
                        return;
                    }
                    const { entities }: DownloadOptions = downloadOptions;

                    // Check if resources exist
                    const validProductions: Production[] = await productionRepository.get({ _id: { $or: _(entities).filter((prod: Production) => prod._id).map<string>((prod: Production) => prod._id).value() } }) as Production[];
                    if (validProductions.length !== entities.length) {
                        client.emit(socketEvents.BadRequest, `The following productions were not found: ${JSON.stringify(filter<Production>(entities, (prod: Production) => filter<Production>(validProductions, (validProd: Production) => validProd._id === prod._id).length === 0))}`);
                    }
                    const medias: Media[] = [];
                    if (medias.length === 0) {
                        client.emit(socketEvents.BadRequest, "Not a single media found. User may have requested an inexistent media or may not be authorized to download it.");
                        return;
                    }

                    // Get paths
                    const paths: string[] = flatten<string>(map<Media, string[]>(medias, (media: Media) => {
                        switch (media.type) {
                            case MediaTypes.Image:
                            case MediaTypes.Slideshow:
                                return map<Source, string>(media.sources, (source: Source) => source.src);
                            case MediaTypes.Video:
                                return map<Source, string>(filter<Source>(media.sources, (source: Source) => source._id === media.rawId), (source: Source) => source.src);
                        }
                    }));

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
                    clients[client.id].state = SocketState.Downloading;
                    for (const file of files) {
                        for (let i: number = 0; i < file.data.length; i += chunkSize) {
                            if (clients[client.id].state === SocketState.Downloading) {
                                client.emit(socketEvents.Download, ({
                                    file: file.path,
                                    fileSize: file.data.length,
                                    totalSize,
                                    data: file.data.slice(i, i + chunkSize)
                                }) as DownloadData);
                            } else {
                                // If client is no longer downloading terminate
                                client.emit(socketEvents.DownloadEnd);
                                return;
                            }
                        }
                    }

                    // Notify that download has been successful
                    client.emit(socketEvents.DownloadEnd);
                } catch (error) {
                    client.emit("error", "An unexpected error has occured");
                }
            });
            client.on(socketEvents.Error, () => clients[client.id].state = SocketState.Idle);
            client.on(socketEvents.UploadInit, async (uploadOptions: UploadOptions) => {
                // Authenticate user
                const response: Response = await fetch(authPath, {
                    headers: { "Cookie": `${config.session.name}=${uploadOptions.cookie}` }
                });
                if (response.status !== 200) {
                    client.emit(socketEvents.BadRequest, "Authentication is required");
                    return;
                }
                const user: User = response.body;
            });
        });
        return io;
    };
