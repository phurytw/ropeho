/**
 * @file Unit test for the authentication controller
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../../test.d.ts" />
import { should, use } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as sinonChai from "sinon-chai";
import * as supertest from "supertest";
import app from "../app";
import { Server } from "http";
import { Express, Request, Response, NextFunction, RequestHandler } from "express-serve-static-core";
import * as express from "express";
import { stub, sandbox as sinonSandbox } from "sinon";
import { head, filter, isArray, includes, keys } from "lodash";
import * as _ from "lodash";
import { v4 } from "uuid";
import { computeHashSync } from "../accounts/password";
import { computeToken } from "../accounts/token";
import { Roles } from "../../enum";
import config from "../../config";
import { endPoints } from "../../common/helpers/resolveEndPoint";
import GenericRepository from "../dal/genericRepository";
import * as passport from "passport";
import uriFriendlyFormat from "../../common/helpers/uriFriendlyFormat";
import * as detect from "detect-port";
import * as socketServer from "../socket";

should();
use(chaiAsPromised);
use(sinonChai);

import User = Ropeho.Models.User;

describe("Auth controller", () => {
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
        }, {
            _id: v4(),
            name: "New user",
            email: "new@test.com",
            password: "",
            token: computeToken(),
            productionIds: [],
            role: Roles.Administrator
        }],
        user: User = users[0],
        newUser: User = users[2];
    let server: Server,
        port: number,
        agent: supertest.SuperTest<supertest.Test>,
        sandbox: sinon.SinonSandbox,
        middleware: RequestHandler,
        reqUser: User = undefined;
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

        sandbox = sinonSandbox.create();
        agent = supertest(testApp);
    });
    beforeEach(() => {
        sandbox.stub(GenericRepository.prototype, "get")
            .callsFake((entities: User | User[]) => {
                if (!entities || (entities as User[]).length === 0) {
                    return Promise.resolve<User[]>(users);
                } else {
                    return Promise.resolve<User | User[]>(_(users).filter((u: User) => _(entities).map((e: User) => e._id).includes(u._id)).thru((usrs: User[]) => (entities as User[]).length === 1 ? head(usrs) : usrs).value());
                }
            });
        sandbox.stub(GenericRepository.prototype, "getById")
            .callsFake((id: string | string[]) => {
                if (isArray<string>(id)) {
                    return Promise.resolve<User[]>(filter(users, (u: User) => includes<string>(id, u._id)));
                } else {
                    return Promise.resolve<User>(_(users).filter((u: User) => u._id === id).head());
                }
            });
        sandbox.stub(GenericRepository.prototype, "search")
            .callsFake((filters: { [key: string]: string }) => {
                if (filters) {
                    for (const index of keys(config.database.users.indexes)) {
                        if (filters[index]) {
                            return Promise.resolve<User[]>(filter<User>(users, (u: User) => includes(uriFriendlyFormat((u as any)[index]), uriFriendlyFormat(filters[index]))));
                        }
                    }
                } else {
                    return Promise.resolve<User[]>([]);
                }
            });
    });
    afterEach(() => sandbox.restore());
    after(() => {
        server.close();
        // Gotta do this because somehow functions used in passport after the first run cannot be stubbed
        delete require.cache[require.resolve("passport")];
    });
    describe("Logging in", () => {
        describe("With email and password credentials", () => {
            it("Should reject if post data does not have email or password", () =>
                agent.post("/api/auth")
                    .send({ username: user.email, password: testPassword })
                    .should.eventually.have.property("status", 500));
            it("Should reject if user is not found", () =>
                agent.post("/api/auth")
                    .send({ email: "test@test.com", password: testPassword })
                    .should.eventually.have.property("status", 400));
            it("Should reject if password does not match", () =>
                agent.post("/api/auth")
                    .send({ email: user.email, password: `${testPassword}test` })
                    .should.eventually.have.property("status", 400));
            it("Should reject if the user is not registered", () =>
                agent.post("/api/auth")
                    .send({ email: newUser.email, password: testPassword })
                    .should.eventually.have.property("status", 400));
            it("Should accept and create a session otherwise", async () => {
                const response: supertest.Response = await agent.post("/api/auth")
                    .send({ email: user.email, password: testPassword });
                response.should.have.property("status", 200);
                response.should.have.property("header").with.property("set-cookie").with.deep.property("[0]").that.contain("ropeho.sid");
            });
        });
    });
    it("Should return an empty object if the user is not logged in", async () => {
        const response: supertest.Response = await agent.get("/api/auth")
            .send();
        response.should.have.property("status", 200);
        response.should.have.property("body").deep.equal({});
    });
    it("Should return the current user is the user is logged in", async () => {
        reqUser = user;
        const response: supertest.Response = await agent.get("/api/auth")
            .send();
        response.should.have.property("status", 200);
        response.should.have.property("body").deep.equal(user);
    });
    it("Should log in using Facebook authentication", async () => {
        const response: supertest.Response = await agent.get("/api/auth/facebook");
        // Should send to facebook
        response.should.have.property("status", 302);
        response.should.have.property("header").with.property("location").that.contains("facebook");
    });
    it("Should redirect to admin homepage when Facebook Authentication is successful", async () => {
        // Stub authenticate
        const authenticateStub: sinon.SinonStub = stub(passport, "authenticate")
            .callsFake(() => (req: Request, res: Response, next: NextFunction) => next());
        const response: supertest.Response = await agent.get("/api/auth/facebook?admin=1");
        response.should.have.property("status", 302);
        response.should.have.property("header").with.property("location").that.contains(endPoints.admin.host);
        authenticateStub.restore();
    });
    it("Should redirect to client homepage when Facebook Authentication is successful", async () => {
        // Stub authenticate
        const authenticateStub: sinon.SinonStub = stub(passport, "authenticate")
            .callsFake(() => (req: Request, res: Response, next: NextFunction) => next());
        const response: supertest.Response = await agent.get("/api/auth/facebook");
        response.should.have.property("status", 302);
        response.should.have.property("header").with.property("location").that.contains(endPoints.client.host);
        authenticateStub.restore();
    });
    it("Should authenticate the user in the socket server from a cookie", async () => {
        reqUser = user;
        const setUserStub: sinon.SinonStub = stub(socketServer, "assignCookieToClient");
        const clientId: string = "12345";
        const cookieValue: string = "cookieYo";
        const cookie: string = `${config.session.name}=${cookieValue}`;
        const response: supertest.Response = await agent.post(`/api/auth/socket/${clientId}`).set("Cookie", cookie);
        response.should.have.property("status", 200);
        setUserStub.should.have.been.calledOnce;
        setUserStub.should.have.been.calledWith(clientId, cookieValue);
        setUserStub.restore();
    });
});
