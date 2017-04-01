/**
 * @file Redux module that notices the application if the application was rendered server side
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../typings.d.ts" />
import { Dispatch, Action } from "redux";
import { Map, fromJS } from "immutable";
import { ThunkAction } from "redux-thunk";

// state
export type RenderingState = Map<string, boolean>;
export const defaultState: RenderingState = Map<string, boolean>({
    hasRendered: false
});

// types
export namespace Actions {
    export type SetRendered = { hasRendered: boolean } & Action;
}

// actions types
export namespace ActionTypes {
    export const SET_RENDERED: string = "ropeho/rendering/SET_RENDERED";
}

// action creators
export const setRendered: (hasRendered: boolean) => ThunkAction<Actions.SetRendered, RenderingState, boolean> =
    (hasRendered: boolean): ThunkAction<Actions.SetRendered, RenderingState, boolean> => {
        return (dispatch: Dispatch<RenderingState>, getState: () => RenderingState) => {
            return dispatch<Actions.SetRendered>({
                type: ActionTypes.SET_RENDERED,
                hasRendered
            });
        };
    };

// reducer
const reducer: (state: RenderingState, action: any & Action) => RenderingState =
    (state: RenderingState = defaultState, action: Action): RenderingState => {
        if (!Map.isMap(state)) {
            state = fromJS(state);
        }
        switch (action.type) {
            case ActionTypes.SET_RENDERED:
                const hasRendered: boolean = (action as Actions.SetRendered).hasRendered;
                return state.set("hasRendered", hasRendered);
            default:
                return state;
        }
    };

export default reducer;
