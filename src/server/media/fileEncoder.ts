/**
 * @file Functions that encode images and videos according to the configuration
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../typings.d.ts" />
import * as sharp from "sharp";
import ffmpeg = require("fluent-ffmpeg");
import { getBufferFromFile, bufferToStream } from "./buffer";
import { Stream } from "stream";
import config from "../../config";
import { fileSync, TmpFile } from "tmp";

import CreateWebMOptions = Ropeho.Media.CreateWebMOptions;

const { media: { imageEncoding: { quality }, videoEncoding: { fps, bitrate, resolution } } }: Ropeho.Configuration.ConfigurationObject = config;

/**
 * Create a lower quality webp image from another image
 * @param {string|Buffer} src a path to an image or a Buffer containing the image data
 * @param {string} dest if defined the encoded image will be created at this location
 * @returns {Promise<Buffer|sharp.OutputInfo>} a promise to a Buffer containing the new image data or the results of the operation if dest is defined
 */
export const createWebp: (src: string | Buffer, dest?: string) => Promise<Buffer | sharp.OutputInfo> =
    async (src: string | Buffer, dest?: string): Promise<Buffer | sharp.OutputInfo> => {
        if (typeof src === "string") {
            src = await getBufferFromFile(src as string);
        }
        if (!src || src instanceof Buffer === false) {
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
 * Create a lower quality webm video from another video
 * @param {string|Buffer|NodeJS.ReadableStream} src a path to an video or a Buffer containing the video data
 * @param {string} dest if defined the encoded video will be created at this location
 * @returns {Promise<Buffer>} a promise to a Buffer containing the new video data
 */
export const createWebm: (src: string | Buffer | NodeJS.ReadableStream, options?: CreateWebMOptions) => Promise<Buffer[]> =
    async (src: string | Buffer | NodeJS.ReadableStream, options: CreateWebMOptions = {}): Promise<Buffer[]> => {
        // Should be a path, a Buffer, or a readable stream
        if (typeof src === "string" ||
            src instanceof Buffer ||
            (typeof (src as NodeJS.ReadableStream).read === "function" && typeof (src as NodeJS.ReadableStream).readable === "boolean" && typeof (src as NodeJS.ReadableStream).on === "function" && src instanceof Stream)) {
            return new Promise<Buffer[]>((resolve: (value?: Buffer[] | PromiseLike<Buffer[]>) => void, reject: (reason?: any) => void) => {
                // If buffer convert it into a readable stream for ffmpeg
                if (src instanceof Buffer) {
                    src = bufferToStream(src);
                }

                // Encoding
                const { offset, duration, dest, thumbnail }: CreateWebMOptions = options;
                const command: any = ffmpeg(src).fps(fps).videoBitrate(bitrate).noAudio().size(resolution).format("webm");
                if (offset) {
                    command.seekInput(offset);
                }
                if (duration) {
                    command.duration(duration);
                }

                // Thumbnail
                const tmpFile: TmpFile = fileSync({ detachDescriptor: true });
                command.screenshot({
                    count: 1,
                    filename: tmpFile.name
                });
                const makeThumbnail: (webm: Buffer) => void = (webm: Buffer) => {
                    createWebp(tmpFile.name, thumbnail).then((thumbnail: Buffer) => {
                        tmpFile.removeCallback();
                        resolve([webm, thumbnail]);
                    }, (err: Error) => reject(err));
                };

                // Output
                if (dest) {
                    // Save to file
                    command.save(dest);
                    makeThumbnail(null);
                } else {
                    // Save to buffer
                    let data: Buffer = new Buffer(0);
                    command.pipe()
                        .on("error", (err: Error) => {
                            tmpFile.removeCallback();
                            reject(err);
                        })
                        .on("data", (chunk: Buffer) => data = Buffer.concat([data, chunk]))
                        .on("end", () => makeThumbnail(data));
                }
            });
        } else {
            throw new TypeError("Input must be a string, a Buffer or a readable stream");
        }
    };
