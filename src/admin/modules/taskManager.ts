/**
 * @file Redux module that manages server side jobs and connected clients
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../test.d.ts" />
import { Dispatch, Action } from "redux";
import { Map, fromJS } from "immutable";
import { ThunkAction } from "redux-thunk";
import { fetchThunk } from "../../common/helpers/fetchUtilities";
import { Job } from "kue";
import { join } from "lodash";

import SocketClient = Ropeho.Socket.SocketClient;

// state
export type TaskManagerState = Map<string, Map<string, any>>;
export const defaultState: TaskManagerState = Map<string, Map<string, any>>({
    tasks: Map<string, any>(),
    clients: Map<string, any>()
});

// types
export namespace Actions {
    export type SetTask = { task?: Job } & Action;
    export type RemoveTask = { taskId?: number } & Action;
    export type SetTasks = { tasks?: Job[] } & Action;
    export type SetClients = { clients?: SocketClient[] } & Action;
    export type RemoveClient = { clientId?: string } & Action;
}

// actions types
export namespace ActionTypes {
    export const SET_TASK: string = "ropeho/taskManager/SET_TASK";
    export const REMOVE_TASK: string = "ropeho/taskManager/REMOVE_TASK";
    export const SET_TASKS: string = "ropeho/taskManager/SET_TASKS";
    export const SET_CLIENTS: string = "ropeho/taskManager/SET_CLIENTS";
    export const REMOVE_CLIENT: string = "ropeho/taskManager/REMOVE_CLIENT";
}

// action creators
// get all tasks and connected clients
export const fetchRunning: (fields?: string[]) => ThunkAction<Promise<Actions.SetClients & Actions.SetTasks>, TaskManagerState, {}> =
    (fields?: string[]): ThunkAction<Promise<Actions.SetClients & Actions.SetTasks>, TaskManagerState, {}> => {
        return fetchThunk<Actions.SetClients & Actions.SetTasks, Ropeho.TaskList, TaskManagerState>(`/api/taskmanager${fields ? `?fields=${join(fields, ",")}` : ""}`, { credentials: "include" },
            (dispatch: Dispatch<TaskManagerState>, running: Ropeho.TaskList) => {
                let actions: Actions.SetClients & Actions.SetTasks;
                if (running.clients) {
                    actions = {
                        ...dispatch<Actions.SetClients>({
                            type: ActionTypes.SET_CLIENTS,
                            clients: running.clients
                        })
                    };
                }
                if (running.tasks) {
                    actions = {
                        ...actions,
                        ...dispatch<Actions.SetTasks>({
                            type: ActionTypes.SET_TASKS,
                            tasks: running.tasks
                        })
                    };
                }
                return actions;
            });
    };
// starts a tasks and updates the tasks in the state
export const startTask: (taskId: number) => ThunkAction<Promise<Actions.SetTask>, TaskManagerState, {}> =
    (taskId: number): ThunkAction<Promise<Actions.SetTask>, TaskManagerState, {}> => {
        return fetchThunk<Actions.SetTask, Job, TaskManagerState>(`/api/taskmanager/task/${taskId}`,
            {
                method: "POST",
            },
            (dispatch: Dispatch<TaskManagerState>, task: Job, getState: () => TaskManagerState) =>
                dispatch<Actions.SetTask>({
                    type: ActionTypes.SET_TASK,
                    task
                }));
    };
// deletes a tasks and updates the tasks in the state
export const cancelTask: (taskId: number) => ThunkAction<Promise<Actions.RemoveTask>, TaskManagerState, {}> =
    (taskId: number): ThunkAction<Promise<Actions.RemoveTask>, TaskManagerState, {}> => {
        return fetchThunk<Actions.RemoveTask, {}, TaskManagerState>(`/api/taskmanager/task/${taskId}`,
            {
                method: "DELETE",
            },
            (dispatch: Dispatch<TaskManagerState>, nothing: {}, getState: () => TaskManagerState) =>
                dispatch<Actions.RemoveTask>({
                    type: ActionTypes.REMOVE_TASK,
                    taskId
                }));
    };
// disconnects a client and updates the client in the state
export const kickClient: (clientId: string) => ThunkAction<Promise<Actions.RemoveClient>, TaskManagerState, {}> =
    (clientId: string): ThunkAction<Promise<Actions.RemoveClient>, TaskManagerState, {}> => {
        return fetchThunk<Actions.RemoveClient, {}, TaskManagerState>(`/api/taskmanager/socket/${clientId}`,
            {
                method: "DELETE",
            },
            (dispatch: Dispatch<TaskManagerState>, nothing: {}, getState: () => TaskManagerState) =>
                dispatch<Actions.RemoveClient>({
                    type: ActionTypes.REMOVE_CLIENT,
                    clientId
                }));
    };

// reducer
const reducer: (state: TaskManagerState, action: any & Action) => TaskManagerState =
    (state: TaskManagerState = defaultState, action: Action): TaskManagerState => {
        if (!Map.isMap(state)) {
            state = fromJS(state);
        }
        switch (action.type) {
            case ActionTypes.REMOVE_CLIENT:
                const clientId: string = (action as Actions.RemoveClient).clientId;
                return state.deleteIn(["clients", clientId]);
            case ActionTypes.REMOVE_TASK:
                const taskId: number = (action as Actions.RemoveTask).taskId;
                return state.deleteIn(["tasks", taskId.toString()]);
            case ActionTypes.SET_TASK:
                const task: Job = (action as Actions.SetTask).task;
                return state.setIn(["tasks", task.id.toString()], task);
            case ActionTypes.SET_TASKS:
                const tasks: Job[] = (action as Actions.SetTasks).tasks;
                return state.set("tasks", Map<string, any>(tasks.map<any[]>((t: Job) => [t.id.toString(), fromJS(t)])));
            case ActionTypes.SET_CLIENTS:
                const clients: SocketClient[] = (action as Actions.SetClients).clients;
                return state.set("clients", Map<string, any>(clients.map<any[]>((c: SocketClient) => [c.socket.id, fromJS(c)])));
            default:
                return state;
        }
    };

export default reducer;
