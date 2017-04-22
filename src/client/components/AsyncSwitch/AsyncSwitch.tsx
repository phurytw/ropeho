/**
 * @file Renders the proper component based on which entity was found in the database
 * @author François Nguyen <https://github.com/lith-light-g>
 */
// tslint:disable:react-this-binding-issue
import * as React from "react";
import { RouteComponentProps, Redirect, Route } from "react-router-dom";
import * as productionModule from "../../modules/production";
import * as categoryIndexModule from "../../modules/categoryIndex";
import { Dispatch } from "redux";
import { RopehoClientState } from "../../reducer";
import { getHasRendered, getSelectedCategory, getSelectedProduction, getCategories } from "../../selectors";
import { ProductionParams, default as ProductionComponent } from "../Production";
import uriFriendlyFormat from "../../../common/helpers/uriFriendlyFormat";
import { connect } from "react-redux";

import Category = Ropeho.Models.Category;
import Production = Ropeho.Models.Production;

export const mapStateToProps: (state: RopehoClientState, ownProps?: AsyncSwitchProps) => AsyncSwitchProps =
    (state: RopehoClientState, ownProps?: AsyncSwitchProps): AsyncSwitchProps => ({
        hasRendered: getHasRendered(state),
        category: getSelectedCategory(state),
        production: getSelectedProduction(state),
        categories: getCategories(state)
    });

export const mapDispatchToProps: (dispatch: Dispatch<any>, ownProps?: AsyncSwitchProps) => AsyncSwitchProps =
    (dispatch: Dispatch<any>, ownProps?: AsyncSwitchProps): AsyncSwitchProps => ({
        fetchCategories: (fields?: string[]) => dispatch<Promise<categoryIndexModule.Actions.SetCategories>, {}>(categoryIndexModule.fetchCategories()),
        fetchProduction: (name: string) => dispatch<Promise<productionModule.Actions.SetProductions>, {}>(productionModule.fetchSingleProduction(name)),
        selectCategory: (name: string) => dispatch<categoryIndexModule.Actions.SelectCategory, {}>(categoryIndexModule.selectCategory(name)),
        selectProduction: (name: string) => dispatch<productionModule.Actions.SelectProduction, {}>(productionModule.selectProduction(name))
    });

export interface AsyncSwitchParams {
    name?: string;
}

export interface AsyncSwitchProps extends Partial<RouteComponentProps<AsyncSwitchParams>> {
    hasRendered?: boolean;
    category?: Category;
    categories?: Category[];
    production?: Production;
    fetchProduction?: (name: string) => Promise<productionModule.Actions.SetProductions>;
    selectProduction?: (name: string) => productionModule.Actions.SelectProduction;
    fetchCategories?: (fields?: string[]) => Promise<categoryIndexModule.Actions.SetCategories>;
    selectCategory?: (name: string) => categoryIndexModule.Actions.SelectCategory;
}

export class AsyncSwitch extends React.Component<AsyncSwitchProps, {}> {
    constructor(props?: AsyncSwitchProps) {
        super(props);
    }
    async componentWillMount(): Promise<void> {
        const { hasRendered, fetchCategories, fetchProduction, selectCategory, selectProduction, match: { params: { name } }, history: { replace } }: AsyncSwitchProps = this.props;
        if (!hasRendered) {
            selectCategory(name);
            selectProduction(name);
            const { productions }: productionModule.Actions.SetProductions = await fetchProduction(name);
            let { categories }: categoryIndexModule.Actions.SetCategories = await fetchCategories();
            const [production]: Production[] = productions;
            if (production) {
                return;
            }
            categories = categories.filter((c: Category) => uriFriendlyFormat(c.name) === uriFriendlyFormat(name));
            if (categories.length > 0) {
                return replace(`/photographies/${uriFriendlyFormat(categories[0].name)}`);
            }
            return replace("/404");
        }
    }
    async componentWillReceiveProps(nextProps: AsyncSwitchProps): Promise<void> {
        const { fetchProduction, selectCategory, selectProduction, categories, history: { replace } }: AsyncSwitchProps = this.props;
        const name: string = nextProps.match.params.name;
        if (name !== this.props.match.params.name) {
            selectCategory(name);
            selectProduction(name);
            const { productions }: productionModule.Actions.SetProductions = await fetchProduction(name);
            const [production]: Production[] = productions;
            if (production) {
                return;
            }
            const foundCategories: Category[] = categories.filter((c: Category) => uriFriendlyFormat(c.name) === uriFriendlyFormat(name));
            if (foundCategories.length > 0) {
                return replace(`/photographies/${uriFriendlyFormat(categories[0].name)}`);
            }
            return replace("/404");
        }
    }
    shouldRedirect: () => boolean = (): boolean => {
        const { hasRendered, category, production }: AsyncSwitchProps = this.props;
        if (hasRendered && (!category && !production)) {
            return true;
        }
        return false;
    }
    static async fetchData(dispatch: Dispatch<RopehoClientState>, { name }: AsyncSwitchParams): Promise<void> {
        await dispatch(productionModule.fetchSingleProduction(name));
        await dispatch(categoryIndexModule.fetchCategories());
        dispatch(productionModule.selectProduction(name));
        dispatch(categoryIndexModule.selectCategory(name));
    }
    render(): JSX.Element {
        const { hasRendered, category, production }: AsyncSwitchProps = this.props;
        if (hasRendered) {
            if (category && !production) {
                return <Redirect to={`/photographies/${uriFriendlyFormat(category.name)}`} />;
            } else if (!category && !production) {
                return <Redirect to="/404" />;
            }
        }
        return <Route path="/:productionName/:mediaNumber?"
            render={(routeProps: Partial<RouteComponentProps<ProductionParams>>) => production ? <ProductionComponent {...routeProps} production={production} /> : null} />;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AsyncSwitch);
