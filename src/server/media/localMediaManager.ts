/**
 * @file Module that manages medias from a local directory
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../typings.d.ts" />
import { dirname, basename, join, isAbsolute } from "path";
import { constants, access, accessSync, createWriteStream, createReadStream, unlink, rename, readdirSync, rmdirSync, stat, Stats } from "fs";
import config from "../../config";
// import * as rimraf from "rimraf";
import * as mkdirp from "mkdirp";
import * as _ from "lodash";
import { includes } from "lodash";
/**
 * Uploads and downloads files to a local directory
 */
export default class MediaManager implements Ropeho.Media.IMediaManager {
    constructor(public baseDirectory: string = process.env.MEDIA_PATH || config.media.localDirectory) {
        this.baseDirectory = isAbsolute(baseDirectory) ? join(dirname(baseDirectory), basename(baseDirectory)) : join(process.cwd(), dirname(baseDirectory), basename(baseDirectory));
        mkdirp.sync(this.baseDirectory);
        // rimraf.sync(join(this.baseDirectory, "**", "*"));
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
                            .on("error", (err: Error) => {
                                reject(err);
                            });
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
                    createReadStream(path)
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
                        // Delete the directory if it's empty
                        this.deleteEmptyDirs(media).then(() => resolve(), (err: NodeJS.ErrnoException) => reject(err));
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
     * @return {Promise<boolean>} a promise that fulfills with true if the file exists
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
    /**
     * Gets the size of a file
     * @param {string} media path to the file
     * @return {Promise<number>} a promise that fulfills with the size of the file in bytes
     */
    filesize(media: string): Promise<number> {
        return new Promise<number>((resolve: (value?: number | PromiseLike<number>) => void, reject: (reason?: any) => void) => {
            media = join(this.baseDirectory, media);
            stat(media, (err: NodeJS.ErrnoException, stats: Stats) => {
                if (err) {
                    reject(new Error("File not found"));
                } else {
                    resolve(stats.size);
                }
            });
        });
    }
    /**
     * Create a new name for a file name to avoid overwriting it
     * @param {string} path path to the file
     * @return {Promise<string>} a promise that fulfills with the new file name
     */
    newName(path: string): Promise<string> {
        return new Promise<string>(async (resolve: (value?: string | PromiseLike<string>) => void, reject: (reason?: any) => void) => {
            try {
                const exists: boolean = await this.exists(path);
                if (!exists) {
                    resolve(path);
                } else {
                    const suffixRegex: RegExp = /^(.+?)(_\d+)?(\.[a-z0-9]+)$/i,
                        noExtRegex: RegExp = /^(.+?)(_\d+)?$/i,
                        files: string[] = readdirSync(dirname(join(this.baseDirectory, path)));
                    if (suffixRegex.test(path)) {
                        // i.e. test_file_2.txt => test_file_3.txt
                        // Get the base name
                        const base: string = basename(path).replace(suffixRegex, "$1");
                        // Get the number to append
                        const suffix: number = _(files)
                            // Filter names that has extension and the base name
                            .filter((s: string) => suffixRegex.test(s) && includes(s, base))
                            .map<RegExpExecArray>((s: string) => suffixRegex.exec(s))
                            // Only keep the duplicate suffix number
                            .filter((matches: RegExpExecArray) => matches[2])
                            .map<number>((matches: RegExpExecArray) => parseInt(matches[2].slice(1)))
                            // Minimum number is 1
                            .concat<number>([0])
                            .max();
                        resolve(path.replace(suffixRegex, `$1_${suffix + 1}$3`));
                    } else {
                        // i.e. .test_file => .test_file_1
                        // Get the base name
                        const base: string = basename(path).replace(noExtRegex, "$1");
                        // Get the number to append
                        const suffix: number = _(files)
                            // Filter names that has extension and the base name
                            .filter((s: string) => noExtRegex.test(s) && !suffixRegex.test(s) && includes(s, base))
                            .map<RegExpExecArray>((s: string) => noExtRegex.exec(s))
                            // Only keep the duplicate suffix number
                            .filter((matches: RegExpExecArray) => matches[2])
                            .map<number>((matches: RegExpExecArray) => parseInt(matches[2].slice(1)))
                            // Minimum number is 1
                            .concat<number>([0])
                            .max();
                        resolve(path.replace(noExtRegex, `$1_${suffix + 1}`));
                    }
                }
            } catch (error) {
                reject(error);
            }
        });
    }
    /**
     * Renames a file and moves it into its new destination folder if needed
     * @param {string} source the file to rename/moves
     * @param {string} dest the destination folder
     */
    rename(source: string, dest: string): Promise<void> {
        return new Promise<void>(async (resolve: () => void, reject: (reason?: any) => void) => {
            if (!(await this.exists(source))) {
                reject(new Error("File not found"));
            } else if (await this.exists(dest)) {
                reject(new Error("There's already a file at this destination"));
            } else {
                dest = join(this.baseDirectory, dest);
                // Create the directory if it does not exists
                mkdirp(dirname(dest), (err: any, made: string) => {
                    if (err) {
                        reject(err);
                    }
                    // Move the file to the new directory
                    rename(join(this.baseDirectory, source), dest, (err: NodeJS.ErrnoException) => {
                        if (err) {
                            reject(err);
                        }
                        // Delete source directory if it's empty
                        this.deleteEmptyDirs(source).then(() => resolve(), (err: NodeJS.ErrnoException) => reject(err));
                    });
                });
            }
        });
    }
    /**
     * Deletes empty folders given a path until the base directory is reached
     * @param {string} path folder to delete
     * @returns {Promise<void>} a promise
     */
    private deleteEmptyDirs(path: string): Promise<void> {
        return new Promise<void>((resolve: () => void, reject: (reason?: any) => void) => {
            let dir: string = dirname(path);
            while (dir !== ".") {
                const absoluteDir: string = join(this.baseDirectory, dir);
                try {
                    accessSync(absoluteDir, constants.F_OK);
                    const contents: string[] = readdirSync(absoluteDir);
                    if (contents.length === 0) {
                        rmdirSync(absoluteDir);
                        dir = dirname(dir);
                    } else {
                        break;
                    }
                } catch (error) {
                    reject(error);
                    break;
                }
            }
            resolve();
        });
    }
}
