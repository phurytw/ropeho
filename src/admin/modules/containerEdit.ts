/**
 * @file Redux module that fetch and update a single presentation container from the server
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../typings.d.ts" />
import { Dispatch, Action } from "redux";
import { Record } from "immutable";
import { ThunkAction } from "redux-thunk";
import { API_END_POINT } from "../helpers/resolveEndPoint";
import { join } from "lodash";
import { fetchThunk } from "../helpers/fetchUtilities";
import { Presentation } from "../models";

import Models = Ropeho.Models;

// state
export interface IProductionContainerEditState {
    container: Models.PresentationContainer;
}
const defaultState: IProductionContainerEditState = {
    container: undefined
};
export class PresentationContainerEditState extends Record(defaultState, "PresentationContainerEditState") implements IProductionContainerEditState {
    public container: Presentation;
    constructor(init?: IProductionContainerEditState) {
        super(init);
    }
}

// types
export namespace Actions {
    export type SetContainer = { container: Models.PresentationContainer } & Action;
}

// actions types
export namespace ActionTypes {
    export const SET_CONTAINER: string = "ropeho/containerEdit/SET_CONTAINER";
}

// action creators
export const fetchContainerByid: (id: string, fields?: string[]) => ThunkAction<Promise<Actions.SetContainer>, PresentationContainerEditState, {}> =
    (id: string, fields?: string[]): ThunkAction<Promise<Actions.SetContainer>, PresentationContainerEditState, {}> => {
        return fetchThunk<Actions.SetContainer, Models.PresentationContainer[], PresentationContainerEditState>(`${API_END_POINT}/api/presentations/${id}${fields ? `?fields=${join(fields, ",")}` : ""}`, (dispatch: Dispatch<PresentationContainerEditState>, container: Models.PresentationContainer) => dispatch<Actions.SetContainer>({
            type: ActionTypes.SET_CONTAINER,
            container
        }));
    };
export const updateContainer: (container: Models.PresentationContainer) => ThunkAction<Promise<Actions.SetContainer>, PresentationContainerEditState, {}> =
    (container: Models.PresentationContainer): ThunkAction<Promise<Actions.SetContainer>, PresentationContainerEditState, {}> => {
        return fetchThunk<Actions.SetContainer, Models.PresentationContainer[], PresentationContainerEditState>(
            `${API_END_POINT}/api/presentations/${container._id}`,
            {
                body: JSON.stringify(container),
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                }
            },
            (dispatch: Dispatch<PresentationContainerEditState>, container: Models.PresentationContainer) => dispatch<Actions.SetContainer>({
                type: ActionTypes.SET_CONTAINER,
                container
            }));
    };
export const deleteContainer: (containerId: string) => ThunkAction<Promise<Actions.SetContainer>, PresentationContainerEditState, {}> =
    (containerId: string): ThunkAction<Promise<Actions.SetContainer>, PresentationContainerEditState, {}> => {
        return fetchThunk<Actions.SetContainer, Models.Category[], PresentationContainerEditState>(
            `${API_END_POINT}/api/presentations/${containerId}`, { method: "DELETE" },
            (dispatch: Dispatch<PresentationContainerEditState>, category: Models.Category) => dispatch<Actions.SetContainer>({
                type: ActionTypes.SET_CONTAINER,
                container: undefined
            }));
    };

// reducer
const reducer: (state: PresentationContainerEditState, action: any & Action) => PresentationContainerEditState =
    (state: PresentationContainerEditState = new PresentationContainerEditState(), action: Action): PresentationContainerEditState => {
        switch (action.type) {
            case ActionTypes.SET_CONTAINER:
                return new PresentationContainerEditState({
                    ...state,
                    container: (action as Actions.SetContainer).container
                });
            default:
                return state;
        }
    };

export default reducer;
