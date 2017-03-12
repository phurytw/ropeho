/**
 * @file Redux module that fetch and update a single category from the server
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../typings.d.ts" />
import { Dispatch, Action } from "redux";
import { Record } from "immutable";
import { ThunkAction } from "redux-thunk";
import { API_END_POINT } from "../helpers/resolveEndPoint";
import { join } from "lodash";
import { fetchThunk } from "../helpers/fetchUtilities";
import { Category } from "../models";

import Models = Ropeho.Models;

// state
export interface ICategoryEditState {
    category: Models.Category;
}
const defaultState: ICategoryEditState = {
    category: undefined
};
export class CategoryEditState extends Record(defaultState, "CategoryEditState") implements ICategoryEditState {
    public category: Category;
    constructor(init?: ICategoryEditState) {
        super(init);
    }
}

// types
export namespace Actions {
    export type SetCategory = { category: Models.Category } & Action;
}

// actions types
export namespace ActionTypes {
    export const SET_CATEGORY: string = "ropeho/categoryEdit/SET_CATEGORY";
}

// action creators
export const fetchCategoryById: (id: string, fields?: string[]) => ThunkAction<Promise<Actions.SetCategory>, CategoryEditState, {}> =
    (id: string, fields?: string[]): ThunkAction<Promise<Actions.SetCategory>, CategoryEditState, {}> => {
        return fetchThunk<Actions.SetCategory, Models.Category[], CategoryEditState>(`${API_END_POINT}/api/categories/${id}${fields ? `?fields=${join(fields, ",")}` : ""}`, (dispatch: Dispatch<CategoryEditState>, category: Models.Category) => dispatch<Actions.SetCategory>({
            type: ActionTypes.SET_CATEGORY,
            category
        }));
    };
export const updateCategory: (category: Models.Category) => ThunkAction<Promise<Actions.SetCategory>, CategoryEditState, {}> =
    (category: Models.Category): ThunkAction<Promise<Actions.SetCategory>, CategoryEditState, {}> => {
        return fetchThunk<Actions.SetCategory, Models.Category[], CategoryEditState>(
            `${API_END_POINT}/api/categories/${category._id}`,
            {
                body: JSON.stringify(category),
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                }
            },
            (dispatch: Dispatch<CategoryEditState>, category: Models.Category) => dispatch<Actions.SetCategory>({
                type: ActionTypes.SET_CATEGORY,
                category
            }));
    };
export const deleteCategory: (categoryId: string) => ThunkAction<Promise<Actions.SetCategory>, CategoryEditState, {}> =
    (categoryId: string): ThunkAction<Promise<Actions.SetCategory>, CategoryEditState, {}> => {
        return fetchThunk<Actions.SetCategory, Models.Category[], CategoryEditState>(
            `${API_END_POINT}/api/categories/${categoryId}`, { method: "DELETE" },
            (dispatch: Dispatch<CategoryEditState>, category: Models.Category) => dispatch<Actions.SetCategory>({
                type: ActionTypes.SET_CATEGORY,
                category: undefined
            }));
    };

// reducer
const reducer: (state: CategoryEditState, action: any & Action) => CategoryEditState =
    (state: CategoryEditState = new CategoryEditState(), action: Action): CategoryEditState => {
        switch (action.type) {
            case ActionTypes.SET_CATEGORY:
                return new CategoryEditState({
                    ...state,
                    category: (action as Actions.SetCategory).category
                });
            default:
                return state;
        }
    };

export default reducer;
