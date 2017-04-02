/**
 * @file Redux module that fetch and update a single category from the server
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../typings.d.ts" />
import { Dispatch, Action } from "redux";
import { ThunkAction } from "redux-thunk";
import { join } from "lodash";
import { fetchThunk } from "../../common/helpers/fetchUtilities";
import { Map, fromJS } from "immutable";

import Category = Ropeho.Models.Category;

// state
export type CategoryEditState = Map<string, Map<string, any>>;
export const defaultState: CategoryEditState = Map<string, Map<string, any>>({
    category: Map<string, any>()
});

// types
export namespace Actions {
    export type SetCategory = { category: Category } & Action;
}

// actions types
export namespace ActionTypes {
    export const SET_CATEGORY: string = "ropeho/categoryEdit/SET_CATEGORY";
}

// action creators
export const fetchCategoryById: (id: string, fields?: string[]) => ThunkAction<Promise<Actions.SetCategory>, CategoryEditState, {}> =
    (id: string, fields?: string[]): ThunkAction<Promise<Actions.SetCategory>, CategoryEditState, {}> => {
        return fetchThunk<Actions.SetCategory, Category[], CategoryEditState>(`/api/categories/${id}${fields ? `?fields=${join(fields, ",")}` : ""}`, (dispatch: Dispatch<CategoryEditState>, category: Category) => dispatch<Actions.SetCategory>({
            type: ActionTypes.SET_CATEGORY,
            category
        }));
    };
export const updateCategory: (category: Category) => ThunkAction<Promise<Actions.SetCategory>, CategoryEditState, {}> =
    (category: Category): ThunkAction<Promise<Actions.SetCategory>, CategoryEditState, {}> => {
        return fetchThunk<Actions.SetCategory, Category[], CategoryEditState>(
            `/api/categories/${category._id}`,
            {
                body: JSON.stringify(category),
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                }
            },
            (dispatch: Dispatch<CategoryEditState>, category: Category) => dispatch<Actions.SetCategory>({
                type: ActionTypes.SET_CATEGORY,
                category
            }));
    };
export const deleteCategory: (categoryId: string) => ThunkAction<Promise<Actions.SetCategory>, CategoryEditState, {}> =
    (categoryId: string): ThunkAction<Promise<Actions.SetCategory>, CategoryEditState, {}> => {
        return fetchThunk<Actions.SetCategory, Category[], CategoryEditState>(
            `/api/categories/${categoryId}`, { method: "DELETE" },
            (dispatch: Dispatch<CategoryEditState>, category: Category) => dispatch<Actions.SetCategory>({
                type: ActionTypes.SET_CATEGORY,
                category: undefined
            }));
    };

// reducer
const reducer: (state: CategoryEditState, action: any & Action) => CategoryEditState =
    (state: CategoryEditState = defaultState, action: Action): CategoryEditState => {
        if (!Map.isMap(state)) {
            state = fromJS(state);
        }
        switch (action.type) {
            case ActionTypes.SET_CATEGORY:
                const category: Category = (action as Actions.SetCategory).category;
                return state.set("category", fromJS(category));
            default:
                return state;
        }
    };

export default reducer;
