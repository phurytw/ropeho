/**
 * @file Unit test for the authorize module
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
import { head, filter } from "lodash";
import { v4 } from "node-uuid";
import { computeHashSync } from "../../../src/server/accounts/password";
import { computeToken } from "../../../src/server/accounts/token";
import { Roles } from "../../../src/enum";
import config from "../../../src/config";
import GenericRepository from "../../../src/server/dal/nedbGenericRepository";
import { isAdmin, isAuthenticated, deserializeCookie } from "../../../src/server/accounts/authorize";
import { sign } from "cookie-signature";
import redis from "../../../src/server/redis";
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
            type: Roles.User
        }, {
            _id: v4(),
            name: "Administrator",
            email: "admin@test.com",
            password: computeHashSync(testPassword).toString("hex"),
            token: computeToken(),
            productionIds: [],
            type: Roles.Administrator
        }, {
            _id: v4(),
            name: "Outdated",
            email: "outdated@test.com",
            password: computeHashSync(testPassword).toString("hex"),
            token: computeToken(config.users.tokenLength, -1),
            productionIds: [],
            type: Roles.User
        }, {
            _id: v4(),
            name: "",
            email: "pending@test.com",
            password: "",
            token: computeToken(),
            productionIds: [],
            type: Roles.User
        }],
        [user, admin, outdated, pending]: User[] = users;
    let server: Server,
        agent: supertest.SuperTest<supertest.Test>,
        getStub: sinon.SinonStub,
        getByIdStub: sinon.SinonStub,
        userCookie: string,
        adminCookie: string;
    before(async () => {
        // Set stubs
        getStub = stub(GenericRepository.prototype, "get", (query: any, projection: any) => new Promise<User[]>((resolve: (value?: User[] | PromiseLike<User[]>) => void) => {
            const { email, token }: any = query;
            if (email) {
                resolve(filter<User>(users, (u: User) => u.email === email));
                return;
            }
            if (token) {
                // tslint:disable-next-line:possible-timing-attack
                resolve(filter<User>(users, (u: User) => u.token === token));
                return;
            }
            resolve([]);
        }));
        getByIdStub = stub(GenericRepository.prototype, "getById", (id: string, projection: any) => new Promise<User>((resolve: (value?: User | PromiseLike<User>) => void) => {
            resolve(head(filter(users, (u: User) => u._id === id)));
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
    });
    after(() => {
        getStub.restore();
        getByIdStub.restore();
        server.close();
    });
    describe("Verifying if user is authenticated", () => {
        it("Should reject if no cookie is provided", () =>
            agent.get("/authorizeTests")
                .should.eventually.have.property("status", 403));
        it("Should accept if user is authenticated", () =>
            agent.get("/authorizeTests")
                .set("Cookie", userCookie)
                .should.eventually.have.property("status", 200));
    });
    describe("Verifying if user is administrator", () => {
        it("Should reject if no cookie is provided", () =>
            agent.get("/authorizeTests/admin")
                .should.eventually.have.property("status", 403));
        it("Should reject if user is authenticated but not administrator", () =>
            agent.get("/authorizeTests/admin")
                .set("Cookie", userCookie)
                .should.eventually.have.property("status", 403));
        it("Should accept if user is an administrator", async () =>
            agent.get("/authorizeTests/admin")
                .set("Cookie", adminCookie)
                .should.eventually.have.property("status", 200));
    });
    describe("Verifying cookie manually", () => {
        const validCookie: Express.Session = {
            id: v4(),
            regenerate: undefined,
            cookie: {
                originalMaxAge: 3600000,
                expires: new Date("2017-02-05T20:55:49.998Z"),
                secure: false,
                httpOnly: true,
                path: "/",
                domain: undefined,
                maxAge: undefined,
                serialize: undefined
            },
            passport: {
                user: "6c83e4cb-a7ef-4c9f-8d05-4118e3ceebea"
            },
            destroy: undefined,
            reload: undefined,
            save: undefined,
            touch: undefined,
        },
            cookieValue: string = "lXHN8zHrv_Rt5e7vVfQn_svJwQMBKaem",
            cookieSigned: string = sign("lXHN8zHrv_Rt5e7vVfQn_svJwQMBKaem", config.session.secret);
        let redisStub: sinon.SinonStub;
        before(() => redisStub = stub(redis, "get", (key: string, callback: (err: Error, cookie?: Express.Session) => void) => {
            if (key === cookieValue) {
                callback(undefined, validCookie);
            } else {
                callback(new Error());
            }
        }));
        afterEach(() => redisStub.reset());
        after(() => redis.restore());
        it("Should returns the user ID", () => {
            return deserializeCookie(cookieSigned).should.eventually.equal(validCookie["passport"].user);
        });
    });
});
