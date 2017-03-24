/**
 * @file Unit tests for the presentation controller
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../../test.d.ts" />
import { should, use } from "chai";
import { stub, sandbox as sinonSandbox } from "sinon";
import * as sinonChai from "sinon-chai";
import { v4 } from "uuid";
import { isArray, filter, head, map, includes, uniq } from "lodash";
import * as _ from "lodash";
import GenericRepository from "../dal/genericRepository";
import { Server } from "http";
import * as express from "express";
import { Express, Request, Response, NextFunction, RequestHandler } from "express-serve-static-core";
import * as supertest from "supertest";
import app from "../app";
import { computeHashSync } from "../accounts/password";
import { computeToken } from "../accounts/token";
import { Roles } from "../../enum";
import { presentations } from "../../sampleData/testDb";
import * as socket from "../socket";
import * as detect from "detect-port";
import config from "../../config";
should();
use(sinonChai);

import User = Ropeho.Models.User;
import PresentationContainer = Ropeho.Models.PresentationContainer;

describe("PresentationContainer controller", () => {
    const testApp: Express = express(),
        testPassword: string = "123456",
        users: User[] = [{
            _id: v4(),
            name: "User",
            email: "user@test.com",
            password: computeHashSync(testPassword).toString("hex"),
            token: computeToken(),
            productionIds: [],
            role: Roles.User
        }, {
            _id: v4(),
            name: "Administrator",
            email: "admin@test.com",
            password: computeHashSync(testPassword).toString("hex"),
            token: computeToken(),
            productionIds: [],
            role: Roles.Administrator
        }],
        [user, admin]: User[] = users,
        [containerA, containerB]: PresentationContainer[] = presentations;
    let server: Server,
        port: number,
        agent: supertest.SuperTest<supertest.Test>,
        sandbox: sinon.SinonSandbox,
        middleware: RequestHandler,
        reqUser: User;
    before(async () => {
        // Setting up the server
        port = await detect(config.endPoints.api.port);
        await new Promise<void>((resolve: () => void, reject: (reason?: any) => void) => {
            middleware = (req: Request, res: Response, next: NextFunction) => {
                req.user = reqUser;
                reqUser = undefined;
                next();
            };
            // Use middleware to create session data
            testApp.use(middleware);
            testApp.use(app);
            server = testApp.listen(port, (err: Error) => err ? reject(err) : resolve());
        });

        // Setup supertest
        sandbox = sinonSandbox.create();
        agent = supertest(testApp);
    });
    beforeEach(() => {
        sandbox.stub(GenericRepository.prototype, "create")
            .callsFake((pre: PresentationContainer) => Promise.resolve<PresentationContainer>(pre));
        sandbox.stub(GenericRepository.prototype, "update")
            .callsFake((params: any) => params ? (isArray(params) ? params.length : 1) : 0);
        sandbox.stub(GenericRepository.prototype, "delete")
            .callsFake((params: any) => params ? (isArray(params) ? params.length : 1) : 0);
        sandbox.stub(GenericRepository.prototype, "get")
            .callsFake((entities: PresentationContainer | PresentationContainer[]) => {
                if (!entities || (entities as PresentationContainer[]).length === 0) {
                    return Promise.resolve<PresentationContainer[]>(presentations);
                } else {
                    return Promise.resolve<PresentationContainer>(_(presentations).filter((p: PresentationContainer) => _(entities).map((e: PresentationContainer) => e._id).includes(p._id)).thru((pre: PresentationContainer[]) => (entities as PresentationContainer[]).length === 1 ? head(pre) : pre).value());
                }
            });
        sandbox.stub(GenericRepository.prototype, "getById")
            .callsFake((id: string | string[]) => {
                if (isArray<string>(id)) {
                    return Promise.resolve<PresentationContainer[]>(filter(presentations, (p: User) => includes<string>(id, p._id)));
                } else {
                    return Promise.resolve<PresentationContainer>(_(presentations).filter((p: User) => p._id === id).head());
                }
            });
        sandbox.stub(GenericRepository.prototype, "search")
            .callsFake((filters: { [key: string]: string }) => {
                if (filters && filters["_id"]) {
                    return Promise.resolve<PresentationContainer[]>(filter<PresentationContainer>(presentations, (p: PresentationContainer) => includes(p._id, filters["_id"])));
                } else {
                    return Promise.resolve<PresentationContainer[]>([]);
                }
            });
        sandbox.stub(GenericRepository.prototype, "order")
            .callsFake((order?: string[]) => {
                if (isArray<string>(order)) {
                    const currentOrder: string[] = map<PresentationContainer, string>(presentations, (p: PresentationContainer) => p._id);
                    return Promise.resolve<string[]>(uniq([...filter<string>(order, (o: string) => includes(currentOrder, o)), ...currentOrder]));
                } else {
                    return Promise.resolve<string[]>(map<PresentationContainer, string>(presentations, (p: PresentationContainer) => p._id));
                }
            });
    });
    afterEach(() => sandbox.restore());
    after(() => server.close());
    describe("Creating a presentation", () => {
        it("Should reject if current user is not an administrator", async () => {
            reqUser = user;
            const response: supertest.Response = await agent.post("/api/presentations")
                .send({ name: "Test PresentationContainer" });
            response.should.have.property("status", 400);
        });
        it("Should add a presentation otherwise", async () => {
            reqUser = admin;
            const testPresentation: PresentationContainer = {},
                response: supertest.Response = await agent.post("/api/presentations")
                    .send(testPresentation);
            response.should.have.property("status", 200);
            GenericRepository.prototype.create.should.have.been.calledOnce;
            GenericRepository.prototype.create.should.have.been.calledWithMatch({ ...testPresentation });
        });
    });
    describe("Getting one or multiple presentations", () => {
        it("Should return all presentations", async () => {
            const response: supertest.Response = await agent.get("/api/presentations");
            response.should.have.property("status", 200);
            response.body.should.deep.equal(presentations);
        });
        it("Should return matched presentations", async () => {
            const response: supertest.Response = await agent.get("/api/presentations")
                .query({ _id: containerA._id });
            response.should.have.property("status", 200);
            response.should.have.property("body").deep.equal([containerA]);
        });
        it("Should return presentations with the desired format", async () => {
            const fields: Object = "_id",
                response: supertest.Response = await agent.get("/api/presentations")
                    .query({ fields });
            response.should.have.property("status", 200);
            response.should.have.property("body").deep.equal(map<PresentationContainer, PresentationContainer>(presentations, (p: PresentationContainer) => ({ _id: p._id })));
        });
    });
    describe("Getting a presentation by ID", () => {
        it("Should get the matched presentation", async () => {
            const response: supertest.Response = await agent.get(`/api/presentations/${containerA._id}`);
            response.should.have.property("status", 200);
            response.should.have.property("body").deep.equal(containerA);
        });
        it("Should return presentations with the desired format", async () => {
            const fields: Object = "_id",
                response: supertest.Response = await agent.get(`/api/presentations/${containerA._id}`)
                    .query({ fields });
            response.should.have.property("status", 200);
            response.should.have.property("body").deep.equal({ _id: containerA._id });
        });
    });
    describe("Updating a presentation", () => {
        it("Should reject if user is not an administrator", async () => {
            reqUser = user;
            const response: supertest.Response = await agent.put(`/api/presentations/${containerA._id}`)
                .send({ ...containerA, presentations: [] });
            response.should.have.property("status", 400);
        });
        it("Should update a presentation", async () => {
            reqUser = admin;
            const pre: PresentationContainer = { ...containerA, presentations: [] },
                response: supertest.Response = await agent.put(`/api/presentations/${containerA._id}`)
                    .send(pre);
            response.should.have.property("status", 200);
            GenericRepository.prototype.update.should.have.been.calledWith(pre);
            GenericRepository.prototype.update.should.have.been.calledOnce;
        });
        it("Should not update if the presentation is being uploaded", async () => {
            reqUser = admin;
            const getLockedStub: sinon.SinonStub = stub(socket, "getLocked").callsFake(() => [containerA._id]),
                response: supertest.Response = await agent.put(`/api/presentations/${containerA._id}`)
                    .send({ ...containerA, presentations: [] });
            response.should.have.property("status", 400);
            GenericRepository.prototype.update.should.have.not.been.called;
            getLockedStub.restore();
        });
    });
    describe("Deleting a presentation", () => {
        it("Should reject if user is not an administrator", async () => {
            reqUser = user;
            const response: supertest.Response = await agent.delete(`/api/presentations/${containerA._id}`);
            response.should.have.property("status", 400);
        });
        it("Should delete a presentation", async () => {
            reqUser = admin;
            const response: supertest.Response = await agent.delete(`/api/presentations/${containerA._id}`);
            response.should.have.property("status", 200);
            GenericRepository.prototype.delete.should.have.been.calledWith(containerA._id);
            GenericRepository.prototype.delete.should.have.been.calledOnce;
        });
        it("Should not delete if the presentation is being uploaded", async () => {
            reqUser = admin;
            const getLockedStub: sinon.SinonStub = stub(socket, "getLocked").callsFake(() => [containerA._id]),
                response: supertest.Response = await agent.delete(`/api/presentations/${containerA._id}`);
            response.should.have.property("status", 400);
            GenericRepository.prototype.delete.should.have.not.been.called;
            getLockedStub.restore();
        });
    });
    describe("Ordering presentations", () => {
        it("Should reject if it is not an array of strings", async () => {
            reqUser = admin;
            let response: supertest.Response = await agent.post("/api/presentations/order").send({});
            response.should.have.property("status", 400);

            reqUser = admin;
            response = await agent.post("/api/presentations/order").send();
            response.should.have.property("status", 400);

            reqUser = admin;
            response = await agent.post("/api/presentations/order").send(["stuff", 0, undefined]);
            response.should.have.property("status", 400);
        });
        it("Should update the order of the presentations", async () => {
            reqUser = admin;
            const response: supertest.Response = await agent.post("/api/presentations/order").send([containerB._id, containerA._id]);
            response.should.have.property("status", 200);
            response.should.have.property("body").deep.equal([containerB._id, containerA._id]);
        });
    });
});
