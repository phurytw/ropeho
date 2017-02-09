/**
 * @file Module that manages medias from a local directory
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../typings.d.ts" />
import { dirname, basename, join } from "path";
import { constants, access, accessSync, createWriteStream, createReadStream, unlink } from "fs";
import config from "../../config";
import * as rimraf from "rimraf";
import * as mkdirp from "mkdirp";

/**
 * Uploads and downloads files to a local directory
 */
export default class MediaManager implements Ropeho.IMediaManager {
    constructor(public baseDirectory: string = config.media.localDirectory) {
        this.baseDirectory = join(process.cwd(), dirname(baseDirectory), basename(baseDirectory));
        mkdirp.sync(this.baseDirectory);
        rimraf.sync(join(this.baseDirectory, "**", "*"));
    }
    /**
     * Create a readable stream to a file at the specified path
     * @param {string} media file path from the base directory
     * @returns {NodeJS.ReadableStream} a readable stream
     */
    startDownload(media: string): NodeJS.ReadableStream {
        const path: string = join(this.baseDirectory, media);
        try {
            accessSync(path, constants.F_OK);
            return createReadStream(path);
        } catch (err) {
            throw err;
        }
    }
    /**
     * Create a writable stream to a file at the specified path
     * @param {string} media file path from the base directory
     * @returns {NodeJS.WritableStream} a writable stream
     */
    startUpload(media: string): NodeJS.WritableStream {
        const path: string = join(this.baseDirectory, media);
        try {
            accessSync(path, constants.F_OK);
            throw new Error("File already exists");
        } catch (err) {
            mkdirp.sync(dirname(path));
            return createWriteStream(path);
        }
    }
    /**
     * Save data into a file in the directory
     * @param {string} media file path from the base directory
     * @param {Buffer} data the data to save
     * @returns {Promise<void>} a promise
     */
    upload(media: string, data: Buffer): Promise<void> {
        return new Promise<void>((resolve: () => void, reject: (reason?: any) => void) => {
            const path: string = join(this.baseDirectory, media);
            access(path, constants.F_OK, (err: NodeJS.ErrnoException) => {
                if (err) {
                    mkdirp(dirname(path), (err: any, made: string) => {
                        if (err) {
                            reject(err);
                        }
                        const stream: NodeJS.WritableStream = createWriteStream(path)
                            .on("error", (err: Error) => reject(err));
                        stream.write(data);
                        stream.end();
                        resolve();
                    });
                } else {
                    reject("File exists");
                }
            });
        });
    }
    /**
     * Gets a Buffer of a file
     * @param {string} media path to a file relative to the base directory
     * @returns {Promise<Buffer>} a promise that gives the Buffer containing the file data
     */
    download(media: string): Promise<Buffer> {
        return new Promise<Buffer>((resolve: (value?: Buffer | PromiseLike<Buffer>) => void, reject: (reason?: any) => void) => {
            const path: string = join(this.baseDirectory, media);
            access(path, constants.F_OK, (err: NodeJS.ErrnoException) => {
                if (err) {
                    reject(new Error("File not found"));
                } else {
                    let data: Buffer = new Buffer(0);
                    const stream: NodeJS.ReadableStream = createReadStream(path)
                        .on("data", (chunk: Buffer) => data = Buffer.concat([data, chunk]))
                        .on("error", (err: Error) => reject(err))
                        .on("end", () => resolve(data));
                }
            });
        });
    }
    /**
     * Deletes a file
     * @param {string} media path to the file to delete
     * @returns {Promise<void>} a promise
     */
    delete(media: string): Promise<void> {
        return new Promise<void>((resolve: () => void, reject: (reason?: any) => void) => {
            const path: string = join(this.baseDirectory, media);
            access(path, constants.F_OK, (err: NodeJS.ErrnoException) => {
                if (err) {
                    reject(new Error("File not found"));
                } else {
                    unlink(path, (err: NodeJS.ErrnoException) => {
                        if (err) {
                            reject(err);
                        }
                        resolve();
                    });
                }
            });
        });
    }
    /**
     * Implementation of updatePermissions but does not do anything
     * @param {string} media path to the file
     * @param {boolean} permissions new permissions
     * @returns {Promise<void>} a promise
     */
    updatePermissions(media: string, permissions: boolean): Promise<void> {
        return new Promise<void>((resolve: () => void, reject: (reason?: any) => void) => {
            const path: string = join(this.baseDirectory, media);
            access(path, constants.F_OK, (err: NodeJS.ErrnoException) => {
                if (err) {
                    reject(new Error("File not found"));
                } else {
                    resolve();
                }
            });
        });
    }
    /**
     * Checks if file exists
     * @param {string} path path to the file
     * @return {Promise<boolean>} a promise that return
     */
    exists(path: string): Promise<boolean> {
        return new Promise<boolean>((resolve: (value?: boolean | PromiseLike<boolean>) => void, reject: (reason?: any) => void) => {
            path = join(this.baseDirectory, path);
            access(path, constants.F_OK, (err: NodeJS.ErrnoException) => {
                if (err) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });
    }
}
