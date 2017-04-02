/**
 * @file Redux module that fetch and update a single production from the server
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../typings.d.ts" />
import { Dispatch, Action } from "redux";
import { Map, fromJS } from "immutable";
import { ThunkAction } from "redux-thunk";
import { join } from "lodash";
import { fetchThunk } from "../../common/helpers/fetchUtilities";

import Production = Ropeho.Models.Production;

// state
export type ProductionEditState = Map<string, Map<string, any>>;
export const defaultState: ProductionEditState = Map<string, any>({
    production: undefined
});

// types
export namespace Actions {
    export type SetProduction = { production: Production } & Action;
}

// actions types
export namespace ActionTypes {
    export const SET_PRODUCTION: string = "ropeho/productionEdit/SET_PRODUCTION";
}

// action creators
export const setProduction: (production: Production) => ThunkAction<Actions.SetProduction, ProductionEditState, {}> =
    (production: Production): ThunkAction<Actions.SetProduction, ProductionEditState, {}> => {
        return (dispatch: Dispatch<ProductionEditState>) => dispatch<Actions.SetProduction>({
            type: ActionTypes.SET_PRODUCTION,
            production
        });
    };
export const fetchProductionById: (id: string, fields?: string[]) => ThunkAction<Promise<Actions.SetProduction>, ProductionEditState, {}> =
    (id: string, fields?: string[]): ThunkAction<Promise<Actions.SetProduction>, ProductionEditState, {}> => {
        return fetchThunk<Actions.SetProduction, Production[], ProductionEditState>(`/api/productions/${id}${fields ? `?fields=${join(fields, ",")}` : ""}`, (dispatch: Dispatch<ProductionEditState>, production: Production) => dispatch<Actions.SetProduction>({
            type: ActionTypes.SET_PRODUCTION,
            production
        }));
    };
export const updateProduction: (production: Production) => ThunkAction<Promise<Actions.SetProduction>, ProductionEditState, {}> =
    (production: Production): ThunkAction<Promise<Actions.SetProduction>, ProductionEditState, {}> => {
        return fetchThunk<Actions.SetProduction, Production[], ProductionEditState>(
            `/api/productions/${production._id}`,
            {
                body: JSON.stringify(production),
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                }
            },
            (dispatch: Dispatch<ProductionEditState>, production: Production) => dispatch<Actions.SetProduction>({
                type: ActionTypes.SET_PRODUCTION,
                production
            }));
    };
export const deleteProduction: (productionId: string) => ThunkAction<Promise<Actions.SetProduction>, ProductionEditState, {}> =
    (productionId: string): ThunkAction<Promise<Actions.SetProduction>, ProductionEditState, {}> => {
        return fetchThunk<Actions.SetProduction, Production[], ProductionEditState>(
            `/api/productions/${productionId}`, { method: "DELETE", },
            (dispatch: Dispatch<ProductionEditState>, production: Production) => dispatch<Actions.SetProduction>({
                type: ActionTypes.SET_PRODUCTION,
                production: undefined
            }));
    };

// reducer
const reducer: (state: ProductionEditState, action: any & Action) => ProductionEditState =
    (state: ProductionEditState = defaultState, action: Action): ProductionEditState => {
        if (!Map.isMap(state)) {
            state = fromJS(state);
        }
        switch (action.type) {
            case ActionTypes.SET_PRODUCTION:
                const production: Production = (action as Actions.SetProduction).production;
                return state.set("production", fromJS(production));
            default:
                return state;
        }
    };

export default reducer;
