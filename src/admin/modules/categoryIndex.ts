/**
 * @file Redux module that fetches categories from the server
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
export interface ICategoryIndexState {
    categories: Models.Category[];
}
const defaultState: ICategoryIndexState = {
    categories: []
};
export class CategoryIndexState extends Record(defaultState, "CategoryIndexState") implements ICategoryIndexState {
    public categories: Category[];
    constructor(init?: ICategoryIndexState) {
        super(init);
    }
}

// types
export namespace Actions {
    export type SetCategories = { categories: Models.Category[] } & Action;
}

// actions types
export namespace ActionTypes {
    export const SET_CATEGORIES: string = "ropeho/api/categoriesIndex/SET_CATEGORIES";
}

// action creators
export const fetchCategories: (fields?: string[]) => ThunkAction<Promise<Actions.SetCategories>, CategoryIndexState, {}> =
    (fields?: string[]): ThunkAction<Promise<Actions.SetCategories>, CategoryIndexState, {}> => {
        return fetchThunk<Actions.SetCategories, Models.Category[], CategoryIndexState>(`${API_END_POINT}/api/categories${fields ? `?fields=${join(fields, ",")}` : ""}`, (dispatch: Dispatch<CategoryIndexState>, categories: Models.Category[]) => dispatch<Actions.SetCategories>({
            type: ActionTypes.SET_CATEGORIES,
            categories
        }));
    };

// reducer
const reducer: (state: CategoryIndexState, action: any & Action) => CategoryIndexState =
    (state: CategoryIndexState = new CategoryIndexState(), action: Action): CategoryIndexState => {
        switch (action.type) {
            case ActionTypes.SET_CATEGORIES:
                return new CategoryIndexState({
                    ...state,
                    categories: (action as Actions.SetCategories).categories
                });
            default:
                return state;
        }
    };

export default reducer;
