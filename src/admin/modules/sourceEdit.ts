/**
 * @file Redux module that sets the selected source and stores the media data
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../typings.d.ts" />
import { Dispatch, Action } from "redux";
import { Record } from "immutable";
import { ThunkAction } from "redux-thunk";
import { Map } from "immutable";
import { mapKeys } from "lodash";

import Models = Ropeho.Models;

// state
export interface ISourceEditState {
    sources?: Map<string, Models.Source>;
    buffers?: Map<string, ArrayBuffer>;

}
const defaultState: ISourceEditState = {
    sources: Map<string, Models.Source>(),
    buffers: Map<string, ArrayBuffer>()
};
export class SourceEditState extends Record(defaultState, "SourceEditState") implements ISourceEditState {
    public sources: Map<string, Models.Source>;
    public buffers: Map<string, ArrayBuffer>;
    constructor(init?: ISourceEditState) {
        super(init);
    }
}

// types
export namespace Actions {
    export type ReplaceSources = { sources: Models.Source[] } & Action;
    export type SetSource = { source: Models.Source } & Action;
    export type ReplaceBuffers = { buffers: { [key: string]: ArrayBuffer } } & Action;
    export type SetBuffer = { buffer: ArrayBuffer, sourceId: string } & Action;
}

// actions types
export namespace ActionTypes {
    export const SET_SOURCE: string = "ropeho/sourceEdit/SET_SOURCE";
    export const REPLACE_SOURCES: string = "ropeho/sourceEdit/REPLACE_SOURCES";
    export const SET_BUFFER: string = "ropeho/sourceEdit/SET_BUFFER";
    export const REPLACE_BUFFERS: string = "ropeho/sourceEdit/REPLACE_BUFFERS";
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
export const replaceSources: (sources: Models.Source[]) => ThunkAction<Actions.ReplaceSources, SourceEditState, {}> =
    (sources: Models.Source[]): ThunkAction<Actions.ReplaceSources, SourceEditState, {}> => {
        return (dispatch: Dispatch<SourceEditState>, getState: () => SourceEditState): Actions.ReplaceSources => {
            return dispatch<Actions.ReplaceSources>({
                type: ActionTypes.REPLACE_SOURCES,
                sources
            });
        };
    };
export const setBuffer: (sourceId: string, buffer: ArrayBuffer) => ThunkAction<Actions.SetBuffer, SourceEditState, {}> =
    (sourceId: string, buffer: ArrayBuffer): ThunkAction<Actions.SetBuffer, SourceEditState, {}> => {
        return (dispatch: Dispatch<SourceEditState>, getState: () => SourceEditState): Actions.SetBuffer => {
            return dispatch<Actions.SetBuffer>({
                type: ActionTypes.SET_BUFFER,
                buffer, sourceId
            });
        };
    };
export const replaceBuffers: (buffers: { [key: string]: ArrayBuffer }) => ThunkAction<Actions.ReplaceBuffers, SourceEditState, {}> =
    (buffers: { [key: string]: ArrayBuffer }): ThunkAction<Actions.ReplaceBuffers, SourceEditState, {}> => {
        return (dispatch: Dispatch<SourceEditState>, getState: () => SourceEditState): Actions.ReplaceBuffers => {
            return dispatch<Actions.ReplaceBuffers>({
                type: ActionTypes.SET_BUFFER,
                buffers
            });
        };
    };

// reducer
const reducer: (state: SourceEditState, action: any & Action) => SourceEditState =
    (state: SourceEditState = new SourceEditState(), action: Action): SourceEditState => {
        switch (action.type) {
            case ActionTypes.SET_SOURCE:
                const source: Models.Source = (action as Actions.SetSource).source;
                return new SourceEditState({
                    ...state,
                    sources: state.sources.set(source._id, source)
                });
            case ActionTypes.SET_BUFFER:
                const { buffer, sourceId }: Actions.SetBuffer = (action as Actions.SetBuffer);
                return new SourceEditState({
                    ...state,
                    buffers: state.buffers.set(sourceId, buffer)
                });
            case ActionTypes.REPLACE_SOURCES:
                const sources: Models.Source[] = (action as Actions.ReplaceSources).sources;
                return new SourceEditState({
                    ...state,
                    sources: Map<string, Models.Source>(mapKeys<Models.Source, string>(sources, (s: Models.Source) => s._id))
                });
            case ActionTypes.REPLACE_BUFFERS:
                const { buffers }: Actions.ReplaceBuffers = (action as Actions.ReplaceBuffers);
                return new SourceEditState({
                    ...state,
                    buffers: Map<string, ArrayBuffer>(buffers)
                });
            default:
                return state;
        }
    };

export default reducer;
