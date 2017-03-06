/**
 * @file Unit tests for the search controller
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../../test.d.ts" />
import { should } from "chai";
import { stub } from "sinon";
import app from "../app";
import * as supertest from "supertest";
import { categories, productions, users } from "../dal/testDb";
import { Express, Request, Response, NextFunction, RequestHandler } from "express-serve-static-core";
import { Server } from "http";
import * as express from "express";
import GlobalRepository from "../dal/globalRepository";
import uriFriendlyFormat from "../helpers/uriFriendlyFormat";
import { cloneDeep, filter, every, includes } from "lodash";
should();

import Category = Ropeho.Models.Category;
import Production = Ropeho.Models.Production;
import User = Ropeho.Models.User;
type Entity = Category | Production | User;

describe("Search controller", () => {
    const testApp: Express = express(),
        port: number = process.env.PORT || 3010,
        [admin, user]: User[] = users,
        [categoryA, categoryB]: Category[] = categories,
        [productionA, productionB, productionC]: Production[] = productions;
    let server: Server,
        agent: supertest.SuperTest<supertest.Test>,
        searchStub: sinon.SinonStub,
        middleware: RequestHandler,
        reqUser: User;
    before(async () => {
        searchStub = stub(GlobalRepository.prototype, "search", (filters: { [key: string]: string }) => new Promise<Entity>((resolve: (value?: Entity | PromiseLike<Entity>) => void) =>
            resolve(filter<Entity>([...categories, ...productions, ...users], (e: Entity) => every<string>(filters, (val: string, key: string) =>
                includes(uriFriendlyFormat((e as any)[key]), uriFriendlyFormat(val)))))));

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
    after(() => {
        searchStub.restore();
        server.close();
    });
    afterEach(() => searchStub.reset());
    it("Should be able to search by name", async () => {
        reqUser = admin;
        const response: supertest.Response = await agent.get(`/api/search/a`);
        response.should.have.property("status", 200);
        response.should.have.property("body").that.has.property("categories").that.contains(categoryA);
        response.should.have.property("body").that.has.property("categories").that.contains(categoryB);
        response.should.have.property("body").that.has.property("productions").that.contains(productionA);
        response.should.have.property("body").that.has.property("users").that.contains(admin);
    });
    it("Should be able to combine with custom filters", async () => {
        reqUser = admin;
        const response: supertest.Response = await agent.get(`/api/search/a`).query({ email: "a" });
        response.should.have.property("status", 200);
        response.should.have.property("body").that.has.property("users").that.contains(admin);
    });
    it("Should filter results when not administrator", async () => {
        const response: supertest.Response = await agent.get(`/api/search/b`);
        const filteredCategory: Category = cloneDeep<Category>(categoryB);
        delete filteredCategory.productionIds;
        response.should.have.property("status", 200);
        response.should.have.property("body").that.has.property("categories").that.contains(filteredCategory);
    });
    it("Should filter results but keep owned productions", async () => {
        reqUser = user;
        const response: supertest.Response = await agent.get(`/api/search/b`);
        const filteredCategory: Category = cloneDeep<Category>(categoryB);
        delete filteredCategory.productionIds;
        response.should.have.property("status", 200);
        response.should.have.property("body").that.has.property("categories").that.contains(filteredCategory);
        response.should.have.property("body").that.has.property("productions").that.contains(productionB);
    });
});
