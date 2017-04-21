/**
 * @file Redux module that fetches productions
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import { Dispatch, Action } from "redux";
import { Map, List } from "immutable";
import { ThunkAction } from "redux-thunk";
import { fetchThunk } from "../../common/helpers/fetchUtilities";

import Production = Ropeho.Models.Production;

// state
export type ProductionIndexState = Map<string, List<Production>>;
export const defaultState: ProductionIndexState = Map<string, List<Production>>({
    productions: List<Production>()
});

// types
export namespace Actions {
    export type SetProductions = { productions: Production[] } & Action;
}

// actions types
export namespace ActionTypes {
    export const SET_PRODUCTIONS: string = "ropeho/client/productionIndex/SET_PRODUCTIONS";
}

// action creators
export const fetchProductions: (productions?: Production[]) => ThunkAction<Promise<Actions.SetProductions>, ProductionIndexState, {}> =
    (productions?: Production[]): ThunkAction<Promise<Actions.SetProductions>, ProductionIndexState, {}> => {
        return fetchThunk<Actions.SetProductions, Production[], ProductionIndexState>(`/api/productions`, (dispatch: Dispatch<ProductionIndexState>, productions: Production[]) => dispatch<Actions.SetProductions>({
            type: ActionTypes.SET_PRODUCTIONS,
            productions
        }));
    };

// reducer
const reducer: (state: ProductionIndexState, action: any & Action) => ProductionIndexState =
    (state: ProductionIndexState = defaultState, action: Action): ProductionIndexState => {
        if (!Map.isMap(state)) {
            state = Map<string, List<Production>>({
                productions: List.of<Production>(...(state as any).productions)
            });
        }
        switch (action.type) {
            case ActionTypes.SET_PRODUCTIONS:
                const productions: Production[] = (action as Actions.SetProductions).productions;
                return state.set("productions", List.of<Production>(...productions));
            default:
                return state;
        }
    };

export default reducer;
