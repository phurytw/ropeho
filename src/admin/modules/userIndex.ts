/**
 * @file Redux module that fetches users from the server
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
export interface IUserIndexState {
    users: Models.User[];
}
const defaultState: IUserIndexState = {
    users: []
};
export class UserIndexState extends Record(defaultState, "UserIndexState") implements IUserIndexState {
    public users: User[];
    constructor(init?: IUserIndexState) {
        super(init);
    }
}

// types
export namespace Actions {
    export type SetUsers = { users: Models.User[] } & Action;
}

// actions types
export namespace ActionTypes {
    export const SET_USERS: string = "ropeho/userIndex/SET_USERS";
}

// action creators
export const fetchUsers: (fields?: string[]) => ThunkAction<Promise<Actions.SetUsers>, UserIndexState, {}> =
    (fields?: string[]): ThunkAction<Promise<Actions.SetUsers>, UserIndexState, {}> => {
        return fetchThunk<Actions.SetUsers, Models.User[], UserIndexState>(`/api/users${fields ? `?fields=${join(fields, ",")}` : ""}`, (dispatch: Dispatch<UserIndexState>, users: Models.User[]) => dispatch<Actions.SetUsers>({
            type: ActionTypes.SET_USERS,
            users
        }));
    };

// reducer
const reducer: (state: UserIndexState, action: any & Action) => UserIndexState =
    (state: UserIndexState = new UserIndexState(), action: Action): UserIndexState => {
        switch (action.type) {
            case ActionTypes.SET_USERS:
                return new UserIndexState({
                    ...state,
                    users: (action as Actions.SetUsers).users
                });
            default:
                return state;
        }
    };

export default reducer;
