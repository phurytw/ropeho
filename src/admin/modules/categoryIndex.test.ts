/**
 * @file Tests for the category index module
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../test.d.ts" />
import { should } from "chai";
import { default as mockStore, IStore } from "redux-mock-store";
import { CategoryIndexState, fetchCategories, ActionTypes, default as reducer } from "./categoryIndex";
import { ActionTypes as ErrorTypes } from "./error";
import { middlewares } from "../store";
import * as nock from "nock";
import { API_END_POINT } from "../helpers/resolveEndPoint";
import { categories } from "../../sampleData/testDb";
import { head } from "lodash";
import "isomorphic-fetch";
import { is } from "immutable";
should();

describe("Category index module", () => {
    let store: IStore<CategoryIndexState>;
    before(() => {
        store = mockStore<CategoryIndexState>(middlewares)(new CategoryIndexState());
    });
    afterEach(() => {
        store.clearActions();
        nock.cleanAll();
    });
    describe("Actions", () => {
        it("Should fetch categories from the API server", async () => {
            const scope: nock.Scope = nock(API_END_POINT)
                .get("/api/categories")
                .reply(200, categories);
            await store.dispatch(fetchCategories());
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.SET_CATEGORIES,
                categories
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
                .get("/api/categories")
                .reply(500, error);
            await store.dispatch(fetchCategories());
            head(store.getActions()).should.deep.equal({
                type: ErrorTypes.SET_ERROR,
                error
            });
            scope.done();
        });
    });
    describe("Reducer", () => {
        it("Should set categories with an immutable state", () => {
            is(reducer(new CategoryIndexState(), {
                type: ActionTypes.SET_CATEGORIES,
                categories
            }), new CategoryIndexState({
                categories
            })).should.be.true;
        });
    });
});
