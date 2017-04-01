/**
 * @file Redux module that handles promise rejections
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../typings.d.ts" />
import { Dispatch, Action } from "redux";
import { Map, fromJS } from "immutable";
import { ThunkAction } from "redux-thunk";

import IErrorResponse = Ropeho.IErrorResponse;

// state
export type ErrorState = Map<string, Map<string, any>>;
export const defaultState: ErrorState = Map<string, Map<string, any>>({
    error: undefined
});

// types
export namespace Actions {
    export type SetError = { error: IErrorResponse } & Action;
}

// actions types
export namespace ActionTypes {
    export const SET_ERROR: string = "ropeho/error/SET_ERROR";
}

// action creators
export const setError: (error?: IErrorResponse) => ThunkAction<Actions.SetError, ErrorState, {}> =
    (error?: IErrorResponse): ThunkAction<Actions.SetError, ErrorState, {}> => {
        return (dispatch: Dispatch<ErrorState>, getState: () => ErrorState) => {
            return dispatch<Actions.SetError>({
                type: ActionTypes.SET_ERROR,
                error
            });
        };
    };

// reducer
const reducer: (state: ErrorState, action: any & Action) => ErrorState =
    (state: ErrorState = defaultState, action: Action): ErrorState => {
        if (!Map.isMap(state)) {
            state = fromJS(state);
        }
        switch (action.type) {
            case ActionTypes.SET_ERROR:
                const error: IErrorResponse = (action as Actions.SetError).error;
                return state.set("error", fromJS(error));
            default:
                return state;
        }
    };

export default reducer;
