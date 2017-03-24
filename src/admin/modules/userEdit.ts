/**
 * @file Redux module that fetch and update a single user from the server
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../typings.d.ts" />
import { Dispatch, Action } from "redux";
import { Record } from "immutable";
import { ThunkAction } from "redux-thunk";
import { join } from "lodash";
import { fetchThunk } from "../helpers/fetchUtilities";
import { User } from "../models";

import Models = Ropeho.Models;

// state
export interface IUserEditState {
    user: Models.User;
}
const defaultState: IUserEditState = {
    user: undefined
};
export class UserEditState extends Record(defaultState, "UserEditState") implements IUserEditState {
    public user: User;
    constructor(init?: IUserEditState) {
        super(init);
    }
}

// types
export namespace Actions {
    export type SetUser = { user: Models.User } & Action;
}

// actions types
export namespace ActionTypes {
    export const SET_USER: string = "ropeho/userEdit/SET_USER";
}

// action creators
export const fetchUserById: (id: string, fields?: string[]) => ThunkAction<Promise<Actions.SetUser>, UserEditState, {}> =
    (id: string, fields?: string[]): ThunkAction<Promise<Actions.SetUser>, UserEditState, {}> => {
        return fetchThunk<Actions.SetUser, Models.User[], UserEditState>(`/api/users/${id}${fields ? `?fields=${join(fields, ",")}` : ""}`, (dispatch: Dispatch<UserEditState>, user: Models.User) => dispatch<Actions.SetUser>({
            type: ActionTypes.SET_USER,
            user
        }));
    };
export const updateUser: (user: Models.User) => ThunkAction<Promise<Actions.SetUser>, UserEditState, {}> =
    (user: Models.User): ThunkAction<Promise<Actions.SetUser>, UserEditState, {}> => {
        return fetchThunk<Actions.SetUser, Models.User[], UserEditState>(
            `/api/users/${user._id}`,
            {
                body: JSON.stringify(user),
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                }
            },
            (dispatch: Dispatch<UserEditState>, production: Models.User) => dispatch<Actions.SetUser>({
                type: ActionTypes.SET_USER,
                user
            }));
    };
export const deleteUser: (userId: string) => ThunkAction<Promise<Actions.SetUser>, UserEditState, {}> =
    (userId: string): ThunkAction<Promise<Actions.SetUser>, UserEditState, {}> => {
        return fetchThunk<Actions.SetUser, Models.User[], UserEditState>(
            `/api/users/${userId}`, { method: "DELETE", },
            (dispatch: Dispatch<UserEditState>, production: Models.User) => dispatch<Actions.SetUser>({
                type: ActionTypes.SET_USER,
                user: undefined
            }));
    };

// reducer
const reducer: (state: UserEditState, action: any & Action) => UserEditState =
    (state: UserEditState = new UserEditState(), action: Action): UserEditState => {
        switch (action.type) {
            case ActionTypes.SET_USER:
                return new UserEditState({
                    ...state,
                    user: (action as Actions.SetUser).user
                });
            default:
                return state;
        }
    };

export default reducer;
