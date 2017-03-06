/**
 * @file Unit test for the authorize module
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../../test.d.ts" />
import { should, use } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as supertest from "supertest";
import app from "../app";
import { Server } from "http";
import { Express, Request, Response, NextFunction } from "express-serve-static-core";
import * as express from "express";
import { stub } from "sinon";
import { head, filter, isArray, includes, forEach } from "lodash";
import * as _ from "lodash";
import { v4 } from "uuid";
import { computeHashSync } from "../accounts/password";
import { computeToken } from "../accounts/token";
import { Roles } from "../../enum";
import config from "../../config";
import GenericRepository from "../dal/genericRepository";
import { isAdmin, isAuthenticated, deserializeCookie } from "../accounts/authorize";
import uriFriendlyFormat from "../helpers/uriFriendlyFormat";
should();
use(chaiAsPromised);

import User = Ropeho.Models.User;

describe("Authorize middlewares", () => {
    const testApp: Express = express(), port: number = process.env.PORT || 3010, testPassword: string = "123456",
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
        }, {
            _id: v4(),
            name: "Outdated",
            email: "outdated@test.com",
            password: computeHashSync(testPassword).toString("hex"),
            token: computeToken(config.users.tokenLength, -1),
            productionIds: [],
            role: Roles.User
        }, {
            _id: v4(),
            name: "",
            email: "pending@test.com",
            password: "",
            token: computeToken(),
            productionIds: [],
            role: Roles.User
        }],
        [user, admin, outdated, pending]: User[] = users;
    let server: Server,
        agent: supertest.SuperTest<supertest.Test>,
        getStub: sinon.SinonStub,
        getByIdStub: sinon.SinonStub,
        searchStub: sinon.SinonStub,
        userCookie: string,
        adminCookie: string;
    before(async () => {
        // Set stubs
        getStub = stub(GenericRepository.prototype, "get", (entities: User | User[]) => new Promise<User | User[]>((resolve: (value?: User | User[] | PromiseLike<User | User[]>) => void) => {
            if (!entities || (entities as User[]).length === 0) {
                resolve(users);
            } else {
                resolve(_(users).filter((u: User) => _(entities).map((e: User) => e._id).includes(u._id)).thru((usrs: User[]) => (entities as User[]).length === 1 ? head(usrs) : usrs).value());
            }
        }));
        getByIdStub = stub(GenericRepository.prototype, "getById", (id: string | string[]) => new Promise<User | User[]>((resolve: (value?: User | User[] | PromiseLike<User | User[]>) => void) => {
            if (isArray<string>(id)) {
                resolve(filter(users, (u: User) => includes<string>(id, u._id)));
            } else {
                resolve(_(users).filter((u: User) => u._id === id).head());
            }
        }));
        searchStub = stub(GenericRepository.prototype, "search", (filters: { [key: string]: string }) => new Promise<User[]>((resolve: (value?: User[] | PromiseLike<User[]>) => void) => {
            if (filters) {
                forEach<{ [key: string]: Ropeho.Models.IIndexOptions }>(config.database.users.indexes, (isUnique: boolean, index: string) => {
                    if (filters[index]) {
                        resolve(filter<User>(users, (u: User) => includes(uriFriendlyFormat((u as any)[index]), uriFriendlyFormat(filters[index]))));
                    }
                });
            } else {
                resolve([]);
            }
        }));

        // Setting up the server
        await new Promise<void>((resolve: () => void, reject: (reason?: any) => void) => {
            testApp.use(app);

            // Set authorize test routes
            testApp.get("/authorizeTests", isAuthenticated, (req: Request, res: Response, next: NextFunction) => res.status(200).send());
            testApp.get("/authorizeTests/admin", isAdmin, (req: Request, res: Response, next: NextFunction) => res.status(200).send());

            server = testApp.listen(port, (err: Error) => err ? reject(err) : resolve());
        });

        // Setup supertest
        agent = supertest(testApp);

        // Getting cookies
        let response: supertest.Response = await agent.post("/api/auth")
            .send({ email: user.email, password: testPassword });
        response.status.should.equal(200);
        userCookie = response.header["set-cookie"][0].split(";")[0];
        response = await agent.post("/api/auth")
            .send({ email: admin.email, password: testPassword });
        response.status.should.equal(200);
        adminCookie = response.header["set-cookie"][0].split(";")[0];
    });
    beforeEach(() => {
        getStub.reset();
        getByIdStub.reset();
        searchStub.reset();
    });
    after(() => {
        getStub.restore();
        getByIdStub.restore();
        searchStub.restore();
        server.close();
        // Gotta do this because somehow functions used in passport after the first run cannot be stubbed
        delete require.cache[require.resolve("passport")];
    });
    describe("Verifying if user is authenticated", () => {
        it("Should reject if no cookie is provided", () =>
            agent.get("/authorizeTests")
                .should.eventually.have.property("status", 400));
        it("Should accept if user is authenticated", () =>
            agent.get("/authorizeTests")
                .set("Cookie", userCookie)
                .should.eventually.have.property("status", 200));
    });
    describe("Verifying if user is administrator", () => {
        it("Should reject if no cookie is provided", () =>
            agent.get("/authorizeTests/admin")
                .should.eventually.have.property("status", 400));
        it("Should reject if user is authenticated but not administrator", () =>
            agent.get("/authorizeTests/admin")
                .set("Cookie", userCookie)
                .should.eventually.have.property("status", 400));
        it("Should accept if user is an administrator", async () =>
            agent.get("/authorizeTests/admin")
                .set("Cookie", adminCookie)
                .should.eventually.have.property("status", 200));
    });
    describe("Verifying cookie manually", () => {
        it("Should return the user ID", () =>
            deserializeCookie(`${adminCookie.split("=")[1]}`).should.eventually.equal(admin._id));
    });
});
