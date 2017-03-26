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
import { is, Map } from "immutable";
should();

import Models = Ropeho.Models;

describe("Media edit module", () => {
    let store: IStore<MediaEditState>;
    const media: Models.Media = productions[0].banner;
    before(() => store = mockStore<MediaEditState>(middlewares())(new MediaEditState()));
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
        it("Should update a media in the state with an immutable media", () => {
            is(reducer(new MediaEditState(), {
                type: ActionTypes.SET_MEDIA,
                media
            }), new MediaEditState({
                medias: Map.of(media._id, media)
            })).should.be.true;
        });
        it("Should replace all medias in the state with immutable medias", () => {
            is(reducer(new MediaEditState({
                medias: Map.of("someId", media)
            }), {
                    type: ActionTypes.REPLACE_MEDIAS,
                    medias: [media, media]
                }), new MediaEditState({
                    medias: Map.of(media._id, media)
                })).should.be.true;
        });
    });
});
