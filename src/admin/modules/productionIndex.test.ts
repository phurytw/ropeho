/**
 * @file Tests for the production index module
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../test.d.ts" />
import { should } from "chai";
import { default as mockStore, IStore } from "redux-mock-store";
import { ProductionIndexState, defaultState, fetchProductions, createProduction, ActionTypes, default as reducer } from "./productionIndex";
import { ActionTypes as ErrorTypes } from "./error";
import { middlewares } from "../store";
import * as nock from "nock";
import { ADMIN_END_POINT } from "../helpers/resolveEndPoint";
import { productions } from "../../sampleData/testDb";
import { map, head } from "lodash";
import "isomorphic-fetch";
import { is, fromJS } from "immutable";
should();

import Models = Ropeho.Models;

describe("Production index module", () => {
    let store: IStore<ProductionIndexState>;
    before(() => {
        store = mockStore<ProductionIndexState>(middlewares({
            host: ADMIN_END_POINT,
            error: {
                type: ErrorTypes.SET_ERROR
            }
        }))(defaultState);
    });
    afterEach(() => {
        store.clearActions();
        nock.cleanAll();
    });
    describe("Fetching productions", () => {
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
        it("Should handle HTTP errors", async () => {
            const error: Ropeho.IErrorResponse = {
                developerMessage: "A nice error",
                errorCode: 0,
                status: 500,
                userMessage: "A nice error"
            };
            const scope: nock.Scope = nock(ADMIN_END_POINT)
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
    describe("Creating productions", () => {
        it("Should create a production to the API server", async () => {
            const newProd: Models.Production = {};
            const scope: nock.Scope = nock(ADMIN_END_POINT)
                .post("/api/productions", newProd)
                .reply(200, newProd);
            await store.dispatch(createProduction(newProd));
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.SET_PRODUCTIONS,
                productions: [newProd]
            });
            scope.done();
        });
        it("Should handle HTTP errors", async () => {
            const newProd: Models.Production = {};
            const error: Ropeho.IErrorResponse = {
                developerMessage: "A nice error",
                errorCode: 0,
                status: 500,
                userMessage: "A nice error"
            };
            const scope: nock.Scope = nock(ADMIN_END_POINT)
                .post("/api/productions", newProd)
                .reply(500, error);
            await store.dispatch(createProduction(newProd));
            head(store.getActions()).should.deep.equal({
                type: ErrorTypes.SET_ERROR,
                error
            });
            scope.done();
        });
    });
    describe("Reducer", () => {
        it("Should set productions with an immutable state", () => {
            is(reducer(undefined, {
                type: ActionTypes.SET_PRODUCTIONS,
                productions
            }), fromJS({
                productions
            })).should.be.true;
        });
    });
});
