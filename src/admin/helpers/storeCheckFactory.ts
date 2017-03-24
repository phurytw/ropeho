/**
 * @file Function that creates a onEnter hook for react-router routes which checks if the user is allowed to render the route
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../typings.d.ts" />
import { Store } from "redux";
import { ThunkAction } from "redux-thunk";
import { EnterHook, RouterState, RedirectFunction } from "react-router";

type AnyFunction<T> = (...args: any[]) => T;

/**
 * Creates a onEnter hook for a Route that checks if the user is allowed to render the route. Can perform a request if necessary.
 * @param {Store<TStore>} store the application's store
 * @param {Function} selector a selector that gets the data to check
 * @param {Function} verifyCb a function that returns true if the user is allowed to load the content, false otherwise, or null if the request needs to be performed
 * @param {Function} requestData a function that returns a {ThunkAction} that eventually gets the data to verify
 * @param {string} redirectPath the path to be redirected to if the user is not allowed to load the content
 */
const storeCheckFactory: <TStore>(store: Store<TStore>,
    selector: AnyFunction<any>,
    verifyCb: AnyFunction<boolean>,
    requestData: (routerState: RouterState) => ThunkAction<Promise<any>, TStore, {}>,
    redirectPath?: string) => EnterHook = <TStore>(store: Store<TStore>,
        selector: AnyFunction<any>,
        verifyCb: AnyFunction<boolean>,
        requestData: (routerState: RouterState) => ThunkAction<Promise<any>, TStore, {}>,
        redirectPath: string = "/"): EnterHook => {
        return (nextState: RouterState, replace: RedirectFunction, callback?: AnyFunction<any>): void => {
            // if it doesn't have a proper store we redirect the user right away
            if (store && typeof store.getState === "function" && typeof selector === "function" && typeof verifyCb === "function") {
                // get the data to check from the state by using the selector then verify
                const state: TStore = store.getState();
                const dataToCheck: any = selector(state);
                const verify: boolean | null = verifyCb(dataToCheck);
                if (verify) {
                    // user is allowed
                    callback();
                    return;
                } else if (verify === false) {
                    // user is forbidden
                    replace(redirectPath);
                    callback();
                    return;
                } else {
                    // request must be performed
                    if (typeof requestData === "function") {
                        const promise: Promise<any> = store.dispatch(requestData(nextState));
                        if (promise && typeof promise.then === "function") {
                            // re-run this when the request fulfills with the updated store
                            promise.then(
                                () => storeCheckFactory(store, selector, verifyCb, requestData, redirectPath)(nextState, replace, callback),
                                () => storeCheckFactory(store, selector, verifyCb, requestData, redirectPath)(nextState, replace, callback)
                            );
                        } else {
                            // re-run this when the request fulfills with the updated store
                            storeCheckFactory(store, selector, verifyCb, requestData, redirectPath)(nextState, replace, callback);
                        }
                        return;
                    }
                }
            }
            replace(redirectPath);
            callback();
        };
    };

export default storeCheckFactory;
