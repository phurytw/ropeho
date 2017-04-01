/**
 * @file Redux module that manages incoming downloads/uploads
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../typings.d.ts" />
import { Dispatch, Action } from "redux";
import { OrderedSet, Map, fromJS, Iterable } from "immutable";
import { ThunkAction } from "redux-thunk";

import SourceData = Ropeho.Socket.SourceData;

// state
export type TransferQueueState = Map<string, Map<string, any> | OrderedSet<string>>;
export const defaultState: Map<string, Map<string, any> | OrderedSet<string>> = Map<string, Map<string, any> | OrderedSet<string>>({
    order: OrderedSet<string>(),
    transferQueue: Map<string, any>()
});

// types
export namespace Actions {
    export type SetQueue = { transferQueue: SourceData[] } & Action;
    export type AddToQueue = { item: SourceData } & Action;
    export type RemoveFromQueue = { target: string } & Action;
}

// action types
export namespace ActionTypes {
    export const SET_QUEUE: string = "ropeho/transferQueue/SET_QUEUE";
    export const ADD_TO_QUEUE: string = "ropeho/transferQueue/ADD_TO_QUEUE";
    export const REMOVE_FROM_QUEUE: string = "ropeho/transferQueue/REMOVE_FROM_QUEUE";
}

// action creators
export const setTransferQueue: (transferQueue: SourceData[]) => ThunkAction<Actions.SetQueue, TransferQueueState, {}> =
    (transferQueue: SourceData[]): ThunkAction<Actions.SetQueue, TransferQueueState, {}> => {
        return (dispatch: Dispatch<TransferQueueState>, getState: () => TransferQueueState) => {
            return dispatch<Actions.SetQueue>({
                type: ActionTypes.SET_QUEUE,
                transferQueue
            });
        };
    };

export const addToQueue: (item: SourceData) => ThunkAction<Actions.AddToQueue, TransferQueueState, {}> =
    (item: SourceData): ThunkAction<Actions.AddToQueue, TransferQueueState, {}> => {
        return (dispatch: Dispatch<TransferQueueState>, getState: () => TransferQueueState) => {
            return dispatch<Actions.AddToQueue>({
                type: ActionTypes.ADD_TO_QUEUE,
                item
            });
        };
    };

export const removeFromQueue: (target: string) => ThunkAction<Actions.RemoveFromQueue, TransferQueueState, {}> =
    (target: string): ThunkAction<Actions.RemoveFromQueue, TransferQueueState, {}> => {
        return (dispatch: Dispatch<TransferQueueState>, getState: () => TransferQueueState) => {
            return dispatch<Actions.RemoveFromQueue>({
                type: ActionTypes.REMOVE_FROM_QUEUE,
                target
            });
        };
    };

// reducer
const reducer: (state: TransferQueueState, action: any & Action) => TransferQueueState =
    (state: TransferQueueState = defaultState, action: Action): TransferQueueState => {
        const fromJSReviver: (key: any, value: Iterable<any, any>) => any = (key: any, value: Iterable<any, any>) =>
            Iterable.isIndexed(value) ? value.toOrderedSet() : value.toMap();
        if (!Map.isMap(state)) {
            state = fromJS(state, fromJSReviver);
        }
        switch (action.type) {
            case ActionTypes.SET_QUEUE:
                const transferQueue: SourceData[] = (action as Actions.SetQueue).transferQueue;
                state = state.set("order", OrderedSet<string>(transferQueue.map<string>((sd: SourceData) => sd.target.sourceId)));
                return state.set("transferQueue", Map<string, any>(transferQueue.map<any[]>((sd: SourceData) => [sd.target.sourceId, fromJS(sd, fromJSReviver)])));
            case ActionTypes.ADD_TO_QUEUE:
                const item: SourceData = (action as Actions.AddToQueue).item;
                const order: OrderedSet<string> = state.get("order") as OrderedSet<string>;
                if (!order.contains(item.target.sourceId)) {
                    state.updateIn(["order"], (order: OrderedSet<string>) => order.add(item.target.sourceId));
                }
                return state.setIn(["transferQueue", item.target.sourceId], fromJS(item, fromJSReviver));
            case ActionTypes.REMOVE_FROM_QUEUE:
                const target: string = (action as Actions.RemoveFromQueue).target;
                state = state.updateIn(["order"], (order: OrderedSet<string>) => order.delete(target));
                return state.deleteIn(["transferQueue", target]);
            default:
                return state;
        }
    };

export default reducer;
