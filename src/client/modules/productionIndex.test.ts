/**
 * @file Tests for the Production Index module
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../test.d.ts" />
import { should } from "chai";
import { default as mockStore, IStore } from "redux-mock-store";
import { ProductionIndexState, defaultState, fetchProductions, ActionTypes, default as reducer } from "./productionIndex";
import reduxThunk from "redux-thunk";
import * as nock from "nock";
import { CLIENT_END_POINT } from "../../common/helpers/resolveEndPoint";
import { productions } from "../../sampleData/testDb";
import { ActionTypes as ErrorTypes } from "../../common/modules/error";
import { head } from "lodash";
import "isomorphic-fetch";
import { is, Map, List } from "immutable";
should();

import Production = Ropeho.Models.Production;

describe("Production Index module", () => {
    let store: IStore<ProductionIndexState>;
    before(() => {
        store = mockStore<ProductionIndexState>([reduxThunk.withExtraArgument({
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
        it("Should fetch productions from the API server", async () => {
            const scope: nock.Scope = nock(CLIENT_END_POINT)
                .get("/api/productions")
                .reply(200, productions);
            await store.dispatch(fetchProductions());
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.SET_PRODUCTIONS,
                productions
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
                .get("/api/productions")
                .reply(500, error);
            await store.dispatch(fetchProductions());
            head(store.getActions()).should.deep.equal({
                type: ErrorTypes.SET_ERROR,
                error
            });
            scope.done();
        });
    });
    describe("Reducer", () => {
        it("Should set productions in the state", () => {
            is(reducer(undefined, {
                type: ActionTypes.SET_PRODUCTIONS,
                productions
            }), Map<string, List<Production>>([["productions", List.of<Production>(...productions)]])).should.be.true;
        });
    });
});
