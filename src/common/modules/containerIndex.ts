/**
 * @file Redux module that fetches presentation containers from the server
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import { Dispatch, Action } from "redux";
import { Map, List, fromJS } from "immutable";
import { ThunkAction } from "redux-thunk";
import { join } from "lodash";
import { fetchThunk } from "../helpers/fetchUtilities";

import PresentationContainer = Ropeho.Models.PresentationContainer;

// state
export type ContainerIndexState = Map<string, List<any>>;
export const defaultState: ContainerIndexState = Map<string, List<any>>({
    containers: List<any>()
});

// types
export namespace Actions {
    export type SetContainers = { containers: PresentationContainer[] } & Action;
}

// actions types
export namespace ActionTypes {
    export const SET_CONTAINERS: string = "ropeho/containerIndex/SET_CONTAINERS";
}

// action creators
export const fetchContainers: (fields?: string[]) => ThunkAction<Promise<Actions.SetContainers>, ContainerIndexState, {}> =
    (fields?: string[]): ThunkAction<Promise<Actions.SetContainers>, ContainerIndexState, {}> => {
        return fetchThunk<Actions.SetContainers, PresentationContainer[], ContainerIndexState>(`/api/presentations${fields ? `?fields=${join(fields, ",")}` : ""}`, (dispatch: Dispatch<ContainerIndexState>, containers: PresentationContainer[]) => dispatch<Actions.SetContainers>({
            type: ActionTypes.SET_CONTAINERS,
            containers
        }));
    };

// reducer
const reducer: (state: ContainerIndexState, action: any & Action) => ContainerIndexState =
    (state: ContainerIndexState = defaultState, action: Action): ContainerIndexState => {
        if (!Map.isMap(state)) {
            state = fromJS(state);
        }
        switch (action.type) {
            case ActionTypes.SET_CONTAINERS:
                const containers: PresentationContainer[] = (action as Actions.SetContainers).containers;
                return state.set("containers", fromJS(containers));
            default:
                return state;
        }
    };

export default reducer;
