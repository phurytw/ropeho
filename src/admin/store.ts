/**
 * @file Exposes a store factory for the admin application
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="typings.d.ts" />
import { createStore, Store, applyMiddleware, Middleware, compose } from "redux";
import { RopehoAdminState, default as reducer } from "./reducer";
import reduxThunk from "redux-thunk";
import { ActionTypes } from "./modules/error";

import FetchThunkExtras = Ropeho.FetchThunkExtras;

const defaultExtras: FetchThunkExtras = {
    init: {
        credentials: "include"
    },
    error: {
        type: ActionTypes.SET_ERROR
    }
};

export const middlewares: (thunkExtras?: FetchThunkExtras) => Middleware[] =
    (thunkExtras?: FetchThunkExtras): Middleware[] => [reduxThunk.withExtraArgument(thunkExtras)];

// compose with Redux devtools for Chrome
const composeEnhancer: typeof compose = global.window ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose : compose;

const configureStore: (initialState?: RopehoAdminState, thunkExtras?: FetchThunkExtras) => Store<RopehoAdminState> =
    (initialState?: RopehoAdminState, thunkExtras?: FetchThunkExtras): Store<RopehoAdminState> => {
        return createStore<RopehoAdminState>(reducer, initialState, composeEnhancer(applyMiddleware(...middlewares({
            ...defaultExtras,
            ...thunkExtras
        }))));
    };

export default configureStore;
