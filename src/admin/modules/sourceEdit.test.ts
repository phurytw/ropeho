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
import { is, Map } from "immutable";
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
            const sourceId: string = "sid";
            store.dispatch(setBuffer(sourceId, buffer));
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.SET_BUFFER,
                buffer,
                sourceId
            });
        });
    });
    describe("Reducer", () => {
        it("Should set state with an immutable source", () => {
            is(reducer(new SourceEditState(), {
                type: ActionTypes.SET_SOURCE,
                source
            }), new SourceEditState({
                sources: Map.of(source._id, source),
            })).should.be.true;
        });
        it("Should set state with an immutable buffer", () => {
            const buffer: ArrayBuffer = new ArrayBuffer(100);
            const sourceId: string = "sid";
            is(reducer(new SourceEditState(), {
                type: ActionTypes.SET_BUFFER,
                buffer, sourceId
            }), new SourceEditState({
                buffers: Map.of(sourceId, buffer)
            })).should.be.true;
        });
        it("Should replace sources with new sources", () => {
            is(reducer(new SourceEditState({
                sources: Map.of("niceId", source)
            }), {
                    type: ActionTypes.REPLACE_SOURCES,
                    sources: [source, source]
                }), new SourceEditState({
                    sources: Map.of(source._id, source),
                })).should.be.true;
        });
        it("Should replace buffers with new buffers", () => {
            const [sid, sid2]: string[] = ["sid", "sid2"];
            const buffers: { [key: string]: ArrayBuffer } = { [sid]: new ArrayBuffer(100), [sid2]: new ArrayBuffer(100) };
            is(reducer(new SourceEditState(), {
                type: ActionTypes.REPLACE_BUFFERS,
                buffers
            }), new SourceEditState({
                buffers: Map.of(sid, buffers[sid], sid2, buffers[sid2])
            })).should.be.true;
        });
    });
});
