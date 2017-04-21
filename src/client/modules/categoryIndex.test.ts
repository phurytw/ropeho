/**
 * @file Tests for the Category Index module
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../test.d.ts" />
import { should } from "chai";
import { default as mockStore, IStore } from "redux-mock-store";
import { CategoryIndexState, defaultState, fetchCategories, selectCategory, ActionTypes, default as reducer } from "./categoryIndex";
import reduxThunk from "redux-thunk";
import * as nock from "nock";
import { CLIENT_END_POINT } from "../../common/helpers/resolveEndPoint";
import { categories } from "../../sampleData/testDb";
import { ActionTypes as ErrorTypes } from "../../common/modules/error";
import { head } from "lodash";
import "isomorphic-fetch";
import { is, Map, List } from "immutable";
should();

import Category = Ropeho.Models.Category;

describe("Category Index module", () => {
    let store: IStore<CategoryIndexState>;
    before(() => {
        store = mockStore<CategoryIndexState>([reduxThunk.withExtraArgument({
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
        it("Should fetch categories from the API server", async () => {
            const scope: nock.Scope = nock(CLIENT_END_POINT)
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
            const scope: nock.Scope = nock(CLIENT_END_POINT)
                .get("/api/categories")
                .reply(500, error);
            await store.dispatch(fetchCategories());
            head(store.getActions()).should.deep.equal({
                type: ErrorTypes.SET_ERROR,
                error
            });
            scope.done();
        });
        it("Should dispatch the selected category", () => {
            store.dispatch(selectCategory("name"));
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.SELECT_CATEGORY,
                name: "name"
            });
        });
    });
    describe("Reducer", () => {
        it("Should set categories in the state", () => {
            is(reducer(undefined, {
                type: ActionTypes.SET_CATEGORIES,
                categories
            }), Map<string, List<Category>>({
                categories: List.of<Category>(...categories),
                selected: undefined
            })).should.be.true;
        });
        it("Should set the selected category", () => {
            is(reducer(undefined, {
                type: ActionTypes.SELECT_CATEGORY,
                name: "selected"
            }), Map<string, List<Category>>({
                categories: List<Category>(),
                selected: "selected"
            })).should.be.true;
        });
    });
});
