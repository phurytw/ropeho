/**
 * @file Tests for the user index module
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../test.d.ts" />
import { should } from "chai";
import { default as mockStore, IStore } from "redux-mock-store";
import { UserIndexState, fetchUsers, ActionTypes, default as reducer } from "./userIndex";
import { ActionTypes as ErrorTypes } from "./error";
import { middlewares } from "../store";
import * as nock from "nock";
import { API_END_POINT } from "../helpers/resolveEndPoint";
import { users } from "../../sampleData/testDb";
import { map, head } from "lodash";
import "isomorphic-fetch";
import { is } from "immutable";
should();

import Models = Ropeho.Models;

describe("User index module", () => {
    let store: IStore<UserIndexState>;
    before(() => {
        store = mockStore<UserIndexState>(middlewares)(new UserIndexState());
    });
    afterEach(() => {
        store.clearActions();
        nock.cleanAll();
    });
    describe("Actions", () => {
        it("Should fetch users from the API server", async () => {
            const expected: Models.User[] = map<Models.User, Models.User>(users, (u: Models.User) => ({ email: u.email, name: u.name }));
            const scope: nock.Scope = nock(API_END_POINT)
                .get("/api/users")
                .query({
                    fields: "name,email"
                })
                .reply(200, expected);
            await store.dispatch(fetchUsers(["name", "email"]));
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.SET_USERS,
                users: expected
            });
            scope.done();
        });
        it("Should handle HTTP errors", async () => {
            const error: Ropeho.IErrorResponse = {
                developerMessage: "A nice error",
                errorCode: 0,
                status: 500,
                userMessage: "A nice error"
            };
            const scope: nock.Scope = nock(API_END_POINT)
                .get("/api/users")
                .reply(500, error);
            await store.dispatch(fetchUsers());
            head(store.getActions()).should.deep.equal({
                type: ErrorTypes.SET_ERROR,
                error
            });
            scope.done();
        });
    });
    describe("Reducer", () => {
        it("Should set users with an immutable state", () => {
            is(reducer(new UserIndexState(), {
                type: ActionTypes.SET_USERS,
                users
            }), new UserIndexState({
                users
            })).should.be.true;
        });
    });
});
