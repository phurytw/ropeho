/**
 * @file Redux module that fetch and update a single user from the server
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../typings.d.ts" />
import { Dispatch, Action } from "redux";
import { Map, fromJS } from "immutable";
import { ThunkAction } from "redux-thunk";
import { join } from "lodash";
import { fetchThunk } from "../../common/helpers/fetchUtilities";

import User = Ropeho.Models.User;

// state
export type UserEditState = Map<string, Map<string, any>>;
export const defaultState: UserEditState = Map<string, Map<string, any>>({
    user: Map<string, any>()
});

// types
export namespace Actions {
    export type SetUser = { user: User } & Action;
}

// actions types
export namespace ActionTypes {
    export const SET_USER: string = "ropeho/userEdit/SET_USER";
}

// action creators
export const fetchUserById: (id: string, fields?: string[]) => ThunkAction<Promise<Actions.SetUser>, UserEditState, {}> =
    (id: string, fields?: string[]): ThunkAction<Promise<Actions.SetUser>, UserEditState, {}> => {
        return fetchThunk<Actions.SetUser, User[], UserEditState>(`/api/users/${id}${fields ? `?fields=${join(fields, ",")}` : ""}`, (dispatch: Dispatch<UserEditState>, user: User) => dispatch<Actions.SetUser>({
            type: ActionTypes.SET_USER,
            user
        }));
    };
export const updateUser: (user: User) => ThunkAction<Promise<Actions.SetUser>, UserEditState, {}> =
    (user: User): ThunkAction<Promise<Actions.SetUser>, UserEditState, {}> => {
        return fetchThunk<Actions.SetUser, User[], UserEditState>(
            `/api/users/${user._id}`,
            {
                body: JSON.stringify(user),
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                }
            },
            (dispatch: Dispatch<UserEditState>, production: User) => dispatch<Actions.SetUser>({
                type: ActionTypes.SET_USER,
                user
            }));
    };
export const deleteUser: (userId: string) => ThunkAction<Promise<Actions.SetUser>, UserEditState, {}> =
    (userId: string): ThunkAction<Promise<Actions.SetUser>, UserEditState, {}> => {
        return fetchThunk<Actions.SetUser, User[], UserEditState>(
            `/api/users/${userId}`, { method: "DELETE", },
            (dispatch: Dispatch<UserEditState>, production: User) => dispatch<Actions.SetUser>({
                type: ActionTypes.SET_USER,
                user: undefined
            }));
    };

// reducer
const reducer: (state: UserEditState, action: any & Action) => UserEditState =
    (state: UserEditState = defaultState, action: Action): UserEditState => {
        if (!Map.isMap(state)) {
            state = fromJS(state);
        }
        switch (action.type) {
            case ActionTypes.SET_USER:
                const user: User = (action as Actions.SetUser).user;
                return state.set("user", fromJS(user));
            default:
                return state;
        }
    };

export default reducer;
