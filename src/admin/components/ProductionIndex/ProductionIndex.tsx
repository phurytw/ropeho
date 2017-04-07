/**
 * @file Production index component
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../typings.d.ts" />
import * as React from "react";
import { connect } from "react-redux";
import { RopehoAdminState } from "../../reducer";
import { Dispatch } from "redux";
import { getProductions, getHasRendered } from "../../selectors";
import { fetchProductions, createProduction, Actions } from "../../../common/modules/productionIndex";
import { Tabs, Tab } from "react-toolbox";
import { PartialRouteComponentProps } from "react-router-dom";
import ProductionNew from "../ProductionNew";
import PreviewCard from "../PreviewCard";
import { isEqual } from "lodash";

import Production = Ropeho.Models.Production;
const productionFields: string[] = ["_id", "name", "banner", "description", "state"];

export const mapStateToProps: (state: RopehoAdminState, ownProps?: ProductionIndexProps) => ProductionIndexProps
    = (state: RopehoAdminState, ownProps?: ProductionIndexProps): ProductionIndexProps => ({
        hasRendered: getHasRendered(state),
        productions: getProductions(state)
    });

export const mapDispatchToProps: (dispatch: Dispatch<RopehoAdminState>, ownProps?: ProductionIndexProps) => ProductionIndexProps
    = (dispatch: Dispatch<RopehoAdminState>, ownProps?: ProductionIndexProps): ProductionIndexProps => ({
        fetchProductions: () => dispatch<Promise<Actions.SetProductions>, {}>(fetchProductions(productionFields)),
        createProduction: (production: Production) => dispatch<Promise<Actions.SetProductions>, {}>(createProduction(production))
    });

export interface ProductionIndexProps extends PartialRouteComponentProps<void> {
    hasRendered?: boolean;
    productions?: Production[];
    fetchProductions?: () => Promise<Actions.SetProductions>;
    createProduction?: (production: Production) => Promise<Actions.SetProductions>;
}

export interface ProductionIndexState {
    index: number;
}

export class ProductionIndex extends React.Component<ProductionIndexProps, ProductionIndexState> {
    constructor(props: ProductionIndexProps) {
        super(props);
        const { location }: ProductionIndexProps = this.props;
        this.state = {
            index: location && location.query && location.query.tab === "1" ? 1 : 0
        };
    }
    shouldComponentUpdate(nextProps: ProductionIndexProps): boolean {
        return !isEqual(nextProps.productions, this.props.productions);
    }
    handleTabChange: (index: number) => void = (index: number): void => {
        this.setState({ index });
    }
    componentWillMount(): void {
        const { hasRendered, fetchProductions }: ProductionIndexProps = this.props;
        if (!hasRendered) {
            fetchProductions();
        }
    }
    goToProduction(production: Production): void {
        this.props.history.push(`/productions/${production._id}`);
    }
    static fetchData(dispatch: Dispatch<RopehoAdminState>): Promise<Actions.SetProductions> {
        return dispatch(fetchProductions(productionFields));
    }
    render(): JSX.Element {
        // tslint:disable:react-this-binding-issue
        const { productions, createProduction }: ProductionIndexProps = this.props;
        return <nav>
            <Tabs index={this.state.index} onChange={this.handleTabChange}>
                <Tab label="Parcourir">
                    {!productions || productions.length === 0 ? <b>Aucune production</b> :
                        productions.map((p: Production) => <PreviewCard onClick={this.goToProduction.bind(this, p)} name={p.name} key={p._id} />)}
                </Tab>
                <Tab label="Créer">
                    <ProductionNew createProduction={createProduction} />
                </Tab>
            </Tabs>
        </nav>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProductionIndex);
