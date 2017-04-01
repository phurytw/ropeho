/**
 * @file Redux module that sets the selected source and stores the media data
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../typings.d.ts" />
import { Dispatch, Action } from "redux";
import { Map, OrderedSet, fromJS } from "immutable";
import { ThunkAction } from "redux-thunk";

import Source = Ropeho.Models.Source;

// state
export type SourceEditState = Map<string, Map<string, any> | OrderedSet<string> | string>;
export const defaultState: SourceEditState = Map<string, Map<string, any> | OrderedSet<string> | string>({
    sources: Map<string, any>(),
    selected: undefined
});

// types
export namespace Actions {
    export type SelectSource = { sourceId: string } & Action;
    export type ReplaceSources = { sources: Source[] } & Action;
    export type SetSource = { source: Source } & Action;
    export type RemoveSources = { sourceIds: string[] } & Action;
}

// actions types
export namespace ActionTypes {
    export const SELECT_SOURCE: string = "ropeho/sourceEdit/SELECT_SOURCE";
    export const SET_SOURCE: string = "ropeho/sourceEdit/SET_SOURCE";
    export const REPLACE_SOURCES: string = "ropeho/sourceEdit/REPLACE_SOURCES";
    export const REMOVE_SOURCES: string = "ropeho/sourceEdit/REMOVE_SOURCES";
}

// action creators
export const selectSource: (sourceId: string) => ThunkAction<Actions.SelectSource, SourceEditState, {}> =
    (sourceId: string): ThunkAction<Actions.SelectSource, SourceEditState, {}> => {
        return (dispatch: Dispatch<SourceEditState>, getState: () => SourceEditState): Actions.SelectSource => {
            return dispatch<Actions.SelectSource>({
                type: ActionTypes.SELECT_SOURCE,
                sourceId
            });
        };
    };
export const setSource: (source: Source) => ThunkAction<Actions.SetSource, SourceEditState, {}> =
    (source: Source): ThunkAction<Actions.SetSource, SourceEditState, {}> => {
        return (dispatch: Dispatch<SourceEditState>, getState: () => SourceEditState): Actions.SetSource => {
            return dispatch<Actions.SetSource>({
                type: ActionTypes.SET_SOURCE,
                source
            });
        };
    };
export const replaceSources: (sources: Source[]) => ThunkAction<Actions.ReplaceSources, SourceEditState, {}> =
    (sources: Source[]): ThunkAction<Actions.ReplaceSources, SourceEditState, {}> => {
        return (dispatch: Dispatch<SourceEditState>, getState: () => SourceEditState): Actions.ReplaceSources => {
            return dispatch<Actions.ReplaceSources>({
                type: ActionTypes.REPLACE_SOURCES,
                sources
            });
        };
    };
export const removeSources: (sourceIds: string[]) => ThunkAction<Actions.RemoveSources, SourceEditState, {}> =
    (sourceIds: string[]): ThunkAction<Actions.RemoveSources, SourceEditState, {}> => {
        return (dispatch: Dispatch<SourceEditState>, getState: () => SourceEditState): Actions.RemoveSources => {
            return dispatch<Actions.RemoveSources>({
                type: ActionTypes.REMOVE_SOURCES,
                sourceIds
            });
        };
    };

// reducer
const reducer: (state: SourceEditState, action: any & Action) => SourceEditState =
    (state: SourceEditState = defaultState, action: Action): SourceEditState => {
        if (!Map.isMap(state)) {
            state = fromJS(state);
        }
        switch (action.type) {
            case ActionTypes.SET_SOURCE:
                const source: Source = (action as Actions.SetSource).source;
                if (source && source._id) {
                    return state.setIn(["sources", source._id], fromJS(source));
                } else {
                    return state;
                }
            case ActionTypes.SELECT_SOURCE:
                const selected: string = (action as Actions.SelectSource).sourceId;
                return state.set("selected", selected);
            case ActionTypes.REMOVE_SOURCES:
                const sourceIds: string[] = (action as Actions.RemoveSources).sourceIds;
                if (sourceIds.indexOf(state.get("selected") as string) >= 0) {
                    state = state.set("selected", undefined);
                }
                return state.updateIn(["sources"], (sources: Map<string, any>) => sources.filter((s: any, key: string) => sourceIds.indexOf(key) === -1));
            case ActionTypes.REPLACE_SOURCES:
                const sources: Source[] = (action as Actions.ReplaceSources).sources;
                return state.set("sources", Map<string, any>(sources.map<any[]>((s: Source) => [s._id, fromJS(s)])));
            default:
                return state;
        }
    };

export default reducer;
