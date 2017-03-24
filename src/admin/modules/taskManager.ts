/**
 * @file Redux module that manages server side jobs, connect clients and current upload queue
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../test.d.ts" />
import { Dispatch, Action } from "redux";
import { Record } from "immutable";
import { ThunkAction } from "redux-thunk";
import { fetchThunk } from "../helpers/fetchUtilities";
import { Job } from "kue";
import { join, map, filter } from "lodash";

import SocketClient = Ropeho.Socket.SocketClient;
import SourceData = Ropeho.Socket.SourceData;

// state
export interface ITaskManagerState {
    tasks?: Job[];
    clients?: SocketClient[];
    transferQueue?: SourceData[];
}
const defaultState: ITaskManagerState = {
    tasks: [],
    clients: [],
    transferQueue: []
};
export class TaskManagerState extends Record(defaultState, "TaskManagerState") implements ITaskManagerState {
    public tasks: Job[];
    public clients: SocketClient[];
    public transferQueue: SourceData[];
    constructor(init?: ITaskManagerState) {
        super(init);
    }
}

// types
export namespace Actions {
    export type SetTasksAndClients = { tasks?: Job[], clients?: SocketClient[] } & Action;
    export type SetTransferQueue = { transferQueue: SourceData[] } & Action;
}

// actions types
export namespace ActionTypes {
    export const SET_TASKS_AND_CLIENTS: string = "ropeho/taskManager/SET_TASKS_AND_CLIENTS";
    export const SET_TRANSFER_QUEUE: string = "ropeho/taskManager/SET_TRANSFER_QUEUE";
}

// action creators
// get all tasks and connected clients
export const fetchRunning: (fields?: string[]) => ThunkAction<Promise<Actions.SetTasksAndClients>, TaskManagerState, {}> =
    (fields?: string[]): ThunkAction<Promise<Actions.SetTasksAndClients>, TaskManagerState, {}> => {
        return fetchThunk<Actions.SetTasksAndClients, Ropeho.TaskList, TaskManagerState>(`/api/taskmanager${fields ? `?fields=${join(fields, ",")}` : ""}`, { credentials: "include" },
            (dispatch: Dispatch<TaskManagerState>, running: Ropeho.TaskList) => {
                const action: Actions.SetTasksAndClients = { type: ActionTypes.SET_TASKS_AND_CLIENTS };
                if (running.clients) {
                    action.clients = running.clients;
                }
                if (running.tasks) {
                    action.tasks = running.tasks;
                }
                return dispatch<Actions.SetTasksAndClients>(action);
            });
    };
// starts a tasks and updates the tasks in the state
export const startTask: (taskId: number) => ThunkAction<Promise<Actions.SetTasksAndClients>, TaskManagerState, {}> =
    (taskId: number): ThunkAction<Promise<Actions.SetTasksAndClients>, TaskManagerState, {}> => {
        return fetchThunk<Actions.SetTasksAndClients, Job, TaskManagerState>(`/api/taskmanager/task/${taskId}`,
            {
                method: "POST",
            },
            (dispatch: Dispatch<TaskManagerState>, task: Job, getState: () => TaskManagerState) =>
                dispatch<Actions.SetTasksAndClients>({
                    type: ActionTypes.SET_TASKS_AND_CLIENTS,
                    tasks: map<Job, Job>(getState().tasks, (t: Job) => t.id === taskId ? task : t)
                }));
    };
// deletes a tasks and updates the tasks in the state
export const cancelTask: (taskId: number) => ThunkAction<Promise<Actions.SetTasksAndClients>, TaskManagerState, {}> =
    (taskId: number): ThunkAction<Promise<Actions.SetTasksAndClients>, TaskManagerState, {}> => {
        return fetchThunk<Actions.SetTasksAndClients, {}, TaskManagerState>(`/api/taskmanager/task/${taskId}`,
            {
                method: "DELETE",
            },
            (dispatch: Dispatch<TaskManagerState>, nothing: {}, getState: () => TaskManagerState) =>
                dispatch<Actions.SetTasksAndClients>({
                    type: ActionTypes.SET_TASKS_AND_CLIENTS,
                    tasks: filter<Job>(getState().tasks, (t: Job) => t.id !== taskId)
                }));
    };
// disconnects a client and updates the client in the state
export const kickClient: (clientId: string) => ThunkAction<Promise<Actions.SetTasksAndClients>, TaskManagerState, {}> =
    (clientId: string): ThunkAction<Promise<Actions.SetTasksAndClients>, TaskManagerState, {}> => {
        return fetchThunk<Actions.SetTasksAndClients, {}, TaskManagerState>(`/api/taskmanager/socket/${clientId}`,
            {
                method: "DELETE",
            },
            (dispatch: Dispatch<TaskManagerState>, nothing: {}, getState: () => TaskManagerState) =>
                dispatch<Actions.SetTasksAndClients>({
                    type: ActionTypes.SET_TASKS_AND_CLIENTS,
                    clients: filter<SocketClient>(getState().clients, (c: SocketClient) => c.socket.id !== clientId)
                }));
    };
// set the file transfer queue
export const setTransferQueue: (transferQueue: SourceData[]) => ThunkAction<Actions.SetTransferQueue, TaskManagerState, {}> =
    (transferQueue: SourceData[]): ThunkAction<Actions.SetTransferQueue, TaskManagerState, {}> => {
        return (dispatch: Dispatch<TaskManagerState>, getState: () => TaskManagerState) => {
            return dispatch<Actions.SetTransferQueue>({
                type: ActionTypes.SET_TRANSFER_QUEUE,
                transferQueue
            });
        };
    };

// reducer
const reducer: (state: TaskManagerState, action: any & Action) => TaskManagerState =
    (state: TaskManagerState = new TaskManagerState(), action: Action): TaskManagerState => {
        switch (action.type) {
            case ActionTypes.SET_TASKS_AND_CLIENTS:
                const typedAction: Actions.SetTasksAndClients = action;
                const data: {
                    tasks?: Job[],
                    clients?: SocketClient[]
                } = {};
                if (typedAction.clients) {
                    data.clients = typedAction.clients;
                }
                if (typedAction.tasks) {
                    data.tasks = typedAction.tasks;
                }
                return new TaskManagerState({
                    ...state.toJS(),
                    ...data
                });
            case ActionTypes.SET_TRANSFER_QUEUE:
                return new TaskManagerState({
                    ...state.toJS(),
                    transferQueue: (action as Actions.SetTransferQueue).transferQueue
                });
            default:
                return state;
        }
    };

export default reducer;
