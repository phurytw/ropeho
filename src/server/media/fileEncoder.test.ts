/**
 * @file Unit tests for the file encoder module
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../../test.d.ts" />
import { createWebp, createWebm, createScreenshot } from "../media/fileEncoder";
import * as fileEncoder from "../media/fileEncoder";
import { getBufferFromFile, bufferToStream } from "../media/buffer";
import { image, video } from "../../sampleData/testMedias";
import { should, use } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as sinonChai from "sinon-chai";
import { stub, spy } from "sinon";
import { join } from "path";
import * as mockFs from "mock-fs";
import * as fs from "fs";
import { accessSync, createWriteStream, constants } from "fs";
import { createReadStream } from "fs"; // fs functions used by toBuffer
import * as sharp from "sharp";
import ffmpeg = require("fluent-ffmpeg");
should();
use(sinonChai);
use(chaiAsPromised);

describe("Media encoder", () => {
    const testImage: Buffer = new Buffer(image, "base64"),
        testVideo: Buffer = new Buffer(video, "base64");
    let testImageSrc: string,
        testImageDest: string,
        fakeFs: typeof fs,
        accessStub: sinon.SinonStub,
        accessSyncStub: sinon.SinonStub,
        openSyncStub: sinon.SinonStub,
        statSyncStub: sinon.SinonStub,
        closeSyncStub: sinon.SinonStub,
        unlinkSyncStub: sinon.SinonStub,
        createReadStreamStub: sinon.SinonStub,
        createWriteStreamStub: sinon.SinonStub,
        sharpToFileStub: sinon.SinonStub,
        sharpToBufferStub: sinon.SinonStub,
        createWebmStub: sinon.SinonStub,
        ffmpegSaveStub: sinon.SinonStub,
        ffmpegPipeStub: sinon.SinonStub;
    before(async () => {
        // Fake fs
        // Type definitions are wrong !!
        const mockedFs: any = mockFs.fs({ "logo.jpg": new Buffer(image, "base64"), "video.mp4": new Buffer(video, "base64") });
        fakeFs = mockedFs as typeof fs;

        // Determine path from the fake fs
        testImageSrc = join(process.cwd(), "logo.jpg");
        testImageDest = join(process.cwd(), "logo.webp");

        // Stub the fs methods we need
        accessStub = stub(fs, "access", fakeFs.access);
        accessSyncStub = stub(fs, "accessSync", fakeFs.accessSync);
        createReadStreamStub = stub(fs, "createReadStream", fakeFs.createReadStream);
        createWriteStreamStub = stub(fs, "createWriteStream", fakeFs.createWriteStream);
        statSyncStub = stub(fs, "statSync", fakeFs.statSync);
        openSyncStub = stub(fs, "openSync", fakeFs.openSync);
        closeSyncStub = stub(fs, "closeSync", fakeFs.closeSync);
        unlinkSyncStub = stub(fs, "unlinkSync", fakeFs.unlinkSync);

        // ffmpeg stubs
        ffmpegSaveStub = stub(ffmpeg.prototype, "save", (path: string) => fakeFs.writeFileSync(path, video));
        ffmpegPipeStub = stub(ffmpeg.prototype, "pipe", () => createReadStream("video.mp4"));

        // Stub these so we write in mock fs instead
        sharpToBufferStub = stub(sharp.prototype, "toBuffer", async (): Promise<Buffer> => testImage);
        sharpToFileStub = stub(sharp.prototype, "toFile", async (dest: string): Promise<sharp.OutputInfo> => {
            if (dest && dest.length > 0) {
                const stream: NodeJS.WritableStream = createWriteStream(dest);
                stream.write(testImage);
                stream.end();
                return {
                    format: "webp",
                    width: 360,
                    height: 291,
                    channels: 4,
                    size: 25522
                };
            } else {
                throw new Error("Invalid destination path");
            }
        });
        createWebmStub = (() => {
            const original: typeof createWebm = createWebm.bind(fileEncoder);
            return stub(fileEncoder, "createWebm", async (src: string | Buffer | NodeJS.ReadableStream, options?: Ropeho.Media.CreateWebMOptions): Promise<Buffer> => {
                if (typeof src === "string") {
                    src = await getBufferFromFile(src);
                }
                if (options && options.dest) {
                    const data: Buffer = await original(src, { ...options, dest: undefined }),
                        stream: NodeJS.WritableStream = createWriteStream(options.dest);
                    stream.on("error", (err: NodeJS.ErrnoException) => { throw err; });
                    stream.write(data);
                    stream.end();
                    return null;
                } else {
                    return original(src, options);
                }
            });
        })();
    });
    after(() => {
        // Restore stubs and fs
        accessStub.restore();
        accessSyncStub.restore();
        createReadStreamStub.restore();
        createWriteStreamStub.restore();
        sharpToBufferStub.restore();
        sharpToFileStub.restore();
        createWebmStub.restore();
        ffmpegSaveStub.restore();
        ffmpegPipeStub.restore();
        openSyncStub.restore();
        statSyncStub.restore();
        closeSyncStub.restore();
        unlinkSyncStub.restore();
        mockFs.restore();
    });
    describe("Encoding images to webp", () => {
        it("Should reject if the input is neither a file nor a buffer", () =>
            createWebp(undefined).should.be.rejected);
        it("Should encode a file to a webp image", async () => {
            const outputInfo: sharp.OutputInfo = await createWebp(testImageSrc, testImageDest) as sharp.OutputInfo;
            should().not.throw(accessSync.bind(fakeFs, testImageDest, constants.F_OK));
            outputInfo.format.should.equal("webp");
        });
        it("Should encode a Buffer to a webp image", async () => {
            const outputInfo: sharp.OutputInfo = await createWebp(testImage, testImageDest) as sharp.OutputInfo;
            should().not.throw(accessSync.bind(fakeFs, testImageDest, constants.F_OK));
            outputInfo.format.should.equal("webp");
        });
        it("Should encode a file to a Buffer", async () => {
            const data: Buffer = await createWebp(testImageSrc) as Buffer;
            data.should.not.be.empty;
        });
        it("Should encode a Buffer to another Buffer", async () => {
            const data: Buffer = await createWebp(testImage) as Buffer;
            data.should.not.be.empty;
        });
    });
    describe("Encoding videos to webm", () => {
        it("Should reject if the input is neither a file nor a readable stream", () =>
            createWebm(undefined).should.be.rejected);
        it("Should encode a file to a webm video", async () => {
            await createWebm("video.mp4", { dest: "video.webm" });
            should().not.throw(accessSync.bind(null, "video.webm", constants.F_OK));
            fakeFs.unlink("video.webm");
        });
        it("Should encode a buffer to a webm video", async () => {
            await createWebm(testVideo, { dest: "video.webm" });
            should().not.throw(accessSync.bind(null, "video.webm", constants.F_OK));
            fakeFs.unlink("video.webm");
        });
        it("Should encode a readable stream to a webm video", async () => {
            await createWebm(bufferToStream(testVideo), { dest: "video.webm" });
            should().not.throw(accessSync.bind(null, "video.webm", constants.F_OK));
            fakeFs.unlink("video.webm");
        });
        it("Should encode a file to a buffer", async () => {
            const data: Buffer = await createWebm("video.mp4");
            data.should.not.be.empty;
        });
        it("Should encode a buffer to a buffer", async () => {
            const data: Buffer = await createWebm(testVideo);
            data.should.not.be.empty;
        });
        it("Should encode a readable stream to a buffer", async () => {
            const data: Buffer = await createWebm(bufferToStream(testVideo));
            data.should.not.be.empty;
        });
        it("Should clip the video", async () => {
            const durationSpy: sinon.SinonSpy = spy(ffmpeg.prototype, "duration"),
                seekInputSpy: sinon.SinonSpy = spy(ffmpeg.prototype, "seekInput");
            await createWebm(testVideo, { duration: 1, offset: 2 });
            durationSpy.should.have.been.calledWithExactly(1);
            seekInputSpy.should.have.been.calledWithExactly(2);
            durationSpy.restore();
            seekInputSpy.restore();
        });
    });
    describe("Creating thumbnails from a video", () => {
        let ffmpegScreenshotStub: sinon.SinonStub;
        let createWebpStub: sinon.SinonStub;
        before(() => {
            // tslint:disable-next-line:only-arrow-functions
            ffmpegScreenshotStub = stub(ffmpeg.prototype, "screenshot", function (): void {
                this.emit("end");
            });
            createWebpStub = stub(fileEncoder, "createWebp", (src: string, dest: string): Promise<Buffer> => new Promise<Buffer>((resolve: (value?: Buffer | PromiseLike<Buffer>) => void) => {
                if (dest) {
                    const stream: NodeJS.WritableStream = fs.createWriteStream(dest);
                    stream.write(testImage);
                    stream.end();
                    resolve();
                } else {
                    resolve(testImage);
                }
            }));
        });
        after(() => {
            ffmpegScreenshotStub.restore();
            createWebpStub.restore();
        });
        it("Should create a thumbnail in the file system", async () => {
            await createScreenshot(testVideo, "video.png");
            should().not.throw(accessSync.bind(null, "video.png", constants.F_OK));
            fakeFs.unlink("video.png");
        });
        it("Should create a thumbnail in memory", async () => {
            const data: Buffer = await createScreenshot(testVideo);
            data.should.deep.equal(testImage);
        });
    });
});
