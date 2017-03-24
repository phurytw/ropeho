/**
 * @file Production editor component
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../typings.d.ts" />
import * as React from "react";
import { connect } from "react-redux";
import { RopehoAdminState } from "../../reducer";
import { getProduction, getHasRendered } from "../../selectors";
import { fetchProductionById, updateProduction, deleteProduction, Actions } from "../../modules/productionEdit";
import { Dispatch } from "redux";
import { PartialRouteComponentProps, Redirect } from "react-router-dom";
import { Button } from "react-toolbox";
import { headerBar } from "./headerBar.css";

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
        updateProduction: (production: Production) => dispatch(updateProduction(production))
    });

export interface ProductionEditState {
    promptSave?: boolean;
    promptDelete?: boolean;
}

export interface ProductionEditParams {
    productionId?: string;
}

export interface ProductionEditProps extends PartialRouteComponentProps<ProductionEditParams> {
    production?: Production;
    fetchProduction?: (id: string) => Promise<Actions.SetProduction>;
    updateProduction?: (production: Production) => Promise<Actions.SetProduction>;
    deleteProduction?: (id: string) => Promise<Actions.SetProduction>;
    hasRendered?: boolean;
}

export class ProductionEdit extends React.Component<ProductionEditProps, ProductionEditState> {
    constructor(props: ProductionEditProps) {
        super(props);
    }
    promptSave: () => void = (): void => this.setState({ promptSave: true });
    saveChanges: (confirm: boolean) => void = (confirm: boolean): void => {
    }
    promptDelete: () => void = (): void => this.setState({ promptDelete: true });
    deleteProduction: (confirm: boolean) => void = (confirm: boolean): void => {
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
        if (production && !production._id) {
            return <Redirect to="/productions" />;
        } else {
            return <div>
                <section className={headerBar}>
                    <h2>{production && production.name}</h2>
                    <Button primary={true} onClick={this.promptSave} icon="done">Enregistrer</Button>
                    <Button accent={true} inverse={true} onClick={this.promptDelete} icon="delete">Supprimer</Button>
                </section>
            </div>;
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProductionEdit);
