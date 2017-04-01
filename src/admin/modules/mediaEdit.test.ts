/**
 * @file Tests for the media edit module
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../test.d.ts" />
import { should } from "chai";
import { default as mockStore, IStore } from "redux-mock-store";
import {
    MediaEditState,
    defaultState,
    setMedia,
    replaceMedias,
    selectMedia,
    setMediaPosition,
    setSourcePosition,
    addSourceToMedia,
    removeMedia,
    removeSourcesFromMedia,
    ActionTypes,
    default as reducer
} from "./mediaEdit";
import { middlewares } from "../store";
import { productions } from "../../sampleData/testDb";
import { head } from "lodash";
import "isomorphic-fetch";
import { is, Map, fromJS } from "immutable";
import { v4 } from "uuid";
should();

import Models = Ropeho.Models;

describe("Media edit module", () => {
    let store: IStore<MediaEditState>;
    const media: Models.Media = productions[0].banner;
    before(() => store = mockStore<MediaEditState>(middlewares())(defaultState));
    afterEach(() => store.clearActions());
    describe("Actions", () => {
        it("Should dispatch a media", () => {
            store.dispatch(setMedia(media));
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.SET_MEDIA,
                media
            });
        });
        it("Should dispatch multiple medias", () => {
            store.dispatch(replaceMedias([media, media]));
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.REPLACE_MEDIAS,
                medias: [media, media]
            });
        });
        it("Should dispatch a media ID to be used by the application", () => {
            store.dispatch(selectMedia(media._id));
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.SELECT_MEDIA,
                mediaId: media._id
            });
        });
        it("Should dispatch a new media position", () => {
            store.dispatch(setMediaPosition(media._id, 2));
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.SET_MEDIA_POSITION,
                mediaId: media._id,
                position: 2
            });
        });
        it("Should dispatch a new source position", () => {
            store.dispatch(setSourcePosition(media._id, media.sources[0]._id, 2));
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.SET_SOURCE_POSITION,
                mediaId: media._id,
                sourceId: media.sources[0]._id,
                position: 2
            });
        });
        it("Should dispatch a source ID to be added to a media", () => {
            store.dispatch(addSourceToMedia(media._id, media.sources[0]._id));
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.ADD_SOURCE_TO_MEDIA,
                mediaId: media._id,
                sourceId: media.sources[0]._id
            });
        });
        it("Should dispatch a media ID for removal", () => {
            store.dispatch(removeMedia(media._id));
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.REMOVE_MEDIA,
                mediaId: media._id
            });
        });
        it("Should dispatch a source ID for removal", () => {
            store.dispatch(removeSourcesFromMedia([media.sources[0]._id]));
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.REMOVE_SOURCES,
                sourceIds: [media.sources[0]._id],
                mediaId: undefined
            });
        });
    });
    describe("Reducer", () => {
        it("Should update a media in the state with an immutable media", () => {
            is(reducer(undefined, {
                type: ActionTypes.SET_MEDIA,
                media
            }), fromJS({
                order: [media._id],
                medias: { [media._id]: media },
                sources: { [media._id]: media.sources.map((s: Models.Source) => s._id) },
                selected: undefined
            })).should.be.true;
        });
        it("Should replace all medias in the state with immutable medias", () => {
            is(reducer(fromJS({
                medias: Map.of("someId", media)
            }), {
                    type: ActionTypes.REPLACE_MEDIAS,
                    medias: [media, media]
                }), fromJS({
                    order: [media._id],
                    medias: { [media._id]: media },
                    sources: { [media._id]: media.sources.map((s: Models.Source) => s._id) },
                })).should.be.true;
        });
        it("Should set the selected media ID in the state", () => {
            is(reducer(undefined, {
                type: ActionTypes.SELECT_MEDIA,
                mediaId: media._id
            }), fromJS({
                selected: media._id,
                order: [],
                sources: {},
                medias: {}
            }));
        });
        it("Should change the order of the media", () => {
            const anotherMedia: Models.Media = {
                _id: v4(),
                delay: 0,
                description: "",
                sources: [],
                state: 0,
                type: 2
            };
            is(reducer(fromJS({
                order: [anotherMedia._id, media._id],
                medias: { [anotherMedia._id]: anotherMedia, [media._id]: media }
            }), {
                    type: ActionTypes.SET_MEDIA_POSITION,
                    mediaId: media._id,
                    position: 0
                }), fromJS({
                    order: [media._id, anotherMedia._id],
                    medias: { [anotherMedia._id]: anotherMedia, [media._id]: media }
                })).should.be.true;
        });
        it("Should not add a media in the order if it's not in the state", () => {
            const anotherMedia: Models.Media = {
                _id: v4(),
                delay: 0,
                description: "",
                sources: [],
                state: 0,
                type: 2
            };
            is(reducer(fromJS({
                order: [anotherMedia._id],
                medias: { [anotherMedia._id]: anotherMedia }
            }), {
                    type: ActionTypes.SET_MEDIA_POSITION,
                    mediaId: media._id,
                    position: 0
                }), fromJS({
                    order: [anotherMedia._id],
                    medias: { [anotherMedia._id]: anotherMedia }
                })).should.be.true;
        });
        it("Should change the order of the source within a media", () => {
            const sources: Models.Source[] = [{
                _id: v4(),
            }, {
                _id: v4(),
            }, {
                _id: v4(),
            }];
            const [srcA, srcB, srcC]: Models.Source[] = sources;
            const anotherMedia: Models.Media = {
                _id: v4(),
                delay: 0,
                description: "",
                sources,
                state: 0,
                type: 2
            };
            is(reducer(fromJS({
                order: [anotherMedia._id],
                medias: { [anotherMedia._id]: anotherMedia },
                sources: { [anotherMedia._id]: sources.map((s: Models.Source) => s._id) }
            }), {
                    type: ActionTypes.SET_SOURCE_POSITION,
                    mediaId: anotherMedia._id,
                    sourceId: srcC._id,
                    position: 1
                }), fromJS({
                    order: [anotherMedia._id],
                    medias: { [anotherMedia._id]: anotherMedia },
                    sources: { [anotherMedia._id]: [srcA._id, srcC._id, srcB._id] }
                })).should.be.true;
        });
        it("Should not change the order of the source if the media does not exist", () => {
            const sources: Models.Source[] = [{
                _id: v4(),
            }, {
                _id: v4(),
            }, {
                _id: v4(),
            }];
            const [srcA]: Models.Source[] = sources;
            const anotherMedia: Models.Media = {
                _id: v4(),
                delay: 0,
                description: "",
                sources,
                state: 0,
                type: 2
            };
            is(reducer(fromJS({
                order: [anotherMedia._id],
                medias: { [anotherMedia._id]: anotherMedia },
                sources: { [anotherMedia._id]: sources.map((s: Models.Source) => s._id) }
            }), {
                    type: ActionTypes.SET_SOURCE_POSITION,
                    mediaId: media._id,
                    sourceId: srcA._id,
                    position: 1
                }), fromJS({
                    order: [anotherMedia._id],
                    medias: { [anotherMedia._id]: anotherMedia },
                    sources: { [anotherMedia._id]: sources.map((s: Models.Source) => s._id) }
                })).should.be.true;
        });
        it("Should not change the order of the source if the source does not exist", () => {
            const sources: Models.Source[] = [{
                _id: v4(),
            }, {
                _id: v4(),
            }, {
                _id: v4(),
            }];
            const anotherMedia: Models.Media = {
                _id: v4(),
                delay: 0,
                description: "",
                sources,
                state: 0,
                type: 2
            };
            is(reducer(fromJS({
                order: [anotherMedia._id],
                medias: { [anotherMedia._id]: anotherMedia },
                sources: { [anotherMedia._id]: sources.map((s: Models.Source) => s._id) }
            }), {
                    type: ActionTypes.SET_SOURCE_POSITION,
                    mediaId: anotherMedia._id,
                    sourceId: v4(),
                    position: 1
                }), fromJS({
                    order: [anotherMedia._id],
                    medias: { [anotherMedia._id]: anotherMedia },
                    sources: { [anotherMedia._id]: sources.map((s: Models.Source) => s._id) }
                })).should.be.true;
        });
        it("Should add the source to the media if it does not exist", () => {
            const sources: Models.Source[] = [{
                _id: v4(),
            }, {
                _id: v4(),
            }, {
                _id: v4(),
            }];
            const [srcA, srcB, srcC]: Models.Source[] = sources;
            const anotherMedia: Models.Media = {
                _id: v4(),
                delay: 0,
                description: "",
                sources,
                state: 0,
                type: 2
            };
            is(reducer(fromJS({
                order: [anotherMedia._id],
                medias: { [anotherMedia._id]: anotherMedia },
                sources: { [anotherMedia._id]: [srcA._id, srcC._id] }
            }), {
                    type: ActionTypes.ADD_SOURCE_TO_MEDIA,
                    mediaId: anotherMedia._id,
                    sourceId: srcB._id
                }), fromJS({
                    order: [anotherMedia._id],
                    medias: { [anotherMedia._id]: anotherMedia },
                    sources: { [anotherMedia._id]: [srcA._id, srcC._id, srcB._id] }
                })).should.be.true;
        });
        it("Should not add the source to the media if it's already there", () => {
            const sources: Models.Source[] = [{
                _id: v4(),
            }, {
                _id: v4(),
            }, {
                _id: v4(),
            }];
            const [srcA, srcB, srcC]: Models.Source[] = sources;
            const anotherMedia: Models.Media = {
                _id: v4(),
                delay: 0,
                description: "",
                sources,
                state: 0,
                type: 2
            };
            is(reducer(fromJS({
                order: [anotherMedia._id],
                medias: { [anotherMedia._id]: anotherMedia },
                sources: { [anotherMedia._id]: [srcA._id, srcB._id, srcC._id] }
            }), {
                    type: ActionTypes.ADD_SOURCE_TO_MEDIA,
                    mediaId: anotherMedia._id,
                    sourceId: srcB._id
                }), fromJS({
                    order: [anotherMedia._id],
                    medias: { [anotherMedia._id]: anotherMedia },
                    sources: { [anotherMedia._id]: [srcA._id, srcB._id, srcC._id] }
                })).should.be.true;
        });
        it("Should remove a media", () => {
            const sources: Models.Source[] = [{
                _id: v4(),
            }, {
                _id: v4(),
            }, {
                _id: v4(),
            }];
            const [srcA, srcB, srcC]: Models.Source[] = sources;
            const anotherMedia: Models.Media = {
                _id: v4(),
                delay: 0,
                description: "",
                sources,
                state: 0,
                type: 2
            };
            is(reducer(fromJS({
                order: [anotherMedia._id],
                medias: { [anotherMedia._id]: anotherMedia },
                sources: { [anotherMedia._id]: [srcA._id, srcB._id, srcC._id] }
            }), {
                    type: ActionTypes.REMOVE_MEDIA,
                    mediaId: anotherMedia._id
                }), fromJS({
                    order: [],
                    medias: {},
                    sources: {}
                })).should.be.true;
        });
        it("Should remove a source from a media", () => {
            const sources: Models.Source[] = [{
                _id: v4(),
            }, {
                _id: v4(),
            }, {
                _id: v4(),
            }];
            const [srcA, srcB, srcC]: Models.Source[] = sources;
            const anotherMedia: Models.Media = {
                _id: v4(),
                delay: 0,
                description: "",
                sources,
                state: 0,
                type: 2
            };
            is(reducer(fromJS({
                order: [anotherMedia._id],
                medias: { [anotherMedia._id]: anotherMedia },
                sources: { [anotherMedia._id]: [srcA._id, srcB._id, srcC._id] }
            }), {
                    type: ActionTypes.REMOVE_SOURCES,
                    sourceIds: [srcA._id, srcC._id]
                }), fromJS({
                    order: [anotherMedia._id],
                    medias: { [anotherMedia._id]: anotherMedia },
                    sources: { [anotherMedia._id]: [srcB._id] }
                })).should.be.true;
        });
    });
});
