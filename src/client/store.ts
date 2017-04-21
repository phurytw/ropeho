/**
 * @file Exposes a store factory for the admin application
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="typings.d.ts" />
import { createStore, Store, applyMiddleware, Middleware, compose } from "redux";
import { RopehoClientState, default as reducer } from "./reducer";
import reduxThunk from "redux-thunk";
import { ActionTypes } from "../common/modules/error";
import { CLIENT_END_POINT } from "../common/helpers/resolveEndPoint";

import FetchThunkExtras = Ropeho.FetchThunkExtras;

const defaultExtras: FetchThunkExtras = {
    host: CLIENT_END_POINT,
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

const configureStore: (initialState?: RopehoClientState, thunkExtras?: FetchThunkExtras) => Store<RopehoClientState> =
    (initialState?: RopehoClientState, thunkExtras?: FetchThunkExtras): Store<RopehoClientState> => {
        return createStore<RopehoClientState>(reducer, initialState, composeEnhancer(applyMiddleware(...middlewares({
            ...defaultExtras,
            ...thunkExtras
        }))));
    };

export default configureStore;
