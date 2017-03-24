/**
 * @file Redux module that fetches productions from the server
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
export interface IProductionIndexState {
    productions: Models.Production[];
}
const defaultState: IProductionIndexState = {
    productions: []
};
export class ProductionIndexState extends Record(defaultState, "ProductionIndexState") implements IProductionIndexState {
    public productions: Production[];
    constructor(init?: IProductionIndexState) {
        super(init);
    }
}

// types
export namespace Actions {
    export type SetProductions = { productions: Models.Production[] } & Action;
}

// actions types
export namespace ActionTypes {
    export const SET_PRODUCTIONS: string = "ropeho/productionIndex/SET_PRODUCTIONS";
}

// action creators
export const fetchProductions: (fields?: string[]) => ThunkAction<Promise<Actions.SetProductions>, ProductionIndexState, {}> =
    (fields?: string[]): ThunkAction<Promise<Actions.SetProductions>, ProductionIndexState, {}> => {
        return fetchThunk<Actions.SetProductions, Models.Production[], ProductionIndexState>(`/api/productions${fields ? `?fields=${join(fields, ",")}` : ""}`, (dispatch: Dispatch<ProductionIndexState>, productions: Models.Production[]) => dispatch<Actions.SetProductions>({
            type: ActionTypes.SET_PRODUCTIONS,
            productions
        }));
    };
export const createProduction: (production: Models.Production) => ThunkAction<Promise<Actions.SetProductions>, ProductionIndexState, {}> =
    (production: Models.Production): ThunkAction<Promise<Actions.SetProductions>, ProductionIndexState, {}> => {
        return fetchThunk<Actions.SetProductions, Models.Production[], ProductionIndexState>(`/api/productions`,
            {
                body: JSON.stringify(production),
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            },
            (dispatch: Dispatch<ProductionIndexState>, production: Models.Production, getState: () => ProductionIndexState) => dispatch<Actions.SetProductions>({
                type: ActionTypes.SET_PRODUCTIONS,
                productions: [...getState().productions, production]
            }));
    };

// reducer
const reducer: (state: ProductionIndexState, action: any & Action) => ProductionIndexState =
    (state: ProductionIndexState = new ProductionIndexState(), action: Action): ProductionIndexState => {
        switch (action.type) {
            case ActionTypes.SET_PRODUCTIONS:
                return new ProductionIndexState({
                    ...state,
                    productions: (action as Actions.SetProductions).productions
                });
            default:
                return state;
        }
    };

export default reducer;
