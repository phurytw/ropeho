/**
 * @file Redux module that fetches categories from the server
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import { Dispatch, Action } from "redux";
import { Map, fromJS, List } from "immutable";
import { ThunkAction } from "redux-thunk";
import { join } from "lodash";
import { fetchThunk } from "../helpers/fetchUtilities";

import Category = Ropeho.Models.Category;

// state
export type CategoryIndexState = Map<string, List<any>>;
export const defaultState: CategoryIndexState = Map<string, List<any>>({
    categories: Map<string, any>()
});

// types
export namespace Actions {
    export type SetCategories = { categories: Category[] } & Action;
}

// actions types
export namespace ActionTypes {
    export const SET_CATEGORIES: string = "ropeho/api/categoriesIndex/SET_CATEGORIES";
}

// action creators
export const fetchCategories: (fields?: string[]) => ThunkAction<Promise<Actions.SetCategories>, CategoryIndexState, {}> =
    (fields?: string[]): ThunkAction<Promise<Actions.SetCategories>, CategoryIndexState, {}> => {
        return fetchThunk<Actions.SetCategories, Category[], CategoryIndexState>(`/api/categories${fields ? `?fields=${join(fields, ",")}` : ""}`, (dispatch: Dispatch<CategoryIndexState>, categories: Category[]) => dispatch<Actions.SetCategories>({
            type: ActionTypes.SET_CATEGORIES,
            categories
        }));
    };

// reducer
const reducer: (state: CategoryIndexState, action: any & Action) => CategoryIndexState =
    (state: CategoryIndexState = defaultState, action: Action): CategoryIndexState => {
        if (!Map.isMap(state)) {
            state = fromJS(state);
        }
        switch (action.type) {
            case ActionTypes.SET_CATEGORIES:
                const categories: Category[] = (action as Actions.SetCategories).categories;
                return state.set("categories", fromJS(categories));
            default:
                return state;
        }
    };

export default reducer;
