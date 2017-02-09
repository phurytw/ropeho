/**
 * @file Unit test for the category controller
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../../typings.d.ts" />
import { should, use } from "chai";
import { stub } from "sinon";
import * as sinonChai from "sinon-chai";
import { v4 } from "node-uuid";
import { isArray, filter, head, map, includes, uniq } from "lodash";
import * as _ from "lodash";
import GenericRepository from "../../../src/server/dal/genericRepository";
import { Server } from "http";
import * as express from "express";
import { Express, Request, Response, NextFunction, RequestHandler } from "express-serve-static-core";
import * as supertest from "supertest";
import app from "../../../src/server/app";
import { computeHashSync } from "../../../src/server/accounts/password";
import { computeToken } from "../../../src/server/accounts/token";
import { Roles } from "../../../src/enum";
import { categories } from "../dal/testDb";
import uriFriendlyFormat from "../../../src/server/helpers/uriFriendlyFormat";
should();
use(sinonChai);

import User = Ropeho.Models.User;
import Category = Ropeho.Models.Category;

describe("Category controller", () => {
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
            type: Roles.User
        }, {
            _id: v4(),
            name: "Administrator",
            email: "admin@test.com",
            password: computeHashSync(testPassword).toString("hex"),
            token: computeToken(),
            productionIds: [],
            type: Roles.Administrator
        }],
        [user, admin]: User[] = users,
        [categoryA, categoryB]: Category[] = categories;
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
        createStub = stub(GenericRepository.prototype, "create").returnsArg(0);
        updateStub = stub(GenericRepository.prototype, "update", (params: any) => params ? (isArray(params) ? params.length : 1) : 0);
        deleteStub = stub(GenericRepository.prototype, "delete", (params: any) => params ? (isArray(params) ? params.length : 1) : 0);
        getStub = stub(GenericRepository.prototype, "get", (entities: Category | Category[]) => new Promise<Category | Category[]>((resolve: (value?: Category | Category[] | PromiseLike<Category | Category[]>) => void) => {
            if (!entities || (entities as Category[]).length === 0) {
                resolve(categories);
            } else {
                resolve(_(categories).filter((c: Category) => _(entities).map((e: Category) => e._id).includes(c._id)).thru((cats: Category[]) => (entities as Category[]).length === 1 ? head(cats) : cats).value());
            }
        }));
        getByIdStub = stub(GenericRepository.prototype, "getById", (id: string | string[], projection: any) => new Promise<Category | Category[]>((resolve: (value?: Category | Category[] | PromiseLike<Category | Category[]>) => void) => {
            if (isArray<string>(id)) {
                resolve(filter(categories, (c: User) => includes<string>(id, c._id)));
            } else {
                resolve(_(categories).filter((c: User) => c._id === id).head());
            }
        }));
        searchStub = stub(GenericRepository.prototype, "search", (filters: { [key: string]: string }) => new Promise<Category[]>((resolve: (value?: Category[] | PromiseLike<Category[]>) => void) => {
            if (filters && filters["name"]) {
                resolve(filter<User>(categories, (c: Category) => includes(uriFriendlyFormat(c.name), uriFriendlyFormat(filters["name"]))));
            } else {
                resolve([]);
            }
        }));
        orderStub = stub(GenericRepository.prototype, "order", (order?: string[]) => new Promise<string[]>((resolve: (value?: string[] | PromiseLike<string[]>) => void) => {
            if (isArray<string>(order)) {
                const currentOrder: string[] = map<Category, string>(categories, (c: Category) => c._id);
                resolve(uniq([...filter<string>(order, (o: string) => includes(currentOrder, o)), ...currentOrder]));
            } else {
                resolve(map<Category, string>(categories, (c: Category) => c._id));
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
    describe("Creating a category", () => {
        it("Should reject if it does not have a name", async () => {
            reqUser = admin;
            const response: supertest.Response = await agent.post("/api/categories")
                .send({ name: "" });
            response.should.have.property("status", 401);
        });
        it("Should reject if the normalized name exists in the database", async () => {
            reqUser = admin;
            const response: supertest.Response = await agent.post("/api/categories")
                .send({ name: "category a" });
            response.should.have.property("status", 401);
        });
        it("Should reject if current user is not an administrator", async () => {
            reqUser = user;
            const response: supertest.Response = await agent.post("/api/categories")
                .send({ name: "Test Category" });
            response.should.have.property("status", 403);
        });
        it("Should add a category otherwise", async () => {
            reqUser = admin;
            const testCategory: Category = { name: "Test Category" },
                response: supertest.Response = await agent.post("/api/categories")
                    .send(testCategory);
            response.should.have.property("status", 200);
            createStub.should.have.been.calledOnce;
            createStub.should.have.been.calledWith({ ...testCategory });
        });
    });
    describe("Getting one or multiple categories", () => {
        it("Should returns all categories", async () => {
            const response: supertest.Response = await agent.get("/api/categories");
            response.should.have.property("status", 200);
            response.body.should.deep.equal(categories);
        });
        it("Should returns matched categories", async () => {
            const response: supertest.Response = await agent.get("/api/categories")
                .query({ name: categoryA.name });
            response.should.have.property("status", 200);
            response.should.have.property("body").deep.equal([categoryA]);
        });
        it("Should returns categories with the desired format", async () => {
            const fields: Object = "name,_id",
                response: supertest.Response = await agent.get("/api/categories")
                    .query({ fields });
            response.should.have.property("status", 200);
            response.should.have.property("body").deep.equal(map<Category, Category>(categories, (c: Category) => ({ name: c.name, _id: c._id })));
        });
    });
    describe("Getting a category by ID", () => {
        it("Should the matched category", async () => {
            const response: supertest.Response = await agent.get(`/api/categories/${categoryA._id}`);
            response.should.have.property("status", 200);
            response.should.have.property("body").deep.equal(categoryA);
        });
        it("Should returns categories with the desired format", async () => {
            const fields: Object = "name",
                response: supertest.Response = await agent.get(`/api/categories/${categoryA._id}`)
                    .query({ fields });
            response.should.have.property("status", 200);
            response.should.have.property("body").deep.equal({ name: categoryA.name });
        });
    });
    describe("Updating a category", () => {
        it("Should update a category", async () => {
            reqUser = admin;
            const usr: Category = { ...categoryA, name: "New Name" },
                response: supertest.Response = await agent.put(`/api/categories/${categoryA._id}`)
                    .send(usr);
            response.should.have.property("status", 200);
            updateStub.should.have.been.calledWith(usr);
            updateStub.should.have.been.calledOnce;
        });
        it("Should update multiple categories", async () => {
            reqUser = admin;
            const cats: Category = map<Category, Category>(categories, (c: Category) => ({ ...c, name: "New Name" })),
                response: supertest.Response = await agent.put(`/api/categories/${categoryA._id}`)
                    .send(cats);
            response.should.have.property("status", 200);
            updateStub.should.have.been.calledWith(cats);
            updateStub.should.have.been.calledOnce;
        });
    });
    describe("Deleting a category", () => {
        it("Should reject if category is not an administrator", async () => {
            reqUser = user;
            const response: supertest.Response = await agent.delete(`/api/categories/${categoryA._id}`);
            response.should.have.property("status", 403);
        });
        it("Should delete a category", async () => {
            reqUser = admin;
            const response: supertest.Response = await agent.delete(`/api/categories/${categoryA._id}`);
            response.should.have.property("status", 200);
            deleteStub.should.have.been.calledWith(categoryA._id);
            deleteStub.should.have.been.calledOnce;
        });
    });
    describe("Ordering categories", () => {
        it("Should reject if it is not an array of strings", async () => {
            reqUser = admin;
            let response: supertest.Response = await agent.post("/api/categories/order").send({});
            response.should.have.property("status", 401);

            reqUser = admin;
            response = await agent.post("/api/categories/order").send();
            response.should.have.property("status", 401);

            reqUser = admin;
            response = await agent.post("/api/categories/order").send(["stuff", 0, undefined]);
            response.should.have.property("status", 401);
        });
        it("Should update the order of the categories", async () => {
            reqUser = admin;
            const response: supertest.Response = await agent.post("/api/categories/order").send([categoryB._id, categoryA._id]);
            response.should.have.property("status", 200);
            response.should.have.property("body").deep.equal([categoryB._id, categoryA._id]);
        });
    });
});
