/**
 * @file Tests for the presentation container edit module
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../test.d.ts" />
import { should } from "chai";
import { default as mockStore, IStore } from "redux-mock-store";
import { PresentationContainerEditState, fetchContainerByid, updateContainer, deleteContainer, ActionTypes, default as reducer } from "./containerEdit";
import { ActionTypes as ErrorTypes } from "./error";
import { middlewares } from "../store";
import * as nock from "nock";
import { ADMIN_END_POINT } from "../helpers/resolveEndPoint";
import { presentations } from "../../sampleData/testDb";
import { head } from "lodash";
import "isomorphic-fetch";
import { is } from "immutable";
should();

import Models = Ropeho.Models;

describe("Presentation container edit module", () => {
    let store: IStore<PresentationContainerEditState>;
    const [container]: Models.Presentation[] = presentations;
    before(() => {
        store = mockStore<PresentationContainerEditState>(middlewares({
            host: ADMIN_END_POINT,
            error: {
                type: ErrorTypes.SET_ERROR
            }
        }))(new PresentationContainerEditState());
    });
    afterEach(() => {
        store.clearActions();
        nock.cleanAll();
    });
    describe("Fetch action", () => {
        it("Should fetch a presentation container from the API server", async () => {
            const scope: nock.Scope = nock(ADMIN_END_POINT)
                .get(`/api/presentations/${container._id}`)
                .reply(200, container);
            await store.dispatch(fetchContainerByid(container._id));
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.SET_CONTAINER,
                container
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
                .get(`/api/presentations/${container._id}`)
                .reply(500, error);
            await store.dispatch(fetchContainerByid(container._id));
            head(store.getActions()).should.deep.equal({
                type: ErrorTypes.SET_ERROR,
                error
            });
            scope.done();
        });
    });
    describe("Delete action", () => {
        it("Should update a presentation container to the API server", async () => {
            const scope: nock.Scope = nock(ADMIN_END_POINT)
                .put(`/api/presentations/${container._id}`, container)
                .reply(200, container);
            await store.dispatch(updateContainer(container));
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.SET_CONTAINER,
                container
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
                .put(`/api/presentations/${container._id}`, container)
                .reply(500, error);
            await store.dispatch(updateContainer(container));
            head(store.getActions()).should.deep.equal({
                type: ErrorTypes.SET_ERROR,
                error
            });
            scope.done();
        });
    });
    describe("Update action", () => {
        it("Should delete a presentation container from the API server", async () => {
            const scope: nock.Scope = nock(ADMIN_END_POINT)
                .delete(`/api/presentations/${container._id}`)
                .reply(200, {});
            await store.dispatch(deleteContainer(container._id));
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.SET_CONTAINER,
                container: undefined
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
                .delete(`/api/presentations/${container._id}`)
                .reply(500, error);
            await store.dispatch(deleteContainer(container._id));
            head(store.getActions()).should.deep.equal({
                type: ErrorTypes.SET_ERROR,
                error
            });
            scope.done();
        });
    });
    describe("Reducer", () => {
        it("Should set presentation containers with an immutable state", () => {
            is(reducer(new PresentationContainerEditState(), {
                type: ActionTypes.SET_CONTAINER,
                container
            }), new PresentationContainerEditState({
                container
            })).should.be.true;
        });
    });
});
