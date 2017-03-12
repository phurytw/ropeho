/**
 * @file Unit tests for the task manager controller
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../../test.d.ts" />
import { should, use } from "chai";
import { stub } from "sinon";
import * as sinonChai from "sinon-chai";
import { Server } from "http";
import * as express from "express";
import { Express, Request, Response, NextFunction, RequestHandler } from "express-serve-static-core";
import { users } from "../../sampleData/testDb";
import app from "../app";
import * as taskQueue from "../media/taskQueue";
import * as socket from "../socket";
import * as supertest from "supertest";
import { Job } from "kue";
import { v4 } from "uuid";
import * as detect from "detect-port";
import config from "../../config";
should();
use(sinonChai);

import User = Ropeho.Models.User;

describe("Task manager controller", () => {
    const testApp: Express = express(),
        [admin, user]: User[] = users;
    let server: Server,
        port: number,
        agent: supertest.SuperTest<supertest.Test>,
        middleware: RequestHandler,
        reqUser: User = admin,
        getClientsStub: sinon.SinonStub,
        getUploadingStub: sinon.SinonStub,
        getDownloadingStub: sinon.SinonStub,
        getTasksStub: sinon.SinonStub,
        cancelTaskStub: sinon.SinonStub,
        startTaskStub: sinon.SinonStub,
        kickClientStub: sinon.SinonStub;
    before(async () => {
        getClientsStub = stub(socket, "getClients").returns([v4(), v4(), v4(), v4(), v4()]);
        getTasksStub = stub(taskQueue, "getTasks").returns([new Job("upload")]);
        getUploadingStub = stub(socket, "getUploading").returns([v4(), v4()]);
        getDownloadingStub = stub(socket, "getDownloading").returns([v4(), v4(), v4()]);
        cancelTaskStub = stub(taskQueue, "cancelTask");
        startTaskStub = stub(taskQueue, "startTask");
        kickClientStub = stub(socket, "kickClient");

        // Setting up the server
        port = await detect(config.endPoints.api.port);
        await new Promise<void>((resolve: () => void, reject: (reason?: any) => void) => {
            middleware = (req: Request, res: Response, next: NextFunction) => {
                req.user = reqUser;
                reqUser = admin;
                next();
            };
            // Use middleware to create session data
            testApp.use(middleware);
            testApp.use(app);
            server = testApp.listen(port, (err: Error) => err ? reject(err) : resolve());
        });

        // Setup supertest
        agent = supertest(testApp);
    });
    after(() => {
        getClientsStub.restore();
        getTasksStub.restore();
        getUploadingStub.restore();
        getDownloadingStub.restore();
        cancelTaskStub.restore();
        startTaskStub.restore();
        kickClientStub.restore();
        server.close();
    });
    afterEach(() => {
        getClientsStub.reset();
        getTasksStub.reset();
        getUploadingStub.reset();
        getDownloadingStub.reset();
        cancelTaskStub.reset();
        startTaskStub.reset();
        kickClientStub.reset();
    });
    describe("Getting informations", () => {
        it("Should get all tasks, all clients and all locked files", async () => {
            const response: supertest.Response = await agent.get("/api/taskmanager");
            response.should.have.property("status", 200);
            response.should.have.property("body").with.property("tasks").with.lengthOf(1);
            response.should.have.property("body").with.property("clients").with.lengthOf(5);
            response.should.have.property("body").with.property("uploading").with.lengthOf(2);
            response.should.have.property("body").with.property("downloading").with.lengthOf(3);
            getTasksStub.should.have.been.calledOnce;
            getClientsStub.should.have.been.calledOnce;
            getDownloadingStub.should.have.been.calledOnce;
            getUploadingStub.should.have.been.calledOnce;
        });
        it("Should reject if user is not administrator", async () => {
            reqUser = user;
            const response: supertest.Response = await agent.get("/api/taskmanager");
            response.should.have.property("status", 400);
            getTasksStub.should.have.not.been.called;
            getClientsStub.should.have.not.been.called;
            getDownloadingStub.should.have.not.been.called;
            getUploadingStub.should.have.not.been.called;
        });
        it("Should be able to filter results", async () => {
            const response: supertest.Response = await agent.get("/api/taskmanager").query({ fields: "downloading,uploading" });
            response.should.have.property("status", 200);
            response.should.have.property("body").with.property("uploading").with.lengthOf(2);
            response.should.have.property("body").with.property("downloading").with.lengthOf(3);
            response.body.should.not.have.property("tasks");
            response.body.should.not.have.property("clients");
        });
    });
    describe("Managing tasks", () => {
        it("Should stop an ongoing task", async () => {
            const response: supertest.Response = await agent.delete(`/api/taskmanager/task/1234`);
            response.should.have.property("status", 200);
            cancelTaskStub.should.have.been.calledOnce.calledWith(1234);
        });
        it("Should restart a task", async () => {
            const response: supertest.Response = await agent.post(`/api/taskmanager/task/1234`);
            response.should.have.property("status", 200);
            startTaskStub.should.have.been.calledOnce.calledWith(1234);
        });
    });
    describe("Managing socket clients", () => {
        it("Should kick a client", async () => {
            const response: supertest.Response = await agent.delete(`/api/taskmanager/socket/1234`);
            response.should.have.property("status", 200);
            kickClientStub.should.have.been.calledOnce.calledWith("1234");
        });
        it("Should throw if a client could not be found", async () => {
            kickClientStub.throws();
            const response: supertest.Response = await agent.delete(`/api/taskmanager/socket/1234`);
            response.should.have.property("status", 400);
            kickClientStub.should.have.been.calledOnce;
        });
    });
});
