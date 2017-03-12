/**
 * @file Tests for the user edit module
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../test.d.ts" />
import { should } from "chai";
import { default as mockStore, IStore } from "redux-mock-store";
import { UserEditState, fetchUserById, updateUser, deleteUser, ActionTypes, default as reducer } from "./userEdit";
import { ActionTypes as ErrorTypes } from "./error";
import { middlewares } from "../store";
import * as nock from "nock";
import { API_END_POINT } from "../helpers/resolveEndPoint";
import { users } from "../../sampleData/testDb";
import { head } from "lodash";
import "isomorphic-fetch";
import { is } from "immutable";
should();

import Models = Ropeho.Models;

describe("User edit module", () => {
    let store: IStore<UserEditState>;
    const [user]: Models.User[] = users;
    const error: Ropeho.IErrorResponse = {
        developerMessage: "A nice error",
        errorCode: 0,
        status: 500,
        userMessage: "A nice error"
    };
    before(() => {
        store = mockStore<UserEditState>(middlewares)(new UserEditState());
    });
    afterEach(() => {
        store.clearActions();
        nock.cleanAll();
    });
    describe("Fetch action", () => {
        it("Should fetch a user from the API server", async () => {
            const scope: nock.Scope = nock(API_END_POINT)
                .get(`/api/users/${user._id}`)
                .reply(200, () => user);
            await store.dispatch(fetchUserById(user._id));
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.SET_USER,
                user
            });
            scope.done();
        });
        it("Should handle HTTP errors", async () => {
            const scope: nock.Scope = nock(API_END_POINT)
                .get(`/api/users/${user._id}`)
                .reply(500, error);
            await store.dispatch(fetchUserById(user._id));
            head(store.getActions()).should.deep.equal({
                type: ErrorTypes.SET_ERROR,
                error
            });
            scope.done();
        });
    });
    describe("Update action", () => {
        it("Should update a user to the API server", async () => {
            const scope: nock.Scope = nock(API_END_POINT)
                .put(`/api/users/${user._id}`, user)
                .reply(200, user);
            await store.dispatch(updateUser(user));
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.SET_USER,
                user
            });
            scope.done();
        });
        it("Should handle HTTP errors", async () => {
            const scope: nock.Scope = nock(API_END_POINT)
                .put(`/api/users/${user._id}`, user)
                .reply(500, error);
            await store.dispatch(updateUser(user));
            head(store.getActions()).should.deep.equal({
                type: ErrorTypes.SET_ERROR,
                error
            });
            scope.done();
        });
    });
    describe("Update action", () => {
        it("Should update a user to the API server", async () => {
            const scope: nock.Scope = nock(API_END_POINT)
                .delete(`/api/users/${user._id}`)
                .reply(200, {});
            await store.dispatch(deleteUser(user._id));
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.SET_USER,
                user: undefined
            });
            scope.done();
        });
        it("Should handle HTTP errors", async () => {
            const scope: nock.Scope = nock(API_END_POINT)
                .delete(`/api/users/${user._id}`)
                .reply(500, error);
            await store.dispatch(deleteUser(user._id));
            head(store.getActions()).should.deep.equal({
                type: ErrorTypes.SET_ERROR,
                error
            });
            scope.done();
        });
    });
    describe("Reducer", () => {
        it("Should set users with an immutable state", () => {
            is(reducer(new UserEditState(), {
                type: ActionTypes.SET_USER,
                user
            }), new UserEditState({
                user
            })).should.be.true;
        });
    });
});
