/**
 * @file Tests for the session module
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import { should } from "chai";
import { IStore, default as mockStore } from "redux-mock-store";
import { defaultState, ActionTypes, SessionState, login, logout, fetchCurrentUser, default as reducer } from "./session";
import * as nock from "nock";
import { ADMIN_END_POINT } from "../helpers/resolveEndPoint";
import reduxThunk from "redux-thunk";
import { users } from "../../sampleData/testDb";
import { ActionTypes as ErrorTypes } from "./error";
import { head } from "lodash";
import { is, fromJS } from "immutable";
should();

import Models = Ropeho.Models;

describe("Session module", () => {
    let store: IStore<SessionState>;
    const [user]: Models.User[] = users;
    const error: Ropeho.IErrorResponse = {
        developerMessage: "A nice error",
        errorCode: 0,
        status: 500,
        userMessage: "A nice error"
    };
    before(() => store = mockStore<SessionState>([reduxThunk.withExtraArgument({
            host: ADMIN_END_POINT,
            init: {
                credentials: "include"
            },
            error: {
                type: ErrorTypes.SET_ERROR
            }
        })])(defaultState));
    afterEach(() => store.clearActions());
    describe("Logging in", () => {
        it("Should receive a user", async () => {
            const scope: nock.Scope = nock(ADMIN_END_POINT)
                .post("/api/auth", {
                    email: user.email,
                    password: user.password
                })
                .reply(200, user);
            await store.dispatch(login(user.email, user.password));
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.SET_CURRENT_USER,
                user
            });
            scope.done();
        });
        it("Should handle HTTP errors", async () => {
            const scope: nock.Scope = nock(ADMIN_END_POINT)
                .post("/api/auth", {
                    email: user.email,
                    password: user.password
                })
                .reply(500, error);
            await store.dispatch(login(user.email, user.password));
            head(store.getActions()).should.deep.equal({
                type: ErrorTypes.SET_ERROR,
                error
            });
            scope.done();
        });
    });
    describe("Logging off", () => {
        it("Should disconnect from the API server", async () => {
            const scope: nock.Scope = nock(ADMIN_END_POINT)
                .post("/api/auth/logout")
                .reply(200, {});
            await store.dispatch(logout());
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.SET_CURRENT_USER,
                user: undefined
            });
            scope.done();
        });
        it("Should handle HTTP errors", async () => {
            const scope: nock.Scope = nock(ADMIN_END_POINT)
                .post("/api/auth/logout")
                .reply(500, error);
            await store.dispatch(logout());
            head(store.getActions()).should.deep.equal({
                type: ErrorTypes.SET_ERROR,
                error
            });
            scope.done();
        });
    });
    describe("Getting the current session", () => {
        it("Should receive a user", async () => {
            const scope: nock.Scope = nock(ADMIN_END_POINT)
                .get("/api/auth")
                .reply(200, user);
            await store.dispatch(fetchCurrentUser());
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.SET_CURRENT_USER,
                user
            });
            scope.done();
        });
        it("Should handle HTTP errors", async () => {
            const scope: nock.Scope = nock(ADMIN_END_POINT)
                .get("/api/auth")
                .reply(500, error);
            await store.dispatch(fetchCurrentUser());
            head(store.getActions()).should.deep.equal({
                type: ErrorTypes.SET_ERROR,
                error
            });
            scope.done();
        });
    });
    describe("Reducer", () => {
        it("Should store an immutable user in the state", () => {
            is(reducer(undefined, {
                type: ActionTypes.SET_CURRENT_USER,
                user
            }), fromJS({
                user
            }));
        });
    });
});
