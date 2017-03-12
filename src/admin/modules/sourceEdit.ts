/**
 * @file Redux module that sets the selected source and stores the media data
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../typings.d.ts" />
import { Dispatch, Action } from "redux";
import { Record } from "immutable";
import { ThunkAction } from "redux-thunk";
import { Source } from "../models";

import Models = Ropeho.Models;

// state
export interface ISourceEditState {
    source?: Models.Source;
    buffer?: ArrayBuffer;

}
const defaultState: ISourceEditState = {
    source: undefined,
    buffer: undefined
};
export class SourceEditState extends Record(defaultState, "SourceEditState") implements ISourceEditState {
    public source: Source;
    public buffer: ArrayBuffer;
    constructor(init?: ISourceEditState) {
        super(init);
    }
}

// types
export namespace Actions {
    export type SetSource = { source: Models.Source } & Action;
    export type SetBuffer = { buffer: ArrayBuffer } & Action;
}

// actions types
export namespace ActionTypes {
    export const SET_SOURCE: string = "ropeho/sourceEdit/SET_SOURCE";
    export const SET_BUFFER: string = "ropeho/sourceEdit/SET_BUFFER";
}

// action creators
export const setSource: (source: Models.Source) => ThunkAction<Actions.SetSource, SourceEditState, {}> =
    (source: Models.Source): ThunkAction<Actions.SetSource, SourceEditState, {}> => {
        return (dispatch: Dispatch<SourceEditState>, getState: () => SourceEditState): Actions.SetSource => {
            return dispatch<Actions.SetSource>({
                type: ActionTypes.SET_SOURCE,
                source
            });
        };
    };
export const setBuffer: (buffer: ArrayBuffer) => ThunkAction<Actions.SetBuffer, SourceEditState, {}> =
    (buffer: ArrayBuffer): ThunkAction<Actions.SetBuffer, SourceEditState, {}> => {
        return (dispatch: Dispatch<SourceEditState>, getState: () => SourceEditState): Actions.SetBuffer => {
            return dispatch<Actions.SetBuffer>({
                type: ActionTypes.SET_BUFFER,
                buffer
            });
        };
    };

// reducer
const reducer: (state: SourceEditState, action: any & Action) => SourceEditState =
    (state: SourceEditState = new SourceEditState(), action: Action): SourceEditState => {
        switch (action.type) {
            case ActionTypes.SET_SOURCE:
                return new SourceEditState({
                    ...state,
                    source: (action as Actions.SetSource).source
                });
            case ActionTypes.SET_BUFFER:
                return new SourceEditState({
                    ...state,
                    buffer: (action as Actions.SetBuffer).buffer
                });
            default:
                return state;
        }
    };

export default reducer;
