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

import Production = Ropeho.Models.Production;

export const mapStateToProps: (state: RopehoAdminState, ownProps?: ProductionIndexProps) => ProductionIndexProps
    = (state: RopehoAdminState, ownProps?: ProductionIndexProps): ProductionIndexProps => ({
        hasRendered: getHasRendered(state),
        productions: getProductions(state)
    });

export const mapDispatchToProps: (dispatch: Dispatch<RopehoAdminState>, ownProps?: ProductionIndexProps) => ProductionIndexProps
    = (dispatch: Dispatch<RopehoAdminState>, ownProps?: ProductionIndexProps): ProductionIndexProps => ({
        fetchProductions: () => dispatch<Promise<Actions.SetProductions>, {}>(fetchProductions(["name", "banner", "description", "state"])),
        createProduction: (production: Production) => dispatch<Promise<Actions.SetProductions>, {}>(createProduction(production))
    });

export interface ProductionIndexProps {
    hasRendered?: boolean;
    productions?: Production[];
    fetchProductions?: () => Promise<Actions.SetProductions>;
    createProduction?: (production: Production) => Promise<Actions.SetProductions>;
}

export class ProductionIndex extends React.Component<ProductionIndexProps, {}> {
    constructor(props: ProductionIndexProps) {
        super(props);
    }
    componentWillMount(): void {
        const { hasRendered, fetchProductions }: ProductionIndexProps = this.props;
        if (!hasRendered) {
            fetchProductions();
        }
    }
    static FetchData(dispatch: Dispatch<RopehoAdminState>): Promise<Actions.SetProductions> {
        return dispatch(fetchProductions(["name", "banner", "description", "state"]));
    }
    render(): JSX.Element {
        return <div>ProductionIndex<br />ProductionIndex<br />
            ProductionIndex<br />
            ProductionIndex<br />
            ProductionIndex<br />
            ProductionIndex<br />
            ProductionIndex<br />
            ProductionIndex<br />
            ProductionIndex<br />
            ProductionIndex<br />
            ProductionIndex<br />
            ProductionIndex<br /></div>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProductionIndex);
