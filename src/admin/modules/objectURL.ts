/**
 * @file Redux module that holds the original filenames of ObjectURLs
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import { Dispatch, Action } from "redux";
import { Map, fromJS } from "immutable";
import { ThunkAction } from "redux-thunk";

// state
export type ObjectURLState = Map<string, Map<string, File>>;
export const defaultState: ObjectURLState = Map<string, Map<string, File>>({
    objectURLs: Map<string, File>()
});

// types
export namespace Actions {
    export type SetFile = { objectURL: string, file: File } & Action;
}

// actions types
export namespace ActionTypes {
    export const SET_FILE: string = "ropeho/objectURL/SET_FILE";
}

// action creators
export const setFile: (objectURL: string, file: File) => ThunkAction<Actions.SetFile, ObjectURLState, {}> =
    (objectURL: string, file: File): ThunkAction<Actions.SetFile, ObjectURLState, {}> => {
        return (dispatch: Dispatch<ObjectURLState>, getState: () => ObjectURLState) => {
            return dispatch<Actions.SetFile>({
                type: ActionTypes.SET_FILE,
                objectURL,
                file
            });
        };
    };

// reducer
const reducer: (state: ObjectURLState, action: any & Action) => ObjectURLState =
    (state: ObjectURLState = defaultState, action: Action): ObjectURLState => {
        if (!Map.isMap(state)) {
            state = fromJS(state);
        }
        switch (action.type) {
            case ActionTypes.SET_FILE:
                const { objectURL, file }: Actions.SetFile = (action as Actions.SetFile);
                return state.setIn(["objectURLs", objectURL], file);
            default:
                return state;
        }
    };

export default reducer;
