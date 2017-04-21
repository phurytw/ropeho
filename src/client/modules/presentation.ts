/**
 * @file Redux module that sets presentations for the home page
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import { Dispatch, Action } from "redux";
import { Map, List } from "immutable";
import { ThunkAction } from "redux-thunk";
import { fetchThunk } from "../../common/helpers/fetchUtilities";

import PresentationContainer = Ropeho.Models.PresentationContainer;

// state
export type PresentationState = Map<string, List<PresentationContainer>>;
export const defaultState: PresentationState = Map<string, List<PresentationContainer>>({
    presentations: List<PresentationContainer>()
});

// types
export namespace Actions {
    export type SetPresentations = { presentations: PresentationContainer[] } & Action;
}

// actions types
export namespace ActionTypes {
    export const SET_PRESENTATIONS: string = "ropeho/client/presentation/SET_PRESENTATIONS";
}

// action creators
export const fetchPresentations: (presentations?: PresentationContainer[]) => ThunkAction<Promise<Actions.SetPresentations>, PresentationState, {}> =
    (presentations?: PresentationContainer[]): ThunkAction<Promise<Actions.SetPresentations>, PresentationState, {}> => {
        return fetchThunk<Actions.SetPresentations, PresentationContainer[], PresentationState>(`/api/presentations`, (dispatch: Dispatch<PresentationState>, presentations: PresentationContainer[]) => dispatch<Actions.SetPresentations>({
            type: ActionTypes.SET_PRESENTATIONS,
            presentations
        }));
    };

// reducer
const reducer: (state: PresentationState, action: any & Action) => PresentationState =
    (state: PresentationState = defaultState, action: Action): PresentationState => {
        if (!Map.isMap(state)) {
            state = Map<string, List<PresentationContainer>>({
                presentations: List.of<PresentationContainer>(...(state as any).presentations)
            });
        }
        switch (action.type) {
            case ActionTypes.SET_PRESENTATIONS:
                const presentations: PresentationContainer[] = (action as Actions.SetPresentations).presentations;
                return state.set("presentations", List.of<PresentationContainer>(...presentations));
            default:
                return state;
        }
    };

export default reducer;
