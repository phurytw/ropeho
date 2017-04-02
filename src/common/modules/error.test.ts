/**
 * @file Test for the error handler module
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../test.d.ts" />
import { should } from "chai";
import { default as mockStore, IStore } from "redux-mock-store";
import { ErrorState, defaultState, setError, ActionTypes, default as reducer } from "./error";
import reduxThunk from "redux-thunk";
import { is, fromJS } from "immutable";
import "isomorphic-fetch";
should();

describe("Error handler module", () => {
    const error: Ropeho.IErrorResponse = {
        developerMessage: "A nice error",
        errorCode: 0,
        status: 400,
        userMessage: "A nice error"
    };
    let store: IStore<ErrorState>;
    before(() => store = mockStore<ErrorState>([reduxThunk])(defaultState));
    afterEach(() => store.clearActions());
    describe("Error action", () => {
        it("Should dispatch an error", () => {
            store.dispatch(setError(error));
            store.getActions().should.deep.equal([
                { type: ActionTypes.SET_ERROR, error }
            ]);
        });
    });
    describe("Error reducer", () => {
        it("Should create a new state with the new error", () => {
            is(reducer(undefined, {
                type: ActionTypes.SET_ERROR,
                error
            }), fromJS({
                error
            }));
        });
    });
});
