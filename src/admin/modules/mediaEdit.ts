/**
 * @file Redux module that sets the selected media
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../typings.d.ts" />
import { Dispatch, Action } from "redux";
import { Record } from "immutable";
import { ThunkAction } from "redux-thunk";
import { Media } from "../models";

import Models = Ropeho.Models;

// state
export interface IMediaEditState {
    media: Models.Media;
}
const defaultState: IMediaEditState = {
    media: undefined
};
export class MediaEditState extends Record(defaultState, "MediaEditState") implements IMediaEditState {
    public media: Media;
    constructor(init?: IMediaEditState) {
        super(init);
    }
}

// types
export namespace Actions {
    export type SetMedia = { media: Models.Media } & Action;
}

// actions types
export namespace ActionTypes {
    export const SET_MEDIA: string = "ropeho/mediaEdit/SET_MEDIA";
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

// reducer
const reducer: (state: MediaEditState, action: any & Action) => MediaEditState =
    (state: MediaEditState = new MediaEditState(), action: Action): MediaEditState => {
        switch (action.type) {
            case ActionTypes.SET_MEDIA:
                return new MediaEditState({
                    ...state,
                    media: (action as Actions.SetMedia).media
                });
            default:
                return state;
        }
    };

export default reducer;
