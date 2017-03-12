/**
 * @file Redux module that fetches presentation containers from the server
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../typings.d.ts" />
import { Dispatch, Action } from "redux";
import { Record } from "immutable";
import { ThunkAction } from "redux-thunk";
import { API_END_POINT } from "../helpers/resolveEndPoint";
import { join } from "lodash";
import { fetchThunk } from "../helpers/fetchUtilities";
import { PresentationContainer } from "../models";

import Models = Ropeho.Models;

// state
export interface IPresentationContainerIndexState {
    containers: Models.PresentationContainer[];
}
const defaultState: IPresentationContainerIndexState = {
    containers: []
};
export class PresentationContainerIndexState extends Record(defaultState, "PresentationContainerIndexState") implements IPresentationContainerIndexState {
    public containers: PresentationContainer[];
    constructor(init?: IPresentationContainerIndexState) {
        super(init);
    }
}

// types
export namespace Actions {
    export type SetContainers = { containers: Models.PresentationContainer[] } & Action;
}

// actions types
export namespace ActionTypes {
    export const SET_CONTAINERS: string = "ropeho/containerIndex/SET_CONTAINERS";
}

// action creators
export const fetchContainers: (fields?: string[]) => ThunkAction<Promise<Actions.SetContainers>, PresentationContainerIndexState, {}> =
    (fields?: string[]): ThunkAction<Promise<Actions.SetContainers>, PresentationContainerIndexState, {}> => {
        return fetchThunk<Actions.SetContainers, Models.PresentationContainer[], PresentationContainerIndexState>(`${API_END_POINT}/api/presentations${fields ? `?fields=${join(fields, ",")}` : ""}`, (dispatch: Dispatch<PresentationContainerIndexState>, containers: Models.PresentationContainer[]) => dispatch<Actions.SetContainers>({
            type: ActionTypes.SET_CONTAINERS,
            containers
        }));
    };

// reducer
const reducer: (state: PresentationContainerIndexState, action: any & Action) => PresentationContainerIndexState =
    (state: PresentationContainerIndexState = new PresentationContainerIndexState(), action: Action): PresentationContainerIndexState => {
        switch (action.type) {
            case ActionTypes.SET_CONTAINERS:
                return new PresentationContainerIndexState({
                    ...state,
                    containers: (action as Actions.SetContainers).containers
                });
            default:
                return state;
        }
    };

export default reducer;
