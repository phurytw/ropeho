/**
 * @file Page showing all productions
 * @author François Nguyen <https://github.com/lith-light-g>
 */
// tslint:disable:react-this-binding-issue
import * as React from "react";
import { Redirect, PartialRouteComponentProps } from "react-router-dom";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import * as productionIndexModule from "../../modules/productionIndex";
import * as categoryIndexModule from "../../modules/categoryIndex";
import { RopehoClientState } from "../../reducer";
import { getHasRendered, getProductionsFromSelectedCategory, getCategories, getSelectedCategory } from "../../selectors";
import VerticalMasonryContainer from "../../../common/components/VerticalMasonryContainer";
import uriFriendlyFormat from "../../../common/helpers/uriFriendlyFormat";
import ContainerRenderer from "../../../common/components/ContainerRenderer";
import MediaPreview from "../../../common/components/MediaPreview";
import { categoryBanner, categoryLink, categoryLayer, selected, mediaPreview, categoryTitle, browse } from "./styles.css";

import Production = Ropeho.Models.Production;
import Presentation = Ropeho.Models.Presentation;
import Category = Ropeho.Models.Category;

const fields: string[] = ["name", "banner", "background"];

export const mapStateToProps: (state: RopehoClientState, ownProps?: ProductionIndexProps) => ProductionIndexProps =
    (state: RopehoClientState, ownProps?: ProductionIndexProps): ProductionIndexProps => ({
        hasRendered: getHasRendered(state),
        productions: getProductionsFromSelectedCategory(state),
        categories: getCategories(state),
        selectedCategory: getSelectedCategory(state)
    });

export const mapDispatchToProps: (dispatch: Dispatch<any>, ownProps?: ProductionIndexProps) => ProductionIndexProps =
    (dispatch: Dispatch<any>, ownProps?: ProductionIndexProps): ProductionIndexProps => ({
        fetchProductions: (fields?: string[]) => dispatch<Promise<productionIndexModule.Actions.SetProductions>, {}>(productionIndexModule.fetchProductions()),
        fetchCategories: (fields?: string[]) => dispatch<Promise<categoryIndexModule.Actions.SetCategories>, {}>(categoryIndexModule.fetchCategories()),
        selectCategory: (name: string) => dispatch<categoryIndexModule.Actions.SelectCategory, {}>(categoryIndexModule.selectCategory(name))
    });

export interface ProductionIndexParams {
    param?: string;
    category?: string;
}

export interface ProductionIndexProps extends PartialRouteComponentProps<ProductionIndexParams> {
    hasRendered?: boolean;
    productions?: Production[];
    categories?: Category[];
    selectedCategory?: Category;
    fetchProductions?: (fields?: string[]) => Promise<productionIndexModule.Actions.SetProductions>;
    fetchCategories?: (fields?: string[]) => Promise<categoryIndexModule.Actions.SetCategories>;
    selectCategory?: (name: string) => categoryIndexModule.Actions.SelectCategory;
}

export interface ProductionIndexState {
    browsingCategories?: boolean;
}

export class ProductionIndex extends React.Component<ProductionIndexProps, ProductionIndexState> {
    constructor(props?: ProductionIndexProps) {
        super(props);
        this.state = {
            browsingCategories: false
        };
    }
    componentWillMount(): void {
        const { fetchProductions, fetchCategories, hasRendered, match: { params: { category } }, history: { replace }, selectCategory }: ProductionIndexProps = this.props;
        if (!hasRendered) {
            selectCategory(category);
            fetchProductions(fields);
            fetchCategories().then((action: categoryIndexModule.Actions.SetCategories) => {
                if (!action.categories.some((c: Category) => uriFriendlyFormat(c.name) === uriFriendlyFormat(category))) {
                    replace("/photographies");
                }
            });
        }
    }
    componentWillReceiveProps(nextProps: ProductionIndexProps): void {
        this.props.selectCategory(nextProps.match.params.category);
    }
    shouldRedirect: () => boolean = (): boolean => {
        const { match: { params: { param, category } }, hasRendered, selectedCategory }: ProductionIndexProps = this.props;
        if (param !== "photographies") {
            return true;
        } else {
            if (hasRendered) {
                if (selectedCategory || !category) {
                    return false;
                } else {
                    return true;
                }
            } else {
                return false;
            }
        }
    }
    showCategories: (event?: React.MouseEvent<HTMLSpanElement>) => void = (event?: React.MouseEvent<HTMLSpanElement>) => {
        if (event) {
            event.stopPropagation();
        }
        this.setState({
            browsingCategories: true
        });
    }
    hideCategories: (event?: React.MouseEvent<HTMLDivElement>) => void = (event?: React.MouseEvent<HTMLDivElement>) => {
        if (event) {
            event.stopPropagation();
        }
        this.setState({
            browsingCategories: false
        });
    }
    goToCategory: (name?: string) => void = (name: string = undefined) => {
        const { history: { push } }: ProductionIndexProps = this.props;
        if (name) {
            push(`/photographies/${uriFriendlyFormat(name)}`);
        } else {
            push(`/photographies`);
        }
    }
    static async fetchData(dispatch: Dispatch<RopehoClientState>, params: ProductionIndexParams): Promise<void> {
        await dispatch<Promise<productionIndexModule.Actions.SetProductions>, {}>(productionIndexModule.fetchProductions(fields));
        await dispatch<Promise<categoryIndexModule.Actions.SetCategories>, {}>(categoryIndexModule.fetchCategories());
        dispatch<categoryIndexModule.Actions.SelectCategory, {}>(categoryIndexModule.selectCategory(params.category));
    }
    render(): JSX.Element {
        const { match: { params: { category } }, selectedCategory, categories }: ProductionIndexProps = this.props;
        const { browsingCategories }: ProductionIndexState = this.state;
        const selectedStyle: string = browsingCategories || selectedCategory ? selected : "";
        const browseStyle: string = browsingCategories ? browse : "";
        if (this.shouldRedirect()) {
            return <Redirect to={`/photographies${selectedCategory ? `/${category}` : ""}`} />;
        }
        return <div>
            <div className={`${categoryBanner} ${selectedStyle}`} onClick={this.hideCategories} role="any">
                {
                    selectedCategory ? <div className={`${mediaPreview} ${browseStyle}`}>
                        <MediaPreview media={selectedCategory.banner} />
                    </div> : null
                }
                {
                    selectedCategory ? <div className={`${categoryTitle} ${browseStyle}`}>
                        <h1>{selectedCategory.name}</h1>
                        <hr />
                    </div> : null
                }
                <div className={categoryLayer}>
                    <div>
                        <span className={categoryLink} onClick={this.showCategories} role="link">Catégories</span>
                    </div>
                    {
                        browsingCategories ? <ul className={browseStyle}>
                            <li className={categoryLink} onClick={this.goToCategory.bind(this, "")} role="link">Tous</li>
                            {
                                categories.map<JSX.Element>((c: Category) => <li className={categoryLink} onClick={this.goToCategory.bind(this, c.name)} role="link" key={c._id}>{c.name}</li>)
                            }
                        </ul> : null
                    }
                </div>
            </div>
            <ContainerRenderer presentations={this.props.productions.map<Presentation>((p: Production) => ({
                _id: p._id,
                mainMedia: p.banner,
                alternateMedia: p.background,
                mainText: p.name,
                href: `/${uriFriendlyFormat(p.name)}`
            }))}
                render={5000}
                interval={100}>
                <VerticalMasonryContainer />
            </ContainerRenderer>
        </div>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProductionIndex);
