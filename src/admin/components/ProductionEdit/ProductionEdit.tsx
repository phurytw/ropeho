/**
 * @file Production editor component
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../typings.d.ts" />
import * as React from "react";
import { connect } from "react-redux";
import { RopehoAdminState } from "../../reducer";
import { getProduction, getHasRendered, getSourcesFromSelectedMedia, getSelectedMedia, getSelectedSource, getUpdatedMedias } from "../../selectors";
import { Actions } from "../../modules/productionEdit";
import * as productionModule from "../../modules/productionEdit";
import { Actions as MediaActions } from "../../modules/mediaEdit";
import * as mediaModule from "../../modules/mediaEdit";
import { Actions as SourceActions } from "../../modules/sourceEdit";
import { Actions as UploadActions } from "../../modules/uploadQueue";
import { Actions as ObjectURLActions } from "../../modules/objectURL";
import * as uploadModule from "../../modules/uploadQueue";
import * as sourceModule from "../../modules/sourceEdit";
import * as objectURLModule from "../../modules/objectURL";
import { setError, Actions as ErrorActions } from "../../../common/modules/error";
import { Dispatch } from "redux";
import { PartialRouteComponentProps, Redirect, Route } from "react-router-dom";
import { Button, Tabs, Tab, Dialog } from "react-toolbox";
import { headerBar } from "./headerBar.css";
import { deleteDialog } from "./deleteDialog.css";
import * as entityUtils from "../../../common/helpers/entityUtilities";
import MediaPreview from "../../../common/components/MediaPreview";
import ProductionEditMetaData from "../ProductionEditMetaData";
import MediaEdit from "../MediaEdit";
import { isEqual } from "lodash";
import SourceEdit from "../SourceEdit";
import MediaSelector from "../MediaSelector";

import Production = Ropeho.Models.Production;
import Media = Ropeho.Models.Media;
import Source = Ropeho.Models.Source;

export const mapStateToProps: (state: RopehoAdminState, ownProps?: ProductionEditProps) => ProductionEditProps
    = (state: RopehoAdminState, ownProps?: ProductionEditProps): ProductionEditProps => ({
        production: getProduction(state),
        hasRendered: getHasRendered(state),
        medias: getUpdatedMedias(state),
        sources: getSourcesFromSelectedMedia(state),
        selectedMedia: getSelectedMedia(state),
        selectedSource: getSelectedSource(state)
    });

export const mapDispatchToProps: (dispatch: Dispatch<RopehoAdminState>, ownProps?: ProductionEditProps) => ProductionEditProps
    = (dispatch: Dispatch<RopehoAdminState>, ownProps?: ProductionEditProps): ProductionEditProps => ({
        fetchProduction: (id: string) => dispatch(productionModule.fetchProductionById(id)),
        deleteProduction: (id: string) => dispatch(productionModule.deleteProduction(id)),
        updateProduction: (production: Production) => dispatch(productionModule.updateProduction(production)),
        setProduction: (production: Production) => dispatch(productionModule.setProduction(production)),
        setMedias: (medias: Media[]) => dispatch(mediaModule.replaceMedias(medias)),
        updateMedia: (media: Media) => dispatch(mediaModule.setMedia(media)),
        setSources: (sources: Source[]) => dispatch(sourceModule.replaceSources(sources)),
        updateSource: (source: Source) => dispatch(sourceModule.setSource(source)),
        selectMedia: (mediaId: string) => dispatch(mediaModule.selectMedia(mediaId)),
        selectSource: (sourceId: string) => dispatch(sourceModule.selectSource(sourceId)),
        addSourceToMedia: (mediaId: string, sourceId: string) => dispatch(mediaModule.addSourceToMedia(mediaId, sourceId)),
        removeMedia: (mediaId: string) => dispatch(mediaModule.removeMedia(mediaId)),
        removeSourcesFromMedia: (sourceIds: string[]) => dispatch(mediaModule.removeSourcesFromMedia(sourceIds)),
        removeSources: (sourceIds: string[]) => dispatch(sourceModule.removeSources(sourceIds)),
        setMediaPosition: (mediaId: string, posiiton: number) => dispatch(mediaModule.setMediaPosition(mediaId, posiiton)),
        setSourcePosition: (mediaId: string, sourceId: string, posiiton: number) => dispatch(mediaModule.setSourcePosition(mediaId, sourceId, posiiton)),
        uploadFile: (file: Ropeho.Socket.UploadEntry) => dispatch(uploadModule.setEntryInUploadQueue(file)),
        setFile: (objectURL: string, file: File) => dispatch(objectURLModule.setFile(objectURL, file)),
        setError: (error?: Ropeho.IErrorResponse) => dispatch(setError(error))
    });

export interface ProductionEditState {
    promptSave?: boolean;
    promptDelete?: boolean;
    tab?: number;
    media?: Media;
    source?: Source;
}

export interface ProductionEditParams {
    productionId?: string;
    mediaId?: string;
    sourceId?: string;
}

export interface ProductionEditProps extends PartialRouteComponentProps<ProductionEditParams> {
    production?: Production;
    medias?: Media[];
    sources?: Source[];
    selectedMedia?: Media;
    selectedSource?: Source;
    hasRendered?: boolean;
    fetchProduction?: (id: string) => Promise<Actions.SetProduction>;
    updateProduction?: (production: Production) => Promise<Actions.SetProduction>;
    deleteProduction?: (id: string) => Promise<Actions.SetProduction>;
    setProduction?: (production: Production) => Actions.SetProduction;
    setMedias?: (medias: Media[]) => MediaActions.ReplaceMedias;
    updateMedia?: (media: Media) => MediaActions.SetMedia;
    setSources?: (sources: Source[]) => SourceActions.ReplaceSources;
    updateSource?: (source: Source) => SourceActions.SetSource;
    selectMedia?: (mediaId: string) => MediaActions.SelectMedia;
    selectSource?: (sourceId: string) => SourceActions.SelectSource;
    addSourceToMedia?: (mediaId: string, sourceId: string) => MediaActions.AddSourceToMedia;
    removeMedia?: (mediaId: string) => MediaActions.RemoveMedia;
    removeSourcesFromMedia?: (sourceIds: string[]) => MediaActions.RemoveSources;
    removeSources?: (sourceIds: string[]) => SourceActions.RemoveSources;
    setSourcePosition?: (mediaId: string, sourceId: string, posiiton: number) => MediaActions.SetSourcePosition;
    setMediaPosition?: (mediaId: string, posiiton: number) => MediaActions.SetMediaPosition;
    uploadFile?: (file: Ropeho.Socket.UploadEntry) => UploadActions.SetEntry;
    setFile?: (objectURL: string, filen: File) => ObjectURLActions.SetFile;
    setError?: (error?: Ropeho.IErrorResponse) => ErrorActions.SetError;
}

export class ProductionEdit extends React.Component<ProductionEditProps, ProductionEditState> {
    constructor(props: ProductionEditProps) {
        super(props);
        const mediaId: string = this.props.match.params.mediaId;
        this.state = {
            promptDelete: false,
            promptSave: false,
            tab: mediaId === "banniere" ? 1 :
                mediaId === "fond" ? 2 :
                    mediaId ? 3 : 0
        };
    }
    shouldComponentUpdate(nextProps: ProductionEditProps, nextState: ProductionEditState): boolean {
        const { medias, production, selectMedia, selectSource, sources }: ProductionEditProps = this.props;
        return !isEqual(medias, nextProps.medias) ||
            !isEqual(production, nextProps.production) ||
            !isEqual(selectMedia, nextProps.selectMedia) ||
            !isEqual(selectSource, nextProps.selectSource) ||
            !isEqual(sources, nextProps.sources) ||
            !isEqual(nextState, this.state);
    }
    updateSource: (source: Source) => void = (source: Source): void => {
        const { updateSource, selectedMedia, addSourceToMedia }: ProductionEditProps = this.props;
        if (selectedMedia && selectedMedia._id) {
            addSourceToMedia(selectedMedia._id, source._id);
        }
        updateSource(source);
    }
    removeSelectedMedia: () => void = (): void => {
        const { selectedMedia, sources, removeMedia, removeSources, removeSourcesFromMedia, history: { replace }, match: { params: { productionId } } }: ProductionEditProps = this.props;
        removeMedia(selectedMedia._id);
        removeSources(sources.map((s: Source) => s._id));
        removeSourcesFromMedia(sources.map((s: Source) => s._id));
        replace(`/productions/${productionId}/medias`);
    }
    removeSources: (sourceIds: string[]) => void = (sourceIds: string[]): void => {
        const { removeSources, removeSourcesFromMedia }: ProductionEditProps = this.props;
        removeSources(sourceIds);
        removeSourcesFromMedia(sourceIds);
    }
    removeSource: (sourceId: string) => void = (sourceId: string): void => {
        this.removeSources([sourceId]);
    }
    promptSaveShow: () => void = (): void => this.setState({ promptSave: true });
    promptSaveHide: () => void = (): void => this.setState({ promptSave: false });
    /**
     * Save changes made to the production
     */
    saveChanges: () => Promise<void> = async (): Promise<void> => {
        const { updateProduction, production, medias, history: { push }, uploadFile }: ProductionEditProps = this.props;
        const newProduction: Production = {
            ...production,
            medias: []
        };
        let uploadEntries: Ropeho.Socket.UploadEntry[] = [];
        // data
        for (const media of medias) {
            if (media._id === production.banner._id) {
                newProduction.banner = media;
            } else if (media._id === production.background._id) {
                newProduction.background = media;
            } else {
                newProduction.medias = [...newProduction.medias, media];
            }

            // file upload
            for (const source of media.sources) {
                if (source.preview.startsWith("blob:")) {
                    uploadEntries = [...uploadEntries, {
                        bytesSent: 0,
                        max: 0,
                        target: {
                            mainId: production._id,
                            mediaId: media._id,
                            sourceId: source._id
                        },
                        active: true,
                        objectURL: source.preview
                    }];
                }
            }
        }
        await updateProduction(newProduction);
        for (const entry of uploadEntries) {
            uploadFile(entry);
        }
        this.setState({ promptSave: false });
        push("/productions");
    }
    promptDeleteShow: () => void = (): void => this.setState({ promptDelete: true });
    promptDeleteHide: () => void = (): void => this.setState({ promptDelete: false });
    deleteProduction: () => void = (): void => {
        this.setState({ promptDelete: false });
    }
    setTab: (tab: number) => void = (tab: number): void => {
        this.setState({ tab });
    }
    navigateTo(path: string): void {
        this.props.history.push(path);
    }
    navigateToMedia: (mediaId: string) => void = (mediaId: string): void => {
        const { match: { params: { productionId } }, history: { push } }: ProductionEditProps = this.props;
        push(`/productions/${productionId}/${mediaId}`);
    }
    navigateToSource: (sourceId: string) => void = (sourceId: string): void => {
        const { match: { params: { productionId, mediaId } }, history: { push } }: ProductionEditProps = this.props;
        push(`/productions/${productionId}/${mediaId}/${sourceId}`);
    }
    fetchProduction: (productionId: string) => Promise<void> = async (productionId: string): Promise<void> => {
        const { fetchProduction, setMedias, setSources, match: { params }, history: { replace } }: ProductionEditProps = this.props;
        try {
            const { production }: Actions.SetProduction = await fetchProduction(productionId);
            setMedias(entityUtils.getMedias(production));
            setSources(entityUtils.getSources(production));
            this.selectFromParams(production, params, production.medias);
        } catch (error) {
            replace("/productions");
        }
    }
    selectFromParams: (production: Production, params: ProductionEditParams, mediasToUse?: Media[], sourcesToUse?: Source[]) => void =
    (production: Production, params: ProductionEditParams, mediasToUse?: Media[], sourcesToUse?: Source[]): void => {
        const { selectMedia, selectSource, history: { replace } }: ProductionEditProps = this.props;
        const { mediaId, sourceId, productionId }: ProductionEditParams = params;
        const medias: Media[] = mediasToUse || this.props.medias;
        const sources: Source[] = sourcesToUse || this.props.sources;
        if (production) {
            switch (mediaId) {
                case "banniere":
                    selectMedia(production.banner._id);
                    break;
                case "fond":
                    selectMedia(production.background._id);
                    break;
                default:
                    if (medias.map((m: Media) => m._id).indexOf(mediaId) >= 0) {
                        selectMedia(mediaId);
                    } else {
                        selectMedia("");
                        if (mediaId && mediaId !== "medias") {
                            replace(`/productions/${productionId}`);
                            return;
                        }
                    }
                    break;
            }
        }
        if (sources.map((s: Source) => s._id).indexOf(sourceId) >= 0) {
            selectSource(sourceId);
        } else {
            selectSource("");
            if (sourceId) {
                replace(`/productions/${productionId}/${mediaId}`);
                return;
            }
        }
    }

    async componentWillMount(): Promise<void> {
        const { hasRendered, match: { params: { productionId } } }: ProductionEditProps = this.props;
        if (!hasRendered) {
            this.fetchProduction(productionId);
        }
    }
    componentWillReceiveProps(nextProps: ProductionEditProps): void {
        const { match: { params: { productionId, mediaId, sourceId } } }: ProductionEditProps = this.props;
        const nextParams: ProductionEditParams = nextProps.match.params;
        // reset when production changes
        if (productionId !== nextParams.productionId) {
            this.fetchProduction(nextParams.productionId);
        }
        // when URL has changed
        if (mediaId !== nextParams.mediaId || sourceId !== nextParams.sourceId) {
            this.selectFromParams(nextProps.production, nextProps.match.params);
        }
    }
    static async fetchData(dispatch: Dispatch<RopehoAdminState>, params: ProductionEditParams): Promise<void> {
        const { mediaId, productionId, sourceId }: ProductionEditParams = params;
        const { production }: Actions.SetProduction = await dispatch(productionModule.fetchProductionById(productionId));
        if (production) {
            dispatch(mediaModule.replaceMedias(entityUtils.getMedias(production)));
            dispatch(sourceModule.replaceSources(entityUtils.getSources(production)));
            switch (mediaId) {
                case "banniere":
                    dispatch(mediaModule.selectMedia(production.banner._id));
                    break;
                case "fond":
                    dispatch(mediaModule.selectMedia(production.background._id));
                    break;
                default:
                    if (production.medias.map((m: Media) => m._id).indexOf(mediaId) >= 0) {
                        dispatch(mediaModule.selectMedia(mediaId));
                    }
                    break;
            }
            dispatch(sourceModule.selectSource(sourceId));
        }
    }
    shouldRedirect: () => JSX.Element = (): JSX.Element => {
        const { hasRendered, production, selectedMedia, selectedSource, match: { params: { productionId, mediaId, sourceId } } }: ProductionEditProps = this.props;
        if (hasRendered) {
            // production not found
            if (!production) {
                return <Redirect to="/productions" />;
            }
            // media not found
            if ((!selectedMedia && mediaId) && mediaId !== "medias") {
                return <Redirect to={`/productions/${productionId}`} />;
            }
            // source not found
            if (!selectedSource && sourceId) {
                return <Redirect to={`/productions/${productionId}/${mediaId}`} />;
            }
        }
    }
    render(): JSX.Element {
        const { production, selectedSource, sources, setError, selectedMedia, updateMedia, setSourcePosition, setFile, updateSource, medias, setMediaPosition }: ProductionEditProps = this.props;
        const { tab, promptSave, promptDelete }: ProductionEditState = this.state;
        // tslint:disable:react-this-binding-issue
        // server side redirections
        const redirect: JSX.Element = this.shouldRedirect();
        if (redirect) {
            return redirect;
        }
        if (!production) {
            return null;
        }
        return <div>
            <section className={headerBar}>
                <h2>{production.name}</h2>
                <Button primary={true} onClick={this.promptSaveShow} icon="done">Enregistrer</Button>
                <Button accent={true} inverse={true} onClick={this.promptDeleteShow} icon="delete">Supprimer</Button>
            </section>
            <Tabs index={tab} onChange={this.setTab}>
                <Tab label="Production" onClick={this.navigateTo.bind(this, `/productions/${production._id}`)}>
                    <ProductionEditMetaData {...this.props} />
                </Tab>
                <Tab label="Bannière" onClick={this.navigateTo.bind(this, `/productions/${production._id}/banniere`)}>
                    <Route
                        path="/productions/:productionId/banniere"
                        render={() => {
                            if (selectedMedia) {
                                return <div>
                                    <div style={{ height: "300px" }}>
                                        <MediaPreview media={{
                                            ...selectedMedia,
                                            sources
                                        }} />
                                    </div>
                                    <MediaEdit
                                        media={selectedMedia}
                                        setMedia={updateMedia}
                                        sources={sources}
                                        setError={setError}
                                        setSource={this.updateSource}
                                        source={selectedSource}
                                        deleteSources={this.removeSources}
                                        setSourcePosition={setSourcePosition}
                                        selectSource={this.navigateToSource}
                                        setFile={setFile}
                                        publicOnly />
                                    <Route
                                        path="/productions/:productionId/:mediaId/:sourceId"
                                        render={() => <SourceEdit
                                            setSource={updateSource}
                                            source={selectedSource}
                                            type={selectedMedia.type}
                                            removeSource={this.removeSource}
                                        />}
                                    />
                                </div>;
                            } else {
                                return null;
                            }
                        }}
                    />
                </Tab>
                <Tab label="Fond" onClick={this.navigateTo.bind(this, `/productions/${production._id}/fond`)}>
                    <Route
                        path="/productions/:productionId/fond"
                        render={() => {
                            if (selectedMedia) {
                                return <div>
                                    <div style={{ height: "300px" }}>
                                        <MediaPreview media={{
                                            ...selectedMedia,
                                            sources
                                        }} />
                                    </div>
                                    <MediaEdit
                                        media={selectedMedia}
                                        setMedia={updateMedia}
                                        sources={sources}
                                        setError={setError}
                                        setSource={this.updateSource}
                                        source={selectedSource}
                                        deleteSources={this.removeSources}
                                        setSourcePosition={setSourcePosition}
                                        selectSource={this.navigateToSource}
                                        setFile={setFile}
                                        publicOnly />
                                    <Route
                                        path="/productions/:productionId/:mediaId/:sourceId"
                                        render={() => <SourceEdit
                                            setSource={updateSource}
                                            source={selectedSource}
                                            type={selectedMedia.type}
                                            removeSource={this.removeSource}
                                        />}
                                    />
                                </div>;
                            } else {
                                return null;
                            }
                        }}
                    />
                </Tab>
                <Tab label="Medias" onClick={this.navigateTo.bind(this, `/productions/${production._id}/medias`)}>
                    <Route
                        path="/productions/:productionId/:mediaId/:sourceId?"
                        render={() => {
                            const prodMedias: Media[] = medias.filter((m: Media) => m._id !== production.background._id && m._id !== production.banner._id);
                            return <div>
                                <MediaSelector
                                    medias={prodMedias}
                                    selectMedia={this.navigateToMedia}
                                    selectedMedia={selectedMedia}
                                    setMedia={updateMedia}
                                    setMediaPosition={setMediaPosition}
                                    removeSelected={this.removeSelectedMedia}
                                />
                                {
                                    selectedMedia ? <div>
                                        <div style={{ height: "300px" }}>
                                            <MediaPreview media={{
                                                ...selectedMedia,
                                                sources
                                            }} />
                                        </div>
                                        <MediaEdit
                                            media={selectedMedia}
                                            setMedia={updateMedia}
                                            sources={sources}
                                            setError={setError}
                                            setSource={this.updateSource}
                                            source={selectedSource}
                                            deleteSources={this.removeSources}
                                            setSourcePosition={setSourcePosition}
                                            selectSource={this.navigateToSource}
                                            setFile={setFile} />
                                        <Route
                                            path="/productions/:productionId/:mediaId/:sourceId"
                                            render={() => <SourceEdit
                                                setSource={updateSource}
                                                source={selectedSource}
                                                type={selectedMedia.type}
                                                removeSource={this.removeSource}
                                            />}
                                        />
                                    </div> : null
                                }
                            </div>;
                        }}
                    />
                </Tab>
            </Tabs>
            <Dialog
                active={promptSave}
                title="Enregistrer les modifications"
                actions={[{
                    label: "Annuler",
                    icon: "cancel",
                    onClick: this.promptSaveHide
                }, {
                    label: "Enregister",
                    icon: "done",
                    primary: true,
                    onClick: this.saveChanges
                }]}
            >
                <p>Cette action va enregistrer toutes les modifications apportés à la production et mettre {} medias à la file d'attente</p>
            </Dialog>
            <Dialog
                className={deleteDialog}
                active={promptDelete}
                title="Supprimer la production"
                actions={[{
                    label: "Annuler",
                    icon: "cancel",
                    onClick: this.promptDeleteHide
                }, {
                    label: "Supprimer",
                    icon: "delete",
                    accent: true,
                    onClick: this.deleteProduction
                }]}
            >
                <p>Cette action va supprimer cette production de la base de données. Les {} medias resteront sur le serveur.</p>
            </Dialog>
        </div>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProductionEdit);
