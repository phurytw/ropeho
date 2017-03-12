/**
 * @file Tests for the container index module
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../test.d.ts" />
import { should } from "chai";
import { default as mockStore, IStore } from "redux-mock-store";
import { PresentationContainerIndexState, fetchContainers, ActionTypes, default as reducer } from "./containerIndex";
import { ActionTypes as ErrorTypes } from "./error";
import { middlewares } from "../store";
import * as nock from "nock";
import { API_END_POINT } from "../helpers/resolveEndPoint";
import { presentations } from "../../sampleData/testDb";
import { head } from "lodash";
import "isomorphic-fetch";
import { is } from "immutable";
should();

describe("Presentation index module", () => {
    let store: IStore<PresentationContainerIndexState>;
    before(() => {
        store = mockStore<PresentationContainerIndexState>(middlewares)(new PresentationContainerIndexState());
    });
    afterEach(() => {
        store.clearActions();
        nock.cleanAll();
    });
    describe("Actions", () => {
        it("Should fetch presentation containers from the API server", async () => {
            const scope: nock.Scope = nock(API_END_POINT)
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
            const scope: nock.Scope = nock(API_END_POINT)
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
            is(reducer(new PresentationContainerIndexState(), {
                type: ActionTypes.SET_CONTAINERS,
                containers: presentations
            }), new PresentationContainerIndexState({
                containers: presentations
            })).should.be.true;
        });
    });
});
