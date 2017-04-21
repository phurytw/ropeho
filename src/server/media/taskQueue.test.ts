/**
 * @file Unit tests for the task queue module
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../../test.d.ts" />
import {
    queue,
    createProcessImageTask,
    createProcessVideoTask,
    createFileUploadTask,
    cancelTask,
    getTasks,
    startTask,
    processVideoTask,
    processUploadTask,
    processImageTask,
    isSourceUsed
} from "../media/taskQueue";
import * as taskQueue from "../media/taskQueue";
import mediaManager from "../media/mediaManager";
import tempMediaManager from "./tempMediaManager";
import * as fileEncoder from "../media/fileEncoder";
import { should, use } from "chai";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { stub, spy, sandbox as sinonSandbox } from "sinon";
import * as kue from "kue";
import { bufferToStream } from "./buffer";
import * as mkdirp from "mkdirp";
should();
use(sinonChai);
use(chaiAsPromised);

import ImageOptions = Ropeho.Tasks.ProcessImageOptions;
import VideoOptions = Ropeho.Tasks.ProcessVideoOptions;
import UploadOptions = Ropeho.Tasks.FileUploadOptions;

describe("Task queue", () => {
    let sandbox: sinon.SinonSandbox;
    before(() => {
        sandbox = sinonSandbox.create();
        queue.testMode.enter();
    });
    beforeEach(() => {
        sandbox.spy(queue, "create");
        sandbox.spy(kue.Job.prototype, "save");
        sandbox.spy(kue.Job.prototype, "remove");
        sandbox.spy(kue.Job.prototype, "attempts");
    });
    afterEach(() => {
        sandbox.restore();
        queue.testMode.clear();
    });
    after(() => {
        queue.testMode.exit();
    });
    describe("Adding tasks", () => {
        it("Should add a image encoding task, execute it, and retry if it fails", () => {
            const data: ImageOptions = {
                source: "file",
                dest: "dest"
            };
            createProcessImageTask(data);
            kue.Job.prototype.attempts.should.have.been.calledOnce;
            queue.testMode.jobs.should.have.lengthOf(1);
            const job: kue.Job = queue.testMode.jobs[0];
            job.type.should.equal("image");
            job.data.should.deep.equal(data);
        });
        it("Should add a video encoding task, execute it, and retry if it fails", () => {
            const data: VideoOptions = {
                source: "file",
                dest: "dest",
                fallbackDest: "fallback"
            };
            createProcessVideoTask(data);
            kue.Job.prototype.attempts.should.have.been.calledOnce;
            queue.testMode.jobs.should.have.lengthOf(1);
            const job: kue.Job = queue.testMode.jobs[0];
            job.type.should.equal("video");
            job.data.should.deep.equal(data);
        });
        it("Should add a file upload task, execute it, and retry if it fails", () => {
            const data: UploadOptions = {
                source: "file",
                dest: "dest"
            };
            createFileUploadTask(data);
            kue.Job.prototype.attempts.should.have.been.calledOnce;
            queue.testMode.jobs.should.have.lengthOf(1);
            const job: kue.Job = queue.testMode.jobs[0];
            job.type.should.equal("upload");
            job.data.should.deep.equal(data);
        });
    });
    describe("Executing tasks", () => {
        beforeEach(() => {
            sandbox.stub(mediaManager, "startUpload").returns({
                write: () => ({}),
                end: () => ({}),
                on: () => ({}),
                once: () => ({}),
                emit: () => ({})
            });
            sandbox.stub(tempMediaManager, "delete");
            sandbox.stub(tempMediaManager, "exists").returns(true);
            sandbox.stub(tempMediaManager, "startDownload").returns(bufferToStream(new Buffer(100)));
            sandbox.stub(fileEncoder, "createWebm");
            sandbox.stub(fileEncoder, "createJpeg");
            sandbox.stub(fileEncoder, "createScreenshot");
            sandbox.stub(mkdirp, "sync");
            sandbox.stub(taskQueue, "isSourceUsed").returns(() => Promise.resolve(false));
        });
        it("Should create a WebP file and upload it", async () => {
            const callback: sinon.SinonSpy = spy();
            const source: string = "/image.jpeg";
            const dest: string = "/image.webp";
            await processImageTask({
                id: 10,
                data: {
                    source,
                    dest
                }
            }, callback);
            mediaManager.startUpload.should.have.been.calledOnce;
            fileEncoder.createJpeg.should.have.been.calledOnce;
            callback.should.have.been.calledOnce;
        });
        it("Should create a WebM file, and a screenshot then upload them", async () => {
            const callback: sinon.SinonSpy = spy();
            const data: VideoOptions = {
                source: "source",
                dest: "dest",
                fallbackDest: "fallback"
            };
            sandbox.stub(kue.Job, "get")
                .callsFake((id: number, callback: (err: any, job: kue.Job) => void) => {
                    callback(null, {
                        id: 10,
                        type: "video",
                        data
                    } as kue.Job);
                });
            await processVideoTask({
                id: 10,
                data
            }, callback);
            mediaManager.startUpload.should.have.been.calledTwice;
            mediaManager.startUpload.should.have.been.calledWithMatch(data.dest);
            mediaManager.startUpload.should.have.been.calledWithMatch(data.fallbackDest);
            fileEncoder.createWebm.should.have.been.calledOnce;
            fileEncoder.createScreenshot.should.have.been.calledOnce;
            callback.should.have.been.calledOnce;
        });
        it("Should upload a file", async () => {
            const callback: sinon.SinonSpy = spy();
            const source: string = "/image.jpeg";
            const dest: string = "/image.webp";
            await processUploadTask({
                id: 10,
                data: {
                    source,
                    dest
                }
            }, callback);
            mediaManager.startUpload.should.have.been.calledOnce;
            callback.should.have.been.calledOnce;
        });
    });
    describe("Freeing source files", () => {
        it("Should return false if the source is used by any task that is not complete", () => {
            const data: VideoOptions = {
                source: "source",
                dest: "dest",
                fallbackDest: "fallback"
            };
            sandbox.stub(taskQueue, "getTasks").callsFake(() => Promise.resolve([{
                id: 10,
                type: "video",
                data
            } as kue.Job]));
            return isSourceUsed(data.source).should.eventually.be.true;
        });
        it("Should return true if the source is no longer used by any tasks", () => {
            const data: VideoOptions = {
                source: "source",
                dest: "dest",
                fallbackDest: "fallback"
            };
            sandbox.stub(taskQueue, "getTasks").callsFake(() => Promise.resolve([]));
            return isSourceUsed(data.source).should.eventually.be.false;
        });
    });
    describe("API", () => {
        it("Should send a detailed list of tasks in queue", () => {
            getTasks().should.eventually.be.an("array");
        });
        it("Should manually start a task", async () => {
            const getTasksStub: sinon.SinonStub = stub(taskQueue, "getTasks")
                .callsFake((filter?: string) =>
                    Promise.resolve<kue.Job[]>([])),
                getJobStub: sinon.SinonStub = stub(kue.Job, "get")
                    .callsFake((id: number, callback: (err: Error, job: kue.Job) => void) => callback(undefined, queue.create("image", {})));
            await startTask(0);
            kue.Job.prototype.save.should.have.been.calledOnce;
            getTasksStub.restore();
            getJobStub.restore();
        });
        it("Should cancel and remove a task", async () => {
            const getJobStub: sinon.SinonStub = stub(kue.Job, "get")
                .callsFake((id: number, callback: (err: Error, job: kue.Job) => void) => callback(undefined, queue.create("image", {})));
            await cancelTask(0);
            kue.Job.prototype.remove.should.have.been.calledOnce;
            getJobStub.restore();
        });
    });
});
