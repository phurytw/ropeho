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
import { fetchProductions, createProduction, Actions } from "../../modules/productionIndex";
import { Tabs, Tab } from "react-toolbox";
import ProductionNew from "../ProductionNew";
import { Location } from "history";
import { map } from "lodash";
import PreviewCard from "../PreviewCard";

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

export interface ProductionIndexProps {
    hasRendered?: boolean;
    productions?: Production[];
    fetchProductions?: () => Promise<Actions.SetProductions>;
    createProduction?: (production: Production) => Promise<Actions.SetProductions>;

    // Do this instead of importing RouteComponentProps because someone changed it and made it non-optional
    // Definitely a great idea
    location?: Location;
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
    handleTabChange: (index: number) => void = (index: number): void => {
        this.setState({ index });
    }
    componentWillMount(): void {
        const { hasRendered, fetchProductions }: ProductionIndexProps = this.props;
        if (!hasRendered) {
            fetchProductions();
        }
    }
    static fetchData(dispatch: Dispatch<RopehoAdminState>): Promise<Actions.SetProductions> {
        return dispatch(fetchProductions(productionFields));
    }
    render(): JSX.Element {
        const { productions, createProduction }: ProductionIndexProps = this.props;
        return <nav>
            <Tabs index={this.state.index} onChange={this.handleTabChange}>
                <Tab label="Parcourir">
                    {map<Production, JSX.Element>(productions, (p: Production) => <PreviewCard href={`/productions/${p._id}`} name={p.name} key={p._id} />)}
                </Tab>
                <Tab label="Créer">
                    <ProductionNew createProduction={createProduction} />
                </Tab>
            </Tabs>
        </nav>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProductionIndex);
