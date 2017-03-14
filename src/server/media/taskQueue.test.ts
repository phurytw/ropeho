/**
 * @file Unit tests for the task queue module
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../../test.d.ts" />
import { queue, createProcessImageTask, createProcessVideoTask, createFileUploadTask, cancelTask, getTasks, startTask, processVideoTask, processUploadTask, processImageTask } from "../media/taskQueue";
import * as taskQueue from "../media/taskQueue";
import mediaManager from "../media/mediaManager";
import * as fileEncoder from "../media/fileEncoder";
import { should } from "chai";
import { stub, spy } from "sinon";
import * as kue from "kue";
should();

describe("Task queue", () => {
    let queueCreateSpy: sinon.SinonSpy,
        saveStub: sinon.SinonStub,
        removeStub: sinon.SinonStub,
        attemptsSpy: sinon.SinonSpy;
    before(() => {
        queueCreateSpy = spy(queue, "create");
        saveStub = stub(kue.Job.prototype, "save");
        removeStub = stub(kue.Job.prototype, "remove");
        attemptsSpy = spy(kue.Job.prototype, "attempts");
    });
    afterEach(() => {
        queueCreateSpy.reset();
        saveStub.reset();
        removeStub.reset();
        attemptsSpy.reset();
    });
    after(() => {
        queueCreateSpy.restore();
        saveStub.restore();
        removeStub.restore();
        attemptsSpy.restore();
    });
    describe("Adding tasks", () => {
        it("Should add a image encoding task, execute it, and retry if it fails", async () => {
            await createProcessImageTask({
                data: new Buffer(0),
                dest: ""
            });
            queueCreateSpy.should.have.been.calledOnce;
            queueCreateSpy.should.have.been.calledWith("image");
            saveStub.should.have.been.calledOnce;
            attemptsSpy.should.have.been.calledOnce;
        });
        it("Should add a video encoding task, execute it, and retry if it fails", async () => {
            await createProcessVideoTask({
                data: new Buffer(0),
                dest: "",
                fallbackDest: ""
            });
            queueCreateSpy.should.have.been.calledOnce;
            queueCreateSpy.should.have.been.calledWith("video");
            saveStub.should.have.been.calledOnce;
            attemptsSpy.should.have.been.calledOnce;
        });
        it("Should add a file upload task, execute it, and retry if it fails", async () => {
            await createFileUploadTask({
                data: new Buffer(0),
                dest: ""
            });
            queueCreateSpy.should.have.been.calledOnce;
            queueCreateSpy.should.have.been.calledWith("upload");
            saveStub.should.have.been.calledOnce;
            attemptsSpy.should.have.been.calledOnce;
        });
    });
    describe("Executing tasks", () => {
        let mediaUploadStub: sinon.SinonStub,
            createWebpStub: sinon.SinonStub,
            createWebmStub: sinon.SinonStub,
            createScreenshotStub: sinon.SinonStub;
        before(() => {
            mediaUploadStub = stub(mediaManager, "upload");
            createWebmStub = stub(fileEncoder, "createWebm").returns([new Buffer(0), new Buffer(0)]);
            createWebpStub = stub(fileEncoder, "createWebp");
            createScreenshotStub = stub(fileEncoder, "createScreenshot");
        });
        afterEach(() => {
            mediaUploadStub.reset();
            createWebmStub.reset();
            createWebpStub.reset();
            createScreenshotStub.reset();
        });
        after(() => {
            mediaUploadStub.restore();
            createWebmStub.restore();
            createWebpStub.restore();
            createScreenshotStub.restore();
        });
        it("Should create a WebP file and upload it", async () => {
            const callback: sinon.SinonSpy = spy();
            await processImageTask({
                id: "",
                data: {
                    data: new Buffer(0),
                    dest: ""
                }
            }, callback);
            mediaUploadStub.should.have.been.calledOnce;
            createWebpStub.should.have.been.calledOnce;
            callback.should.have.been.calledOnce;
        });
        it("Should create a WebM file, and a screenshot then upload them", async () => {
            const callback: sinon.SinonSpy = spy();
            await processVideoTask({
                id: "",
                data: {
                    data: new Buffer(0),
                    dest: "dest",
                    fallbackDest: "fallback"
                }
            }, callback);
            mediaUploadStub.should.have.been.calledTwice;
            mediaUploadStub.should.have.been.calledWithMatch("dest");
            mediaUploadStub.should.have.been.calledWithMatch("fallback");
            createWebmStub.should.have.been.calledOnce;
            createScreenshotStub.should.have.been.calledOnce;
            callback.should.have.been.calledOnce;
        });
        it("Should upload a file", async () => {
            const callback: sinon.SinonSpy = spy();
            await processUploadTask({
                id: "",
                data: {
                    data: new Buffer(0),
                    dest: ""
                }
            }, callback);
            mediaUploadStub.should.have.been.calledOnce;
            callback.should.have.been.calledOnce;
        });
    });
    describe("API", () => {
        it("Should send a detailed list of tasks in queue", () => {
            getTasks().should.eventually.be.an("array");
        });
        it("Should manually start a task", async () => {
            const getTasksStub: sinon.SinonStub = stub(taskQueue, "getTasks", (filter?: string) =>
                new Promise<kue.Job[]>((resolve: (value?: kue.Job[] | PromiseLike<kue.Job[]>) => void, reject: (reason?: any) => void) =>
                    resolve([]))),
                getJobStub: sinon.SinonStub = stub(kue.Job, "get", (id: number, callback: (err: Error, job: kue.Job) => void) => callback(undefined, queue.create("image", {})));
            await startTask(0);
            saveStub.should.have.been.calledOnce;
            getTasksStub.restore();
            getJobStub.restore();
        });
        it("Should cancel and remove a task", async () => {
            const getJobStub: sinon.SinonStub = stub(kue.Job, "get", (id: number, callback: (err: Error, job: kue.Job) => void) => callback(undefined, queue.create("image", {})));
            await cancelTask(0);
            removeStub.should.have.been.calledOnce;
            getJobStub.restore();
        });
    });
});
