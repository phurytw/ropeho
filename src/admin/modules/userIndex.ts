/**
 * @file Redux module that fetches users from the server
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../typings.d.ts" />
import { Dispatch, Action } from "redux";
import { Map, List, fromJS } from "immutable";
import { ThunkAction } from "redux-thunk";
import { join } from "lodash";
import { fetchThunk } from "../helpers/fetchUtilities";

import User = Ropeho.Models.User;

// state
export type UserIndexState = Map<string, List<any>>;
export const defaultState: UserIndexState = Map<string, List<any>>({
    users: List<any>()
});

// types
export namespace Actions {
    export type SetUsers = { users: User[] } & Action;
}

// actions types
export namespace ActionTypes {
    export const SET_USERS: string = "ropeho/userIndex/SET_USERS";
}

// action creators
export const fetchUsers: (fields?: string[]) => ThunkAction<Promise<Actions.SetUsers>, UserIndexState, {}> =
    (fields?: string[]): ThunkAction<Promise<Actions.SetUsers>, UserIndexState, {}> => {
        return fetchThunk<Actions.SetUsers, User[], UserIndexState>(`/api/users${fields ? `?fields=${join(fields, ",")}` : ""}`, (dispatch: Dispatch<UserIndexState>, users: User[]) => dispatch<Actions.SetUsers>({
            type: ActionTypes.SET_USERS,
            users
        }));
    };

// reducer
const reducer: (state: UserIndexState, action: any & Action) => UserIndexState =
    (state: UserIndexState = defaultState, action: Action): UserIndexState => {
        if (!Map.isMap(state)) {
            state = fromJS(state);
        }
        switch (action.type) {
            case ActionTypes.SET_USERS:
                const users: User[] = (action as Actions.SetUsers).users;
                return state.set("users", fromJS(users));
            default:
                return state;
        }
    };

export default reducer;
