/**
 * @file Tests for the production index module
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../test.d.ts" />
import { should } from "chai";
import { default as mockStore, IStore } from "redux-mock-store";
import { ProductionIndexState, defaultState, fetchProductions, createProduction, setProductionPosition, saveOrder, ActionTypes, default as reducer } from "./productionIndex";
import { ActionTypes as ErrorTypes } from "./error";
import reduxThunk from "redux-thunk";
import * as nock from "nock";
import { ADMIN_END_POINT } from "../helpers/resolveEndPoint";
import { productions } from "../../sampleData/testDb";
import { map, head, mapKeys } from "lodash";
import "isomorphic-fetch";
import { is, fromJS } from "immutable";
should();

import Models = Ropeho.Models;

describe("Production index module", () => {
    let store: IStore<ProductionIndexState>;
    before(() => {
        store = mockStore<ProductionIndexState>([reduxThunk.withExtraArgument({
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
    describe("Action creators", () => {
        it("Should fetch productions from the API server", async () => {
            const expected: Models.Production[] = map<Models.Production, Models.Production>(productions, (p: Models.Production) => ({ banner: p.banner, name: p.name }));
            const scope: nock.Scope = nock(ADMIN_END_POINT)
                .get("/api/productions")
                .query({
                    fields: "name,banner"
                })
                .reply(200, expected);
            await store.dispatch(fetchProductions(["name", "banner"]));
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.SET_PRODUCTIONS,
                productions: expected
            });
            scope.done();
        });
        it("Should create a production to the API server", async () => {
            const newProd: Models.Production = {};
            const scope: nock.Scope = nock(ADMIN_END_POINT)
                .post("/api/productions", newProd)
                .reply(200, newProd);
            await store.dispatch(createProduction(newProd));
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.ADD_PRODUCTION,
                production: newProd
            });
            scope.done();
        });
        it("Should save the production order to the server", async () => {
            const order: string[] = productions.map<string>((p: Models.Production) => p._id);
            const scope: nock.Scope = nock(ADMIN_END_POINT)
                .post("/api/productions/order", order)
                .reply(200, order);
            await store.dispatch(saveOrder(order));
            store.getActions().should.be.empty;
            scope.done();
        });
        it("Should dispatch a new position for a production", () => {
            store.dispatch(setProductionPosition("prodId", 10));
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.SET_POSITION,
                productionId: "prodId",
                position: 10
            });
        });
    });
    describe("Reducer", () => {
        it("Should set productions in the state", () => {
            is(reducer(undefined, {
                type: ActionTypes.SET_PRODUCTIONS,
                productions
            }), fromJS({
                order: productions.map((p: Models.Production) => p._id),
                productions: mapKeys<Models.Production, string>(productions, (p: Models.Production) => p._id)
            })).should.be.true;
        });
        it("Should add a production in the state", () => {
            const [production]: Models.Production[] = productions;
            is(reducer(undefined, {
                type: ActionTypes.ADD_PRODUCTION,
                production
            }), fromJS({
                order: [production._id],
                productions: {
                    [production._id]: production
                }
            })).should.be.true;
        });
        it("Should change a production's position in the state", () => {
            const [productionA, productionB]: Models.Production[] = productions;
            is(reducer(fromJS({
                order: [productionA._id, productionB._id],
                productions: {
                    [productionA._id]: productionA,
                    [productionB._id]: productionB
                }
            }), {
                    type: ActionTypes.SET_POSITION,
                    productionId: productionA._id,
                    position: 1
                }), fromJS({
                    order: [productionB._id, productionA._id],
                    productions: {
                        [productionA._id]: productionA,
                        [productionB._id]: productionB
                    }
                })).should.be.true;
        });
    });
});
