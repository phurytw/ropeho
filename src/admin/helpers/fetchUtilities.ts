/**
 * @file Rejects fetch if status is 400 or above
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../typings.d.ts" />
import { ThunkAction } from "redux-thunk";
import { Dispatch, Action } from "redux";
import { ErrorCodes } from "../../enum";

// error handler to put as a then callback to a promise that will reject if the status code is 400 or above
export const errorHandler: (response: Response) => Promise<Response> =
    (response: Response): Promise<Response> => {
        if (response.status >= 400) {
            return Promise.reject(response);
        } else if (response.status) {
            return Promise.resolve(response);
        } else {

        }
    };

export function fetchThunk<A, R, S>(input: RequestInfo, init?: (dispatch: Dispatch<S>, result: R, getState: () => S) => A): ThunkAction<Promise<A>, S, {}>;
export function fetchThunk<A, R, S>(input: RequestInfo, init?: RequestInit, callback?: (dispatch: Dispatch<S>, result: R, getState: () => S) => A): ThunkAction<Promise<A>, S, {}>;
export function fetchThunk<A, R, S>(input: RequestInfo, init?: any, callback?: any): ThunkAction<Promise<A>, S, {}> {
    if (typeof init === "function") {
        callback = init;
        init = undefined;
    }
    return (dispatch: Dispatch<S>, getState: () => S, errorAction: { error: Ropeho.IErrorResponse } & Action) => {
        return fetch(input, init)
            .then<Response>(errorHandler)
            .then<A>((response: Response) => response.json().then((result: R) => callback(dispatch, result, getState)))
            .catch((response: Response) => {
                if (response.json) {
                    return response.json().then((error: Ropeho.IErrorResponse) => dispatch({ ...errorAction, error }));
                } else {
                    return Promise.resolve(dispatch({
                        ...errorAction,
                        error: {
                            errorCode: ErrorCodes.UnexpectedError,
                            status: 500,
                            developerMessage: response.toString(),
                            userMessage: "Une erreur s'est produite"
                        } as Ropeho.IErrorResponse
                    }));
                }
            });
    };
}
