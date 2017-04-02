/**
 * @file Redux module that fetch and update a single presentation container from the server
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../typings.d.ts" />
import { Dispatch, Action } from "redux";
import { Map, fromJS } from "immutable";
import { ThunkAction } from "redux-thunk";
import { join } from "lodash";
import { fetchThunk } from "../../common/helpers/fetchUtilities";

import PresentationContainer = Ropeho.Models.PresentationContainer;

// state
export type PresentationContainerEditState = Map<string, Map<string, any>>;
export const defaultState: PresentationContainerEditState = Map<string, Map<string, any>>({
    container: Map<string, any>()
});

// types
export namespace Actions {
    export type SetContainer = { container: PresentationContainer } & Action;
}

// actions types
export namespace ActionTypes {
    export const SET_CONTAINER: string = "ropeho/containerEdit/SET_CONTAINER";
}

// action creators
export const fetchContainerByid: (id: string, fields?: string[]) => ThunkAction<Promise<Actions.SetContainer>, PresentationContainerEditState, {}> =
    (id: string, fields?: string[]): ThunkAction<Promise<Actions.SetContainer>, PresentationContainerEditState, {}> => {
        return fetchThunk<Actions.SetContainer, PresentationContainer[], PresentationContainerEditState>(`/api/presentations/${id}${fields ? `?fields=${join(fields, ",")}` : ""}`, (dispatch: Dispatch<PresentationContainerEditState>, container: PresentationContainer) => dispatch<Actions.SetContainer>({
            type: ActionTypes.SET_CONTAINER,
            container
        }));
    };
export const updateContainer: (container: PresentationContainer) => ThunkAction<Promise<Actions.SetContainer>, PresentationContainerEditState, {}> =
    (container: PresentationContainer): ThunkAction<Promise<Actions.SetContainer>, PresentationContainerEditState, {}> => {
        return fetchThunk<Actions.SetContainer, PresentationContainer[], PresentationContainerEditState>(
            `/api/presentations/${container._id}`,
            {
                body: JSON.stringify(container),
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                }
            },
            (dispatch: Dispatch<PresentationContainerEditState>, container: PresentationContainer) => dispatch<Actions.SetContainer>({
                type: ActionTypes.SET_CONTAINER,
                container
            }));
    };
export const deleteContainer: (containerId: string) => ThunkAction<Promise<Actions.SetContainer>, PresentationContainerEditState, {}> =
    (containerId: string): ThunkAction<Promise<Actions.SetContainer>, PresentationContainerEditState, {}> => {
        return fetchThunk<Actions.SetContainer, {}, PresentationContainerEditState>(
            `/api/presentations/${containerId}`, { method: "DELETE" },
            (dispatch: Dispatch<PresentationContainerEditState>, deleted: {}) => dispatch<Actions.SetContainer>({
                type: ActionTypes.SET_CONTAINER,
                container: undefined
            }));
    };

// reducer
const reducer: (state: PresentationContainerEditState, action: any & Action) => PresentationContainerEditState =
    (state: PresentationContainerEditState = defaultState, action: Action): PresentationContainerEditState => {
        if (!Map.isMap(state)) {
            state = fromJS(state);
        }
        switch (action.type) {
            case ActionTypes.SET_CONTAINER:
                const container: PresentationContainer = (action as Actions.SetContainer).container;
                return state.set("container", fromJS(container));
            default:
                return state;
        }
    };

export default reducer;
