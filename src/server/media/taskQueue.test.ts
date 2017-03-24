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
import { stub, spy, sandbox as sinonSandbox } from "sinon";
import * as kue from "kue";
should();

describe("Task queue", () => {
    let sandbox: sinon.SinonSandbox;
    before(() => sandbox = sinonSandbox.create());
    beforeEach(() => {
        sandbox.spy(queue, "create");
        sandbox.stub(kue.Job.prototype, "save");
        sandbox.stub(kue.Job.prototype, "remove");
        sandbox.spy(kue.Job.prototype, "attempts");
    });
    afterEach(() => sandbox.restore());
    describe("Adding tasks", () => {
        it("Should add a image encoding task, execute it, and retry if it fails", async () => {
            await createProcessImageTask({
                data: new Buffer(0),
                dest: ""
            });
            queue.create.should.have.been.calledOnce;
            queue.create.should.have.been.calledWith("image");
            kue.Job.prototype.save.should.have.been.calledOnce;
            kue.Job.prototype.attempts.should.have.been.calledOnce;
        });
        it("Should add a video encoding task, execute it, and retry if it fails", async () => {
            await createProcessVideoTask({
                data: new Buffer(0),
                dest: "",
                fallbackDest: ""
            });
            queue.create.should.have.been.calledOnce;
            queue.create.should.have.been.calledWith("video");
            kue.Job.prototype.save.should.have.been.calledOnce;
            kue.Job.prototype.attempts.should.have.been.calledOnce;
        });
        it("Should add a file upload task, execute it, and retry if it fails", async () => {
            await createFileUploadTask({
                data: new Buffer(0),
                dest: ""
            });
            queue.create.should.have.been.calledOnce;
            queue.create.should.have.been.calledWith("upload");
            kue.Job.prototype.save.should.have.been.calledOnce;
            kue.Job.prototype.attempts.should.have.been.calledOnce;
        });
    });
    describe("Executing tasks", () => {
        beforeEach(() => {
            sandbox.stub(mediaManager, "upload");
            sandbox.stub(fileEncoder, "createWebm").returns([new Buffer(0), new Buffer(0)]);
            sandbox.stub(fileEncoder, "createWebp");
            sandbox.stub(fileEncoder, "createScreenshot");
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
            mediaManager.upload.should.have.been.calledOnce;
            fileEncoder.createWebp.should.have.been.calledOnce;
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
            mediaManager.upload.should.have.been.calledTwice;
            mediaManager.upload.should.have.been.calledWithMatch("dest");
            mediaManager.upload.should.have.been.calledWithMatch("fallback");
            fileEncoder.createWebm.should.have.been.calledOnce;
            fileEncoder.createScreenshot.should.have.been.calledOnce;
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
            mediaManager.upload.should.have.been.calledOnce;
            callback.should.have.been.calledOnce;
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
