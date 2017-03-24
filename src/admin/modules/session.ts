/**
 * @file Redux module that manages the currently logged in user
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../test.d.ts" />
import { User } from "../models";
import { Dispatch, Action } from "redux";
import { Record } from "immutable";
import { ThunkAction } from "redux-thunk";
import { fetchThunk } from "../helpers/fetchUtilities";

import Models = Ropeho.Models;

// state
export interface ISessionState {
    user: Models.User;
}
const defaultState: ISessionState = {
    user: undefined
};
export class SessionState extends Record(defaultState, "SessionState") implements ISessionState {
    public user: User;
    constructor(init?: ISessionState) {
        super(init);
    }
}

// types
export namespace Actions {
    export type SetCurrentUser = { user: Models.User } & Action;
}

// actions types
export namespace ActionTypes {
    export const SET_CURRENT_USER: string = "ropeho/session/SET_CURRENT_USER";
}

// action creators
export const login: (email: string, password: string) => ThunkAction<Promise<Actions.SetCurrentUser>, SessionState, {}> =
    (email: string, password: string): ThunkAction<Promise<Actions.SetCurrentUser>, SessionState, {}> => {
        return fetchThunk<Actions.SetCurrentUser, Models.Production[], SessionState>(`/api/auth`,
            {
                body: JSON.stringify({ email, password }),
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            },
            (dispatch: Dispatch<SessionState>, user: Models.User) => dispatch<Actions.SetCurrentUser>({
                type: ActionTypes.SET_CURRENT_USER,
                user
            }));
    };
export const logout: () => ThunkAction<Promise<Actions.SetCurrentUser>, SessionState, {}> =
    (): ThunkAction<Promise<Actions.SetCurrentUser>, SessionState, {}> => {
        return fetchThunk<Actions.SetCurrentUser, Models.Production[], SessionState>(`/api/auth/logout`,
            {
                method: "POST",
            },
            (dispatch: Dispatch<SessionState>, user: Models.User) => dispatch<Actions.SetCurrentUser>({
                type: ActionTypes.SET_CURRENT_USER,
                user: undefined
            }));
    };
export const fetchCurrentUser: () => ThunkAction<Promise<Actions.SetCurrentUser>, SessionState, {}> =
    (): ThunkAction<Promise<Actions.SetCurrentUser>, SessionState, {}> => {
        return fetchThunk<Actions.SetCurrentUser, Models.Production[], SessionState>(`/api/auth`, { credentials: "include" },
            (dispatch: Dispatch<SessionState>, user: Models.User) => dispatch<Actions.SetCurrentUser>({
                type: ActionTypes.SET_CURRENT_USER,
                user
            }));
    };

// reducer
const reducer: (state: SessionState, action: any & Action) => SessionState =
    (state: SessionState = new SessionState(), action: Action): SessionState => {
        switch (action.type) {
            case ActionTypes.SET_CURRENT_USER:
                return new SessionState({
                    ...state,
                    user: (action as Actions.SetCurrentUser).user
                });
            default:
                return state;
        }
    };

export default reducer;
