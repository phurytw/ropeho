/**
 * @file Test for the ObjectURL module
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../test.d.ts" />
import { should } from "chai";
import { default as mockStore, IStore } from "redux-mock-store";
import { ObjectURLState, defaultState, setFile, ActionTypes, default as reducer } from "./objectURL";
import reduxThunk from "redux-thunk";
import { is, fromJS } from "immutable";
import "isomorphic-fetch";
should();

describe("ObjectURL module", () => {
    let store: IStore<ObjectURLState>;
    const objectURL: string = "blob:http://localhost/myNiceBlob";
    const file: File = new File([new ArrayBuffer(100)], "thatFile.jpeg");
    before(() => store = mockStore<ObjectURLState>([reduxThunk])(defaultState));
    afterEach(() => store.clearActions());
    describe("Actions", () => {
        it("Should dispatch an objectURL and its associated file", () => {
            store.dispatch(setFile(objectURL, file));
            store.getActions().should.deep.equal([
                {
                    type: ActionTypes.SET_FILE,
                    objectURL,
                    file
                }
            ]);
        });
    });
    describe("Error reducer", () => {
        it("Should create a new state with the new error", () => {
            is(reducer(undefined, {
                type: ActionTypes.SET_FILE,
                objectURL,
                file
            }), fromJS({
                objectURLs: {}
            }).setIn(["objectURLs", objectURL], file));
        });
    });
});
