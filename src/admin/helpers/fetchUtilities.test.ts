/**
 * @file Tests for the fetch error handler
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../test.d.ts" />
import { should, use } from "chai";
import { spy } from "sinon";
import * as sinonChai from "sinon-chai";
import { errorHandler, fetchThunk } from "./fetchUtilities";
import { ActionTypes as ErrorTypes } from "../modules/error";
import * as nock from "nock";
import "isomorphic-fetch";
import { default as mockStore, IStore } from "redux-mock-store";
import { middlewares } from "../store";
import { ThunkAction } from "redux-thunk";
import { Dispatch, Action } from "redux";
import "isomorphic-fetch";
should();
use(sinonChai);

interface TestState {
    test: string;
}
const SET_TEST: string = "SET_TEST";

describe("Error handler", () => {
    // tslint:disable-next-line:no-http-string
    const host: string = "http://localhost",
        successfulResponse: TestState = {
            test: "good"
        },
        error: Ropeho.IErrorResponse = {
            developerMessage: "A nice error",
            errorCode: 0,
            status: 400,
            userMessage: "A nice error"
        };
    beforeEach(() => {
        const scope: nock.Scope = nock(host);
        scope.get("/good").reply(200, successfulResponse);
        scope.get("/bad").reply(500, error);
    });
    describe("Error handler", () => {
        afterEach(() => nock.cleanAll());
        it("Should not dispatch an error if the HTTP request succeeds", async () => {
            await fetch(`${host}/good`)
                .then<Response>(errorHandler)
                .then((response: Response) => response.status.should.equal(200));
        });
        it("Should dispatch an error if the HTTP request fails", async () => {
            await fetch(`${host}/bad`)
                .then<Response>(errorHandler)
                .catch((response: Response) => response.status.should.equal(500));
        });
    });
    describe("Thunk factory", () => {
        let store: IStore<TestState>,
            thunk: ThunkAction<Promise<TestState>, TestState, {}>,
            thunkSpy: sinon.SinonSpy;
        before(() => store = mockStore<TestState>(middlewares({
            host,
            error: {
                type: ErrorTypes.SET_ERROR
            }
        }))());
        beforeEach(() => {
            store.clearActions();
            thunkSpy = spy();
        });
        it("Should create a thunk that runs a promise and execute a callback", async () => {
            thunk = fetchThunk<TestState & Action, TestState, TestState>(
                `${host}/good`,
                (dispatch: Dispatch<TestState>, result: TestState) => dispatch<TestState & Action>({
                    type: SET_TEST,
                    test: result.test
                }));
            await store.dispatch(thunk);
            store.getActions().should.deep.equal([{
                type: SET_TEST,
                test: "good"
            }]);
        });
        it("Should create a thunk that runs a rejected promise and dispatches the error", async () => {
            thunk = fetchThunk<TestState & Action, TestState, TestState>(
                `${host}/bad`,
                (dispatch: Dispatch<TestState>, result: TestState) => dispatch<TestState & Action>({
                    type: SET_TEST,
                    test: result.test
                }));
            await store.dispatch(thunk);
            store.getActions().should.deep.equal([{
                type: ErrorTypes.SET_ERROR,
                error
            }]);
        });
    });
});
