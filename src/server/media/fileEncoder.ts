/**
 * @file Functions that encode images and videos according to the configuration
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../typings.d.ts" />
import * as sharp from "sharp";
import ffmpeg = require("fluent-ffmpeg");
import { bufferToStream } from "./buffer";
import { Stream } from "stream";
import config from "../../config";
import { fileSync, TmpFile } from "tmp";

import CreateWebMOptions = Ropeho.Media.CreateWebMOptions;

const { media: { imageEncoding: { quality }, videoEncoding: { fps, bitrate } } }: Ropeho.Configuration.ConfigurationObject = config;

/**
 * Create a lower quality webp image from another image
 * @param {string|Buffer} src a path to an image or a Buffer containing the image data
 * @param {string} dest if defined the encoded image will be created at this location
 * @returns {Promise<Buffer|sharp.OutputInfo>} a promise to a Buffer containing the new image data or the results of the operation if dest is defined
 */
export const createWebp: (src: string | Buffer, dest?: string) => Promise<Buffer | sharp.OutputInfo> =
    async (src: string | Buffer, dest?: string): Promise<Buffer | sharp.OutputInfo> => {
        if (typeof src !== "string" && src instanceof Buffer === false) {
            throw new TypeError("Input should be a path or a Buffer");
        }
        const shrp: sharp.SharpInstance = sharp(src)
            .toFormat("webp", { quality });
        if (dest) {
            return shrp.toFile(dest);
        } else {
            return shrp.toBuffer();
        }
    };

/**
 * Create a lower quality jpeg image from another image
 * @param {string|Buffer} src a path to an image or a Buffer containing the image data
 * @param {string} dest if defined the encoded image will be created at this location
 * @returns {Promise<Buffer|sharp.OutputInfo>} a promise to a Buffer containing the new image data or the results of the operation if dest is defined
 */
export const createJpeg: (src: string | Buffer, dest?: string) => Promise<Buffer | sharp.OutputInfo> =
    async (src: string | Buffer, dest?: string): Promise<Buffer | sharp.OutputInfo> => {
        if (typeof src !== "string" && src instanceof Buffer === false) {
            throw new TypeError("Input should be a path or a Buffer");
        }
        const shrp: sharp.SharpInstance = sharp(src)
            .jpeg({ quality });
        if (dest) {
            return shrp.toFile(dest);
        } else {
            return shrp.toBuffer();
        }
    };

/**
 * Create a lower quality webm video from another video
 * @param {string|Buffer|NodeJS.ReadableStream} src a path to an video or a Buffer containing the video data
 * @param {CreateWebMOptions} options encoding options (duration, offset, destination)
 * @returns {Promise<Buffer>} a promise to a Buffer containing the new video data
 */
export const createWebm: (src: string | Buffer | NodeJS.ReadableStream, options?: CreateWebMOptions) => Promise<Buffer> =
    async (src: string | Buffer | NodeJS.ReadableStream, options: CreateWebMOptions = {}): Promise<Buffer> => {
        // Should be a path, a Buffer, or a readable stream
        if (typeof src === "string" ||
            src instanceof Buffer ||
            (typeof (src as NodeJS.ReadableStream).read === "function" && typeof (src as NodeJS.ReadableStream).readable === "boolean" && typeof (src as NodeJS.ReadableStream).on === "function" && src instanceof Stream)) {
            return new Promise<Buffer>((resolve: (value?: Buffer | PromiseLike<Buffer>) => void, reject: (reason?: any) => void) => {
                // If buffer convert it into a readable stream for ffmpeg
                if (src instanceof Buffer) {
                    src = bufferToStream(src);
                }

                // Encoding
                const { offset, duration, dest, setProgress }: CreateWebMOptions = options;
                const command: any = ffmpeg(src)
                    .videoCodec("libvpx-vp9")
                    .audioCodec("libopus")
                    .fps(fps)
                    .videoBitrate(bitrate)
                    .videoBitrate("64k")
                    .noAudio()
                    .format("webm")
                    .on("error", (err: Error) => reject(err));
                if (offset) {
                    command.seekInput(offset);
                }
                if (duration) {
                    command.duration(duration);
                }
                if (typeof setProgress === "function") {
                    command.on("progress", (progress: any) => {
                        setProgress(progress.percent);
                    });
                }

                // Output
                if (dest) {
                    // Save to file
                    command
                        .save(dest)
                        .on("end", () => resolve(null));
                } else {
                    // Save to buffer
                    let data: Buffer = new Buffer(0);
                    command.pipe()
                        .on("data", (chunk: Buffer) => data = Buffer.concat([data, chunk]))
                        .on("end", () => resolve(data));
                }
            });
        } else {
            throw new TypeError("Input must be a string, a Buffer or a readable stream");
        }
    };

/**
 * Create a screenshot of a video
 * @param {string|Buffer|NodeJS.ReadableStream} src a path to an video or a Buffer containing the video data
 * @param {string} dest if defined the screenshot will be created at this location
 * @param {string} timestamp time at which the screenshot will be taken
 * @returns {Promise<Buffer>} a promise to a Buffer containing the screenshot
 */
export const createScreenshot: (src: string | Buffer | NodeJS.ReadableStream, dest?: string, timestamp?: string) => Promise<Buffer> =
    async (src: string | Buffer | NodeJS.ReadableStream, dest: string = undefined, timestamp: string = "00:00:05"): Promise<Buffer> => {
        // Should be a path, a Buffer, or a readable stream
        if (typeof src === "string" ||
            src instanceof Buffer ||
            (typeof (src as NodeJS.ReadableStream).read === "function" && typeof (src as NodeJS.ReadableStream).readable === "boolean" && typeof (src as NodeJS.ReadableStream).on === "function" && src instanceof Stream)) {
            return new Promise<Buffer>((resolve: (value?: Buffer | PromiseLike<Buffer>) => void, reject: (reason?: any) => void) => {
                // If buffer convert it into a readable stream for ffmpeg
                if (src instanceof Buffer) {
                    src = bufferToStream(src);
                }

                if (dest) {
                    // create as file
                    ffmpeg(src)
                        .on("error", (err: Error) => {
                            reject(err);
                        })
                        .on("end", () => resolve(null))
                        .screenshot({
                            timestamps: [timestamp],
                            count: 1,
                            filename: dest
                        });
                } else {
                    // create as Buffer

                    // Thumbnail can obly be created in the file system
                    const tmpFile: TmpFile = fileSync();

                    ffmpeg(src)
                        .on("error", (err: Error) => {
                            tmpFile.removeCallback();
                            reject(err);
                        })
                        .on("end", () =>
                            createJpeg(tmpFile.name)
                                .then((thumbnail: Buffer) => {
                                    tmpFile.removeCallback();
                                    resolve(thumbnail);
                                }, (err: Error) => reject(err)))
                        .screenshot({
                            timestamps: [timestamp],
                            count: 1,
                            filename: tmpFile.name
                        });
                }
            });
        } else {
            throw new TypeError("Input must be a string, a Buffer or a readable stream");
        }
    };
