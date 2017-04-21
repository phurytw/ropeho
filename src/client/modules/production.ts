/**
 * @file Redux module that fetches the selected production from the server
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import { Dispatch, Action } from "redux";
import { Map } from "immutable";
import { ThunkAction } from "redux-thunk";
import { join } from "lodash";
import { fetchThunk } from "../../common/helpers/fetchUtilities";
import uriFriendlyFormat from "../../common/helpers/uriFriendlyFormat";

import Production = Ropeho.Models.Production;

// initial state
export type ProductionState = Map<string, Map<string, Production> | string>;
export const defaultState: ProductionState = Map<string, Map<string, Production> | string>({
    productions: Map<string, Production>(),
    selected: undefined
});

// types
export namespace Actions {
    export type SetProductions = { productions: Production[] } & Action;
    export type SelectProduction = { name: string } & Action;
}

// actions types
export namespace ActionTypes {
    export const SET_PRODUCTIONS: string = "ropeho/client/production/SET_PRODUCTIONS";
    export const SELECT_PRODUCTION: string = "ropeho/client/production/SELECT_PRODUCTION";
}

// action creators
export const fetchSingleProduction: (name: string, fields?: string[]) => ThunkAction<Promise<Actions.SetProductions>, ProductionState, {}> =
    (name: string, fields?: string[]): ThunkAction<Promise<Actions.SetProductions>, ProductionState, {}> => {
        name = uriFriendlyFormat(name);
        return fetchThunk<Actions.SetProductions, Production[], ProductionState>(`/api/productions?name=${name}${fields ? `&fields=${join(fields, ",")}` : ""}`, (dispatch: Dispatch<ProductionState>, productions: Production[]) => dispatch<Actions.SetProductions>({
            type: ActionTypes.SET_PRODUCTIONS,
            productions
        }));
    };
export const selectProduction: (name: string) => ThunkAction<Actions.SelectProduction, ProductionState, {}> =
    (name: string): ThunkAction<Actions.SelectProduction, ProductionState, {}> =>
        (dispatch: Dispatch<ProductionState>) => dispatch<Actions.SelectProduction>({
            type: ActionTypes.SELECT_PRODUCTION,
            name: typeof name === "string" ? uriFriendlyFormat(name) : name
        });

// reducer
const reducer: (state: ProductionState, action: any & Action) => ProductionState =
    (state: ProductionState = defaultState, action: Action): ProductionState => {
        if (!Map.isMap(state)) {
            state = Map<string, Map<string, Production> | string>({
                productions: Map<string, Production>((state as any).productions),
                selected: (state as any).selected
            });
        }
        switch (action.type) {
            case ActionTypes.SET_PRODUCTIONS:
                const productions: Production[] = (action as Actions.SetProductions).productions;
                return state.updateIn(["productions"], (pMap: Map<string, Production>) => {
                    for (const p of productions) {
                        pMap = pMap.set(uriFriendlyFormat(p.name), p);
                    }
                    return pMap;
                });
            case ActionTypes.SELECT_PRODUCTION:
                const { name }: Actions.SelectProduction = action as Actions.SelectProduction;
                return state.set("selected", name);
            default:
                return state;
        }
    };

export default reducer;
