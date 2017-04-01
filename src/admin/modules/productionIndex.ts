/**
 * @file Redux module that fetches productions from the server
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../typings.d.ts" />
import { Dispatch, Action } from "redux";
import { Map, List, fromJS } from "immutable";
import { ThunkAction } from "redux-thunk";
import { join } from "lodash";
import { fetchThunk } from "../helpers/fetchUtilities";

import Production = Ropeho.Models.Production;

// initial state
export type ProductionIndexState = Map<string, List<any>>;
export const defaultState: ProductionIndexState = Map<string, List<any>>({
    productions: List<any>()
});

// types
export namespace Actions {
    export type SetProductions = { productions: Production[] } & Action;
}

// actions types
export namespace ActionTypes {
    export const SET_PRODUCTIONS: string = "ropeho/productionIndex/SET_PRODUCTIONS";
}

// action creators
export const fetchProductions: (fields?: string[]) => ThunkAction<Promise<Actions.SetProductions>, ProductionIndexState, {}> =
    (fields?: string[]): ThunkAction<Promise<Actions.SetProductions>, ProductionIndexState, {}> => {
        return fetchThunk<Actions.SetProductions, Production[], ProductionIndexState>(`/api/productions${fields ? `?fields=${join(fields, ",")}` : ""}`, (dispatch: Dispatch<ProductionIndexState>, productions: Production[]) => dispatch<Actions.SetProductions>({
            type: ActionTypes.SET_PRODUCTIONS,
            productions
        }));
    };
export const createProduction: (production: Production) => ThunkAction<Promise<Actions.SetProductions>, ProductionIndexState, {}> =
    (production: Production): ThunkAction<Promise<Actions.SetProductions>, ProductionIndexState, {}> => {
        return fetchThunk<Actions.SetProductions, Production[], ProductionIndexState>(`/api/productions`,
            {
                body: JSON.stringify(production),
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            },
            (dispatch: Dispatch<ProductionIndexState>, production: Production, getState: () => ProductionIndexState) => dispatch<Actions.SetProductions>({
                type: ActionTypes.SET_PRODUCTIONS,
                productions: [...getState().get("productions").toJS(), production]
            }));
    };

// reducer
const reducer: (state: ProductionIndexState, action: any & Action) => ProductionIndexState =
    (state: ProductionIndexState = defaultState, action: Action): ProductionIndexState => {
        if (!Map.isMap(state)) {
            state = fromJS(state);
        }
        switch (action.type) {
            case ActionTypes.SET_PRODUCTIONS:
                const productions: Production[] = (action as Actions.SetProductions).productions;
                return state.set("productions", fromJS(productions));
            default:
                return state;
        }
    };

export default reducer;
