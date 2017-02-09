/**
 * @file Unit test for the user controller
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../../typings.d.ts" />
import { should, use } from "chai";
import { stub } from "sinon";
import * as sinonChai from "sinon-chai";
import { v4 } from "node-uuid";
import { isArray, filter, head, map, includes, forEach } from "lodash";
import * as _ from "lodash";
import GenericRepository from "../../../src/server/dal/genericRepository";
import { Server } from "http";
import * as express from "express";
import { Express, Request, Response, NextFunction, RequestHandler } from "express-serve-static-core";
import * as supertest from "supertest";
import app from "../../../src/server/app";
import config from "../../../src/config";
import { computeHashSync } from "../../../src/server/accounts/password";
import { computeToken } from "../../../src/server/accounts/token";
import { Roles } from "../../../src/enum";
import * as passport from "passport";
import mailer from "../../../src/server/helpers/mailer";
import uriFriendlyFormat from "../../../src/server/helpers/uriFriendlyFormat";
should();
use(sinonChai);

import User = Ropeho.Models.User;

describe("User controller", () => {
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
        }, {
            _id: v4(),
            name: "Facebook Name",
            email: "facebook@test.com",
            password: "",
            token: computeToken(),
            productionIds: [],
            facebookId: "0123456789",
            type: Roles.User
        }],
        [user, admin, outdated, pending, facebook]: User[] = users;
    let server: Server,
        agent: supertest.SuperTest<supertest.Test>,
        createStub: sinon.SinonStub,
        updateStub: sinon.SinonStub,
        deleteStub: sinon.SinonStub,
        getStub: sinon.SinonStub,
        getByIdStub: sinon.SinonStub,
        searchStub: sinon.SinonStub,
        sendMailStub: sinon.SinonStub,
        actuallySendMail: boolean = false,
        middleware: RequestHandler,
        reqUser: User;
    before(async () => {
        // Stub the repository class methods
        createStub = stub(GenericRepository.prototype, "create").returnsArg(0);
        updateStub = stub(GenericRepository.prototype, "update", (params: User | User[]) => params ? (isArray(params) ? params.length : 1) : 0);
        deleteStub = stub(GenericRepository.prototype, "delete", (params: User | User[] | string | string[]) => params ? (isArray(params) ? params.length : 1) : 0);
        getStub = stub(GenericRepository.prototype, "get", (entities: User | User[]) => new Promise<User | User[]>((resolve: (value?: User | User[] | PromiseLike<User | User[]>) => void) => {
            if (!entities || (entities as User[]).length === 0) {
                resolve(users);
            } else {
                resolve(_(users).filter((u: User) => _(entities).map((e: User) => e._id).includes(u._id)).thru((usrs: User[]) => (entities as User[]).length === 1 ? head(usrs) : usrs).value());
            }
        }));
        getByIdStub = stub(GenericRepository.prototype, "getById", (id: string | string[], projection: any) => new Promise<User | User[]>((resolve: (value?: User | User[] | PromiseLike<User | User[]>) => void) => {
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
        sendMailStub = (() => {
            const original: Function = mailer.sendMail.bind(mailer),
                mailStub: sinon.SinonStub = stub(mailer, "sendMail", (...args: any[]) => {
                    if (actuallySendMail) {
                        actuallySendMail = false;
                        return original(...args);
                    } else {
                        return new Promise<nodemailer.SendMailOptions>((resolve: (value?: nodemailer.SendMailOptions | PromiseLike<nodemailer.SendMailOptions>) => void, reject: (reason?: any) => void) => {
                            resolve(mailStub.args);
                        });
                    }
                });
            return mailStub;
        })();

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
        sendMailStub.reset();
        searchStub.reset();
    });
    after(() => {
        server.close();
        createStub.restore();
        updateStub.restore();
        deleteStub.restore();
        getStub.restore();
        getByIdStub.restore();
        sendMailStub.restore();
        searchStub.restore();
    });
    describe("Creating an user", () => {
        it("Should reject if no email is specified", async () => {
            // Execute as administrator
            reqUser = admin;
            const response: supertest.Response = await agent.post("/api/users")
                .send({});
            response.should.have.property("status", 400);
            createStub.should.have.not.been.called;
        });
        it("Should reject if email is not a valid email", async () => {
            // Execute as administrator
            reqUser = admin;
            const response: supertest.Response = await agent.post("/api/users")
                .send({ email: "test@test" });
            response.should.have.property("status", 400);
            createStub.should.have.not.been.called;
        });
        it("Should reject if email is already used", async () => {
            // Execute as administrator
            reqUser = admin;
            const response: supertest.Response = await agent.post("/api/users")
                .send({ email: user.email });
            response.should.have.property("status", 401);
            createStub.should.have.not.been.called;
        });
        it("Should accept and create a new user with a token and an ID if email is valid and send an invitation", async () => {
            // Execute as administrator
            reqUser = admin;
            const response: supertest.Response = await agent.post("/api/users")
                .send({ email: "test@test.com" });
            response.should.have.property("status", 200);
            createStub.should.have.been.calledOnce;
            const user: User = response.body;
            user._id.should.not.be.empty;
            user.token.should.not.be.empty;
            const tokenData: string[] = user.token.split("-");
            tokenData.should.have.lengthOf(2);
            const [token, timestamp]: string[] = tokenData;
            isNaN(parseInt(timestamp)).should.be.false;
            sendMailStub.should.have.been.calledOnce;
        });
        it("Should reject if current user is not an administrator", async () => {
            // Execute as user
            reqUser = user;
            const response: supertest.Response = await agent.post("/api/users")
                .send({ email: "test@test.com" });
            response.should.have.property("status", 403);
        });
    });
    describe("Registering an user", () => {
        let nonExistentToken: string;
        describe("Token", () => {
            before(() => {
                nonExistentToken = computeToken();
            });
            it("Should reject if token is not found", async () => {
                const response: supertest.Response = await agent.post(`/api/users/register/${nonExistentToken}`)
                    .send({ name: "test", password: testPassword });
                response.should.have.property("status", 404);
                const errorMessage: string = response.text;
                errorMessage.should.contain(nonExistentToken);
            });
            it("Should reject if token is expired", async () => {
                const response: supertest.Response = await agent.post(`/api/users/register/${outdated.token}`)
                    .send({ name: "test", password: testPassword });
                response.should.have.property("status", 401);
                const errorMessage: string = response.text;
                errorMessage.should.contain("expired");
            });
            it("Should reject if the user has already setup his password", async () => {
                const response: supertest.Response = await agent.post(`/api/users/register/${user.token}`)
                    .send({ name: "test", password: testPassword });
                response.should.have.property("status", 401);
            });
            it("Should reject if the user has link his account to Facebook", async () => {
                const response: supertest.Response = await agent.post(`/api/users/register/${facebook.token}`)
                    .send({ name: "test", password: testPassword });
                response.should.have.property("status", 401);
            });
            it("Should accept with a valid token and send a confirmation email", async () => {
                const response: supertest.Response = await agent.post(`/api/users/register/${pending.token}`)
                    .send({ name: "test", password: testPassword });
                response.should.have.property("status", 200);
                sendMailStub.should.have.been.calledOnce;
            });
        });
        describe("Form", () => {
            it("Should reject if it has neither a name nor password", async () => {
                const response: supertest.Response = await agent.post(`/api/users/register/${pending.token}`);
                response.should.have.property("status", 400);
            });
            it("Should reject if it has no name", async () => {
                const response: supertest.Response = await agent.post(`/api/users/register/${pending.token}`)
                    .send({ password: testPassword });
                response.should.have.property("status", 400);
                const errorMessage: string = response.text;
                errorMessage.should.contain("name");
            });
            it("Should reject if it has no password", async () => {
                const response: supertest.Response = await agent.post(`/api/users/register/${pending.token}`)
                    .send({ name: "test" });
                response.should.have.property("status", 400);
                const errorMessage: string = response.text;
                errorMessage.should.contain("Password");
            });
            it("Should accept and update the user otherwise and send a confirmation email", async () => {
                const response: supertest.Response = await agent.post(`/api/users/register/${pending.token}`)
                    .send({ name: "test", password: testPassword });
                response.should.have.property("status", 200);
                updateStub.should.have.been.calledOnce.and.returned(1);
                sendMailStub.should.have.been.calledOnce;
            });
        });
        describe("Using facebook", () => {
            let authenticateStub: sinon.SinonStub;
            before(() => {
                authenticateStub = (() => {
                    const original: Function = passport.authenticate.bind(passport),
                        authStub: sinon.SinonStub = stub(passport, "authenticate", (...args: any[]) => {
                            if (authStub.callCount === 1) {
                                return original(...args);
                            } else {
                                return (req: Request, res: Response, next: NextFunction) => {
                                    next();
                                };
                            }
                        });
                    return authStub;
                })();
            });
            after(() => {
                authenticateStub.restore();
            });
            it("Should reject if user is not logged on with Facebook", async () => {
                const response: supertest.Response = await agent.get(`/api/users/register/${pending.token}/facebook`);
                // Should send to facebook
                response.should.have.property("status", 302);
                response.should.have.property("header").with.property("location").that.contains("facebook");
            });
            it("Should reject if user is already registered", async () => {
                reqUser = facebook;
                const response: supertest.Response = await agent.get(`/api/users/register/${user.token}/facebook`);
                response.should.have.property("status", 401);
            });
            it("Should register the user with a Facebook ID and send a confirmation email", async () => {
                reqUser = facebook;
                const response: supertest.Response = await agent.get(`/api/users/register/${pending.token}/facebook`);
                // Should have called update
                response.should.have.property("status", 200);
                updateStub.should.have.been.calledOnce;
                deleteStub.should.have.been.calledOnce;
                sendMailStub.should.have.been.calledOnce;
                // Update should have been called with the current Facebook name
                updateStub.should.have.been.calledWithMatch({ name: facebook.name });
            });
        });
    });
    describe("Getting one or multiple users", () => {
        it("Should reject if user is not an administrator", async () => {
            reqUser = user;
            const response: supertest.Response = await agent.get("/api/users");
            response.should.have.property("status", 403);
        });
        it("Should returns all users", async () => {
            reqUser = admin;
            const response: supertest.Response = await agent.get("/api/users");
            response.should.have.property("status", 200);
            response.body.should.deep.equal(users);
        });
        it("Should returns matched users", async () => {
            reqUser = admin;
            const response: supertest.Response = await agent.get("/api/users")
                .query({ email: user.email });
            response.should.have.property("status", 200);
            response.should.have.property("body").deep.equal([user]);
        });
        it("Should returns users with the desired format", async () => {
            reqUser = admin;
            const fields: Object = "email",
                response: supertest.Response = await agent.get("/api/users")
                    .query({ fields });
            response.should.have.property("status", 200);
            response.should.have.property("body").deep.equal(map<User, User>(users, (u: User) => ({ email: u.email })));
        });
    });
    describe("Getting a user by ID", () => {
        it("Should reject if user is not an administrator", async () => {
            reqUser = user;
            const response: supertest.Response = await agent.get(`/api/users/${user._id}`);
            response.should.have.property("status", 403);
        });
        it("Should the matched user", async () => {
            reqUser = admin;
            const response: supertest.Response = await agent.get(`/api/users/${user._id}`);
            response.should.have.property("status", 200);
            response.should.have.property("body").deep.equal(user);
        });
        it("Should returns users with the desired format", async () => {
            reqUser = admin;
            const fields: Object = "email",
                response: supertest.Response = await agent.get(`/api/users/${user._id}`)
                    .query({ fields });
            response.should.have.property("status", 200);
            response.should.have.property("body").deep.equal({ email: user.email });
        });
    });
    describe("Updating a user", () => {
        it("Should reject if user is not an administrator", async () => {
            reqUser = user;
            const response: supertest.Response = await agent.put(`/api/users/${user._id}`)
                .send({ ...user, name: "New Name" });
            response.should.have.property("status", 403);
        });
        it("Should update a user", async () => {
            reqUser = admin;
            const usr: User = { ...user, name: "New Name" },
                response: supertest.Response = await agent.put(`/api/users/${user._id}`)
                    .send(usr);
            response.should.have.property("status", 200);
            updateStub.should.have.been.calledWith(usr);
            updateStub.should.have.been.calledOnce;
        });
        it("Should update multiple users", async () => {
            reqUser = admin;
            const usrs: User = map<User, User>(users, (u: User) => ({ ...u, name: "New Name" }));
            const response: supertest.Response = await agent.put(`/api/users/${user._id}`)
                .send(usrs);
            response.should.have.property("status", 200);
            updateStub.should.have.been.calledWith(usrs);
            updateStub.should.have.been.calledOnce;
        });
    });
    describe("Deleting a user", () => {
        it("Should reject if user is not an administrator", async () => {
            reqUser = user;
            const response: supertest.Response = await agent.delete(`/api/users/${user._id}`);
            response.should.have.property("status", 403);
        });
        it("Should delete a user", async () => {
            reqUser = admin;
            const response: supertest.Response = await agent.delete(`/api/users/${user._id}`);
            response.should.have.property("status", 200);
            deleteStub.should.have.been.calledWith(user._id);
            deleteStub.should.have.been.calledOnce;
        });
    });
});
