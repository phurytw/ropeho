/**
 * @file Tests for the ProductionEdit component
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../../test.d.ts" />
import { should, use } from "chai";
import * as sinonChai from "sinon-chai";
import * as chaiEnzyme from "chai-enzyme";
import { shallow, ShallowWrapper, mount, ReactWrapper } from "enzyme";
import { stub, spy } from "sinon";
import * as React from "react";
import { productions } from "../../../sampleData/testDb";
import * as productionEditModule from "../../modules/productionEdit";
import * as mediaEditModule from "../../modules/mediaEdit";
import * as sourceEditModule from "../../modules/sourceEdit";
import * as uploadQueueModule from "../../modules/uploadQueue";
import * as objectURLModule from "../../modules/objectURL";
import * as errorModule from "../../../common/modules/error";
import { IStore, default as mockStore } from "redux-mock-store";
import { RopehoAdminState, default as rootReducer } from "../../reducer";
import * as selectors from "../../selectors";
import { middlewares } from "../../store";
import { fromJS } from "immutable";
import hook from "../../../common/helpers/cssModulesHook";
hook();
import { ProductionEdit, ProductionEditProps, ProductionEditParams, mapStateToProps, mapDispatchToProps } from "./ProductionEdit";
import { ProductionEditMetaData } from "../ProductionEditMetaData";
import { MediaEdit } from "../MediaEdit";
import SourceEdit from "../SourceEdit";
import MediaSelector from "../MediaSelector";
import { Button, Tab, Tabs, Dialog } from "react-toolbox";
import { StaticRouter, Redirect } from "react-router";
should();
use(sinonChai);
use(chaiEnzyme);

import Source = Ropeho.Models.Source;
import Media = Ropeho.Models.Media;
import Production = Ropeho.Models.Production;

describe("Production Edit component", () => {
    const production: Production = productions[0];
    let store: IStore<RopehoAdminState>;
    let dispatchStub: sinon.SinonStub,
        pushSpy: sinon.SinonSpy,
        updateSourceSpy: sinon.SinonSpy,
        addToMediaSpy: sinon.SinonSpy,
        removeMediaSpy: sinon.SinonSpy,
        removeSourcesFromMediaSpy: sinon.SinonSpy,
        removeSourcesSpy: sinon.SinonSpy,
        uploadSpy: sinon.SinonSpy,
        selectMediaSpy: sinon.SinonSpy,
        replaceSpy: sinon.SinonSpy,
        selectSourceSpy: sinon.SinonSpy,
        setMediasSpy: sinon.SinonSpy,
        setSourcesSpy: sinon.SinonSpy,
        props: ProductionEditProps;
    before(() => {
        store = mockStore<RopehoAdminState>(middlewares())(rootReducer(undefined, { type: "" }));
        dispatchStub = stub(store, "dispatch")
            .callsFake((...args: any[]) => {
                if (args[0] && typeof args[0].then === "function") {
                    return Promise.resolve(args[0]);
                } else {
                    return args[0];
                }
            });
    });
    beforeEach(() => {
        pushSpy = spy();
        updateSourceSpy = spy();
        addToMediaSpy = spy();
        removeMediaSpy = spy();
        removeSourcesFromMediaSpy = spy();
        removeSourcesSpy = spy();
        uploadSpy = spy();
        selectMediaSpy = spy();
        replaceSpy = spy();
        selectSourceSpy = spy();
        setMediasSpy = spy();
        setSourcesSpy = spy();
        props = {
            fetchProduction: (): Promise<productionEditModule.Actions.SetProduction> => Promise.resolve<productionEditModule.Actions.SetProduction>({
                type: productionEditModule.ActionTypes.SET_PRODUCTION,
                production
            }),
            production,
            match: {
                params: {
                    productionId: production._id
                }
            },
            medias: [production.banner, production.background, ...production.medias],
            sources: production.banner.sources,
            setMedias: setMediasSpy,
            setSources: setSourcesSpy,
            history: {
                push: pushSpy,
                replace: replaceSpy
            } as any,
            updateMedia: () => ({}) as any,
            updateSource: updateSourceSpy,
            selectMedia: selectMediaSpy,
            selectSource: selectSourceSpy,
            addSourceToMedia: addToMediaSpy,
            removeMedia: removeMediaSpy,
            removeSourcesFromMedia: removeSourcesFromMediaSpy,
            removeSources: removeSourcesSpy,
            uploadFile: uploadSpy
        };
    });
    afterEach(() => {
        store.clearActions();
        pushSpy.reset();
        updateSourceSpy.reset();
        addToMediaSpy.reset();
        removeMediaSpy.reset();
        removeSourcesFromMediaSpy.reset();
        removeSourcesSpy.reset();
        uploadSpy.reset();
        selectMediaSpy.reset();
        replaceSpy.reset();
        selectSourceSpy.reset();
        setMediasSpy.reset();
        setSourcesSpy.reset();
    });
    describe("Element", () => {
        describe("Header", () => {
            it("Should display the production title", () => {
                shallow(<ProductionEdit {...props} />)
                    .findWhere((node: ShallowWrapper<any, {}>) => node.type() === "h2" && node.text() === production.name)
                    .should.have.lengthOf(1);
            });
            it("Should display an save changes button", () => {
                const wrapper: ShallowWrapper<any, {}> = shallow(<ProductionEdit {...props} />);
                const instance: ProductionEdit = wrapper.instance() as ProductionEdit;
                wrapper.find(Button).find({ onClick: instance.promptSaveShow }).should.have.lengthOf(1);
            });
            it("Should display a delete button", () => {
                const wrapper: ShallowWrapper<any, {}> = shallow(<ProductionEdit {...props} />);
                const instance: ProductionEdit = wrapper.instance() as ProductionEdit;
                wrapper.find(Button).find({ onClick: instance.promptDeleteShow }).should.have.lengthOf(1);
            });
        });
        describe("Tabs", () => {
            it("Should have a navbar to navigate between editors", () => {
                const wrapper: ShallowWrapper<any, {}> = shallow(<ProductionEdit {...props} />);
                const instance: ProductionEdit = wrapper.instance() as ProductionEdit;
                wrapper.find(Tabs).find({ onChange: instance.setTab }).should.have.lengthOf(1);
            });
            it("Should have a tab to edit production metadata", () => {
                const wrapper: ShallowWrapper<any, {}> = shallow(<ProductionEdit {...props} />);
                wrapper.find(Tab).find({ label: "Production" }).should.have.lengthOf(1);
            });
            it("Should have a tab to edit banner", () => {
                const wrapper: ShallowWrapper<any, {}> = shallow(<ProductionEdit {...props} />);
                wrapper.find(Tab).find({ label: "Bannière" }).should.have.lengthOf(1);
            });
            it("Should have a tab to edit background", () => {
                const wrapper: ShallowWrapper<any, {}> = shallow(<ProductionEdit {...props} />);
                wrapper.find(Tab).find({ label: "Fond" }).should.have.lengthOf(1);
            });
            it("Should have a tab to edit medias", () => {
                const wrapper: ShallowWrapper<any, {}> = shallow(<ProductionEdit {...props} />);
                wrapper.find(Tab).find({ label: "Medias" }).should.have.lengthOf(1);
            });
        });
        describe("Tab content", () => {
            it("Should have a tab showing a form allowing to edit metadata", () => {
                shallow(<ProductionEdit {...props} />).find(ProductionEditMetaData).should.have.lengthOf(1);
            });
            it("Should have a tab showing a the media editor for the banner", () => {
                mount(<StaticRouter
                    location="/productions/id/banniere"
                    context={{}}
                    history={undefined}>
                    <ProductionEdit
                        {...props}
                        match={{
                            params: {
                                productionId: production._id,
                                mediaId: "banniere"
                            }
                        }}
                        selectedMedia={production.banner._id}
                    />
                </StaticRouter>)
                    .find(MediaEdit).should.have.lengthOf(1);
            });
            it("Should have a tab showing a the media editor for the background", () => {
                mount(<StaticRouter
                    location="/productions/id/fond"
                    context={{}}
                    history={undefined}>
                    <ProductionEdit
                        {...props}
                        match={{
                            params: {
                                productionId: production._id,
                                mediaId: "fond"
                            }
                        }}
                        selectedMedia={production.background._id}
                    />
                </StaticRouter>)
                    .find(MediaEdit).should.have.lengthOf(1);
            });
            it("Should have a tab showing a the source editor for the banner", () => {
                mount(<StaticRouter
                    location="/productions/id/banniere/sourceId"
                    context={{}}
                    history={undefined}>
                    <ProductionEdit
                        {...props}
                        match={{
                            params: {
                                productionId: production._id,
                                mediaId: "banniere",
                                sourceId: "sourceId"
                            }
                        }}
                        selectedMedia={production.banner._id}
                    />
                </StaticRouter>)
                    .find(SourceEdit).should.have.lengthOf(1);
            });
            it("Should have a tab showing a the source editor for the background", () => {
                mount(<StaticRouter
                    location="/productions/id/fond/sourceId"
                    context={{}}
                    history={undefined}>
                    <ProductionEdit
                        {...props}
                        match={{
                            params: {
                                productionId: production._id,
                                mediaId: "fond",
                                sourceId: "sourceId"
                            }
                        }}
                        selectedMedia={production.background._id}
                    />
                </StaticRouter>)
                    .find(SourceEdit).should.have.lengthOf(1);
            });
            it("Should have a tab showing a the media selector", () => {
                mount(<StaticRouter
                    location="/productions/id/medias"
                    context={{}}
                    history={undefined}>
                    <ProductionEdit
                        {...props}
                        match={{
                            params: {
                                productionId: production._id,
                                mediaId: "medias"
                            }
                        }}
                        selectedMedia={production.background._id}
                    />
                </StaticRouter>)
                    .find(MediaSelector).should.have.lengthOf(1);
            });
        });
        describe("Action notifications", () => {
            it("Should prompt a dialog asking for user confirmation when saving", () => {
                shallow(<ProductionEdit {...props} />).setState({ promptSave: true }).find(Dialog).find({ title: "Enregistrer les modifications" }).should.have.lengthOf(1);
            });
            it("Should prompt a dialog asking for user confirmation when deleting", () => {
                shallow(<ProductionEdit {...props} />).setState({ promptDelete: true }).find(Dialog).find({ title: "Supprimer la production" }).should.have.lengthOf(1);
            });
        });
    });
    describe("Methods", () => {
        it("Should set promptSave to true", () => {
            const instance: ProductionEdit = shallow(<ProductionEdit {...props} />).instance() as ProductionEdit;
            instance.promptSaveShow();
            instance.state.promptSave.should.equal(true);
        });
        it("Should set promptSave to false", () => {
            const instance: ProductionEdit = shallow(<ProductionEdit {...props} />).instance() as ProductionEdit;
            instance.promptSaveHide();
            instance.state.promptSave.should.equal(false);
        });
        it("Should set promptDelete to true", () => {
            const instance: ProductionEdit = shallow(<ProductionEdit {...props} />).instance() as ProductionEdit;
            instance.promptDeleteShow();
            instance.state.promptDelete.should.equal(true);
        });
        it("Should set promptDelete to false", () => {
            const instance: ProductionEdit = shallow(<ProductionEdit {...props} />).instance() as ProductionEdit;
            instance.promptDeleteHide();
            instance.state.promptDelete.should.equal(false);
        });
        it("Should set tab", () => {
            const instance: ProductionEdit = shallow(<ProductionEdit {...props} />).instance() as ProductionEdit;
            instance.setTab(1000);
            instance.state.tab.should.equal(1000);
        });
        it("Should go to page specified by the URL", () => {
            const instance: ProductionEdit = shallow(<ProductionEdit {...props} />).instance() as ProductionEdit;
            const url: string = "/awholenewworld";
            instance.navigateTo(url);
            pushSpy.should.have.been.calledOnce;
            pushSpy.should.have.been.calledWith(url);
        });
        it("Should go to page specified by the source", () => {
            const instance: ProductionEdit = shallow(<ProductionEdit {...props} match={{
                params: {
                    productionId: production._id,
                    mediaId: "banniere",
                    sourceId: production.banner.sources[0]._id
                }
            }} />).instance() as ProductionEdit;
            instance.navigateToSource(production.banner.sources[0]._id);
            pushSpy.should.have.been.calledOnce;
            pushSpy.should.have.been.calledWith(`/productions/${production._id}/banniere/${production.banner.sources[0]._id}`);
        });
        it("Should go to page specified by the media", () => {
            const instance: ProductionEdit = shallow(<ProductionEdit {...props} match={{
                params: {
                    productionId: production._id,
                    mediaId: production.medias[0]._id
                }
            }} />).instance() as ProductionEdit;
            instance.navigateToMedia(production.banner._id);
            pushSpy.should.have.been.calledOnce;
            pushSpy.should.have.been.calledWith(`/productions/${production._id}/${production.banner._id}`);
        });
        it("Should update a source and add it to the media", () => {
            const instance: ProductionEdit = shallow(<ProductionEdit {...props} selectedMedia={production.banner} />).instance() as ProductionEdit;
            const source: Source = {
                _id: "sourceId"
            };
            instance.updateSource(source);
            updateSourceSpy.should.have.been.calledOnce;
            addToMediaSpy.should.have.been.calledOnce;
        });
        it("Should remove a media and associated sources", () => {
            const customProps: ProductionEditProps = {
                ...props,
                selectedMedia: production.banner,
                sources: production.banner.sources
            };
            const instance: ProductionEdit = shallow(<ProductionEdit {...customProps} />).instance() as ProductionEdit;
            instance.removeSelectedMedia();
            removeMediaSpy.should.have.been.calledOnce;
            removeMediaSpy.should.have.been.calledWith(production.banner._id);
            removeSourcesFromMediaSpy.should.have.been.calledOnce;
            removeSourcesFromMediaSpy.should.have.been.calledWith(production.banner.sources.map((s: Source) => s._id));
            removeSourcesSpy.should.have.been.calledOnce;
            removeSourcesSpy.should.have.been.calledWith(production.banner.sources.map((s: Source) => s._id));
            replaceSpy.should.have.been.calledOnce;
            replaceSpy.should.have.been.calledWith(`/productions/${production._id}/medias`);
        });
        it("Should remove sources from the source state and the media state", () => {
            const customProps: ProductionEditProps = {
                ...props,
                selectedMedia: production.banner,
                sources: production.banner.sources,
            };
            const instance: ProductionEdit = shallow(<ProductionEdit {...customProps} />).instance() as ProductionEdit;
            const sourceIds: string[] = production.banner.sources.map((s: Source) => s._id);
            instance.removeSources(sourceIds);
            removeSourcesFromMediaSpy.should.have.been.calledOnce;
            removeSourcesFromMediaSpy.should.have.been.calledWith(sourceIds);
            removeSourcesSpy.should.have.been.calledOnce;
            removeSourcesSpy.should.have.been.calledWith(sourceIds);
        });
        it("Should remove a single source", () => {
            const instance: ProductionEdit = shallow(<ProductionEdit {...props} />).instance() as ProductionEdit;
            const removeSourcesStub: sinon.SinonStub = stub(instance, "removeSources");
            const sourceId: string = "sourceId";
            instance.removeSource(sourceId);
            removeSourcesStub.should.have.been.calledOnce;
            removeSourcesStub.should.have.been.calledWith([sourceId]);
        });
        it("Should update the production with the changes made and redirect to the productions list", (done: MochaDone) => {
            const pushSpy: sinon.SinonSpy = spy(() => {
                updateProductionSpy.should.have.been.calledOnce;
                uploadSpy.should.have.been.calledOnce;
                updateProductionSpy.should.have.been.calledWithExactly(updatedProduction);
                pushSpy.should.have.been.calledOnce;
                done();
            });
            const newSource: Source = {
                _id: "newSourceBaby",
                preview: "blob:http://localhost/something"
            };
            const newMedia: Media = {
                ...production.banner,
                sources: [newSource]
            };
            const updatedProduction: Production = {
                ...production,
                banner: newMedia
            };
            const updateProductionSpy: sinon.SinonSpy = spy(() => Promise.resolve(updatedProduction));
            const instance: ProductionEdit = shallow(<ProductionEdit
                {...props}
                history={{
                    push: pushSpy
                } as any}
                production={production}
                updateProduction={updateProductionSpy}
                medias={[newMedia, production.background, ...production.medias]}
            />).instance() as ProductionEdit;
            instance.saveChanges();
        });
        it("Should select the banner", () => {
            const instance: ProductionEdit = shallow(<ProductionEdit {...props} />).instance() as ProductionEdit;
            instance.selectFromParams(production, { mediaId: "banniere" });
            selectMediaSpy.should.have.been.calledOnce;
            selectMediaSpy.should.have.been.calledWith(production.banner._id);
        });
        it("Should select the background", () => {
            const instance: ProductionEdit = shallow(<ProductionEdit {...props} />).instance() as ProductionEdit;
            instance.selectFromParams(production, { mediaId: "fond" });
            selectMediaSpy.should.have.been.calledOnce;
            selectMediaSpy.should.have.been.calledWith(production.background._id);
        });
        it("Should select the media", () => {
            const instance: ProductionEdit = shallow(<ProductionEdit {...props} />).instance() as ProductionEdit;
            instance.selectFromParams(production, { mediaId: production.medias[0]._id });
            selectMediaSpy.should.have.been.calledOnce;
            selectMediaSpy.should.have.been.calledWith(production.medias[0]._id);
        });
        it("Should redirect if the media has not been found", () => {
            const instance: ProductionEdit = shallow(<ProductionEdit {...props} />).instance() as ProductionEdit;
            instance.selectFromParams(production, { productionId: "id", mediaId: "lubba dubba dub dub" });
            selectMediaSpy.should.have.been.calledOnce;
            selectMediaSpy.should.have.been.calledWith("");
            replaceSpy.should.have.been.calledOnce;
            replaceSpy.should.have.been.calledWith("/productions/id");
        });
        it("Should select the source", () => {
            const instance: ProductionEdit = shallow(<ProductionEdit {...props} />).instance() as ProductionEdit;
            instance.selectFromParams(production, { productionId: production._id, mediaId: production.banner._id, sourceId: production.banner.sources[0]._id });
            selectSourceSpy.should.have.been.calledOnce;
            selectSourceSpy.should.have.been.calledWith(production.banner.sources[0]._id);
        });
        it("Should redirect if the source has not been found", () => {
            const instance: ProductionEdit = shallow(<ProductionEdit {...props} />).instance() as ProductionEdit;
            instance.selectFromParams(production, { productionId: production._id, mediaId: production.banner._id, sourceId: "notASource" });
            replaceSpy.should.have.been.calledOnce;
            replaceSpy.should.have.been.calledWith(`/productions/${production._id}/${production.banner._id}`);
        });
    });
    describe("Props", () => {
        it("Should get the production being edited from the state", () => {
            const fetchSpy: sinon.SinonSpy = spy(selectors, "getProduction");
            mapStateToProps({
                ...store.getState(),
                productionEdit: fromJS({
                    production
                })
            }).production.should.deep.equal(production);
            fetchSpy.should.have.been.calledOnce;
            fetchSpy.restore();
        });
        it("Should get if the application has been rendered from the server from the state", () => {
            const getHasRenderedSpy: sinon.SinonSpy = spy(selectors, "getHasRendered");
            mapStateToProps(store.getState());
            getHasRenderedSpy.should.have.been.calledOnce;
            getHasRenderedSpy.restore();
        });
        it("Should get the updated medias from the state", () => {
            const getUpdatedMediasSpy: sinon.SinonSpy = spy(selectors, "getUpdatedMedias");
            mapStateToProps(store.getState());
            getUpdatedMediasSpy.should.have.been.calledOnce;
            getUpdatedMediasSpy.restore();
        });
        it("Should get the sources selected by the media from the state", () => {
            const getSourcesFromSelectedMediaSpy: sinon.SinonSpy = spy(selectors, "getSourcesFromSelectedMedia");
            mapStateToProps(store.getState());
            getSourcesFromSelectedMediaSpy.should.have.been.calledOnce;
            getSourcesFromSelectedMediaSpy.restore();
        });
        it("Should get the medias from the state", () => {
            const getSelectedMediaSpy: sinon.SinonSpy = spy(selectors, "getSelectedMedia");
            mapStateToProps(store.getState());
            getSelectedMediaSpy.should.have.been.calledOnce;
            getSelectedMediaSpy.restore();
        });
        it("Should get the medias from the state", () => {
            const getSelectedSourceSpy: sinon.SinonSpy = spy(selectors, "getSelectedSource");
            mapStateToProps(store.getState());
            getSelectedSourceSpy.should.have.been.calledOnce;
            getSelectedSourceSpy.restore();
        });
        it("Should fetch a single production", () => {
            const fetchStub: sinon.SinonStub = stub(productionEditModule, "fetchProductionById");
            mapDispatchToProps(dispatchStub).fetchProduction("id");
            fetchStub.should.have.been.calledOnce;
            fetchStub.restore();
        });
        it("Should save modifications made to a production", () => {
            const updateStub: sinon.SinonStub = stub(productionEditModule, "updateProduction");
            mapDispatchToProps(dispatchStub).updateProduction({});
            updateStub.should.have.been.calledOnce;
            updateStub.restore();
        });
        it("Should delete a production", () => {
            const deleteStub: sinon.SinonStub = stub(productionEditModule, "deleteProduction");
            mapDispatchToProps(dispatchStub).deleteProduction("id");
            deleteStub.should.have.been.calledOnce;
            deleteStub.restore();
        });
        it("Should set an error", () => {
            const setErrorStub: sinon.SinonStub = stub(errorModule, "setError");
            const error: Ropeho.IErrorResponse = {
                userMessage: "my error"
            };
            mapDispatchToProps(dispatchStub).setError(error);
            setErrorStub.should.have.been.calledOnce;
            setErrorStub.restore();
        });
        it("Should update the selected production in the state", () => {
            const setProductionStub: sinon.SinonStub = stub(productionEditModule, "setProduction");
            mapDispatchToProps(dispatchStub).setProduction(production);
            setProductionStub.should.have.been.calledOnce;
            setProductionStub.restore();
        });
        it("Should set the medias in the state", () => {
            const replaceMediasStub: sinon.SinonStub = stub(mediaEditModule, "replaceMedias");
            mapDispatchToProps(dispatchStub).setMedias(production.medias);
            replaceMediasStub.should.have.been.calledOnce;
            replaceMediasStub.restore();
        });
        it("Should set the sources in the state", () => {
            const replaceSourcesStub: sinon.SinonStub = stub(sourceEditModule, "replaceSources");
            mapDispatchToProps(dispatchStub).setSources(production.banner.sources);
            replaceSourcesStub.should.have.been.calledOnce;
            replaceSourcesStub.restore();
        });
        it("Should update a single media in the state", () => {
            const setMediaStub: sinon.SinonStub = stub(mediaEditModule, "setMedia");
            mapDispatchToProps(dispatchStub).updateMedia(production.banner);
            setMediaStub.should.have.been.calledOnce;
            setMediaStub.restore();
        });
        it("Should update a single source in the state", () => {
            const setSourceStub: sinon.SinonStub = stub(sourceEditModule, "setSource");
            mapDispatchToProps(dispatchStub, {
                selectedMedia: production.banner
            }).updateSource(production.banner.sources[0]);
            setSourceStub.should.have.been.calledOnce;
            setSourceStub.restore();
        });
        it("Should select a media", () => {
            const selectMediaStub: sinon.SinonStub = stub(mediaEditModule, "selectMedia");
            mapDispatchToProps(dispatchStub).selectMedia(production.banner._id);
            selectMediaStub.should.have.been.calledOnce;
            selectMediaStub.restore();
        });
        it("Should select a source", () => {
            const selectSourceStub: sinon.SinonStub = stub(sourceEditModule, "selectSource");
            mapDispatchToProps(dispatchStub).selectSource(production.banner.sources[0]._id);
            selectSourceStub.should.have.been.calledOnce;
            selectSourceStub.restore();
        });
        it("Should add a source to a media", () => {
            const addSourceToMediaStub: sinon.SinonStub = stub(mediaEditModule, "addSourceToMedia");
            mapDispatchToProps(dispatchStub).addSourceToMedia("mediaId", "sourceId");
            addSourceToMediaStub.should.have.been.calledOnce;
            addSourceToMediaStub.should.have.been.calledWith("mediaId", "sourceId");
            addSourceToMediaStub.restore();
        });
        it("Should remove a media", () => {
            const removeMediaStub: sinon.SinonStub = stub(mediaEditModule, "removeMedia");
            mapDispatchToProps(dispatchStub).removeMedia("mediaId");
            removeMediaStub.should.have.been.calledOnce;
            removeMediaStub.should.have.been.calledWith("mediaId");
            removeMediaStub.restore();
        });
        it("Should remove a source from a media", () => {
            const removeSourceFromMediaStub: sinon.SinonStub = stub(mediaEditModule, "removeSourcesFromMedia");
            mapDispatchToProps(dispatchStub).removeSourcesFromMedia(["sourceId"]);
            removeSourceFromMediaStub.should.have.been.calledOnce;
            removeSourceFromMediaStub.should.have.been.calledWith(["sourceId"]);
            removeSourceFromMediaStub.restore();
        });
        it("Should remove a source from the state", () => {
            const removeSourceStub: sinon.SinonStub = stub(sourceEditModule, "removeSources");
            mapDispatchToProps(dispatchStub).removeSources(["sourceId"]);
            removeSourceStub.should.have.been.calledOnce;
            removeSourceStub.should.have.been.calledWith(["sourceId"]);
            removeSourceStub.restore();
        });
        it("Should set a source's position", () => {
            const setSourcePositionStub: sinon.SinonStub = stub(mediaEditModule, "setSourcePosition");
            mapDispatchToProps(dispatchStub).setSourcePosition("mediaId", "sourceId", 10);
            setSourcePositionStub.should.have.been.calledOnce;
            setSourcePositionStub.should.have.been.calledWith("mediaId", "sourceId", 10);
            setSourcePositionStub.restore();
        });
        it("Should add a new item to the upload queue", () => {
            const setEntryInUploadQueueStub: sinon.SinonStub = stub(uploadQueueModule, "setEntryInUploadQueue");
            const file: Ropeho.Socket.UploadEntry = {
                id: "id",
                bytesSent: 0,
                max: 0,
                target: {
                    mainId: "main",
                    mediaId: "media",
                    sourceId: "source"
                },
                active: true,
                objectURL: ""
            };
            mapDispatchToProps(dispatchStub).uploadFile(file);
            setEntryInUploadQueueStub.should.have.been.calledOnce;
            setEntryInUploadQueueStub.should.have.been.calledWith(file);
            setEntryInUploadQueueStub.restore();
        });
        it("Should add an objectURL's file in the state", () => {
            const setFilenameStub: sinon.SinonStub = stub(objectURLModule, "setFile");
            const objectURL: string = "blob:http://localhost/aNiceBlob";
            const file: File = new File([new ArrayBuffer(100)], "aNiceFile.png");
            mapDispatchToProps(dispatchStub).setFile(objectURL, file);
            setFilenameStub.should.have.been.calledOnce;
            setFilenameStub.should.have.been.calledWith(objectURL, file);
            setFilenameStub.restore();
        });
        it("Should set media's position", () => {
            const setMediaPositionStub: sinon.SinonStub = stub(mediaEditModule, "setMediaPosition");
            mapDispatchToProps(dispatchStub).setMediaPosition("mediaId", 10);
            setMediaPositionStub.should.have.been.calledOnce;
            setMediaPositionStub.should.have.been.calledWith("mediaId", 10);
            setMediaPositionStub.restore();
        });
    });
    describe("Lifecycle", () => {
        it("Should fetch the production, medias and sources and select the chosen media/source on initial render", (done: MochaDone) => {
            const getProductionSpy: sinon.SinonSpy = spy();
            const customProps: ProductionEditProps = {
                ...props,
                fetchProduction: (id: string): Promise<productionEditModule.Actions.SetProduction> => {
                    getProductionSpy(id);
                    return Promise.resolve({ type: productionEditModule.ActionTypes.SET_PRODUCTION, production });
                },
                selectSource: (sourceId: string) => {
                    getProductionSpy.should.have.been.calledOnce;
                    getProductionSpy.should.have.been.calledWith(production._id);
                    setMediasSpy.should.have.been.calledOnce;
                    setSourcesSpy.should.have.been.calledOnce;
                    selectMediaSpy.should.have.been.calledOnce;
                    return done();
                }
            };
            shallow(<ProductionEdit {...customProps} />);
        });
        it("Should fetch the new production and update the state", () => {
            const wrapper: ShallowWrapper<ProductionEditProps, any> = shallow(<ProductionEdit
                {...props}
                match={{
                    params: {
                        productionId: "id"
                    }
                }}
            />);
            const instance: ProductionEdit = wrapper.instance() as ProductionEdit;
            const fetchStub: sinon.SinonStub = stub(instance, "fetchProduction");
            instance.componentWillReceiveProps({
                match: {
                    params: {
                        productionId: production._id
                    }
                }
            });
            fetchStub.should.have.been.calledOnce;
            fetchStub.should.have.been.calledWith(production._id);
        });
        it("Should select the medias and sources when the URL changes", () => {
            const wrapper: ShallowWrapper<ProductionEditProps, any> = shallow(<ProductionEdit
                {...props}
                match={{
                    params: {
                        productionId: production._id
                    }
                }}
            />);
            const instance: ProductionEdit = wrapper.instance() as ProductionEdit;
            const selectStub: sinon.SinonStub = stub(instance, "selectFromParams");
            const params: ProductionEditParams = {
                productionId: production._id,
                mediaId: production.banner._id,
                sourceId: production.banner.sources[0]._id
            };
            instance.componentWillReceiveProps({
                production,
                match: {
                    params
                }
            });
            selectStub.should.have.been.calledOnce;
            selectStub.should.have.been.calledWith(production, params);
        });
        it("Should set the active tab to production metadata", () => {
            shallow(<ProductionEdit {...props} />).state<number>("tab").should.equal(0);
        });
        it("Should set the active tab to banner", () => {
            const paramsProps: ProductionEditProps = {
                ...props,
                match: {
                    params: {
                        productionId: "id",
                        mediaId: "banniere"
                    }
                }
            };
            shallow(<ProductionEdit {...paramsProps} />).state<number>("tab").should.equal(1);
        });
        it("Should set the active tab to background", () => {
            const paramsProps: ProductionEditProps = {
                ...props,
                match: {
                    params: {
                        productionId: "id",
                        mediaId: "fond"
                    }
                }
            };
            shallow(<ProductionEdit {...paramsProps} />).state<number>("tab").should.equal(2);
        });
        it("Should set the active tab to medias", () => {
            const paramsProps: ProductionEditProps = {
                ...props,
                production: {
                    ...props.production,
                    medias: [{
                        _id: "idmedia"
                    }]
                },
                match: {
                    params: {
                        productionId: "id",
                        mediaId: "idmedia"
                    }
                }
            };
            shallow(<ProductionEdit {...paramsProps} />).state<number>("tab").should.equal(3);
        });
    });
    describe("Server side fetching", () => {
        it("Should fetch productions and select the banner using the static fetch", async () => {
            const fetchProductionsStub: sinon.SinonStub = stub(productionEditModule, "fetchProductionById")
                .callsFake(() => (dispatch: any) => dispatch({
                    type: productionEditModule.ActionTypes.SET_PRODUCTION,
                    production
                }));
            await ProductionEdit.fetchData(dispatchStub, {
                productionId: production._id
            });
            fetchProductionsStub.should.have.been.calledOnce;
            fetchProductionsStub.should.have.been.calledWith(production._id);
            fetchProductionsStub.restore();
        });
    });
    describe("Server side redirections", () => {
        describe("Matching production ID", () => {
            it("Should redirect to production index if there's no production", () => {
                const wrapper: ReactWrapper<any, {}> = mount(<StaticRouter location={`/productions/${production._id}`} context={{}} history={undefined} >
                    <ProductionEdit
                        hasRendered
                        match={{
                            params: {
                                productionId: production._id
                            }
                        }}
                    />
                </StaticRouter>);
                wrapper.findWhere((node: ReactWrapper<any, any>) => node.type() === Redirect && node.prop("to") === "/productions").should.have.lengthOf(1);
            });
            it("Should load the production if the production is found", () => {
                const wrapper: ReactWrapper<any, {}> = mount(<StaticRouter location={`/productions/${production._id}`} context={{}} history={undefined} >
                    <ProductionEdit
                        hasRendered
                        match={{
                            params: {
                                productionId: production._id
                            }
                        }}
                        production={production}
                    />
                </StaticRouter>);
                wrapper.findWhere((node: ReactWrapper<any, any>) => node.type() === Redirect).should.have.lengthOf(0);
                wrapper.find(ProductionEdit).should.have.lengthOf(1);
            });
        });
        describe("Matching media ID", () => {
            it("Should redirect to the production if the media could not be found", () => {
                const wrapper: ReactWrapper<any, {}> = mount(<StaticRouter location={`/productions/${production._id}`} context={{}} history={undefined} >
                    <ProductionEdit
                        hasRendered
                        match={{
                            params: {
                                productionId: production._id,
                                mediaId: "someMedia"
                            }
                        }}
                        production={production}
                    />
                </StaticRouter>);
                wrapper.findWhere((node: ReactWrapper<any, any>) => node.type() === Redirect && node.prop("to") === `/productions/${production._id}`).should.have.lengthOf(1);
            });
            it("Should load the production if a the media and production are found", () => {
                const wrapper: ReactWrapper<any, {}> = mount(<StaticRouter location={`/productions/${production._id}`} context={{}} history={undefined} >
                    <ProductionEdit
                        hasRendered
                        match={{
                            params: {
                                productionId: production._id,
                                mediaId: production.medias[0]._id
                            }
                        }}
                        production={production}
                        medias={[production.banner, production.background, ...production.medias]}
                        selectedMedia={production.medias[0]}
                    />
                </StaticRouter>);
                wrapper.findWhere((node: ReactWrapper<any, any>) => node.type() === Redirect && node.prop("to") === `/productions/${production._id}`).should.have.lengthOf(0);
                wrapper.find(ProductionEdit).should.have.lengthOf(1);
            });
            it("Should load the production the media ID is medias", () => {
                const wrapper: ReactWrapper<any, {}> = mount(<StaticRouter location={`/productions/${production._id}`} context={{}} history={undefined} >
                    <ProductionEdit
                        hasRendered
                        match={{
                            params: {
                                productionId: production._id,
                                mediaId: "medias"
                            }
                        }}
                        production={production}
                        medias={[production.banner, production.background, ...production.medias]}
                    />
                </StaticRouter>);
                wrapper.findWhere((node: ReactWrapper<any, any>) => node.type() === Redirect && node.prop("to") === `/productions/${production._id}`).should.have.lengthOf(0);
                wrapper.find(ProductionEdit).should.have.lengthOf(1);
            });
        });
        describe("Matching source ID", () => {
            it("Should redirect to the media if the source was not found", () => {
                const wrapper: ReactWrapper<any, {}> = mount(<StaticRouter location={`/productions/${production._id}`} context={{}} history={undefined} >
                    <ProductionEdit
                        hasRendered
                        match={{
                            params: {
                                productionId: production._id,
                                mediaId: "banniere",
                                sourceId: "someSource"
                            }
                        }}
                        production={production}
                        medias={[production.banner, production.background, ...production.medias]}
                        sources={production.banner.sources}
                        selectedMedia={production.banner}
                    />
                </StaticRouter>);
                wrapper.findWhere((node: ReactWrapper<any, any>) => node.type() === Redirect && node.prop("to") === `/productions/${production._id}/banniere`).should.have.lengthOf(1);
            });
            it("Should load the production if a the media, source and production are found", () => {
                const wrapper: ReactWrapper<any, {}> = mount(<StaticRouter location={`/productions/${production._id}`} context={{}} history={undefined} >
                    <ProductionEdit
                        hasRendered
                        match={{
                            params: {
                                productionId: production._id,
                                mediaId: production.medias[0]._id,
                                sourceId: production.medias[0].sources[0]._id
                            }
                        }}
                        production={production}
                        medias={[production.banner, production.background, ...production.medias]}
                        sources={production.medias[0].sources}
                        selectedMedia={production.medias[0]}
                        selectedSource={production.medias[0].sources[0]}
                    />
                </StaticRouter>);
                wrapper.findWhere((node: ReactWrapper<any, any>) => node.type() === Redirect && node.prop("to") === `/productions/${production._id}`).should.have.lengthOf(0);
                wrapper.find(ProductionEdit).should.have.lengthOf(1);
            });
        });
    });
});
