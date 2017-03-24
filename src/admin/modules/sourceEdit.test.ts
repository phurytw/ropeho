/**
 * @file Tests for the source edit module
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../test.d.ts" />
import { should } from "chai";
import { default as mockStore, IStore } from "redux-mock-store";
import { SourceEditState, setSource, setBuffer, ActionTypes, default as reducer } from "./sourceEdit";
import { middlewares } from "../store";
import { productions } from "../../sampleData/testDb";
import { head } from "lodash";
import "isomorphic-fetch";
import { is } from "immutable";
should();

import Models = Ropeho.Models;

describe("Source edit module", () => {
    let store: IStore<SourceEditState>;
    const source: Models.Source = productions[0].banner.sources[0];
    before(() => store = mockStore<SourceEditState>(middlewares())(new SourceEditState()));
    afterEach(() => store.clearActions());
    describe("Actions", () => {
        it("Should fetch a production from the API server", () => {
            store.dispatch(setSource(source));
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.SET_SOURCE,
                source
            });
        });
        it("Should set the buffer with data", () => {
            const buffer: ArrayBuffer = new ArrayBuffer(100);
            store.dispatch(setBuffer(buffer));
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.SET_BUFFER,
                buffer
            });
        });
    });
    describe("Reducer", () => {
        it("Should set state with an immutable source", () => {
            is(reducer(new SourceEditState(), {
                type: ActionTypes.SET_SOURCE,
                source
            }), new SourceEditState({
                source,
                buffer: undefined
            })).should.be.true;
        });
        it("Should set state with an immutable buffer", () => {
            const buffer: ArrayBuffer = new ArrayBuffer(100);
            is(reducer(new SourceEditState(), {
                type: ActionTypes.SET_BUFFER,
                buffer
            }), new SourceEditState({
                source: undefined,
                buffer
            })).should.be.true;
        });
    });
});
