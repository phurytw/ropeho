/**
 * @file Production editor component
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../typings.d.ts" />
import * as React from "react";
import { connect } from "react-redux";
import { RopehoAdminState } from "../../reducer";
import { getProduction, getHasRendered, getMedias, getSourcesFromSelectedMedia, getSelectedMedia, getSelectedSource } from "../../selectors";
import { Actions } from "../../modules/productionEdit";
import * as productionModule from "../../modules/productionEdit";
import { Actions as MediaActions } from "../../modules/mediaEdit";
import * as mediaModule from "../../modules/mediaEdit";
import { Actions as SourceActions } from "../../modules/sourceEdit";
import * as sourceModule from "../../modules/sourceEdit";
import { setError, Actions as ErrorActions } from "../../modules/error";
import { Dispatch } from "redux";
import { PartialRouteComponentProps, Redirect, Route } from "react-router-dom";
import { Button, Tabs, Tab, Dialog } from "react-toolbox";
import { headerBar } from "./headerBar.css";
import { deleteDialog } from "./deleteDialog.css";
import * as entityUtils from "../../../server/helpers/entityUtilities";
import ProductionEditMetaData from "../ProductionEditMetaData";
import MediaEdit from "../MediaEdit";

import Production = Ropeho.Models.Production;
import Media = Ropeho.Models.Media;
import Source = Ropeho.Models.Source;

export const mapStateToProps: (state: RopehoAdminState, ownProps?: ProductionEditProps) => ProductionEditProps
    = (state: RopehoAdminState, ownProps?: ProductionEditProps): ProductionEditProps => ({
        production: getProduction(state),
        hasRendered: getHasRendered(state),
        medias: getMedias(state),
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
        setSourcePosition: (mediaId: string, sourceId: string, posiiton: number) => dispatch(mediaModule.setSourcePosition(mediaId, sourceId, posiiton)),
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
    updateSource: (source: Source) => void = (source: Source): void => {
        const { updateSource, selectedMedia, addSourceToMedia }: ProductionEditProps = this.props;
        if (selectedMedia && selectedMedia._id) {
            addSourceToMedia(selectedMedia._id, source._id);
        }
        updateSource(source);
    }
    removeSelectedMedia: () => void = (): void => {
        const { selectedMedia, sources, removeMedia, removeSources, removeSourcesFromMedia }: ProductionEditProps = this.props;
        removeMedia(selectedMedia._id);
        removeSources(sources.map((s: Source) => s._id));
        removeSourcesFromMedia(sources.map((s: Source) => s._id));
    }
    removeSources: (sourceIds: string[]) => void = (sourceIds: string[]): void => {
        const { removeSources, removeSourcesFromMedia }: ProductionEditProps = this.props;
        removeSources(sourceIds);
        removeSourcesFromMedia(sourceIds);
    }
    promptSaveShow: () => void = (): void => this.setState({ promptSave: true });
    promptSaveHide: () => void = (): void => this.setState({ promptSave: false });
    saveChanges: (confirm: boolean) => void = (confirm: boolean): void => {
        this.setState({ promptSave: false });
    }
    promptDeleteShow: () => void = (): void => this.setState({ promptDelete: true });
    promptDeleteHide: () => void = (): void => this.setState({ promptDelete: false });
    deleteProduction: (confirm: boolean) => void = (confirm: boolean): void => {
        this.setState({ promptDelete: false });
    }
    setTab: (tab: number) => void = (tab: number): void => {
        this.setState({ tab });
    }
    navigateTo(path: string): void {
        this.props.history.push(path);
    }
    navigateToSource(sourceId: string): void {
        const { match: { params: { productionId, mediaId } } }: ProductionEditProps = this.props;
        this.props.history.push(`/productions/${productionId}/${mediaId}/${sourceId}`);
    }
    fetchProduction: (productionId: string) => Promise<void> = async (productionId: string): Promise<void> => {
        const { fetchProduction, setMedias, setSources }: ProductionEditProps = this.props;
        try {
            const { production }: Actions.SetProduction = await fetchProduction(productionId);
            setMedias(entityUtils.getMedias(production));
            setSources(entityUtils.getSources(production));
        } catch (error) {
            window.location.replace("/productions");
        }
    }
    async componentWillMount(): Promise<void> {
        const { hasRendered, match: { params: { productionId } } }: ProductionEditProps = this.props;
        if (!hasRendered) {
            this.fetchProduction(productionId);
        }
    }
    componentWillUpdate(nextProps: ProductionEditProps): void {
        const { production, selectMedia, selectSource }: ProductionEditProps = this.props;
        const { match: { params: { mediaId, sourceId } } }: ProductionEditProps = nextProps;
        if (production) {
            switch (mediaId) {
                case "banniere":
                    selectMedia(production.banner._id);
                    break;
                case "fond":
                    selectMedia(production.background._id);
                    break;
                default:
                    selectMedia(mediaId);
                    break;
            }
            selectSource(sourceId);
        }
    }
    componentWillReceiveProps(nextProps: ProductionEditProps): void {
        const { match: { params: { productionId } } }: ProductionEditProps = this.props;
        const nextParams: ProductionEditParams = nextProps.match.params;
        if (productionId !== nextParams.productionId) {
            this.fetchProduction(nextParams.productionId);
        }
    }
    static async fetchData(dispatch: Dispatch<RopehoAdminState>, params: ProductionEditParams): Promise<void> {
        const { mediaId, productionId, sourceId }: ProductionEditParams = params;
        const { production }: Actions.SetProduction = await dispatch(productionModule.fetchProductionById(productionId));
        if (production) {
            dispatch(mediaModule.replaceMedias(entityUtils.getMedias(production)));
            dispatch(sourceModule.replaceSources(entityUtils.getSources(production)));
            dispatch(mediaModule.selectMedia(mediaId));
            dispatch(sourceModule.selectSource(sourceId));
        }
    }
    render(): JSX.Element {
        const { production, selectedSource, sources, hasRendered, setError, selectedMedia, updateMedia, setSourcePosition }: ProductionEditProps = this.props;
        const { tab, promptSave, promptDelete }: ProductionEditState = this.state;
        // tslint:disable:react-this-binding-issue
        // if production has not been found
        if ((production && !production._id) || (!production && hasRendered)) {
            return <Redirect to="/productions" />;
        } else if (production) {
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
                                    return <MediaEdit
                                        media={selectedMedia}
                                        setMedia={updateMedia}
                                        sources={sources}
                                        setError={setError}
                                        setSource={this.updateSource}
                                        source={selectedSource}
                                        deleteSources={this.removeSources}
                                        setSourcePosition={setSourcePosition}
                                        selectSource={this.navigateToSource.bind(this)}
                                        publicOnly />;
                                } else {
                                    return null;
                                }
                            }}
                        />
                    </Tab>
                    <Tab label="Fond" />
                    <Tab label="Medias" />
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
        } else {
            return <div></div>;
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProductionEdit);
