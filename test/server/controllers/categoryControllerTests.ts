/**
 * @file Unit test for the category controller
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../../typings.d.ts" />
import { should, use } from "chai";
import { stub } from "sinon";
import * as sinonChai from "sinon-chai";
import { v4 } from "node-uuid";
import { isArray, filter, head, map } from "lodash";
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
        middleware: RequestHandler,
        reqUser: User;
    before(async () => {
        // Stub the repository class methods
        createStub = stub(GenericRepository.prototype, "create").returnsArg(0);
        updateStub = stub(GenericRepository.prototype, "update", (params: any) => params ? (isArray(params) ? params.length : 1) : 0);
        deleteStub = stub(GenericRepository.prototype, "delete", (params: any) => params ? (isArray(params) ? params.length : 1) : 0);
        getStub = stub(GenericRepository.prototype, "get", (query: any, projection: any) => new Promise<Category[]>((resolve: (value?: Category[] | PromiseLike<Category[]>) => void) => {
            query = query || {};
            const { name, normalizedName }: any = query;
            if (name) {
                resolve(filter<Category>(categories, (u: Category) => u.name === name));
                return;
            }
            if (normalizedName) {
                resolve(filter<Category>(categories, (u: Category) => u.normalizedName === normalizedName));
                return;
            }
            resolve(categories);
        }));
        getByIdStub = stub(GenericRepository.prototype, "getById", (id: string, projection: any) => new Promise<User>((resolve: (value?: User | PromiseLike<User>) => void) => {
            resolve(head(filter(categories, (u: User) => u._id === id)));
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
    });
    after(() => {
        server.close();
        createStub.restore();
        updateStub.restore();
        deleteStub.restore();
        getStub.restore();
        getByIdStub.restore();
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
            createStub.should.have.been.calledWith({ ...testCategory, name: uriFriendlyFormat(testCategory.name) });
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
                .query({ fields: { name: categoryA.name } });
            response.should.have.property("status", 200);
            response.should.have.property("body").deep.equal([categoryA]);
        });
        it("Should returns categories with the desired format", async () => {
            const projection: Object = { name: "1" },
                response: supertest.Response = await agent.get("/api/categories")
                    .query({ projection });
            response.should.have.property("status", 200);
            getStub.should.have.been.calledWith(undefined, projection);
        });
    });
    describe("Getting a category by ID", () => {
        it("Should the matched category", async () => {
            const response: supertest.Response = await agent.get(`/api/categories/${categoryA._id}`);
            response.should.have.property("status", 200);
            response.should.have.property("body").deep.equal(categoryA);
        });
        it("Should returns categories with the desired format", async () => {
            const projection: Object = { name: "1" },
                response: supertest.Response = await agent.get(`/api/categories/${categoryA._id}`)
                    .query({ projection });
            response.should.have.property("status", 200);
            getByIdStub.should.have.been.calledWith(categoryA._id, projection);
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
});
