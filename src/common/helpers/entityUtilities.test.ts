/**
 * @file Unit tests for the entity utilities module
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../../test.d.ts" />
import { should, use } from "chai";
import * as sinonChai from "sinon-chai";
import { spy } from "sinon";
import {
    isProduction,
    isSource,
    isMedia,
    isCategory,
    isPresentation,
    isPresentationContainer,
    getMedias,
    getSources,
    updateSourceInMedia,
    updateMediaInEntity,
    getEntityType,
    getAllSourceTargetOptionsFromEntity,
    getMediaFromEntity,
    getSourceFromMedia,
    isUser,
    filterProduction
} from "../helpers/entityUtilities";
import * as entityUtilities from "../helpers/entityUtilities";
import { EntityType, MediaPermissions } from "../../enum";
import { categories, productions, presentations, users } from "../../sampleData/testDb";
import { flatMap, cloneDeep, forEach } from "lodash";
import * as deepFreeze from "deep-freeze";
import { isUUID } from "validator";
import { v4 } from "uuid";
should();
use(sinonChai);

import Production = Ropeho.Models.Production;
import Category = Ropeho.Models.Category;
import PresentationContainer = Ropeho.Models.PresentationContainer;
import Presentation = Ropeho.Models.Presentation;
import Media = Ropeho.Models.Media;
import Source = Ropeho.Models.Source;
import User = Ropeho.Models.User;
import SourceTargetOptions = Ropeho.Socket.SourceTargetOptions;

describe("Entity utilities", () => {
    const [productionA]: Production[] = productions,
        [containerA]: PresentationContainer[] = presentations,
        [presentationA]: Presentation[] = containerA.presentations,
        [categoryA]: Category[] = categories,
        [mediaA, mediaB, mediaC]: Media[] = productionA.medias,
        [sourceA]: Source[] = mediaC.sources,
        [userA]: User[] = users;
    describe("Type checking functions", () => {
        describe("isSource", () => {
            it("Should return false if parameter is not a source", () => {
                isSource(mediaA).should.be.false;
                isSource(productionA).should.be.false;
                isSource(categoryA).should.be.false;
                isSource(presentationA).should.be.false;
                isSource(containerA).should.be.false;
                isSource("" as any).should.be.false;
                isSource({}).should.be.false;
                isSource(undefined).should.be.false;
                const fakeSrc: Source = { ...sourceA };
                delete fakeSrc.fallback;
                isSource(fakeSrc).should.be.false;
            });
            it("Should return true if it is a valid source", () => isSource(sourceA).should.be.true);
        });
        describe("isMedia", () => {
            it("Should return false if parameter is not a media", () => {
                isMedia(sourceA).should.be.false;
                isMedia(productionA).should.be.false;
                isMedia(categoryA).should.be.false;
                isMedia(presentationA).should.be.false;
                isMedia(containerA).should.be.false;
                isMedia("" as any).should.be.false;
                isMedia({}).should.be.false;
                isMedia(undefined).should.be.false;
                const fakeMedia: Media = { ...mediaC };
                delete fakeMedia.description;
                isMedia(fakeMedia).should.be.false;
            });
            it("Should return true if it is a valid media", () => isMedia(mediaA).should.be.true);
        });
        describe("isProduction", () => {
            it("Should return false if parameter is not a production", () => {
                isProduction(mediaA).should.be.false;
                isProduction(sourceA).should.be.false;
                isProduction(categoryA).should.be.false;
                isProduction(presentationA).should.be.false;
                isProduction(containerA).should.be.false;
                isProduction("" as any).should.be.false;
                isProduction({}).should.be.false;
                isProduction(undefined).should.be.false;
                const fakeProd: Production = { ...productionA };
                delete fakeProd.description;
                isProduction(fakeProd).should.be.false;
            });
            it("Should return true if it is a valid production", () => isProduction(productionA).should.be.true);
        });
        describe("isCategory", () => {
            it("Should return false if parameter is not a category", () => {
                isCategory(mediaA).should.be.false;
                isCategory(sourceA).should.be.false;
                isCategory(productionA).should.be.false;
                isCategory(presentationA).should.be.false;
                isCategory(containerA).should.be.false;
                isCategory("" as any).should.be.false;
                isCategory({}).should.be.false;
                isCategory(undefined).should.be.false;
                const fakeCate: Category = { ...categoryA };
                delete fakeCate.productionIds;
                isCategory(fakeCate).should.be.false;
            });
            it("Should return true if it is a valid category", () => isCategory(categoryA).should.be.true);
        });
        describe("isPresentation", () => {
            it("Should return false if parameter is not a presentation", () => {
                isPresentation(mediaA).should.be.false;
                isPresentation(sourceA).should.be.false;
                isPresentation(productionA).should.be.false;
                isPresentation(categoryA).should.be.false;
                isPresentation(containerA).should.be.false;
                isPresentation("" as any).should.be.false;
                isPresentation({}).should.be.false;
                isPresentation(undefined).should.be.false;
                const fakePre: Presentation = { ...presentationA };
                delete fakePre.mainMedia;
                isPresentation(fakePre).should.be.false;
            });
            it("Should return true if it is a valid presentation", () => isPresentation(presentationA).should.be.true);
        });
        describe("isPresentationContainer", () => {
            it("Should return false if parameter is not a presentation container", () => {
                isPresentationContainer(mediaA).should.be.false;
                isPresentationContainer(sourceA).should.be.false;
                isPresentationContainer(productionA).should.be.false;
                isPresentationContainer(categoryA).should.be.false;
                isPresentationContainer(presentationA).should.be.false;
                isPresentationContainer("" as any).should.be.false;
                isPresentationContainer({}).should.be.false;
                isPresentationContainer(undefined).should.be.false;
                const fakeCont: PresentationContainer = { ...containerA };
                delete fakeCont.type;
                isPresentationContainer(fakeCont).should.be.false;
            });
            it("Should return true if it is a valid presentation container", () => isPresentationContainer(containerA).should.be.true);
        });
        describe("isUser", () => {
            it("Should return false if parameter is not a user", () => {
                isUser(mediaA).should.be.false;
                isUser(sourceA).should.be.false;
                isUser(productionA).should.be.false;
                isUser(categoryA).should.be.false;
                isUser(presentationA).should.be.false;
                isUser("" as any).should.be.false;
                isUser({}).should.be.false;
                isUser(undefined).should.be.false;
                const fakeUsr: User = { ...userA };
                delete fakeUsr.productionIds;
                isUser(fakeUsr).should.be.false;
            });
            it("Should return true if it is a valid user", () => isUser(userA).should.be.true);
        });
        describe("Detecting entity types", () => {
            it("Should throw if the entity is unknown", () => should().throw(getEntityType.bind(entityUtilities, {})));
            it("Should detect that it is a production", () => getEntityType(productionA).should.equal(EntityType.Production));
            it("Should detect that it is a category", () => getEntityType(categoryA).should.equal(EntityType.Category));
            it("Should detect that it is a presentation", () => getEntityType(presentationA).should.equal(EntityType.Presentation));
            it("Should detect that it is a presentation container", () => getEntityType(containerA).should.equal(EntityType.PresentationContainer));
            it("Should detect that it is a media", () => getEntityType(mediaA).should.equal(EntityType.Media));
            it("Should detect that it is a source", () => getEntityType(sourceA).should.equal(EntityType.Source));
        });
    });
    describe("Finding functions", () => {
        describe("Getting medias out of an entity", () => {
            it("Should throw if the parameter is not a valid entity", () => {
                should().throw(getMedias.bind(entityUtilities, ""));
                should().throw(getMedias.bind(entityUtilities, {}));
                should().throw(getMedias.bind(entityUtilities, undefined));
                should().throw(getMedias.bind(entityUtilities, null));
                should().throw(getMedias.bind(entityUtilities, mediaA));
                should().throw(getMedias.bind(entityUtilities, sourceA));
            });
            it("Should get medias from a production", () => {
                const medias: Media[] = [productionA.banner, productionA.background, ...productionA.medias];
                getMedias(productionA).should.deep.equal(medias);
            });
            it("Should get medias from a category", () => {
                getMedias(categoryA).should.deep.equal([categoryA.banner]);
            });
            it("Should get medias from a presentation", () => {
                getMedias(presentationA).should.deep.equal([presentationA.mainMedia, presentationA.alternateMedia]);
            });
            it("Should get medias from a presentation container", () => {
                getMedias(containerA).should.deep.equal([presentationA.mainMedia, presentationA.alternateMedia]);
            });
        });
        describe("Getting sources out of an entity", () => {
            it("Should throw if the parameter is not valid", () => {
                should().throw(getSources.bind(entityUtilities, ""));
                should().throw(getSources.bind(entityUtilities, undefined));
                should().throw(getSources.bind(entityUtilities, {}));
                should().throw(getSources.bind(entityUtilities, sourceA));
            });
            it("Should use getMedias first then return the sources from the medias", () => {
                const gmSpy: sinon.SinonSpy = spy(entityUtilities, "getMedias");
                const sources: Source[] = flatMap<Media, Source>([productionA.banner, productionA.background, ...productionA.medias], (m: Media) => m.sources);
                getSources(productionA).should.deep.equal(sources);
                gmSpy.should.have.been.calledOnce;
                gmSpy.restore();
            });
        });
        describe("Getting a specific media", () => {
            let gmSpy: sinon.SinonSpy;
            before(() => gmSpy = spy(entityUtilities, "getMedias"));
            afterEach(() => gmSpy.reset());
            after(() => gmSpy.restore());
            it("Should return undefined if the media was not found", () => should().not.exist(getMediaFromEntity(productionA, v4())));
            it("Should return the found media", () => {
                getMediaFromEntity(productionA, mediaA._id).should.deep.equal(mediaA);
                gmSpy.should.have.been.calledOnce;
            });
        });
        describe("Getting a specific source", () => {
            it("Should return undefined if the source was not found", () => should().not.exist(getSourceFromMedia(mediaA, v4())));
            it("Should return the found source", () => {
                getSourceFromMedia(mediaC, sourceA._id).should.deep.equal(sourceA);
            });
        });
    });
    describe("Modifying functions", () => {
        describe("Updating a source in a media", () => {
            it("Should fail if the source is not valid", () =>
                should().throw(updateSourceInMedia.bind(null, mediaA, {})));
            it("Should fail if the media is not valid", () =>
                should().throw(updateSourceInMedia.bind(null, {}, sourceA)));
            it("Should fail if the source does not belong to this media", () =>
                should().throw(updateSourceInMedia.bind(null, mediaB, sourceA)));
            it("Should update an existing source", () => {
                const oldMedia: Media = cloneDeep<Media>(mediaA);
                deepFreeze(oldMedia);
                const newSrc: Source = {
                    ...mediaA.sources[0],
                    preview: "newPreview"
                };
                const newMedia: Media = {
                    ...mediaA, sources: [newSrc]
                };
                updateSourceInMedia(oldMedia, newSrc).should.deep.equal(newMedia);
            });
        });
        describe("Update a media in other entities", () => {
            const modifiedMedia: Media = { ...mediaA, description: "The New Media" };
            it("Should fail if the entity is not valid", () =>
                should().throw(updateMediaInEntity.bind(null, {}, mediaA)));
            it("Should fail if the media is not valid", () =>
                should().throw(updateMediaInEntity.bind(null, productionA, {})));
            it("Should return the same object if the media could not be found in the entity", () =>
                updateMediaInEntity(presentationA, mediaA).should.deep.equal(presentationA));
            it("Should update a media in a production with a new one and return the new production", () => {
                const prod: Production = cloneDeep<Production>(productionA);
                const prodBanner: Production = { ...prod, banner: mediaA };
                const prodBackground: Production = { ...prod, background: mediaA };
                const prodMedia: Production = { ...prod, medias: [mediaA, mediaB] };
                deepFreeze(prodBanner);
                deepFreeze(prodBackground);
                deepFreeze(prodMedia);
                updateMediaInEntity(prodBanner, modifiedMedia).should.deep.equal({ ...productionA, banner: modifiedMedia });
                updateMediaInEntity(prodBackground, modifiedMedia).should.deep.equal({ ...productionA, background: modifiedMedia });
                updateMediaInEntity(prodMedia, modifiedMedia).should.deep.equal({ ...productionA, medias: [modifiedMedia, mediaB] });
            });
            it("Should update a media in a category with a new one and return the new category", () => {
                const catClone: Category = cloneDeep<Category>(categoryA);
                const cat: Category = { ...catClone, banner: mediaA };
                deepFreeze(cat);
                updateMediaInEntity(cat, modifiedMedia).should.deep.equal({ ...categoryA, banner: modifiedMedia });
            });
            it("Should update a media in a presentation with a new one and return the new presentation", () => {
                const pre: Presentation = cloneDeep<Presentation>(presentationA);
                const preMain: Presentation = { ...pre, mainMedia: mediaA };
                const preAlt: Presentation = { ...pre, alternateMedia: mediaA };
                deepFreeze(preMain);
                deepFreeze(preAlt);
                updateMediaInEntity(preMain, modifiedMedia).should.deep.equal({ ...presentationA, mainMedia: modifiedMedia });
                updateMediaInEntity(preAlt, modifiedMedia).should.deep.equal({ ...presentationA, alternateMedia: modifiedMedia });
            });
            it("Should update a media in a presentation container with a new one and return the new presentation container", () => {
                const containerClone: PresentationContainer = cloneDeep<PresentationContainer>(containerA);
                const container: PresentationContainer = { ...containerClone, presentations: [{ ...presentationA, mainMedia: mediaA }] };
                deepFreeze(container);
                updateMediaInEntity(container, modifiedMedia).should.deep.equal({ ...containerA, presentations: [{ ...presentationA, mainMedia: modifiedMedia }] });
            });
        });
    });
    describe("Getting download/upload request data", () => {
        it("Should reject if param is neither a production, a presentation container, a presention nor a category", () => {
            should().throw(getAllSourceTargetOptionsFromEntity.bind(entityUtilities, mediaA));
            should().throw(getAllSourceTargetOptionsFromEntity.bind(entityUtilities, sourceA));
            should().throw(getAllSourceTargetOptionsFromEntity.bind(entityUtilities, ""));
            should().throw(getAllSourceTargetOptionsFromEntity.bind(entityUtilities, undefined));
            should().throw(getAllSourceTargetOptionsFromEntity.bind(entityUtilities, {}));
        });
        it("Should return all sources as an object with 3 IDs", () => {
            const stos: SourceTargetOptions[] = getAllSourceTargetOptionsFromEntity(productionA);
            stos.should.have.lengthOf(7);
            forEach<SourceTargetOptions>(stos, (sto: SourceTargetOptions) => {
                const { mainId, mediaId, sourceId }: SourceTargetOptions = sto;
                mainId.should.be.ok;
                isUUID(mainId, 4).should.be.true;
                mediaId.should.be.ok;
                isUUID(mediaId, 4).should.be.true;
                sourceId.should.be.ok;
                isUUID(sourceId, 4).should.be.true;
            });
        });
    });
    describe("Filtering a production", () => {
        it("Should filter out data not owned", () => should().not.exist(filterProduction({
            ...productionA,
            state: MediaPermissions.OwnerOnly
        })));
        it("Should filter out data that are made private", () => should().not.exist(filterProduction({
            ...productionA,
            state: MediaPermissions.Locked
        })));
        it("Should filter out data that are made private even if owned", () => should().not.exist(filterProduction({
            ...productionA,
            state: MediaPermissions.Locked
        }, [productionA._id])));
        it("Should filter out medias that are not owned", () => filterProduction({
            ...productionA,
            medias: [{
                _id: v4(),
                delay: 0,
                description: "",
                sources: [],
                state: MediaPermissions.OwnerOnly,
                type: 0
            }]
        }).should.deep.equal({ ...productionA, state: MediaPermissions.Public, medias: [] }));
        it("Should keep the entire production if it is owned", () => {
            const prod: Production = {
                ...productionA,
                state: MediaPermissions.OwnerOnly
            };
            filterProduction(prod, [productionA._id]).should.deep.equal(prod);
        });
        it("Should keep the entire production if second parameter is true", () => {
            const prod: Production = {
                ...productionA,
                state: MediaPermissions.OwnerOnly
            };
            filterProduction(prod, true).should.deep.equal(prod);
        });
        it("Should not filter out banner and background no matter theirs states", () => {
            const prod: Production = {
                ...productionA,
                state: MediaPermissions.Public,
                banner: {
                    _id: v4(),
                    delay: 0,
                    description: "",
                    sources: [],
                    state: MediaPermissions.OwnerOnly,
                    type: 0
                },
                background: {
                    _id: v4(),
                    delay: 0,
                    description: "",
                    sources: [],
                    state: MediaPermissions.OwnerOnly,
                    type: 0
                }
            };
            filterProduction(prod, true).should.deep.equal(prod);
        });
    });
});
