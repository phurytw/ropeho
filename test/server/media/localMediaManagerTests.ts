/**
 * @file Unit tests for the local media manager module
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../../typings.d.ts" />
import MediaManager from "../../../src/server/media/localMediaManager";
import config from "../../../src/config";
import { should } from "chai";
import { accessSync, statSync, stat, readdirSync } from "fs";
import { access, createWriteStream, createReadStream, unlink } from "fs"; // fs functions used in MediaManager
import { mkdirSync, mkdir } from "fs"; // fs functions used in mkdirp
import { join } from "path";
import { stub } from "sinon";
import * as mockFs from "mock-fs";
import * as fs from "fs";
should();

describe("Local media manager", () => {
    const path: string = join(process.cwd(), config.media.localDirectory),
        testFile: string = "test/sub_test/file.txt",
        nonExistentFile: string = "test/sub_test/aNotExistentFile.txt",
        testFileData: Buffer = new Buffer("This is a text file", "UTF-8");
    let mediaManager: Ropeho.IMediaManager,
        fakeFs: typeof fs,
        accessSyncStub: sinon.SinonStub,
        statSyncStub: sinon.SinonStub,
        statStub: sinon.SinonStub,
        readdirSyncStub: sinon.SinonStub,
        accessStub: sinon.SinonStub,
        createWriteStreamStub: sinon.SinonStub,
        createReadStreamStub: sinon.SinonStub,
        unlinkStub: sinon.SinonStub,
        mkdirSyncStub: sinon.SinonStub,
        mkdirStub: sinon.SinonStub;
    before(() => {
        // Type definitions are wrong !!
        const mockedFs: any = mockFs.fs({});
        fakeFs = mockedFs as typeof fs;

        // Stub the fs methods we need
        accessSyncStub = stub(fs, "accessSync", fakeFs.accessSync);
        accessStub = stub(fs, "access", fakeFs.access);
        createReadStreamStub = stub(fs, "createReadStream", fakeFs.createReadStream);
        statSyncStub = stub(fs, "statSync", fakeFs.statSync);
        statStub = stub(fs, "stat", fakeFs.stat);
        readdirSyncStub = stub(fs, "readdirSync", fakeFs.readdirSync);
        createWriteStreamStub = stub(fs, "createWriteStream", fakeFs.createWriteStream);
        unlinkStub = stub(fs, "unlink", fakeFs.unlink);
        mkdirSyncStub = stub(fs, "mkdirSync", fakeFs.mkdirSync);
        mkdirStub = stub(fs, "mkdir", fakeFs.mkdir);
    });
    after(() => {
        // Restore stubs and fs
        accessSyncStub.restore();
        statSyncStub.restore();
        statStub.restore();
        readdirSyncStub.restore();
        accessStub.restore();
        createWriteStreamStub.restore();
        createReadStreamStub.restore();
        unlinkStub.restore();
        mkdirSyncStub.restore();
        mkdirStub.restore();
        mockFs.restore();
    });
    describe("Instantiating", async () => {
        it("Should create an empty media folder", () => {
            mediaManager = new MediaManager();
            statSync(path).isDirectory().should.be.true;
            readdirSync(path).should.be.empty;
        });
    });
    describe("Uploading", async () => {
        it("Should accept a path to a file and create directories if necessary", async () => {
            const promise: Promise<void> = mediaManager.upload(testFile, testFileData);
            promise.should.be.fulfilled;
            await promise;
            statSync(join((mediaManager as MediaManager).baseDirectory, testFile)).isFile().should.be.true;
        });
        it("Should reject if the file already exists", () =>
            mediaManager.upload(testFile, new Buffer("This is a text file", "UTF-8")).should.be.rejected);
        it("Should reject a path to a directory", () =>
            mediaManager.upload("/test/sub_test", new Buffer("This is a text file", "UTF-8")).should.be.rejected);
    });
    describe("Downloading", async () => {
        it("Should reject if the file does not exist", () =>
            mediaManager.download(nonExistentFile).should.be.rejected);
        it("Should download a file", async () => {
            const promise: Promise<Buffer> = mediaManager.download(testFile);
            promise.should.be.fulfilled;
            const data: Buffer = await promise;
            data.should.deep.equal(testFileData);
        });
    });
    describe("Permissions", async () => {
        it("Changing permissions should reject if the file does not exist", () =>
            mediaManager.updatePermissions(nonExistentFile, false).should.be.rejected);
        it("Calling permissions related functions should return an empty promise", async () => {
            statSync(join((mediaManager as MediaManager).baseDirectory, testFile)).isFile().should.be.true;
            const permissions: Promise<void> = mediaManager.updatePermissions(testFile, false);
            permissions.should.be.fulfilled;
            await permissions;
        });
    });
    describe("Deleting", async () => {
        it("Should reject if the file does not exist", () =>
            mediaManager.delete(nonExistentFile).should.be.rejected);
        it("Should delete a file", async () => {
            const promise: Promise<any> = mediaManager.delete(testFile);
            promise.should.be.fulfilled;
            await promise;
            should().throw(statSync.bind(null, (join((mediaManager as MediaManager).baseDirectory, testFile))));
        });
    });
});
