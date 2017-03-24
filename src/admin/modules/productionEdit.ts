/**
 * @file Redux module that fetch and update a single production from the server
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../typings.d.ts" />
import { Dispatch, Action } from "redux";
import { Record } from "immutable";
import { ThunkAction } from "redux-thunk";
import { join } from "lodash";
import { fetchThunk } from "../helpers/fetchUtilities";
import { Production } from "../models";

import Models = Ropeho.Models;

// state
export interface IProductionEditState {
    production: Models.Production;
}
const defaultState: IProductionEditState = {
    production: undefined
};
export class ProductionEditState extends Record(defaultState, "ProductionEditState") implements IProductionEditState {
    public production: Production;
    constructor(init?: IProductionEditState) {
        super(init);
    }
}

// types
export namespace Actions {
    export type SetProduction = { production: Models.Production } & Action;
}

// actions types
export namespace ActionTypes {
    export const SET_PRODUCTION: string = "ropeho/productionEdit/SET_PRODUCTION";
}

// action creators
export const fetchProductionById: (id: string, fields?: string[]) => ThunkAction<Promise<Actions.SetProduction>, ProductionEditState, {}> =
    (id: string, fields?: string[]): ThunkAction<Promise<Actions.SetProduction>, ProductionEditState, {}> => {
        return fetchThunk<Actions.SetProduction, Models.Production[], ProductionEditState>(`/api/productions/${id}${fields ? `?fields=${join(fields, ",")}` : ""}`, (dispatch: Dispatch<ProductionEditState>, production: Models.Production) => dispatch<Actions.SetProduction>({
            type: ActionTypes.SET_PRODUCTION,
            production
        }));
    };
export const updateProduction: (production: Models.Production) => ThunkAction<Promise<Actions.SetProduction>, ProductionEditState, {}> =
    (production: Models.Production): ThunkAction<Promise<Actions.SetProduction>, ProductionEditState, {}> => {
        return fetchThunk<Actions.SetProduction, Models.Production[], ProductionEditState>(
            `/api/productions/${production._id}`,
            {
                body: JSON.stringify(production),
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                }
            },
            (dispatch: Dispatch<ProductionEditState>, production: Models.Production) => dispatch<Actions.SetProduction>({
                type: ActionTypes.SET_PRODUCTION,
                production
            }));
    };
export const deleteProduction: (productionId: string) => ThunkAction<Promise<Actions.SetProduction>, ProductionEditState, {}> =
    (productionId: string): ThunkAction<Promise<Actions.SetProduction>, ProductionEditState, {}> => {
        return fetchThunk<Actions.SetProduction, Models.Production[], ProductionEditState>(
            `/api/productions/${productionId}`, { method: "DELETE", },
            (dispatch: Dispatch<ProductionEditState>, production: Models.Production) => dispatch<Actions.SetProduction>({
                type: ActionTypes.SET_PRODUCTION,
                production: undefined
            }));
    };

// reducer
const reducer: (state: ProductionEditState, action: any & Action) => ProductionEditState =
    (state: ProductionEditState = new ProductionEditState(), action: Action): ProductionEditState => {
        switch (action.type) {
            case ActionTypes.SET_PRODUCTION:
                return new ProductionEditState({
                    ...state,
                    production: (action as Actions.SetProduction).production
                });
            default:
                return state;
        }
    };

export default reducer;
