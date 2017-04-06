/**
 * @file Redux module that manages the currently logged in user
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../test.d.ts" />
import { Dispatch, Action } from "redux";
import { Map, fromJS } from "immutable";
import { ThunkAction } from "redux-thunk";
import { fetchThunk } from "../helpers/fetchUtilities";

import User = Ropeho.Models.User;
import Production = Ropeho.Models.Production;

// state
export type SessionState = Map<string, Map<string, any>>;
export const defaultState: SessionState = Map<string, Map<string, any>>({
    user: Map<string, any>()
});

// types
export namespace Actions {
    export type SetCurrentUser = { user: User } & Action;
}

// actions types
export namespace ActionTypes {
    export const SET_CURRENT_USER: string = "ropeho/session/SET_CURRENT_USER";
}

// action creators
export const login: (email: string, password: string) => ThunkAction<Promise<Actions.SetCurrentUser>, SessionState, {}> =
    (email: string, password: string): ThunkAction<Promise<Actions.SetCurrentUser>, SessionState, {}> => {
        return fetchThunk<Actions.SetCurrentUser, Production[], SessionState>(`/api/auth`,
            {
                body: JSON.stringify({ email, password }),
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            },
            (dispatch: Dispatch<SessionState>, user: User) => dispatch<Actions.SetCurrentUser>({
                type: ActionTypes.SET_CURRENT_USER,
                user
            }));
    };
export const logout: () => ThunkAction<Promise<Actions.SetCurrentUser>, SessionState, {}> =
    (): ThunkAction<Promise<Actions.SetCurrentUser>, SessionState, {}> => {
        return fetchThunk<Actions.SetCurrentUser, Production[], SessionState>(`/api/auth/logout`,
            {
                method: "POST",
            },
            (dispatch: Dispatch<SessionState>, user: User) => dispatch<Actions.SetCurrentUser>({
                type: ActionTypes.SET_CURRENT_USER,
                user: undefined
            }));
    };
export const fetchCurrentUser: () => ThunkAction<Promise<Actions.SetCurrentUser>, SessionState, {}> =
    (): ThunkAction<Promise<Actions.SetCurrentUser>, SessionState, {}> => {
        return fetchThunk<Actions.SetCurrentUser, Production[], SessionState>(`/api/auth`,
            (dispatch: Dispatch<SessionState>, user: User) => dispatch<Actions.SetCurrentUser>({
                type: ActionTypes.SET_CURRENT_USER,
                user
            }));
    };
export const socketAuthentication: (clientId: string) => ThunkAction<Promise<void>, SessionState, {}> =
    (clientId: string): ThunkAction<Promise<void>, SessionState, {}> => {
        return fetchThunk<void, Production[], SessionState>(`/api/auth/socket/${clientId}`, {
            method: "POST"
        }, () => ({}));
    };

// reducer
const reducer: (state: SessionState, action: any & Action) => SessionState =
    (state: SessionState = defaultState, action: Action): SessionState => {
        if (!Map.isMap(state)) {
            state = fromJS(state);
        }
        switch (action.type) {
            case ActionTypes.SET_CURRENT_USER:
                const user: User = (action as Actions.SetCurrentUser).user;
                return state.set("user", fromJS(user));
            default:
                return state;
        }
    };

export default reducer;
