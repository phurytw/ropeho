/**
 * @file Helper functions that interact with NodeJS.Buffer
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../typings.d.ts" />
import { createReadStream, access } from "fs";
import { parse, Url } from "url";
import { get as httpGet, IncomingMessage } from "http";
import { get as httpsGet } from "https";
import { PassThrough } from "stream";

/**
 * Get a file from the file system or the worldwide web and converts it into a Buffer
 * @param {string} path path or URI to the file
 * @returns {Promise<Buffer>} a promise that gives a Buffer containing the file data
 */
export const getBufferFromFile: (path: string) => Promise<Buffer> =
    (path: string): Promise<Buffer> =>
        new Promise<Buffer>((resolve: (value?: Buffer | PromiseLike<Buffer>) => void, reject: (reason?: any) => void) => {
            let data: Buffer = new Buffer(0);
            // Check if path is from the web
            const urlObj: Url = parse(path);
            if (/https?:/.test(urlObj.protocol)) {
                const webFileGetHandler: (res: IncomingMessage) => void =
                    (res: IncomingMessage) => {
                        if (res.statusCode >= 400) {
                            reject(res.statusCode);
                        } else {
                            res.on("data", (chunk: Buffer) => data = Buffer.concat([data, chunk]));
                            res.on("error", (err: Error) => reject(err));
                            res.on("end", () => resolve(data));
                        }
                    };
                // tslint:disable-next-line:no-http-string
                if (urlObj.protocol === "http:") {
                    httpGet(path, webFileGetHandler);
                } else {
                    httpsGet(path, webFileGetHandler);
                }
            } else {
                // Path is from file system
                // Check if file exists
                access(path, (err: NodeJS.ErrnoException) => {
                    if (err) {
                        reject(err);
                    }
                    // Reads file into buffer
                    createReadStream(path)
                        .on("data", (chunk: Buffer) => data = Buffer.concat([data, chunk]))
                        .on("error", (err: Error) => reject(err))
                        .on("end", () => resolve(data));
                });
            }
        });

export const bufferToStream: (input: Buffer) => NodeJS.ReadableStream =
    (input: Buffer): NodeJS.ReadableStream => {
        if (!input || input instanceof Buffer === false) {
            throw new TypeError("Input must be a Buffer");
        }
        const stream: PassThrough = new PassThrough();
        stream.end(input);
        return stream;
    };
