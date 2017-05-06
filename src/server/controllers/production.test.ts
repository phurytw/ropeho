/**
 * @file Unit tests for the production controller
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
import { productions } from "../../sampleData/testDb";
import uriFriendlyFormat from "../../common/helpers/uriFriendlyFormat";
import * as socket from "../socket";
import * as detect from "detect-port";
import { endPoints } from "../../common/helpers/resolveEndPoint";
should();
use(sinonChai);

import User = Ropeho.Models.User;
import Production = Ropeho.Models.Production;

describe("Production controller", () => {
    const testApp: Express = express(),
        testPassword: string = "123456",
        [productionA, productionB, productionC]: Production[] = productions,
        users: User[] = [{
            _id: v4(),
            name: "User",
            email: "user@test.com",
            password: computeHashSync(testPassword).toString("hex"),
            token: computeToken(),
            productionIds: [productionB._id, productionC._id],
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
        [user, admin]: User[] = users;
    let server: Server,
        port: number,
        agent: supertest.SuperTest<supertest.Test>,
        sandbox: sinon.SinonSandbox,
        middleware: RequestHandler,
        reqUser: User;
    before(async () => {
        // Setting up the server
        port = await detect(endPoints.api.port);
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
            .callsFake((prod: Production) => {
                if (_(productions).map<string>((p: Production) => uriFriendlyFormat(p.name)).includes(uriFriendlyFormat(prod.name))) {
                    return Promise.reject<Error>(new Error("Name already in use"));
                } else {
                    return Promise.resolve<Production>(prod);
                }
            });
        sandbox.stub(GenericRepository.prototype, "update")
            .callsFake((params: any) => params ? (isArray(params) ? params.length : 1) : 0);
        sandbox.stub(GenericRepository.prototype, "delete")
            .callsFake((params: any) => params ? (isArray(params) ? params.length : 1) : 0);
        sandbox.stub(GenericRepository.prototype, "get")
            .callsFake((entities: Production | Production[]) => {
                if (!entities || (entities as Production[]).length === 0) {
                    return Promise.resolve<Production[]>(productions);
                } else {
                    return Promise.resolve<Production | Production[]>(_(productions).filter((p: Production) => _(entities).map((e: Production) => e._id).includes(p._id)).thru((prods: Production[]) => (entities as Production[]).length === 1 ? head(prods) : prods).value());
                }
            });
        sandbox.stub(GenericRepository.prototype, "getById")
            .callsFake((id: string | string[]) => {
                if (isArray<string>(id)) {
                    return Promise.resolve<Production[]>(filter(productions, (p: User) => includes<string>(id, p._id)));
                } else {
                    return Promise.resolve<Production>(_(productions).filter((p: User) => p._id === id).head());
                }
            });
        sandbox.stub(GenericRepository.prototype, "search")
            .callsFake((filters: { [key: string]: string }) => {
                if (filters && filters["name"]) {
                    return Promise.resolve<Production[]>(filter<Production>(productions, (p: Production) => includes(uriFriendlyFormat(p.name), uriFriendlyFormat(filters["name"]))));
                } else {
                    return Promise.resolve<Production[]>([]);
                }
            });
        sandbox.stub(GenericRepository.prototype, "order")
            .callsFake((order?: string[]) => {
                if (isArray<string>(order)) {
                    const currentOrder: string[] = map<Production, string>(productions, (p: Production) => p._id);
                    return Promise.resolve<string[]>(uniq([...filter<string>(order, (o: string) => includes(currentOrder, o)), ...currentOrder]));
                } else {
                    return Promise.resolve<string[]>(map<Production, string>(productions, (p: Production) => p._id));
                }
            });
    });
    afterEach(() => sandbox.restore());
    after(() => server.close());
    describe("Creating a production", () => {
        it("Should reject if it does not have a name", async () => {
            reqUser = admin;
            const response: supertest.Response = await agent.post("/api/productions")
                .send({ name: "" });
            response.should.have.property("status", 400);
        });
        it("Should reject if the normalized name exists in the database", async () => {
            reqUser = admin;
            const response: supertest.Response = await agent.post("/api/productions")
                .send({ name: "production a" });
            response.should.have.property("status", 400);
        });
        it("Should reject if current user is not an administrator", async () => {
            reqUser = user;
            const response: supertest.Response = await agent.post("/api/productions")
                .send({ name: "Test Production" });
            response.should.have.property("status", 400);
        });
        it("Should add a production otherwise", async () => {
            reqUser = admin;
            const testProduction: Production = { name: "Test Production" },
                response: supertest.Response = await agent.post("/api/productions")
                    .send(testProduction);
            response.should.have.property("status", 200);
            GenericRepository.prototype.create.should.have.been.calledOnce;
            GenericRepository.prototype.create.should.have.been.calledWithMatch({ ...testProduction });
        });
    });
    describe("Getting one or multiple productions", () => {
        it("Should return all productions", async () => {
            reqUser = admin;
            const response: supertest.Response = await agent.get("/api/productions");
            response.should.have.property("status", 200);
            response.body.should.deep.equal(productions);
        });
        it("Should return matched productions", async () => {
            reqUser = admin;
            const response: supertest.Response = await agent.get("/api/productions")
                .query({ name: productionA.name });
            response.should.have.property("status", 200);
            response.should.have.property("body").deep.equal([productionA]);
        });
        it("Should return productions with the desired format", async () => {
            reqUser = admin;
            const fields: Object = "name,_id",
                response: supertest.Response = await agent.get("/api/productions")
                    .query({ fields });
            response.should.have.property("status", 200);
            response.should.have.property("body").deep.equal(map<Production, Production>(productions, (p: Production) => ({ name: p.name, _id: p._id })));
        });
        it("Should filter out private productions", async () => {
            const response: supertest.Response = await agent.get("/api/productions");
            response.should.have.property("status", 200);
            response.body.should.deep.equal([productionA]);
        });
        it("Should filter out private productions but keep those owned", async () => {
            reqUser = user;
            const response: supertest.Response = await agent.get("/api/productions");
            response.should.have.property("status", 200);
            response.body.should.deep.equal([productionA, productionB]);
        });
    });
    describe("Getting a production by ID", () => {
        it("Should get the matched production", async () => {
            reqUser = admin;
            const response: supertest.Response = await agent.get(`/api/productions/${productionA._id}`);
            response.should.have.property("status", 200);
            response.should.have.property("body").deep.equal(productionA);
        });
        it("Should return productions with the desired format", async () => {
            reqUser = admin;
            const fields: Object = "name",
                response: supertest.Response = await agent.get(`/api/productions/${productionA._id}`)
                    .query({ fields });
            response.should.have.property("status", 200);
            response.should.have.property("body").deep.equal({ name: productionA.name });
        });
        it("Should reject if the production is private", async () => {
            const response: supertest.Response = await agent.get(`/api/productions/${productionB._id}`);
            response.should.have.property("status", 400);
        });
        it("Should return the production if owned", async () => {
            reqUser = user;
            const response: supertest.Response = await agent.get(`/api/productions/${productionB._id}`);
            response.should.have.property("status", 200);
        });
        it("Should reject if the production is not found", async () => {
            const response: supertest.Response = await agent.get(`/api/productions/${v4()}`);
            response.should.have.property("status", 400);
        });
    });
    describe("Updating a production", () => {
        it("Should reject if user is not an administrator", async () => {
            reqUser = user;
            const response: supertest.Response = await agent.put(`/api/productions/${productionA._id}`)
                .send({ ...productionA, name: "New Name" });
            response.should.have.property("status", 400);
        });
        it("Should update a production", async () => {
            reqUser = admin;
            const prod: Production = { ...productionA, name: "New Name" },
                response: supertest.Response = await agent.put(`/api/productions/${productionA._id}`)
                    .send(prod);
            response.should.have.property("status", 200);
            GenericRepository.prototype.update.should.have.been.calledWith(prod);
            GenericRepository.prototype.update.should.have.been.calledOnce;
        });
        it("Should not update if the production is being downloaded/uploaded", async () => {
            reqUser = admin;
            const getLockedStub: sinon.SinonStub = stub(socket, "getLocked").callsFake(() => [productionA._id]),
                response: supertest.Response = await agent.put(`/api/productions/${productionA._id}`)
                    .send({ ...productionA, name: "New Name" });
            response.should.have.property("status", 400);
            GenericRepository.prototype.update.should.have.not.been.called;
            getLockedStub.restore();
        });
    });
    describe("Deleting a production", () => {
        it("Should reject if user is not an administrator", async () => {
            reqUser = user;
            const response: supertest.Response = await agent.delete(`/api/productions/${productionA._id}`);
            response.should.have.property("status", 400);
        });
        it("Should delete a production", async () => {
            reqUser = admin;
            const response: supertest.Response = await agent.delete(`/api/productions/${productionA._id}`);
            response.should.have.property("status", 200);
            GenericRepository.prototype.delete.should.have.been.calledWith(productionA._id);
            GenericRepository.prototype.delete.should.have.been.calledOnce;
        });
        it("Should not delete if the production is being downloaded/uploaded", async () => {
            reqUser = admin;
            const getLockedStub: sinon.SinonStub = stub(socket, "getLocked").callsFake(() => [productionA._id]),
                response: supertest.Response = await agent.delete(`/api/productions/${productionA._id}`);
            response.should.have.property("status", 400);
            GenericRepository.prototype.delete.should.have.not.been.called;
            getLockedStub.restore();
        });
    });
    describe("Ordering productions", () => {
        it("Should reject if it is not an array of strings", async () => {
            reqUser = admin;
            let response: supertest.Response = await agent.post("/api/productions/order").send({});
            response.should.have.property("status", 400);

            reqUser = admin;
            response = await agent.post("/api/productions/order").send();
            response.should.have.property("status", 400);

            reqUser = admin;
            response = await agent.post("/api/productions/order").send(["stuff", 0, undefined]);
            response.should.have.property("status", 400);
        });
        it("Should update the order of the productions", async () => {
            reqUser = admin;
            const response: supertest.Response = await agent.post("/api/productions/order").send([productionB._id, productionA._id]);
            response.should.have.property("status", 200);
            response.should.have.property("body").deep.equal([productionB._id, productionA._id, productionC._id]);
        });
    });
});
