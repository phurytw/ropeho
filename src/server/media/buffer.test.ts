/**
 * @file Unit tests for the Buffer module
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../../test.d.ts" />
import { getBufferFromFile, bufferToStream } from "../media/buffer";
import { image } from "../../sampleData/testMedias";
import { should } from "chai";
import { stub } from "sinon";
import { createReadStream } from "fs";
import { join } from "path";
import * as http from "http";
import * as https from "https";
import * as mockFs from "mock-fs";
import * as fs from "fs";
should();

describe("Buffer tools", () => {
    const testImage: Buffer = new Buffer(image, "base64"),
        getHandler: Function = async (path: string, callback?: (res: http.IncomingMessage) => void) => {
            const stream: NodeJS.ReadableStream = createReadStream(testImageSrc);
            (stream as http.IncomingMessage).statusCode = 200;
            callback(stream as http.IncomingMessage);
        };
    let testImageSrc: string,
        fakeFs: typeof fs,
        createReadStreamStub: sinon.SinonStub,
        accessStub: sinon.SinonStub;
    before(() => {
        // Fake fs
        // Type definitions are wrong !!
        const mockedFs: any = mockFs.fs({ "logo.jpg": testImage });
        fakeFs = mockedFs as typeof fs;

        // Determine path from the fake fs
        testImageSrc = join(process.cwd(), "logo.jpg");

        // Stub the fs methods we need
        createReadStreamStub = stub(fs, "createReadStream", fakeFs.createReadStream);
        accessStub = stub(fs, "access", fakeFs.access);
    });
    after(() => {
        // Restore stubs and fs
        createReadStreamStub.restore();
        accessStub.restore();
        mockFs.restore();
    });
    describe("Converting resources to Buffer", () => {
        it("Should reject if a file does not exist", () =>
            getBufferFromFile(join(process.cwd(), "logo.jpeg")).should.be.rejected);
        it("Should get a Buffer from an image located in the file system", async () => {
            const testImage: Buffer = await getBufferFromFile(testImageSrc);
            testImage.should.not.be.empty;
        });
        it("Should get a Buffer from an image located in the worldwide web (HTTP)", async () => {
            const httpGetStub: sinon.SinonStub = stub(http, "get", getHandler),
                // tslint:disable-next-line:no-http-string
                testImage: Buffer = await getBufferFromFile("http://test.com/logo.png");
            testImage.should.not.be.empty;
            httpGetStub.restore();
        });
        it("Should get a Buffer from an image located in the worldwide web (HTTPS)", async () => {
            const httpsGetStub: sinon.SinonStub = stub(https, "get", getHandler),
                testImage: Buffer = await getBufferFromFile("https://test.com/logo.png");
            testImage.should.not.be.empty;
            httpsGetStub.restore();
        });
    });
    describe("Converting a Buffer into a Readable Stream", () => {
        it("Should reject if a file is not a Buffer", () => {
            should().throw(bufferToStream.bind(null, undefined));
            should().throw(bufferToStream.bind(null, 10));
            should().throw(bufferToStream.bind(null, "data"));
            should().throw(bufferToStream.bind(null, {}));
            should().throw(bufferToStream.bind(null, []));
        });
        it("Should return a readable stream that contains the Buffer data", (done: MochaDone) => {
            const stream: NodeJS.ReadableStream = bufferToStream(testImage);
            let data: Buffer = new Buffer(0);
            stream.on("data", (chunk: Buffer) => data = Buffer.concat([data, chunk]))
                .on("error", (err: Error) => { throw err; })
                .on("end", () => {
                    data.should.be.deep.equal(testImage);
                    done();
                });
        });
    });
});
