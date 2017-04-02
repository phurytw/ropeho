/**
 * @file Tests for the container index module
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../test.d.ts" />
import { should } from "chai";
import { default as mockStore, IStore } from "redux-mock-store";
import { ContainerIndexState, defaultState, fetchContainers, ActionTypes, default as reducer } from "./containerIndex";
import { ActionTypes as ErrorTypes } from "./error";
import reduxThunk from "redux-thunk";
import * as nock from "nock";
import { ADMIN_END_POINT } from "../helpers/resolveEndPoint";
import { presentations } from "../../sampleData/testDb";
import { head } from "lodash";
import "isomorphic-fetch";
import { is, fromJS } from "immutable";
should();

describe("Presentation index module", () => {
    let store: IStore<ContainerIndexState>;
    before(() => {
        store = mockStore<ContainerIndexState>([reduxThunk.withExtraArgument({
            host: ADMIN_END_POINT,
            init: {
                credentials: "include"
            },
            error: {
                type: ErrorTypes.SET_ERROR
            }
        })])(defaultState);
    });
    afterEach(() => {
        store.clearActions();
        nock.cleanAll();
    });
    describe("Actions", () => {
        it("Should fetch presentation containers from the API server", async () => {
            const scope: nock.Scope = nock(ADMIN_END_POINT)
                .get("/api/presentations")
                .reply(200, presentations);
            await store.dispatch(fetchContainers());
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.SET_CONTAINERS,
                containers: presentations
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
            const scope: nock.Scope = nock(ADMIN_END_POINT)
                .get("/api/presentations")
                .reply(500, error);
            await store.dispatch(fetchContainers());
            head(store.getActions()).should.deep.equal({
                type: ErrorTypes.SET_ERROR,
                error
            });
            scope.done();
        });
    });
    describe("Reducer", () => {
        it("Should set presentations with an immutable state", () => {
            is(reducer(undefined, {
                type: ActionTypes.SET_CONTAINERS,
                containers: presentations
            }), fromJS({
                containers: presentations
            })).should.be.true;
        });
    });
});
