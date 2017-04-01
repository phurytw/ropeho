/**
 * @file Tests for the presentation container edit module
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../test.d.ts" />
import { should } from "chai";
import { default as mockStore, IStore } from "redux-mock-store";
import { CategoryEditState, defaultState, fetchCategoryById, updateCategory, deleteCategory, ActionTypes, default as reducer } from "./categoryEdit";
import { ActionTypes as ErrorTypes } from "./error";
import { middlewares } from "../store";
import * as nock from "nock";
import { ADMIN_END_POINT } from "../helpers/resolveEndPoint";
import { categories } from "../../sampleData/testDb";
import { head } from "lodash";
import "isomorphic-fetch";
import { is, fromJS } from "immutable";
should();

import Category = Ropeho.Models.Category;

describe("Category edit module", () => {
    let store: IStore<CategoryEditState>;
    const [category]: Category[] = categories;
    before(() => {
        store = mockStore<CategoryEditState>(middlewares({
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
    describe("Fetch action", () => {
        it("Should fetch a category from the API server", async () => {
            const scope: nock.Scope = nock(ADMIN_END_POINT)
                .get(`/api/categories/${category._id}`)
                .reply(200, category);
            await store.dispatch(fetchCategoryById(category._id));
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.SET_CATEGORY,
                category
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
                .get(`/api/categories/${category._id}`)
                .reply(500, error);
            await store.dispatch(fetchCategoryById(category._id));
            head(store.getActions()).should.deep.equal({
                type: ErrorTypes.SET_ERROR,
                error
            });
            scope.done();
        });
    });
    describe("Update action", () => {
        it("Should update a category to the API server", async () => {
            const scope: nock.Scope = nock(ADMIN_END_POINT)
                .put(`/api/categories/${category._id}`, category)
                .reply(200, category);
            await store.dispatch(updateCategory(category));
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.SET_CATEGORY,
                category
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
                .put(`/api/categories/${category._id}`, category)
                .reply(500, error);
            await store.dispatch(updateCategory(category));
            head(store.getActions()).should.deep.equal({
                type: ErrorTypes.SET_ERROR,
                error
            });
            scope.done();
        });
    });
    describe("Delete action", () => {
        it("Should delete a category from the API server", async () => {
            const scope: nock.Scope = nock(ADMIN_END_POINT)
                .delete(`/api/categories/${category._id}`)
                .reply(200, {});
            await store.dispatch(deleteCategory(category._id));
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.SET_CATEGORY,
                category: undefined
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
                .delete(`/api/categories/${category._id}`)
                .reply(500, error);
            await store.dispatch(deleteCategory(category._id));
            head(store.getActions()).should.deep.equal({
                type: ErrorTypes.SET_ERROR,
                error
            });
            scope.done();
        });
    });
    describe("Reducer", () => {
        it("Should set categories with an immutable state", () => {
            is(reducer(undefined, {
                type: ActionTypes.SET_CATEGORY,
                category
            }), fromJS({
                category
            })).should.be.true;
        });
    });
});
