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
import { fetchProductions, createProduction, saveOrder, setProductionPosition, Actions } from "../../../common/modules/productionIndex";
import { Tabs, Tab, Dialog, Navigation, Button } from "react-toolbox";
import { RouteComponentProps } from "react-router-dom";
import ProductionNew from "../ProductionNew";
import PreviewCard from "../PreviewCard";
import CardView from "../CardView";

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
        createProduction: (production: Production) => dispatch<Promise<Actions.AddProduction>, {}>(createProduction(production)),
        setPosition: (productionId: string, position: number) => dispatch<Actions.SetPosition, {}>(setProductionPosition(productionId, position)),
        saveOrder: (order: string[]) => dispatch<Promise<void>, {}>(saveOrder(order))
    });

export interface ProductionIndexProps extends Partial<RouteComponentProps<void>> {
    hasRendered?: boolean;
    productions?: Production[];
    fetchProductions?: () => Promise<Actions.SetProductions>;
    createProduction?: (production: Production) => Promise<Actions.AddProduction>;
    setPosition?: (productionId: string, position: number) => Actions.SetPosition;
    saveOrder?: (order: string[]) => Promise<void>;
}

export interface ProductionIndexState {
    index: number;
    promptNewOrder: boolean;
}

export class ProductionIndex extends React.Component<ProductionIndexProps, ProductionIndexState> {
    constructor(props: ProductionIndexProps) {
        super(props);
        const { location }: ProductionIndexProps = this.props;
        this.state = {
            index: location && location.state && location.state.tab === "1" ? 1 : 0,
            promptNewOrder: false
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
    goToProduction(production: Production): void {
        this.props.history.push(`/productions/${production._id}`);
    }
    moveProductionUp(production: Production): void {
        const { productions, setPosition }: ProductionIndexProps = this.props;
        const index: number = productions.map((p: Production) => p._id).indexOf(production._id);
        setPosition(production._id, Math.max(index - 1, 0));
    }
    moveProductionDown(production: Production): void {
        const { productions, setPosition }: ProductionIndexProps = this.props;
        const index: number = productions.map((p: Production) => p._id).indexOf(production._id);
        setPosition(production._id, index + 1);
    }
    saveOrder: () => void = (): void => {
        if (this.state.promptNewOrder) {
            const { productions, saveOrder }: ProductionIndexProps = this.props;
            saveOrder(productions.map<string>((p: Production) => p._id));
            this.setState({ promptNewOrder: false });
        } else {
            this.setState({ promptNewOrder: true });
        }
    }
    closeDialog: () => void = (): void => {
        this.setState({ promptNewOrder: false });
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
                    <Navigation type="horizontal">
                        <Button label="Enregistrer" primary={true} onClick={this.saveOrder} />
                    </Navigation>
                    <CardView>
                        {!productions || productions.length === 0 ? <b>Aucune production</b> :
                            productions.map((p: Production) => <div key={p._id}>
                                <PreviewCard
                                    onClick={this.goToProduction.bind(this, p)}
                                    onLeft={this.moveProductionUp.bind(this, p)}
                                    onRight={this.moveProductionDown.bind(this, p)}
                                    name={p.name}
                                    media={p.banner}
                                />
                            </div>)}
                    </CardView>
                </Tab>
                <Tab label="Créer">
                    <ProductionNew createProduction={createProduction} />
                </Tab>
            </Tabs>
            <Dialog
                active={this.state.promptNewOrder}
                title="Ordre des productions"
                actions={[{
                    label: "Enregistrer",
                    primary: true,
                    onClick: this.saveOrder
                }, {
                    label: "Annuler",
                    onClick: this.closeDialog
                }]}
            >
                <p>Cette action va enregistrer les productions dans cet ordre:</p>
                <ol>{
                    productions.map<JSX.Element>((p: Production) => <li key={p._id}>{p.name}</li>)
                }</ol>
            </Dialog>
        </nav>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProductionIndex);
