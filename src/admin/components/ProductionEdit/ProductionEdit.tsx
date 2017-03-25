/**
 * @file Production editor component
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../typings.d.ts" />
import * as React from "react";
import { connect } from "react-redux";
import { RopehoAdminState } from "../../reducer";
import { getProduction, getHasRendered } from "../../selectors";
import { fetchProductionById, updateProduction, deleteProduction, setProduction, Actions } from "../../modules/productionEdit";
import { Dispatch } from "redux";
import { PartialRouteComponentProps, Redirect, Prompt } from "react-router-dom";
import { Button, Tabs, Tab, Dialog } from "react-toolbox";
import { headerBar } from "./headerBar.css";
import { deleteDialog } from "./deleteDialog.css";
import ProductionEditMetaData from "../ProductionEditMetaData";

import Production = Ropeho.Models.Production;

export const mapStateToProps: (state: RopehoAdminState, ownProps?: ProductionEditProps) => ProductionEditProps
    = (state: RopehoAdminState, ownProps?: ProductionEditProps): ProductionEditProps => ({
        production: getProduction(state),
        hasRendered: getHasRendered(state)
    });
export const mapDispatchToProps: (dispatch: Dispatch<RopehoAdminState>, ownProps?: ProductionEditProps) => ProductionEditProps
    = (dispatch: Dispatch<RopehoAdminState>, ownProps?: ProductionEditProps): ProductionEditProps => ({
        fetchProduction: (id: string) => dispatch(fetchProductionById(id)),
        deleteProduction: (id: string) => dispatch(deleteProduction(id)),
        updateProduction: (production: Production) => dispatch(updateProduction(production)),
        setProduction: (production: Production) => dispatch(setProduction(production))
    });

export interface ProductionEditState {
    promptSave?: boolean;
    promptDelete?: boolean;
    tab?: number;
}

export interface ProductionEditParams {
    productionId?: string;
}

export interface ProductionEditProps extends PartialRouteComponentProps<ProductionEditParams> {
    production?: Production;
    fetchProduction?: (id: string) => Promise<Actions.SetProduction>;
    updateProduction?: (production: Production) => Promise<Actions.SetProduction>;
    deleteProduction?: (id: string) => Promise<Actions.SetProduction>;
    setProduction?: (production: Production) => Actions.SetProduction;
    hasRendered?: boolean;
}

export class ProductionEdit extends React.Component<ProductionEditProps, ProductionEditState> {
    constructor(props: ProductionEditProps) {
        super(props);
        this.state = {
            promptDelete: false,
            promptSave: false,
            tab: 0
        };
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
    componentWillMount(): void {
        const { hasRendered, fetchProduction, match: { params: { productionId } } }: ProductionEditProps = this.props;
        if (!hasRendered) {
            fetchProduction(productionId).catch(() => window.location.replace("/productions"));
        }
    }
    static fetchData(dispatch: Dispatch<RopehoAdminState>, params: ProductionEditParams): Promise<Actions.SetProduction> {
        return dispatch(fetchProductionById(params.productionId));
    }
    render(): JSX.Element {
        const { production }: ProductionEditProps = this.props;
        const { tab, promptSave, promptDelete }: ProductionEditState = this.state;
        if (production && !production._id) {
            return <Redirect to="/productions" />;
        } else if (production) {
            return <div>
                <Prompt message="Êtes vous sur ?" />
                <section className={headerBar}>
                    <h2>{production.name}</h2>
                    <Button primary={true} onClick={this.promptSaveShow} icon="done">Enregistrer</Button>
                    <Button accent={true} inverse={true} onClick={this.promptDeleteShow} icon="delete">Supprimer</Button>
                </section>
                <Tabs index={tab} onChange={this.setTab}>
                    <Tab label="Production">
                        <ProductionEditMetaData {...this.props} />
                    </Tab>
                    <Tab label="Bannière" />
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
