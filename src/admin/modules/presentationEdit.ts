/**
 * @file Redux module that sets the selected presentation
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../typings.d.ts" />
import { Dispatch, Action } from "redux";
import { Record } from "immutable";
import { ThunkAction } from "redux-thunk";
import { Presentation } from "../models";

import Models = Ropeho.Models;

// state
export interface IPresentationEditState {
    presentation: Models.Presentation;
}
const defaultState: IPresentationEditState = {
    presentation: undefined
};
export class PresentationEditState extends Record(defaultState, "PresentationEditState") implements IPresentationEditState {
    public presentation: Presentation;
    constructor(init?: IPresentationEditState) {
        super(init);
    }
}

// types
export namespace Actions {
    export type SetPresentation = { presentation: Models.Presentation } & Action;
}

// actions types
export namespace ActionTypes {
    export const SET_PRESENTATION: string = "ropeho/presentationEdit/SET_PRESENTATION";
}

// action creators
export const setPresentation: (presentation: Models.Presentation) => ThunkAction<Actions.SetPresentation, PresentationEditState, {}> =
    (presentation: Models.Presentation): ThunkAction<Actions.SetPresentation, PresentationEditState, {}> => {
        return (dispatch: Dispatch<PresentationEditState>, getState: () => PresentationEditState): Actions.SetPresentation => {
            return dispatch<Actions.SetPresentation>({
                type: ActionTypes.SET_PRESENTATION,
                presentation
            });
        };
    };

// reducer
const reducer: (state: PresentationEditState, action: any & Action) => PresentationEditState =
    (state: PresentationEditState = new PresentationEditState(), action: Action): PresentationEditState => {
        switch (action.type) {
            case ActionTypes.SET_PRESENTATION:
                return new PresentationEditState({
                    ...state,
                    presentation: (action as Actions.SetPresentation).presentation
                });
            default:
                return state;
        }
    };

export default reducer;
