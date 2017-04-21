/**
 * @file Tests for the production module
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../test.d.ts" />
import { should } from "chai";
import { default as mockStore, IStore } from "redux-mock-store";
import { ProductionState, defaultState, fetchSingleProduction, selectProduction, ActionTypes, default as reducer } from "./production";
import { ActionTypes as ErrorTypes } from "../../common/modules/error";
import reduxThunk from "redux-thunk";
import * as nock from "nock";
import { CLIENT_END_POINT } from "../../common/helpers/resolveEndPoint";
import { productions } from "../../sampleData/testDb";
import { map, head, mapKeys } from "lodash";
import uriFriendlyFormat from "../../common/helpers/uriFriendlyFormat";
import "isomorphic-fetch";
import { is, Map } from "immutable";
should();

import Models = Ropeho.Models;

describe("Production module", () => {
    let store: IStore<ProductionState>;
    before(() => {
        store = mockStore<ProductionState>([reduxThunk.withExtraArgument({
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
    describe("Action creators", () => {
        it("Should fetch productions from the API server by name", async () => {
            const expected: Models.Production[] = map<Models.Production, Models.Production>(productions, (p: Models.Production) => ({ banner: p.banner, name: p.name }));
            const scope: nock.Scope = nock(CLIENT_END_POINT)
                .get("/api/productions")
                .query({
                    fields: "name,banner",
                    name: uriFriendlyFormat(productions[0].name)
                })
                .reply(200, expected);
            await store.dispatch(fetchSingleProduction(productions[0].name, ["name", "banner"]));
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.SET_PRODUCTIONS,
                productions: expected
            });
            scope.done();
        });
        it("Should select a production", () => {
            store.dispatch(selectProduction("prodId"));
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.SELECT_PRODUCTION,
                name: "prodid"
            });
        });
    });
    describe("Reducer", () => {
        it("Should set productions in the state", () => {
            is(reducer(undefined, {
                type: ActionTypes.SET_PRODUCTIONS,
                productions
            }), Map<string, Map<string, Models.Production> | string>({
                productions: Map<string, Models.Production>(mapKeys<Models.Production, string>(productions, (p: Models.Production) => uriFriendlyFormat(p.name))),
                selected: undefined
            })).should.be.true;
        });
        it("Should set the selected production in the state", () => {
            is(reducer(undefined, {
                type: ActionTypes.SELECT_PRODUCTION,
                name: "selected"
            }), Map<string, Map<string, Models.Production> | string>({
                productions: Map<string, Models.Production>(),
                selected: "selected"
            })).should.be.true;
        });
    });
});
