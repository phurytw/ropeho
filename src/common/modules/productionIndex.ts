/**
 * @file Redux module that fetches productions from the server
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import { Dispatch, Action } from "redux";
import { Map, List, fromJS } from "immutable";
import { ThunkAction } from "redux-thunk";
import { join } from "lodash";
import { fetchThunk } from "../helpers/fetchUtilities";

import Production = Ropeho.Models.Production;

// initial state
export type ProductionIndexState = Map<string, Map<string, any> | List<string>>;
export const defaultState: ProductionIndexState = Map<string, Map<string, any> | List<string>>({
    order: List<string>(),
    productions: Map<string, any>()
});

// types
export namespace Actions {
    export type SetProductions = { productions: Production[] } & Action;
    export type AddProduction = { production: Production } & Action;
    export type SetPosition = { productionId: string, position: number } & Action;
}

// actions types
export namespace ActionTypes {
    export const SET_PRODUCTIONS: string = "ropeho/productionIndex/SET_PRODUCTIONS";
    export const ADD_PRODUCTION: string = "ropeho/productionIndex/ADD_PRODUCTION";
    export const SET_POSITION: string = "ropeho/productionIndex/SET_POSITION";
}

// action creators
export const fetchProductions: (fields?: string[]) => ThunkAction<Promise<Actions.SetProductions>, ProductionIndexState, {}> =
    (fields?: string[]): ThunkAction<Promise<Actions.SetProductions>, ProductionIndexState, {}> => {
        return fetchThunk<Actions.SetProductions, Production[], ProductionIndexState>(`/api/productions${fields ? `?fields=${join(fields, ",")}` : ""}`, (dispatch: Dispatch<ProductionIndexState>, productions: Production[]) => dispatch<Actions.SetProductions>({
            type: ActionTypes.SET_PRODUCTIONS,
            productions
        }));
    };
export const createProduction: (production: Production) => ThunkAction<Promise<Actions.AddProduction>, ProductionIndexState, {}> =
    (production: Production): ThunkAction<Promise<Actions.AddProduction>, ProductionIndexState, {}> => {
        return fetchThunk<Actions.AddProduction, Production[], ProductionIndexState>(`/api/productions`,
            {
                body: JSON.stringify(production),
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            },
            (dispatch: Dispatch<ProductionIndexState>, production: Production) => dispatch<Actions.AddProduction>({
                type: ActionTypes.ADD_PRODUCTION,
                production
            }));
    };
export const setProductionPosition: (productionId: string, position: number) => ThunkAction<Actions.SetPosition, ProductionIndexState, {}> =
    (productionId: string, position: number): ThunkAction<Actions.SetPosition, ProductionIndexState, {}> => {
        return (dispatch: Dispatch<ProductionIndexState>) => dispatch<Actions.SetPosition>({
            type: ActionTypes.SET_POSITION,
            productionId,
            position
        });
    };
export const saveOrder: (order: string[]) => ThunkAction<Promise<void>, ProductionIndexState, {}> =
    (order: string[]): ThunkAction<Promise<void>, ProductionIndexState, {}> => {
        return fetchThunk<void, string[], ProductionIndexState>(`/api/productions/order`,
            {
                body: JSON.stringify(order),
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            });
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
                state = state.set("order", List<string>(productions.map<string>((p: Production) => p._id)));
                return state.set("productions", Map<string, any>(productions.map<any[]>((p: Production) => [p._id, fromJS(p)])));
            case ActionTypes.SET_POSITION:
                const { position, productionId }: Actions.SetPosition = action as Actions.SetPosition;
                const prevPosition: number = (state.get("order") as List<string>).indexOf(productionId);
                if (prevPosition >= 0) {
                    return state.updateIn(["order"], (order: List<string>) => order.delete(prevPosition).insert(position, productionId));
                } else {
                    return state;
                }
            case ActionTypes.ADD_PRODUCTION:
                const production: Production = (action as Actions.AddProduction).production;
                state = state.updateIn(["order"], (order: List<string>) => order.push(production._id));
                return state.setIn(["productions", production._id], fromJS(production));
            default:
                return state;
        }
    };

export default reducer;
