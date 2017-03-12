/**
 * @file Exposes a store factory for the admin application
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="typings.d.ts" />
import { createStore, Store, applyMiddleware, Middleware, compose } from "redux";
import { RopehoAdminState, default as reducer } from "./reducer";
import reduxThunk from "redux-thunk";
import { ActionTypes } from "./modules/error";

export const middlewares: Middleware[] = [reduxThunk.withExtraArgument({ type: ActionTypes.SET_ERROR })];

// compose with Redux devtools for Chrome
const composeEnhancer: typeof compose = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const configureStore: (initialState?: RopehoAdminState) => Store<RopehoAdminState> =
    (initialState?: RopehoAdminState): Store<RopehoAdminState> => {
        return createStore<RopehoAdminState>(reducer, initialState, composeEnhancer(applyMiddleware(...middlewares)));
    };

export default configureStore;
