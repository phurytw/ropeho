/**
 * @file Redux module that sets the selected media
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../typings.d.ts" />
import { Dispatch, Action } from "redux";
import { fromJS, Map, List, OrderedSet } from "immutable";
import { ThunkAction } from "redux-thunk";

import Media = Ropeho.Models.Media;
import Source = Ropeho.Models.Source;

// state
export type MediaEditState = Map<string, List<string> | Map<string, any> | string>;
export const defaultState: MediaEditState = Map<string, List<string> | Map<string, any> | string>({
    order: List<string>(),
    sources: Map<string, List<string>>(),
    medias: Map<string, any>(),
    selected: undefined
});

// types
export namespace Actions {
    export type SelectMedia = { mediaId: string } & Action;
    export type SetMedia = { media: Media } & Action;
    export type ReplaceMedias = { medias: Media[] } & Action;
    export type SetMediaPosition = { mediaId: string, position: number } & Action;
    export type SetSourcePosition = { mediaId: string, sourceId: string, position: number } & Action;
    export type AddSourceToMedia = { mediaId: string, sourceId: string } & Action;
    export type RemoveMedia = { mediaId: string } & Action;
    export type RemoveSources = { sourceIds: string[], mediaId?: string } & Action;
}

// actions types
export namespace ActionTypes {
    export const SELECT_MEDIA: string = "ropeho/mediaEdit/SELECT_MEDIA";
    export const SET_MEDIA: string = "ropeho/mediaEdit/SET_MEDIA";
    export const REPLACE_MEDIAS: string = "ropeho/mediaEdit/REPLACE_MEDIAS";
    export const SET_MEDIA_POSITION: string = "ropeho/mediaEdit/SET_MEDIA_POSITION";
    export const SET_SOURCE_POSITION: string = "ropeho/mediaEdit/SET_SOURCE_POSITION";
    export const ADD_SOURCE_TO_MEDIA: string = "ropeho/mediaEdit/ADD_SOURCE_TO_MEDIA";
    export const REMOVE_MEDIA: string = "ropeho/mediaEdit/REMOVE_MEDIA";
    export const REMOVE_SOURCES: string = "ropeho/mediaEdit/REMOVE_SOURCES";
}

// action creators
export const selectMedia: (mediaId: string) => ThunkAction<Actions.SelectMedia, MediaEditState, {}> =
    (mediaId: string): ThunkAction<Actions.SelectMedia, MediaEditState, {}> => {
        return (dispatch: Dispatch<MediaEditState>, getState: () => MediaEditState): Actions.SelectMedia => {
            return dispatch<Actions.SelectMedia>({
                type: ActionTypes.SELECT_MEDIA,
                mediaId
            });
        };
    };
export const setMedia: (media: Media) => ThunkAction<Actions.SetMedia, MediaEditState, {}> =
    (media: Media): ThunkAction<Actions.SetMedia, MediaEditState, {}> => {
        return (dispatch: Dispatch<MediaEditState>, getState: () => MediaEditState): Actions.SetMedia => {
            return dispatch<Actions.SetMedia>({
                type: ActionTypes.SET_MEDIA,
                media
            });
        };
    };
export const replaceMedias: (medias: Media[]) => ThunkAction<Actions.ReplaceMedias, any, {}> =
    (medias: Media[]): ThunkAction<Actions.ReplaceMedias, any, {}> => {
        return (dispatch: Dispatch<any>, getState: () => any): Actions.ReplaceMedias => {
            return dispatch<Actions.ReplaceMedias>({
                type: ActionTypes.REPLACE_MEDIAS,
                medias
            });
        };
    };
export const setMediaPosition: (mediaId: string, position: number) => ThunkAction<Actions.SetMediaPosition, any, {}> =
    (mediaId: string, position: number): ThunkAction<Actions.SetMediaPosition, any, {}> => {
        return (dispatch: Dispatch<any>, getState: () => any): Actions.SetMediaPosition => {
            return dispatch<Actions.SetMediaPosition>({
                type: ActionTypes.SET_MEDIA_POSITION,
                mediaId,
                position
            });
        };
    };
export const setSourcePosition: (mediaId: string, sourceId: string, position: number) => ThunkAction<Actions.SetSourcePosition, any, {}> =
    (mediaId: string, sourceId: string, position: number): ThunkAction<Actions.SetSourcePosition, any, {}> => {
        return (dispatch: Dispatch<any>, getState: () => any): Actions.SetSourcePosition => {
            return dispatch<Actions.SetSourcePosition>({
                type: ActionTypes.SET_SOURCE_POSITION,
                mediaId,
                sourceId,
                position
            });
        };
    };
export const addSourceToMedia: (mediaId: string, sourceId: string) => ThunkAction<Actions.AddSourceToMedia, any, {}> =
    (mediaId: string, sourceId: string): ThunkAction<Actions.AddSourceToMedia, any, {}> => {
        return (dispatch: Dispatch<any>, getState: () => any): Actions.AddSourceToMedia => {
            return dispatch<Actions.AddSourceToMedia>({
                type: ActionTypes.ADD_SOURCE_TO_MEDIA,
                mediaId,
                sourceId
            });
        };
    };
export const removeMedia: (mediaId: string) => ThunkAction<Actions.RemoveMedia, any, {}> =
    (mediaId: string): ThunkAction<Actions.RemoveMedia, any, {}> => {
        return (dispatch: Dispatch<any>, getState: () => any): Actions.RemoveMedia => {
            return dispatch<Actions.RemoveMedia>({
                type: ActionTypes.REMOVE_MEDIA,
                mediaId
            });
        };
    };
export const removeSourcesFromMedia: (sourceIds: string[], mediaId?: string) => ThunkAction<Actions.RemoveSources, any, {}> =
    (sourceIds: string[], mediaId?: string): ThunkAction<Actions.RemoveSources, any, {}> => {
        return (dispatch: Dispatch<any>, getState: () => any): Actions.RemoveSources => {
            return dispatch<Actions.RemoveSources>({
                type: ActionTypes.REMOVE_SOURCES,
                mediaId,
                sourceIds
            });
        };
    };

// reducer
const reducer: (state: MediaEditState, action: any & Action) => MediaEditState =
    (state: MediaEditState = defaultState, action: Action): MediaEditState => {
        if (!Map.isMap(state)) {
            state = fromJS(state);
        }
        let mediaId: string;
        let order: List<string>;
        let position: number;
        let sourceId: string;
        switch (action.type) {
            case ActionTypes.SET_MEDIA:
                const media: Map<string, any> = fromJS((action as Actions.SetMedia).media);
                mediaId = media.get("_id");
                order = state.get("order") as List<string>;
                if (!order.contains(mediaId)) {
                    state = state.updateIn(["order"], (order: List<string>) => order.push(mediaId));
                    state = state.setIn(["sources", mediaId], (media.get("sources") as List<any>).map((s: Map<string, any>) => s.get("_id")));
                }
                return state.setIn(["medias", mediaId], media);
            case ActionTypes.SELECT_MEDIA:
                const selected: string = (action as Actions.SelectMedia).mediaId;
                return state.set("selected", selected);
            case ActionTypes.SET_MEDIA_POSITION:
                position = (action as Actions.SetMediaPosition).position;
                mediaId = (action as Actions.SetMediaPosition).mediaId;
                if (state.getIn(["medias", mediaId])) {
                    return state.updateIn(["order"], (order: List<string>) => {
                        order = order.delete(order.indexOf(mediaId));
                        return order.insert(position, mediaId);
                    });
                }
                return state;
            case ActionTypes.ADD_SOURCE_TO_MEDIA:
                mediaId = (action as Actions.AddSourceToMedia).mediaId;
                sourceId = (action as Actions.AddSourceToMedia).sourceId;
                if (state.getIn(["medias", mediaId])) {
                    return state.updateIn(["sources", mediaId], (order: List<string>) => {
                        if (order.includes(sourceId)) {
                            return order;
                        } else {
                            return order.push(sourceId);
                        }
                    });
                }
                return state;
            case ActionTypes.SET_SOURCE_POSITION:
                position = (action as Actions.SetSourcePosition).position;
                mediaId = (action as Actions.SetSourcePosition).mediaId;
                sourceId = (action as Actions.SetSourcePosition).sourceId;
                if (state.getIn(["medias", mediaId]) && (state.getIn(["sources", mediaId]) as List<string>).includes(sourceId)) {
                    return state.updateIn(["sources", mediaId], (order: List<string>) => {
                        order = order.delete(order.indexOf(sourceId));
                        return order.insert(position, sourceId);
                    });
                }
                return state;
            case ActionTypes.REMOVE_MEDIA:
                mediaId = (action as Actions.RemoveMedia).mediaId;
                state = state.deleteIn(["medias", mediaId]);
                state = state.deleteIn(["sources", mediaId]);
                return state.updateIn(["order"], (order: List<string>) => order.delete(order.indexOf(mediaId)));
            case ActionTypes.REMOVE_SOURCES:
                const sourceIds: string[] = (action as Actions.RemoveSources).sourceIds;
                mediaId = (action as Actions.RemoveSources).mediaId;
                if (mediaId) {
                    return state.updateIn(["sources", mediaId], (order: List<string>) => order.takeWhile((id: string) => sourceIds.indexOf(id) === -1));
                } else {
                    return state.updateIn(["sources"], (sources: Map<string, any>) => sources.map((order: List<string>) => order.filter((id: string) => sourceIds.indexOf(id) === -1)));
                }
            case ActionTypes.REPLACE_MEDIAS:
                const medias: Media[] = (action as Actions.ReplaceMedias).medias;
                state = state.set("order", OrderedSet<string>(medias.map<string>((m: Media) => m._id)).toList());
                state = state.set("sources",
                    Map<string, any>(medias.map((m: Media) =>
                        ([m._id,
                        List<string>(m.sources.map((s: Source) => s._id))]))));
                return state.set("medias", Map<string, any>(medias.map<any[]>((m: Media) => [m._id, fromJS(m)])));
            default:
                return state;
        }
    };

export default reducer;
