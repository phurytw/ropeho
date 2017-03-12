/**
 * @file Redux module that handles promise rejections
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../typings.d.ts" />
import { Dispatch, Action } from "redux";
import { Record } from "immutable";
import { ThunkAction } from "redux-thunk";

import IErrorResponse = Ropeho.IErrorResponse;

// state
export interface IErrorState {
    error: IErrorResponse;
}
const defaultState: IErrorState = {
    error: undefined
};
export class ErrorState extends Record(defaultState, "ErrorState") implements IErrorState {
    public error: IErrorResponse;
    public hasRendered: boolean;
    constructor(init?: IErrorState) {
        super(init);
    }
}

// types
export namespace Actions {
    export type SetError = { error: IErrorResponse } & Action;
}

// actions types
export namespace ActionTypes {
    export const SET_ERROR: string = "ropeho/error/SET_ERROR";
}

// action creators
export const setError: (error: IErrorResponse) => ThunkAction<Actions.SetError, ErrorState, {}> =
    (error: IErrorResponse): ThunkAction<Actions.SetError, ErrorState, {}> => {
        return (dispatch: Dispatch<ErrorState>, getState: () => ErrorState) => {
            return dispatch<Actions.SetError>({
                type: ActionTypes.SET_ERROR,
                error
            });
        };
    };

// reducer
const reducer: (state: ErrorState, action: any & Action) => ErrorState =
    (state: ErrorState = new ErrorState(), action: Action): ErrorState => {
        switch (action.type) {
            case ActionTypes.SET_ERROR:
                return new ErrorState({
                    ...state,
                    error: (action as Actions.SetError).error
                });
            default:
                return state;
        }
    };

export default reducer;
