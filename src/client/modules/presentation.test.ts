/**
 * @file Tests for the Presentation module
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../test.d.ts" />
import { should } from "chai";
import { default as mockStore, IStore } from "redux-mock-store";
import { PresentationState, defaultState, fetchPresentations, ActionTypes, default as reducer } from "./presentation";
import reduxThunk from "redux-thunk";
import * as nock from "nock";
import { CLIENT_END_POINT } from "../../common/helpers/resolveEndPoint";
import { presentations } from "../../sampleData/testDb";
import { ActionTypes as ErrorTypes } from "../../common/modules/error";
import { head } from "lodash";
import "isomorphic-fetch";
import { is, Map, List } from "immutable";
should();

import PresentationContainer = Ropeho.Models.PresentationContainer;

describe("Presentation module", () => {
    let store: IStore<PresentationState>;
    before(() => {
        store = mockStore<PresentationState>([reduxThunk.withExtraArgument({
            host: CLIENT_END_POINT,
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
        it("Should fetch presentations from the API server", async () => {
            const scope: nock.Scope = nock(CLIENT_END_POINT)
                .get("/api/presentations")
                .reply(200, presentations);
            await store.dispatch(fetchPresentations());
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.SET_PRESENTATIONS,
                presentations
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
            const scope: nock.Scope = nock(CLIENT_END_POINT)
                .get("/api/presentations")
                .reply(500, error);
            await store.dispatch(fetchPresentations());
            head(store.getActions()).should.deep.equal({
                type: ErrorTypes.SET_ERROR,
                error
            });
            scope.done();
        });
    });
    describe("Reducer", () => {
        it("Should set presentations in the state", () => {
            is(reducer(undefined, {
                type: ActionTypes.SET_PRESENTATIONS,
                presentations
            }), Map<string, List<PresentationContainer>>([["presentations", List.of<PresentationContainer>(...presentations)]])).should.be.true;
        });
    });
});
