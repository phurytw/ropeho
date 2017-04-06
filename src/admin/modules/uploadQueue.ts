/**
 * @file Redux module that manages incoming downloads/uploads
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import { Dispatch, Action } from "redux";
import { List, Map, fromJS } from "immutable";
import { ThunkAction } from "redux-thunk";
import { v4 } from "uuid";

import UploadEntry = Ropeho.Socket.UploadEntry;

// state
export type UploadQueueState = Map<string, Map<string, any> | List<string>>;
export const defaultState: Map<string, Map<string, any> | List<string>> = Map<string, Map<string, any> | List<string>>({
    order: List<string>(),
    uploadQueue: Map<string, any>()
});

// types
export namespace Actions {
    export type SetQueue = { uploadQueue: UploadEntry[] } & Action;
    export type SetEntry = { item: UploadEntry } & Action;
    export type RemoveEntry = { id: string } & Action;
    export type SetActive = { id: string, active: boolean } & Action;
}

// action types
export namespace ActionTypes {
    export const REPLACE_QUEUE: string = "ropeho/uploadQueue/REPLACE_QUEUE";
    export const SET_ENTRY: string = "ropeho/uploadQueue/SET_ENTRY";
    export const REMOVE_ENTRY: string = "ropeho/uploadQueue/REMOVE_ENTRY";
    export const SET_ACTIVE: string = "ropeho/uploadQueue/SET_ACTIVE";
}

// action creators
export const replaceUploadQueue: (uploadQueue: UploadEntry[]) => ThunkAction<Actions.SetQueue, UploadQueueState, {}> =
    (uploadQueue: UploadEntry[]): ThunkAction<Actions.SetQueue, UploadQueueState, {}> => {
        return (dispatch: Dispatch<UploadQueueState>, getState: () => UploadQueueState) => {
            return dispatch<Actions.SetQueue>({
                type: ActionTypes.REPLACE_QUEUE,
                uploadQueue
            });
        };
    };

export const setEntryInUploadQueue: (item: UploadEntry) => ThunkAction<Actions.SetEntry, UploadQueueState, {}> =
    (item: UploadEntry): ThunkAction<Actions.SetEntry, UploadQueueState, {}> => {
        return (dispatch: Dispatch<UploadQueueState>, getState: () => UploadQueueState) => {
            return dispatch<Actions.SetEntry>({
                type: ActionTypes.SET_ENTRY,
                item
            });
        };
    };

export const removeEntryFromUploadQueue: (id: string) => ThunkAction<Actions.RemoveEntry, UploadQueueState, {}> =
    (id: string): ThunkAction<Actions.RemoveEntry, UploadQueueState, {}> => {
        return (dispatch: Dispatch<UploadQueueState>, getState: () => UploadQueueState) => {
            return dispatch<Actions.RemoveEntry>({
                type: ActionTypes.REMOVE_ENTRY,
                id
            });
        };
    };

export const setActive: (id: string, active?: boolean) => ThunkAction<Actions.SetActive, UploadQueueState, {}> =
    (id: string, active: boolean = false): ThunkAction<Actions.SetActive, UploadQueueState, {}> => {
        return (dispatch: Dispatch<UploadQueueState>, getState: () => UploadQueueState) => {
            return dispatch<Actions.SetActive>({
                type: ActionTypes.SET_ACTIVE,
                id,
                active
            });
        };
    };

// reducer
const reducer: (state: UploadQueueState, action: any & Action) => UploadQueueState =
    (state: UploadQueueState = defaultState, action: Action): UploadQueueState => {
        if (!Map.isMap(state)) {
            state = fromJS(state);
        }
        switch (action.type) {
            case ActionTypes.REPLACE_QUEUE:
                const uploadQueue: UploadEntry[] = (action as Actions.SetQueue).uploadQueue;
                state = state.set("order", List<string>());
                state = state.set("uploadQueue", Map<string, any>());
                for (const item of uploadQueue) {
                    item.id = item.id || v4();
                    state = state.updateIn(["order"], (order: List<string>) => order.push(item.id));
                    state = state.setIn(["uploadQueue", item.id], fromJS(item));
                }
                return state;
            case ActionTypes.SET_ENTRY:
                const item: UploadEntry = (action as Actions.SetEntry).item;
                item.id = item.id || v4();
                const order: List<string> = state.get("order") as List<string>;
                if (!order.contains(item.id)) {
                    state = state.updateIn(["order"], (order: List<string>) => order.push(item.id));
                }
                return state.setIn(["uploadQueue", item.id], fromJS(item));
            case ActionTypes.SET_ACTIVE:
                const activeId: string = (action as Actions.SetActive).id;
                const active: boolean = (action as Actions.SetActive).active;
                return state.setIn(["uploadQueue", activeId, "active"], active);
            case ActionTypes.REMOVE_ENTRY:
                const idToDelete: string = (action as Actions.RemoveEntry).id;
                state = state.updateIn(["order"], (order: List<string>) => order.delete(order.indexOf(idToDelete)));
                return state.deleteIn(["uploadQueue", idToDelete]);
            default:
                return state;
        }
    };

export default reducer;
