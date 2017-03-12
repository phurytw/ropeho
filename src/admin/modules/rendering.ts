/**
 * @file Redux module that notices the application if the application was rendered server side
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../typings.d.ts" />
import { Dispatch, Action } from "redux";
import { Record } from "immutable";
import { ThunkAction } from "redux-thunk";

// state
export interface IRenderingState {
    hasRendered: boolean;
}
const defaultState: IRenderingState = {
    hasRendered: false
};
export class RenderingState extends Record(defaultState, "RenderingState") implements IRenderingState {
    public hasRendered: boolean;
    constructor(init?: IRenderingState) {
        super(init);
    }
}

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
    (state: RenderingState = new RenderingState(), action: Action): RenderingState => {
        switch (action.type) {
            case ActionTypes.SET_RENDERED:
                return new RenderingState({
                    ...state,
                    hasRendered: (action as Actions.SetRendered).hasRendered
                });
            default:
                return state;
        }
    };

export default reducer;
