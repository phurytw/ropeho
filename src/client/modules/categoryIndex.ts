/**
 * @file Redux module that fetches categories
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import { Dispatch, Action } from "redux";
import { Map, List } from "immutable";
import { ThunkAction } from "redux-thunk";
import { fetchThunk } from "../../common/helpers/fetchUtilities";
import uriFriendlyFormat from "../../common/helpers/uriFriendlyFormat";

import Category = Ropeho.Models.Category;

// state
export type CategoryIndexState = Map<string, List<Category> | string>;
export const defaultState: CategoryIndexState = Map<string, List<Category> | string>({
    categories: List<Category>(),
    selected: undefined
});

// types
export namespace Actions {
    export type SetCategories = { categories: Category[] } & Action;
    export type SelectCategory = { name: string } & Action;
}

// actions types
export namespace ActionTypes {
    export const SET_CATEGORIES: string = "ropeho/client/categoryIndex/SET_CATEGORIES";
    export const SELECT_CATEGORY: string = "ropeho/client/categoryIndex/SELECT_CATEGORY";
}

// action creators
export const fetchCategories: (categories?: Category[]) => ThunkAction<Promise<Actions.SetCategories>, CategoryIndexState, {}> =
    (categories?: Category[]): ThunkAction<Promise<Actions.SetCategories>, CategoryIndexState, {}> => {
        return fetchThunk<Actions.SetCategories, Category[], CategoryIndexState>(`/api/categories`, (dispatch: Dispatch<CategoryIndexState>, categories: Category[]) => dispatch<Actions.SetCategories>({
            type: ActionTypes.SET_CATEGORIES,
            categories
        }));
    };
export const selectCategory: (name: string) => ThunkAction<Actions.SelectCategory, CategoryIndexState, {}> =
    (name: string): ThunkAction<Actions.SelectCategory, CategoryIndexState, {}> =>
        (dispatch: Dispatch<CategoryIndexState>) => dispatch<Actions.SelectCategory>({
            type: ActionTypes.SELECT_CATEGORY,
            name: typeof name === "string" ? uriFriendlyFormat(name) : name
        });

// reducer
const reducer: (state: CategoryIndexState, action: any & Action) => CategoryIndexState =
    (state: CategoryIndexState = defaultState, action: Action): CategoryIndexState => {
        if (!Map.isMap(state)) {
            state = Map<string, List<Category>>({
                categories: List.of<Category>(...(state as any).categories),
                selected: (state as any).selected
            });
        }
        switch (action.type) {
            case ActionTypes.SET_CATEGORIES:
                const categories: Category[] = (action as Actions.SetCategories).categories;
                return state.set("categories", List.of<Category>(...categories));
            case ActionTypes.SELECT_CATEGORY:
                const { name }: Actions.SelectCategory = action as Actions.SelectCategory;
                return state.set("selected", name);
            default:
                return state;
        }
    };

export default reducer;
