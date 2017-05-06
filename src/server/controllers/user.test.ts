/**
 * @file Unit tests for the user controller
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../../test.d.ts" />
import { should, use } from "chai";
import { stub, sandbox as sinonSandbox } from "sinon";
import * as sinonChai from "sinon-chai";
import { v4 } from "uuid";
import { isArray, head, map, includes, keys, cloneDeep } from "lodash";
import * as _ from "lodash";
import GenericRepository from "../dal/genericRepository";
import { Server } from "http";
import * as express from "express";
import { Express, Request, Response, NextFunction, RequestHandler } from "express-serve-static-core";
import * as supertest from "supertest";
import app from "../app";
import config from "../../config";
import { endPoints } from "../../common/helpers/resolveEndPoint";
import { computeHashSync } from "../accounts/password";
import { computeToken } from "../accounts/token";
import { Roles } from "../../enum";
import * as passport from "passport";
import mailer from "../helpers/mailer";
import uriFriendlyFormat from "../../common/helpers/uriFriendlyFormat";
import * as detect from "detect-port";
should();
use(sinonChai);

import User = Ropeho.Models.User;
import Production = Ropeho.Models.Production;

describe("User controller", () => {
    const testApp: Express = express(),
        testPassword: string = "123456",
        production: Production = {
            _id: v4(),
            name: "name",
            background: {
                _id: v4(),
                delay: 0,
                description: "",
                sources: [],
                state: 0,
                type: 0
            },
            banner: {
                _id: v4(),
                delay: 0,
                description: "",
                sources: [],
                state: 0,
                type: 0
            },
            description: "",
            medias: [],
            state: 0
        },
        users: User[] = [{
            _id: v4(),
            name: "User",
            email: "user@test.com",
            password: computeHashSync(testPassword).toString("hex"),
            token: computeToken(),
            productionIds: [production._id],
            role: Roles.User,
            facebookId: ""
        }, {
            _id: v4(),
            name: "Administrator",
            email: "admin@test.com",
            password: computeHashSync(testPassword).toString("hex"),
            token: computeToken(),
            productionIds: [],
            role: Roles.Administrator,
            facebookId: ""
        }, {
            _id: v4(),
            name: "Outdated",
            email: "outdated@test.com",
            password: computeHashSync(testPassword).toString("hex"),
            token: computeToken(config.users.tokenLength, -1),
            productionIds: [],
            role: Roles.User,
            facebookId: ""
        }, {
            _id: v4(),
            name: "",
            email: "pending@test.com",
            password: "",
            token: computeToken(),
            productionIds: [],
            role: Roles.User,
            facebookId: ""
        }, {
            _id: v4(),
            name: "Facebook Name",
            email: "facebook@test.com",
            password: "",
            token: computeToken(),
            productionIds: [],
            facebookId: "0123456789",
            role: Roles.User
        }],
        [user, admin, outdated, pending, facebook]: User[] = users;
    let server: Server,
        port: number,
        agent: supertest.SuperTest<supertest.Test>,
        sandbox: sinon.SinonSandbox,
        actuallySendMail: boolean = false,
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
            .callsFake((usr: User) => {
                const unique: string[] = ["facebookId", "email", "token"];
                for (const i of unique) {
                    if (((usr as any)[i]) && _(users).map<string>((u: User) => uriFriendlyFormat((u as any)[i])).includes(uriFriendlyFormat((usr as any)[i]))) {
                        return Promise.reject<string>(`${i} ${(usr as any)[i]} already in use`);
                    }
                }
                return Promise.resolve<User>(usr);
            });
        sandbox.stub(GenericRepository.prototype, "update")
            .callsFake((params: User | User[]) => params ? (isArray(params) ? params.length : 1) : 0);
        sandbox.stub(GenericRepository.prototype, "delete")
            .callsFake((params: User | User[] | string | string[]) => params ? (isArray(params) ? params.length : 1) : 0);
        sandbox.stub(GenericRepository.prototype, "get")
            .callsFake((entities: User | User[]) => {
                if (!entities || (entities as User[]).length === 0) {
                    return Promise.resolve<User[]>(cloneDeep<User[]>(users));
                } else {
                    return Promise.resolve<User | User[]>(_(users).filter((u: User) => _(entities).map((e: User) => e._id).includes(u._id)).thru((usrs: User[]) => (entities as User[]).length === 1 ? head(usrs) : usrs).value());
                }
            });
        sandbox.stub(GenericRepository.prototype, "getById")
            .callsFake((id: string | string[]) => {
                if (isArray<string>(id)) {
                    // Need to add productions because we use both with getById
                    return Promise.resolve<User[]>(_([...users, production]).filter((u: User) => includes<string>(id, u._id)).cloneDeep());
                } else {
                    return Promise.resolve<User>(cloneDeep<User>(_(users).filter((u: User) => u._id === id).head()));
                }
            });
        sandbox.stub(GenericRepository.prototype, "search")
            .callsFake((filters: { [key: string]: string }) => {
                if (filters) {
                    for (const index of keys(config.database.users.indexes)) {
                        if (filters[index]) {
                            return Promise.resolve<User[]>(_(users).filter((u: User) => includes(uriFriendlyFormat((u as any)[index]), uriFriendlyFormat(filters[index]))).cloneDeep());
                        }
                    }
                } else {
                    return Promise.resolve<User[]>([]);
                }
            });
        const originalSendMail: Function = mailer.sendMail.bind(mailer);
        sandbox.stub(mailer, "sendMail")
            .callsFake((...args: any[]) => {
                if (actuallySendMail) {
                    actuallySendMail = false;
                    return originalSendMail(...args);
                } else {
                    return Promise.resolve<nodemailer.SendMailOptions>((mailer.sendMail as sinon.SinonStub).args);
                }
            });
    });
    afterEach(() => sandbox.restore());
    after(() => server.close());
    describe("Creating an user", () => {
        it("Should reject if no email is specified", async () => {
            // Execute as administrator
            reqUser = admin;
            const response: supertest.Response = await agent.post("/api/users")
                .send({});
            response.should.have.property("status", 400);
            GenericRepository.prototype.create.should.have.not.been.called;
        });
        it("Should reject if email is not a valid email", async () => {
            // Execute as administrator
            reqUser = admin;
            const response: supertest.Response = await agent.post("/api/users")
                .send({ email: "test@test" });
            response.should.have.property("status", 400);
            GenericRepository.prototype.create.should.have.not.been.called;
        });
        it("Should reject if email is already used", async () => {
            // Execute as administrator
            reqUser = admin;
            const response: supertest.Response = await agent.post("/api/users")
                .send({ email: user.email });
            response.should.have.property("status", 400);
        });
        it("Should accept and create a new user with a token and an ID if email is valid and send an invitation", async () => {
            // Execute as administrator
            reqUser = admin;
            const response: supertest.Response = await agent.post("/api/users")
                .send({ email: "test@test.com" });
            response.should.have.property("status", 200);
            GenericRepository.prototype.create.should.have.been.calledOnce;
            const user: User = response.body;
            user._id.should.not.be.empty;
            user.token.should.not.be.empty;
            const tokenData: string[] = user.token.split("-");
            tokenData.should.have.lengthOf(2);
            const timestamp: string = tokenData[1];
            isNaN(parseInt(timestamp)).should.be.false;
            mailer.sendMail.should.have.been.calledOnce;
        });
        it("Should reject if current user is not an administrator", async () => {
            // Execute as user
            reqUser = user;
            const response: supertest.Response = await agent.post("/api/users")
                .send({ email: "test@test.com" });
            response.should.have.property("status", 400);
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
                response.should.have.property("status", 400);
                const errorMessage: string = response.text;
                errorMessage.should.contain(nonExistentToken);
            });
            it("Should reject if token is expired", async () => {
                const response: supertest.Response = await agent.post(`/api/users/register/${outdated.token}`)
                    .send({ name: "test", password: testPassword });
                response.should.have.property("status", 400);
                const errorMessage: string = response.text;
                errorMessage.should.contain("expired");
            });
            it("Should reject if the user has already setup his password", async () => {
                const response: supertest.Response = await agent.post(`/api/users/register/${user.token}`)
                    .send({ name: "test", password: testPassword });
                response.should.have.property("status", 400);
            });
            it("Should reject if the user has link his account to Facebook", async () => {
                const response: supertest.Response = await agent.post(`/api/users/register/${facebook.token}`)
                    .send({ name: "test", password: testPassword });
                response.should.have.property("status", 400);
            });
            it("Should accept with a valid token and send a confirmation email", async () => {
                const response: supertest.Response = await agent.post(`/api/users/register/${pending.token}`)
                    .send({ name: "test", password: testPassword });
                response.should.have.property("status", 200);
                mailer.sendMail.should.have.been.calledOnce;
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
                GenericRepository.prototype.update.should.have.been.calledOnce.and.returned(1);
                mailer.sendMail.should.have.been.calledOnce;
            });
        });
        describe("Using facebook", () => {
            let authenticateStub: sinon.SinonStub;
            before(() => {
                authenticateStub = (() => {
                    const original: Function = passport.authenticate.bind(passport),
                        authStub: sinon.SinonStub = stub(passport, "authenticate")
                            .callsFake((...args: any[]) => {
                                if (authStub.callCount === 1) {
                                    return original(...args);
                                } else {
                                    return (req: Request, res: Response, next: NextFunction) => next();
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
                response.should.have.property("status", 400);
            });
            it("Should register the user with a Facebook ID and send a confirmation email", async () => {
                reqUser = facebook;
                const response: supertest.Response = await agent.get(`/api/users/register/${pending.token}/facebook`);
                // Should have called update
                response.should.have.property("status", 200);
                GenericRepository.prototype.update.should.have.been.calledOnce;
                GenericRepository.prototype.delete.should.have.been.calledOnce;
                mailer.sendMail.should.have.been.calledOnce;
                // Update should have been called with the current Facebook name
                GenericRepository.prototype.update.should.have.been.calledWithMatch({ name: facebook.name });
            });
        });
    });
    describe("Getting one or multiple users", () => {
        it("Should reject if user is not an administrator", async () => {
            reqUser = user;
            const response: supertest.Response = await agent.get("/api/users");
            response.should.have.property("status", 400);
        });
        it("Should return all users", async () => {
            reqUser = admin;
            const response: supertest.Response = await agent.get("/api/users");
            response.should.have.property("status", 200);
            response.body.should.deep.equal(map<User, User>(users, (u: User) => ({
                ...u,
                productions: includes(u.productionIds, production._id) ? [production] : []
            })));
        });
        it("Should return matched users", async () => {
            reqUser = admin;
            const response: supertest.Response = await agent.get("/api/users")
                .query({ email: user.email });
            response.should.have.property("status", 200);
            response.should.have.property("body").deep.equal([{
                ...user,
                productions: [production]
            }]);
        });
        it("Should return users with the desired format", async () => {
            reqUser = admin;
            const fields: Object = "email,productions",
                response: supertest.Response = await agent.get("/api/users")
                    .query({ fields });
            response.should.have.property("status", 200);
            response.should.have.property("body").deep.equal(map<User, User>(users, (u: User) => ({
                email: u.email,
                productions: includes(u.productionIds, production._id) ? [production] : []
            })));
        });
    });
    describe("Getting a user by ID", () => {
        it("Should reject if user is not an administrator", async () => {
            reqUser = user;
            const response: supertest.Response = await agent.get(`/api/users/${user._id}`);
            response.should.have.property("status", 400);
        });
        it("Should get the matched user", async () => {
            reqUser = admin;
            const response: supertest.Response = await agent.get(`/api/users/${user._id}`);
            response.should.have.property("status", 200);
            response.should.have.property("body").deep.equal({
                ...user,
                productions: [production]
            });
        });
        it("Should return users with the desired format", async () => {
            reqUser = admin;
            const fields: Object = "email,productions",
                response: supertest.Response = await agent.get(`/api/users/${user._id}`)
                    .query({ fields });
            response.should.have.property("status", 200);
            response.should.have.property("body").deep.equal({ email: user.email, productions: [production] });
        });
    });
    describe("Updating a user", () => {
        it("Should reject if user is not an administrator", async () => {
            reqUser = user;
            const response: supertest.Response = await agent.put(`/api/users/${user._id}`)
                .send({ ...user, name: "New Name" });
            response.should.have.property("status", 400);
        });
        it("Should update a user", async () => {
            reqUser = admin;
            const usr: User = { ...user, name: "New Name" },
                response: supertest.Response = await agent.put(`/api/users/${user._id}`)
                    .send(usr);
            response.should.have.property("status", 200);
            GenericRepository.prototype.update.should.have.been.calledWith(usr);
            GenericRepository.prototype.update.should.have.been.calledOnce;
        });
    });
    describe("Deleting a user", () => {
        it("Should reject if user is not an administrator", async () => {
            reqUser = user;
            const response: supertest.Response = await agent.delete(`/api/users/${user._id}`);
            response.should.have.property("status", 400);
        });
        it("Should delete a user", async () => {
            reqUser = admin;
            const response: supertest.Response = await agent.delete(`/api/users/${user._id}`);
            response.should.have.property("status", 200);
            GenericRepository.prototype.delete.should.have.been.calledWith(user._id);
            GenericRepository.prototype.delete.should.have.been.calledOnce;
        });
    });
});
