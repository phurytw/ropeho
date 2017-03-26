/**
 * @file Redux module that sets the selected media
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../typings.d.ts" />
import { Dispatch, Action } from "redux";
import { Record, Map } from "immutable";
import { ThunkAction } from "redux-thunk";
import { mapKeys } from "lodash";

import Models = Ropeho.Models;

// state
export interface IMediaEditState {
    medias: Map<string, Models.Media>;
}
const defaultState: IMediaEditState = {
    medias: Map<string, Models.Media>()
};
export class MediaEditState extends Record(defaultState, "MediaEditState") implements IMediaEditState {
    public medias: Map<string, Models.Media>;
    constructor(init?: IMediaEditState) {
        super(init);
    }
}

// types
export namespace Actions {
    export type SetMedia = { media: Models.Media } & Action;
    export type ReplaceMedias = { medias: Models.Media[] } & Action;
}

// actions types
export namespace ActionTypes {
    export const SET_MEDIA: string = "ropeho/mediaEdit/SET_MEDIA";
    export const REPLACE_MEDIAS: string = "ropeho/mediaEdit/REPLACE_MEDIAS";
}

// action creators
export const setMedia: (media: Models.Media) => ThunkAction<Actions.SetMedia, MediaEditState, {}> =
    (media: Models.Media): ThunkAction<Actions.SetMedia, MediaEditState, {}> => {
        return (dispatch: Dispatch<MediaEditState>, getState: () => MediaEditState): Actions.SetMedia => {
            return dispatch<Actions.SetMedia>({
                type: ActionTypes.SET_MEDIA,
                media
            });
        };
    };
export const replaceMedias: (medias: Models.Media[]) => ThunkAction<Actions.ReplaceMedias, MediaEditState, {}> =
    (medias: Models.Media[]): ThunkAction<Actions.ReplaceMedias, MediaEditState, {}> => {
        return (dispatch: Dispatch<MediaEditState>, getState: () => MediaEditState): Actions.ReplaceMedias => {
            return dispatch<Actions.ReplaceMedias>({
                type: ActionTypes.REPLACE_MEDIAS,
                medias
            });
        };
    };

// reducer
const reducer: (state: MediaEditState, action: any & Action) => MediaEditState =
    (state: MediaEditState = new MediaEditState(), action: Action): MediaEditState => {
        switch (action.type) {
            case ActionTypes.SET_MEDIA:
                const media: Models.Media = (action as Actions.SetMedia).media;
                return new MediaEditState({
                    medias: state.medias.set(media._id, media)
                });
            case ActionTypes.REPLACE_MEDIAS:
                return new MediaEditState({
                    medias: Map(mapKeys<Models.Media, string>((action as Actions.ReplaceMedias).medias, (m: Models.Media) => m._id))
                });
            default:
                return state;
        }
    };

export default reducer;
