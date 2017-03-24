/**
 * @file Rejects fetch if status is 400 or above
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../typings.d.ts" />
import { ThunkAction } from "redux-thunk";
import { Dispatch } from "redux";
import { ErrorCodes } from "../../enum";
import { ADMIN_END_POINT } from "./resolveEndPoint";

/**
 * error handler to put as a then callback to a promise that will reject if the status code is 400 or above
 * @param {Response} response response result from fetch
 */
export const errorHandler: (response: Response) => Promise<Response> =
    (response: Response): Promise<Response> => {
        if (response.status >= 400) {
            return Promise.reject(response);
        } else {
            return Promise.resolve(response);
        }
    };

// tslint:disable:only-arrow-functions
/**
 * Creates a redux thunk that uses fetch and automatically parses the result
 * @param {RequestInfo} input request or requested URL
 * @param {(dispatch:Dispatch<S>,result:R,getState:()=>S)=>A} callback callback executed when the fetch request fulfills it can used to dispatch an action
 * @returns {ThunkAction<Promise<A>,S,{}>} a Redux thunk
 */
export function fetchThunk<A, R, S>(input: RequestInfo, callback?: (dispatch: Dispatch<S>, result: R, getState: () => S) => A): ThunkAction<Promise<A>, S, {}>;
/**
 * Creates a redux thunk that uses fetch and automatically parses the result
 * @param {RequestInfo} input request or requested URL
 * @param {RequestInit} init fetch options
 * @param {(dispatch:Dispatch<S>,result:R,getState:()=>S)=>A} callback callback executed when the fetch request fulfills it can used to dispatch an action
 * @returns {ThunkAction<Promise<A>,S,{}>} a Redux thunk
 */
export function fetchThunk<A, R, S>(input: RequestInfo, init?: RequestInit, callback?: (dispatch: Dispatch<S>, result: R, getState: () => S) => A): ThunkAction<Promise<A>, S, {}>;
export function fetchThunk<A, R, S>(input: RequestInfo, init?: any, callback?: any): ThunkAction<Promise<A>, S, {}> {
    // for the first overload
    if (typeof init === "function") {
        callback = init;
        init = {};
    }
    return (dispatch: Dispatch<S>, getState: () => S, extras: Ropeho.FetchThunkExtras) => {
        // if not absolute path append ADMIN_END_POINT or if specified the host in extras
        if (typeof input === "string") {
            input = input.startsWith("//") ? `https:${input}` : input;
            // tslint:disable-next-line:no-http-string
            if (!input.startsWith("http://") && !input.startsWith("https://")) {
                input = `${extras.host || ADMIN_END_POINT}${input}`;
            }
        }
        return fetch(input, {
            ...extras.init,
            ...init
        })
            .then<Response>(errorHandler)
            .then<A>((response: Response) => response.json().then((result: R) => callback(dispatch, result, getState)))
            .catch((response: Response) => {
                if (response.json) {
                    return response.json().then((error: Ropeho.IErrorResponse) => dispatch({ ...extras.error, error }));
                } else {
                    return Promise.resolve(dispatch({
                        ...extras.error,
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
