/**
 * @file Tests for the Redux selectors
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../test.d.ts" />
import { should } from "chai";
import {
    getCurrentUser,
    getError,
    getHasRendered,
    getProductions,
    getProduction,
    getMedias,
    getSources,
    getSelectedMedia,
    getSelectedSource,
    getSourcesFromSelectedMedia
} from "./selectors";
import { users, productions } from "../sampleData/testDb";
import sessionReducer from "./modules/session";
import renderingReducer from "./modules/rendering";
import errorReducer from "./modules/error";
import productionIndexReducer from "./modules/productionIndex";
import productionEditReducer from "./modules/productionEdit";
import mediaEditReducer from "./modules/mediaEdit";
import sourceEditReducer from "./modules/sourceEdit";
should();

import Models = Ropeho.Models;
import IErrorResponse = Ropeho.IErrorResponse;

describe("Redux selectors", () => {
    it("Should get the current user", () => {
        const [user]: Models.User[] = users;
        getCurrentUser({
            session: sessionReducer({
                user
            } as any, { type: "" })
        }).should.deep.equal(user);
    });
    it("Should get the rendering state", () => {
        getHasRendered({
            rendering: renderingReducer({
                hasRendered: true
            } as any, { type: "" })
        }).should.deep.equal(true);
        getHasRendered({
            rendering: renderingReducer({
                hasRendered: false
            } as any, { type: "" })
        }).should.deep.equal(false);
    });
    it("Should get the current error", () => {
        const error: IErrorResponse = {
            developerMessage: "A nice error",
            errorCode: 0,
            status: 400,
            userMessage: "A nice error"
        };
        getError({
            error: errorReducer({
                error
            } as any, { type: "" })
        }).should.deep.equal(error);
    });
    it("Should get all productions", () => {
        getProductions({
            productionIndex: productionIndexReducer({ productions } as any, { type: "" })
        }).should.deep.equal(productions);
    });
    it("Should get the production being edited", () => {
        getProduction({
            productionEdit: productionEditReducer({ production: productions[0] } as any, { type: "" })
        }).should.deep.equal(productions[0]);
    });
    it("Should get all medias", () => {
        const [mediaA, mediaB]: Models.Media[] = productions[0].medias;
        getMedias({
            mediaEdit: mediaEditReducer({
                order: [mediaA._id, mediaB._id],
                medias: {
                    [mediaA._id]: mediaA,
                    [mediaB._id]: mediaB
                }
            } as any, { type: "" })
        }).should.deep.equal([mediaA, mediaB]);
    });
    it("Should get all sources", () => {
        const [media]: Models.Media[] = productions[0].medias;
        const [sourceA]: Models.Source[] = media.sources;
        getSources({
            sourceEdit: sourceEditReducer({
                order: [sourceA._id],
                sources: {
                    [sourceA._id]: sourceA
                }
            } as any, { type: "" })
        }).should.deep.equal([sourceA]);
    });
    it("Should get the selected media", () => {
        const [media]: Models.Media[] = productions[0].medias;
        getSelectedMedia({
            mediaEdit: mediaEditReducer({
                order: [media._id],
                medias: { [media._id]: media },
                selected: media._id
            } as any, { type: "" })
        }).should.deep.equal(media);
    });
    it("Should get undefined if the selected media does not exist", () => {
        const [media]: Models.Media[] = productions[0].medias;
        should().not.exist(getSelectedMedia({
            mediaEdit: mediaEditReducer({
                order: [],
                medias: {},
                selected: media._id
            } as any, { type: "" })
        }));
    });
    it("Should get undefined if there is no selected media", () => {
        const [media]: Models.Media[] = productions[0].medias;
        should().not.exist(getSelectedMedia({
            mediaEdit: mediaEditReducer({
                order: [media._id],
                medias: { [media._id]: media },
                selected: undefined
            } as any, { type: "" })
        }));
    });
    it("Should get the selected source", () => {
        const [source]: Models.Source[] = productions[0].banner.sources;
        getSelectedSource({
            sourceEdit: sourceEditReducer({
                order: [source._id],
                sources: { [source._id]: source },
                selected: source._id
            } as any, { type: "" })
        }).should.deep.equal(source);
    });
    it("Should get undefined if the selected source does not exist", () => {
        const [source]: Models.Source[] = productions[0].banner.sources;
        should().not.exist(getSelectedSource({
            sourceEdit: sourceEditReducer({
                order: [],
                sources: {},
                selected: source._id
            } as any, { type: "" })
        }));
    });
    it("Should get undefined if there is no selected source", () => {
        const [source]: Models.Source[] = productions[0].banner.sources;
        should().not.exist(getSelectedSource({
            sourceEdit: sourceEditReducer({
                order: [source._id],
                sources: { [source._id]: source },
                selected: undefined
            } as any, { type: "" })
        }));
    });
    it("Should get sources from the selected media", () => {
        const media: Models.Media = productions[0].banner;
        const [source]: Models.Source[] = media.sources;
        getSourcesFromSelectedMedia({
            sourceEdit: sourceEditReducer({
                sources: { [source._id]: source }
            } as any, { type: "" }),
            mediaEdit: mediaEditReducer({
                sources: { [media._id]: [source._id] },
                selected: media._id
            } as any, { type: "" })
        }).should.deep.equal([source]);
    });
});
