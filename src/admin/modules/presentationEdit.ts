/**
 * @file Redux module that sets the selected presentation
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../typings.d.ts" />
import { Dispatch, Action } from "redux";
import { Map, fromJS } from "immutable";
import { ThunkAction } from "redux-thunk";

import Presentation = Ropeho.Models.Presentation;

// state
export type PresentationEditState = Map<string, Map<string, any>>;
export const defaultState: PresentationEditState = Map<string, any>({
    presentation: Map<string, any>()
});

// types
export namespace Actions {
    export type SetPresentation = { presentation: Presentation } & Action;
}

// actions types
export namespace ActionTypes {
    export const SET_PRESENTATION: string = "ropeho/presentationEdit/SET_PRESENTATION";
}

// action creators
export const setPresentation: (presentation: Presentation) => ThunkAction<Actions.SetPresentation, PresentationEditState, {}> =
    (presentation: Presentation): ThunkAction<Actions.SetPresentation, PresentationEditState, {}> => {
        return (dispatch: Dispatch<PresentationEditState>, getState: () => PresentationEditState): Actions.SetPresentation => {
            return dispatch<Actions.SetPresentation>({
                type: ActionTypes.SET_PRESENTATION,
                presentation
            });
        };
    };

// reducer
const reducer: (state: PresentationEditState, action: any & Action) => PresentationEditState =
    (state: PresentationEditState = defaultState, action: Action): PresentationEditState => {
        if (!Map.isMap(state)) {
            state = fromJS(state);
        }
        switch (action.type) {
            case ActionTypes.SET_PRESENTATION:
                const presentation: Presentation = (action as Actions.SetPresentation).presentation;
                return state.set("presentation", fromJS(presentation));
            default:
                return state;
        }
    };

export default reducer;
