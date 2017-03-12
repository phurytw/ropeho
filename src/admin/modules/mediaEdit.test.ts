/**
 * @file Tests for the media edit module
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../test.d.ts" />
import { should } from "chai";
import { default as mockStore, IStore } from "redux-mock-store";
import { MediaEditState, setMedia, ActionTypes, default as reducer } from "./mediaEdit";
import { middlewares } from "../store";
import { productions } from "../../sampleData/testDb";
import { head } from "lodash";
import "isomorphic-fetch";
import { is } from "immutable";
should();

import Models = Ropeho.Models;

describe("Media edit module", () => {
    let store: IStore<MediaEditState>;
    const media: Models.Media = productions[0].banner;
    before(() => store = mockStore<MediaEditState>(middlewares)(new MediaEditState()));
    afterEach(() => store.clearActions());
    describe("Actions", () => {
        it("Should dispatch a media", () => {
            store.dispatch(setMedia(media));
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.SET_MEDIA,
                media
            });
        });
    });
    describe("Reducer", () => {
        it("Should set the state with an immutable media", () => {
            is(reducer(new MediaEditState(), {
                type: ActionTypes.SET_MEDIA,
                media
            }), new MediaEditState({
                media
            })).should.be.true;
        });
    });
});
