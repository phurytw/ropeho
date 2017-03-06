/**
 * @file Unit tests for the presentation controller
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../../test.d.ts" />
import { should, use } from "chai";
import { stub } from "sinon";
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
import { presentations } from "../dal/testDb";
import * as socket from "../socket";
should();
use(sinonChai);

import User = Ropeho.Models.User;
import PresentationContainer = Ropeho.Models.PresentationContainer;

describe("PresentationContainer controller", () => {
    const testApp: Express = express(),
        port: number = process.env.PORT || 3010,
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
        agent: supertest.SuperTest<supertest.Test>,
        createStub: sinon.SinonStub,
        updateStub: sinon.SinonStub,
        deleteStub: sinon.SinonStub,
        getStub: sinon.SinonStub,
        getByIdStub: sinon.SinonStub,
        searchStub: sinon.SinonStub,
        orderStub: sinon.SinonStub,
        middleware: RequestHandler,
        reqUser: User;
    before(async () => {
        // Stub the repository class methods
        createStub = stub(GenericRepository.prototype, "create", (pre: PresentationContainer) => new Promise<PresentationContainer>((resolve: (value?: PresentationContainer | PromiseLike<PresentationContainer>) => void) => resolve(pre)));
        updateStub = stub(GenericRepository.prototype, "update", (params: any) => params ? (isArray(params) ? params.length : 1) : 0);
        deleteStub = stub(GenericRepository.prototype, "delete", (params: any) => params ? (isArray(params) ? params.length : 1) : 0);
        getStub = stub(GenericRepository.prototype, "get", (entities: PresentationContainer | PresentationContainer[]) => new Promise<PresentationContainer | PresentationContainer[]>((resolve: (value?: PresentationContainer | PresentationContainer[] | PromiseLike<PresentationContainer | PresentationContainer[]>) => void) => {
            if (!entities || (entities as PresentationContainer[]).length === 0) {
                resolve(presentations);
            } else {
                resolve(_(presentations).filter((p: PresentationContainer) => _(entities).map((e: PresentationContainer) => e._id).includes(p._id)).thru((pre: PresentationContainer[]) => (entities as PresentationContainer[]).length === 1 ? head(pre) : pre).value());
            }
        }));
        getByIdStub = stub(GenericRepository.prototype, "getById", (id: string | string[]) => new Promise<PresentationContainer | PresentationContainer[]>((resolve: (value?: PresentationContainer | PresentationContainer[] | PromiseLike<PresentationContainer | PresentationContainer[]>) => void) => {
            if (isArray<string>(id)) {
                resolve(filter(presentations, (p: User) => includes<string>(id, p._id)));
            } else {
                resolve(_(presentations).filter((p: User) => p._id === id).head());
            }
        }));
        searchStub = stub(GenericRepository.prototype, "search", (filters: { [key: string]: string }) => new Promise<PresentationContainer[]>((resolve: (value?: PresentationContainer[] | PromiseLike<PresentationContainer[]>) => void) => {
            if (filters && filters["_id"]) {
                resolve(filter<PresentationContainer>(presentations, (p: PresentationContainer) => includes(p._id, filters["_id"])));
            } else {
                resolve([]);
            }
        }));
        orderStub = stub(GenericRepository.prototype, "order", (order?: string[]) => new Promise<string[]>((resolve: (value?: string[] | PromiseLike<string[]>) => void) => {
            if (isArray<string>(order)) {
                const currentOrder: string[] = map<PresentationContainer, string>(presentations, (p: PresentationContainer) => p._id);
                resolve(uniq([...filter<string>(order, (o: string) => includes(currentOrder, o)), ...currentOrder]));
            } else {
                resolve(map<PresentationContainer, string>(presentations, (p: PresentationContainer) => p._id));
            }
        }));

        // Setting up the server
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
        agent = supertest(testApp);
    });
    beforeEach(() => {
        createStub.reset();
        updateStub.reset();
        deleteStub.reset();
        getStub.reset();
        getByIdStub.reset();
        searchStub.reset();
        orderStub.reset();
    });
    after(() => {
        server.close();
        createStub.restore();
        updateStub.restore();
        deleteStub.restore();
        getStub.restore();
        getByIdStub.restore();
        searchStub.restore();
        orderStub.restore();
    });
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
            createStub.should.have.been.calledOnce;
            createStub.should.have.been.calledWithMatch({ ...testPresentation });
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
            updateStub.should.have.been.calledWith(pre);
            updateStub.should.have.been.calledOnce;
        });
        it("Should not update if the presentation is being uploaded", async () => {
            reqUser = admin;
            const getLockedStub: sinon.SinonStub = stub(socket, "getLocked", () => [containerA._id]),
                response: supertest.Response = await agent.put(`/api/presentations/${containerA._id}`)
                    .send({ ...containerA, presentations: [] });
            response.should.have.property("status", 400);
            updateStub.should.have.not.been.called;
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
            deleteStub.should.have.been.calledWith(containerA._id);
            deleteStub.should.have.been.calledOnce;
        });
        it("Should not delete if the presentation is being uploaded", async () => {
            reqUser = admin;
            const getLockedStub: sinon.SinonStub = stub(socket, "getLocked", () => [containerA._id]),
                response: supertest.Response = await agent.delete(`/api/presentations/${containerA._id}`);
            response.should.have.property("status", 400);
            deleteStub.should.have.not.been.called;
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
