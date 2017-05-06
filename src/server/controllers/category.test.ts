/**
 * @file Unit tests for the category controller
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../../test.d.ts" />
import { should, use } from "chai";
import { stub, sandbox as sinonSandbox } from "sinon";
import * as sinonChai from "sinon-chai";
import { v4 } from "uuid";
import { isArray, filter, head, map, includes, uniq, cloneDeep } from "lodash";
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
import { categories, productions } from "../../sampleData/testDb";
import uriFriendlyFormat from "../../common/helpers/uriFriendlyFormat";
import * as socket from "../socket";
import * as detect from "detect-port";
import { endPoints } from "../../common/helpers/resolveEndPoint";
should();
use(sinonChai);

import User = Ropeho.Models.User;
import Category = Ropeho.Models.Category;
import Production = Ropeho.Models.Production;

describe("Category controller", () => {
    const testApp: Express = express(),
        testPassword: string = "123456",
        users: User[] = [{
            _id: v4(),
            name: "User",
            email: "user@test.com",
            password: computeHashSync(testPassword).toString("hex"),
            token: computeToken(),
            productionIds: [productions[1]._id],
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
        [categoryA, categoryB]: Category[] = categories;
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
            .callsFake((cat: Category) => {
                if (_(categories).map<string>((c: Category) => uriFriendlyFormat(c.name)).includes(uriFriendlyFormat(cat.name))) {
                    return Promise.reject<Error>(new Error("Name already in use"));
                } else {
                    return Promise.resolve<Category>(cat);
                }
            });
        sandbox.stub(GenericRepository.prototype, "update")
            .callsFake((params: any) => params ? (isArray(params) ? params.length : 1) : 0);
        sandbox.stub(GenericRepository.prototype, "delete")
            .callsFake((params: any) => params ? (isArray(params) ? params.length : 1) : 0);
        sandbox.stub(GenericRepository.prototype, "get")
            .callsFake((entities: Category | Category[]) => Promise.resolve<Category[]>(cloneDeep<Category[]>(categories)));
        sandbox.stub(GenericRepository.prototype, "getById")
            .callsFake((id: string | string[]) => {
                if (isArray<string>(id)) {
                    // Need to add productions because we use both with getById
                    return Promise.resolve<Category[]>(_([...categories, ...productions]).filter((c: User) => includes<string>(id, c._id)).cloneDeep());
                } else {
                    return Promise.resolve<Category>(_(categories).filter((c: User) => c._id === id).thru((categories: Category[]) => head(categories)).cloneDeep());
                }
            });
        sandbox.stub(GenericRepository.prototype, "search")
            .callsFake((filters: { [key: string]: string }) => {
                const properties: string[] = ["_id", "name"];
                if (filters) {
                    for (const p of properties) {
                        if (filters[p]) {
                            return Promise.resolve<Category[]>(_(categories).filter((c: Category) => includes(uriFriendlyFormat((c as any)[p]), uriFriendlyFormat(filters[p]))).cloneDeep());
                        }
                    }
                    return Promise.resolve<Category[]>([]);
                } else {
                    return Promise.resolve<Category[]>([]);
                }
            });
        sandbox.stub(GenericRepository.prototype, "order")
            .callsFake((order?: string[]) => {
                if (isArray<string>(order)) {
                    const currentOrder: string[] = map<Category, string>(categories, (c: Category) => c._id);
                    return Promise.resolve<string[]>(uniq([...filter<string>(order, (o: string) => includes(currentOrder, o)), ...currentOrder]));
                } else {
                    return Promise.resolve<string[]>(map<Category, string>(categories, (c: Category) => c._id));
                }
            });
    });
    afterEach(() => sandbox.restore());
    after(() => server.close());
    describe("Creating a category", () => {
        it("Should reject if it does not have a name", async () => {
            reqUser = admin;
            const response: supertest.Response = await agent.post("/api/categories")
                .send({ name: "" });
            response.should.have.property("status", 400);
        });
        it("Should reject if the normalized name exists in the database", async () => {
            reqUser = admin;
            const response: supertest.Response = await agent.post("/api/categories")
                .send({ name: "category a" });
            response.should.have.property("status", 400);
        });
        it("Should reject if current user is not an administrator", async () => {
            reqUser = user;
            const response: supertest.Response = await agent.post("/api/categories")
                .send({ name: "Test Category" });
            response.should.have.property("status", 400);
        });
        it("Should add a category otherwise", async () => {
            reqUser = admin;
            const testCategory: Category = { name: "Test Category" },
                response: supertest.Response = await agent.post("/api/categories")
                    .send(testCategory);
            response.should.have.property("status", 200);
            GenericRepository.prototype.create.should.have.been.calledOnce;
            GenericRepository.prototype.create.should.have.been.calledWithMatch({ ...testCategory });
        });
    });
    describe("Getting one or multiple categories", () => {
        it("Should return all categories", async () => {
            reqUser = admin;
            const response: supertest.Response = await agent.get("/api/categories");
            response.should.have.property("status", 200);
            response.body.should.deep.equal(map<Category, Category>(categories, (c: Category) => ({
                ...c,
                productions: filter<Production>(productions, (p: Production) => includes(c.productionIds, p._id))
            })));
        });
        it("Should return matched categories", async () => {
            reqUser = admin;
            const response: supertest.Response = await agent.get("/api/categories")
                .query({ name: categoryA.name });
            response.should.have.property("status", 200);
            response.should.have.property("body").deep.equal([{
                ...categoryA,
                productions: filter<Production>(productions, (p: Production) => includes(categoryA.productionIds, p._id))
            }]);
        });
        it("Should return categories with the desired format", async () => {
            reqUser = admin;
            const fields: Object = "name,_id,productions",
                response: supertest.Response = await agent.get("/api/categories")
                    .query({ fields });
            response.should.have.property("status", 200);
            response.should.have.property("body").deep.equal(map<Category, Category>(categories, (c: Category) => ({
                name: c.name,
                _id: c._id,
                productions: filter<Production>(productions, (p: Production) => includes(c.productionIds, p._id))
            })));
        });
        it("Should filter out private productions", async () => {
            const response: supertest.Response = await agent.get("/api/categories").query({ _id: categoryA._id });
            response.should.have.property("status", 200);
            response.should.have.property("body").deep.equal([{
                ...categoryA,
                productions: filter<Production>(productions, (p: Production) => p._id === categoryA.productionIds[0]),
                productionIds: [categoryA.productionIds[0]]
            }]);
        });
        it("Should keep owned productions", async () => {
            reqUser = user;
            const response: supertest.Response = await agent.get("/api/categories").query({ _id: categoryA._id });
            response.should.have.property("status", 200);
            response.should.have.property("body").deep.equal([{
                ...categoryA,
                productions: filter<Production>(productions, (p: Production) => p._id === categoryA.productionIds[0] || p._id === categoryA.productionIds[1]),
                productionIds: [categoryA.productionIds[0], categoryA.productionIds[1]]
            }]);
        });
        it("Should filter out private productions if the user wants to", async () => {
            reqUser = admin;
            const response: supertest.Response = await agent.get("/api/categories").query({ _id: categoryA._id }).query({ public: 1 });
            response.should.have.property("status", 200);
            response.should.have.property("body").deep.equal([{
                ...categoryA,
                productions: filter<Production>(productions, (p: Production) => p._id === categoryA.productionIds[0]),
                productionIds: [categoryA.productionIds[0]]
            }]);
        });
    });
    describe("Getting a category by ID", () => {
        it("Should return an error response when not found", async () => {
            const response: supertest.Response = await agent.get(`/api/categories/${v4()}`);
            response.should.have.property("status", 400);
        });
        it("Should return the found category", async () => {
            reqUser = admin;
            const response: supertest.Response = await agent.get(`/api/categories/${categoryA._id}`);
            response.should.have.property("status", 200);
            response.should.have.property("body").deep.equal({
                ...categoryA,
                productions: filter<Production>(productions, (p: Production) => includes(categoryA.productionIds, p._id))
            });
        });
        it("Should return categories with the desired format", async () => {
            reqUser = admin;
            const fields: Object = "name,_id,productions",
                response: supertest.Response = await agent.get(`/api/categories/${categoryA._id}`)
                    .query({ fields });
            response.should.have.property("status", 200);
            response.should.have.property("body").deep.equal({
                name: categoryA.name,
                _id: categoryA._id,
                productions: filter<Production>(productions, (p: Production) => includes(categoryA.productionIds, p._id))
            });
        });
        it("Should filter out private productions", async () => {
            const response: supertest.Response = await agent.get(`/api/categories/${categoryA._id}`);
            response.should.have.property("status", 200);
            response.should.have.property("body").deep.equal({
                ...categoryA,
                productions: filter<Production>(productions, (p: Production) => p._id === categoryA.productionIds[0]),
                productionIds: [categoryA.productionIds[0]]
            });
        });
        it("Should keep owned productions", async () => {
            reqUser = user;
            const response: supertest.Response = await agent.get(`/api/categories/${categoryA._id}`);
            response.should.have.property("status", 200);
            response.should.have.property("body").deep.equal({
                ...categoryA,
                productions: filter<Production>(productions, (p: Production) => p._id === categoryA.productionIds[0] || p._id === categoryA.productionIds[1]),
                productionIds: [categoryA.productionIds[0], categoryA.productionIds[1]]
            });
        });
        it("Should filter out private productions if the user wants to", async () => {
            reqUser = admin;
            const response: supertest.Response = await agent.get(`/api/categories/${categoryA._id}`).query({ public: 1 });
            response.should.have.property("status", 200);
            response.should.have.property("body").deep.equal({
                ...categoryA,
                productions: filter<Production>(productions, (p: Production) => p._id === categoryA.productionIds[0]),
                productionIds: [categoryA.productionIds[0]]
            });
        });
    });
    describe("Updating a category", () => {
        it("Should reject if user is not an administrator", async () => {
            reqUser = user;
            const response: supertest.Response = await agent.put(`/api/categories/${categoryA._id}`)
                .send({ ...categoryA, name: "New Name" });
            response.should.have.property("status", 400);
        });
        it("Should update a category", async () => {
            reqUser = admin;
            const cat: Category = { ...categoryA, name: "New Name" },
                response: supertest.Response = await agent.put(`/api/categories/${categoryA._id}`)
                    .send(cat);
            response.should.have.property("status", 200);
            GenericRepository.prototype.update.should.have.been.calledWith(cat);
            GenericRepository.prototype.update.should.have.been.calledOnce;
        });
        it("Should not update if the category is being uploaded", async () => {
            reqUser = admin;
            const getLockedStub: sinon.SinonStub = stub(socket, "getLocked")
                .callsFake(() => [categoryA._id]),
                response: supertest.Response = await agent.put(`/api/categories/${categoryA._id}`)
                    .send({ ...categoryA, name: "New Name" });
            response.should.have.property("status", 400);
            GenericRepository.prototype.update.should.have.not.been.called;
            getLockedStub.restore();
        });
    });
    describe("Deleting a category", () => {
        it("Should reject if user is not an administrator", async () => {
            reqUser = user;
            const response: supertest.Response = await agent.delete(`/api/categories/${categoryA._id}`);
            response.should.have.property("status", 400);
        });
        it("Should delete a category", async () => {
            reqUser = admin;
            const response: supertest.Response = await agent.delete(`/api/categories/${categoryA._id}`);
            response.should.have.property("status", 200);
            GenericRepository.prototype.delete.should.have.been.calledWith(categoryA._id);
            GenericRepository.prototype.delete.should.have.been.calledOnce;
        });
        it("Should not delete if the category is being uploaded", async () => {
            reqUser = admin;
            const getLockedStub: sinon.SinonStub = stub(socket, "getLocked")
                .callsFake(() => [categoryA._id]),
                response: supertest.Response = await agent.delete(`/api/categories/${categoryA._id}`);
            response.should.have.property("status", 400);
            GenericRepository.prototype.delete.should.have.not.been.called;
            getLockedStub.restore();
        });
    });
    describe("Ordering categories", () => {
        it("Should reject if it is not an array of strings", async () => {
            reqUser = admin;
            let response: supertest.Response = await agent.post("/api/categories/order").send({});
            response.should.have.property("status", 400);

            reqUser = admin;
            response = await agent.post("/api/categories/order").send();
            response.should.have.property("status", 400);

            reqUser = admin;
            response = await agent.post("/api/categories/order").send(["stuff", 0, undefined]);
            response.should.have.property("status", 400);
        });
        it("Should update the order of the categories", async () => {
            reqUser = admin;
            const response: supertest.Response = await agent.post("/api/categories/order").send([categoryB._id, categoryA._id]);
            response.should.have.property("status", 200);
            response.should.have.property("body").deep.equal([categoryB._id, categoryA._id]);
        });
    });
});
