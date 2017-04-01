/**
 * @file Tests for the source edit module
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../test.d.ts" />
import { should } from "chai";
import { default as mockStore, IStore } from "redux-mock-store";
import { SourceEditState, setSource, defaultState, ActionTypes, replaceSources, selectSource, removeSources, default as reducer } from "./sourceEdit";
import { middlewares } from "../store";
import { productions } from "../../sampleData/testDb";
import { head } from "lodash";
import "isomorphic-fetch";
import { is, fromJS } from "immutable";
should();

import Models = Ropeho.Models;

describe("Source edit module", () => {
    let store: IStore<SourceEditState>;
    const source: Models.Source = productions[0].banner.sources[0];
    before(() => store = mockStore<SourceEditState>(middlewares())(defaultState));
    afterEach(() => store.clearActions());
    describe("Actions", () => {
        it("Should dispatch a single source", () => {
            store.dispatch(setSource(source));
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.SET_SOURCE,
                source
            });
        });
        it("Should dispatch multiple sources", () => {
            store.dispatch(replaceSources([source, source]));
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.REPLACE_SOURCES,
                sources: [source, source]
            });
        });
        it("Should dispatch the selected source ID", () => {
            store.dispatch(selectSource(source._id));
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.SELECT_SOURCE,
                sourceId: source._id
            });
        });
        it("Should dispatch a source ID for removal", () => {
            store.dispatch(removeSources([source._id]));
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.REMOVE_SOURCES,
                sourceIds: [source._id]
            });
        });
    });
    describe("Reducer", () => {
        it("Should set state with an immutable source", () => {
            is(reducer(undefined, {
                type: ActionTypes.SET_SOURCE,
                source
            }), fromJS({
                sources: { [source._id]: source },
                selected: undefined
            })).should.be.true;
        });
        it("Should replace sources with new sources", () => {
            is(reducer(fromJS({
                sources: { niceId: source }
            }), {
                    type: ActionTypes.REPLACE_SOURCES,
                    sources: [source, source]
                }), fromJS({
                    sources: { [source._id]: source }
                })).should.be.true;
        });
        it("Should set the selected source in the state", () => {
            is(reducer(undefined, {
                type: ActionTypes.SELECT_SOURCE,
                sourceId: source._id
            }), fromJS({
                sources: {},
                selected: source._id
            }));
        });
        it("Should remove a source from the state", () => {
            is(reducer(fromJS({
                sources: { [source._id]: source }
            }), {
                    type: ActionTypes.REMOVE_SOURCES,
                    sourceIds: [source._id]
                }), fromJS({
                    sources: {}
                })).should.be.true;
        });
    });
});
