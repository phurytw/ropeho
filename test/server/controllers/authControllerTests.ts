/**
 * @file Unit test for the authentication controller
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../../typings.d.ts" />
import { should, use } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as supertest from "supertest";
import app from "../../../src/server/app";
import { Server } from "http";
import { Express, Request, Response, NextFunction } from "express-serve-static-core";
import * as express from "express";
import { stub } from "sinon";
import { head, filter, isArray, includes, forEach } from "lodash";
import * as _ from "lodash";
import { v4 } from "node-uuid";
import { computeHashSync } from "../../../src/server/accounts/password";
import { computeToken } from "../../../src/server/accounts/token";
import { Roles } from "../../../src/enum";
import config from "../../../src/config";
import GenericRepository from "../../../src/server/dal/genericRepository";
import * as passport from "passport";
import uriFriendlyFormat from "../../../src/server/helpers/uriFriendlyFormat";

should();
use(chaiAsPromised);

import User = Ropeho.Models.User;

describe("Auth controller", () => {
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
        }, {
            _id: v4(),
            name: "New user",
            email: "new@test.com",
            password: "",
            token: computeToken(),
            productionIds: [],
            role: Roles.Administrator
        }],
        [user, admin, newUser]: User[] = users;
    let server: Server,
        agent: supertest.SuperTest<supertest.Test>,
        getStub: sinon.SinonStub,
        getByIdStub: sinon.SinonStub,
        searchStub: sinon.SinonStub;
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
                forEach<boolean>(config.database.users.indexes, (isUnique: boolean, index: string) => {
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
            server = testApp.listen(port, (err: Error) => err ? reject(err) : resolve());
        });

        agent = supertest(testApp);
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
    describe("Logging in", () => {
        describe("With email and password credentials", () => {
            it("Should reject if post data does not have email or password", () =>
                agent.post("/api/auth")
                    .send({ username: user.email, password: testPassword })
                    .should.eventually.have.property("status", 400));
            it("Should reject if user is not found", () =>
                agent.post("/api/auth")
                    .send({ email: "test@test.com", password: testPassword })
                    .should.eventually.have.property("status", 401));
            it("Should reject if password does not match", () =>
                agent.post("/api/auth")
                    .send({ email: user.email, password: `${testPassword}test` })
                    .should.eventually.have.property("status", 401));
            it("Should reject if the user is not registered", () =>
                agent.post("/api/auth")
                    .send({ email: newUser.email, password: testPassword })
                    .should.eventually.have.property("status", 401));
        });
        it("Should accept and create a session otherwise", async () => {
            const response: supertest.Response = await agent.post("/api/auth")
                .send({ email: user.email, password: testPassword });
            response.should.have.property("status", 200);
            response.should.have.property("header").with.property("set-cookie").with.deep.property("[0]").that.contain("ropeho.sid");
        });
    });
    it("Should log in using Facebook authentication", async () => {
        const response: supertest.Response = await agent.get("/api/auth/facebook");
        // Should send to facebook
        response.should.have.property("status", 302);
        response.should.have.property("header").with.property("location").that.contains("facebook");
    });
    it("Should redirect to admin homepage when Facebook Authentication is successful", async () => {
        // Stub authenticate
        const authenticateStub: sinon.SinonStub = stub(passport, "authenticate", () => (req: Request, res: Response, next: NextFunction) => {
            next();
        });
        const response: supertest.Response = await agent.get("/api/auth/facebook?admin=1");
        response.should.have.property("status", 302);
        response.should.have.property("header").with.property("location").that.contains(config.hosts.admin);
        authenticateStub.restore();
    });
    it("Should redirect to client homepage when Facebook Authentication is successful", async () => {
        // Stub authenticate
        const authenticateStub: sinon.SinonStub = stub(passport, "authenticate", () => (req: Request, res: Response, next: NextFunction) => {
            next();
        });
        const response: supertest.Response = await agent.get("/api/auth/facebook");
        response.should.have.property("status", 302);
        response.should.have.property("header").with.property("location").that.contains(config.hosts.client);
        authenticateStub.restore();
    });
});
