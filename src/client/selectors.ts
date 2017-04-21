/**
 * @file Redux selectors to use throughout the application
 * @author François Nguyen
 */
/// <reference path="./typings.d.ts" />
import { RopehoClientState } from "./reducer";
import { Map, List } from "immutable";
import uriFriendlyFormat from "../common/helpers/uriFriendlyFormat";

import PresentationContainer = Ropeho.Models.PresentationContainer;
import Production = Ropeho.Models.Production;
import Category = Ropeho.Models.Category;

export const getHasRendered: (state: RopehoClientState) => boolean =
    (state: RopehoClientState): boolean => state.rendering.get("hasRendered");

export const getError: (state: RopehoClientState) => Ropeho.IErrorResponse =
    (state: RopehoClientState): Ropeho.IErrorResponse => {
        const error: Map<string, any> = state.error.get("error");
        return error && error.toJS();
    };

export const getProductions: (state: RopehoClientState) => Production[] =
    (state: RopehoClientState): Production[] => {
        return state.productionIndex.get("productions").toArray();
    };

export const getPresentations: (state: RopehoClientState) => PresentationContainer[] =
    (state: RopehoClientState): PresentationContainer[] => {
        return state.presentation.get("presentations").toArray();
    };

export const getCategories: (state: RopehoClientState) => Category[] =
    (state: RopehoClientState): Category[] => {
        return (state.categoryIndex.get("categories") as List<Category>).toArray();
    };

export const getSelectedCategory: (state: RopehoClientState) => Category =
    (state: RopehoClientState): Category => {
        let category: Category;
        const selected: string = state.categoryIndex.get("selected") as string;
        (state.categoryIndex.get("categories") as List<Category>).forEach((c: Category) => {
            if (uriFriendlyFormat(c.name) === selected) {
                category = c;
                return;
            }
        });
        return category;
    };

export const getProductionsFromSelectedCategory: (state: RopehoClientState) => Production[] =
    (state: RopehoClientState): Production[] => {
        const selectedCategory: Category = getSelectedCategory(state);
        if (selectedCategory) {
            return state.productionIndex.get("productions").filter((p: Production) => selectedCategory.productionIds.indexOf(p._id) >= 0).toArray();
        } else {
            return state.productionIndex.get("productions").toArray();
        }
    };

export const getSelectedProduction: (state: RopehoClientState) => Production =
    (state: RopehoClientState): Production => {
        return state.production.getIn(["productions", state.production.get("selected")]);
    };

export const getCategoriesFromSelectedProduction: (state: RopehoClientState) => Category[] =
    (state: RopehoClientState): Category[] => {
        const selected: Production = state.production.getIn(["productions", state.production.get("selected")]);
        let categories: Category[] = [];
        (state.categoryIndex.get("categories") as List<Category>).forEach((c: Category) => {
            if (c.productionIds.indexOf(selected._id) >= 0) {
                categories = [...categories, c];
            }
        });
        return categories;
    };
