/**
 * @file Tests for the task manager module
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../test.d.ts" />
import { should } from "chai";
import { is, fromJS } from "immutable";
import { ActionTypes, TaskManagerState, cancelTask, fetchRunning, kickClient, startTask, default as reducer } from "./taskManager";
import { ADMIN_END_POINT } from "../helpers/resolveEndPoint";
import { head } from "lodash";
import { default as mockStore, IStore } from "redux-mock-store";
import "isomorphic-fetch";
import { middlewares } from "../store";
import * as nock from "nock";
import { Job } from "kue";
import { ActionTypes as ErrorTypes } from "./error";
should();

import SocketClient = Ropeho.Socket.SocketClient;

describe("Task manager module", () => {
    let store: IStore<TaskManagerState>;
    const initialState: TaskManagerState = fromJS({
        tasks: { "20": { id: 20 } as Job, "40": { id: 40 } as Job },
        clients: { "client1": { socket: { id: "client1" } as SocketIO.Socket, state: 0 }, "client2": { socket: { id: "client2" } as SocketIO.Socket, state: 0 } }
    });
    before(() => {
        store = mockStore<TaskManagerState>(middlewares({
            host: ADMIN_END_POINT,
            error: {
                type: ErrorTypes.SET_ERROR
            }
        }))(initialState);
    });
    afterEach(() => {
        store.clearActions();
        nock.cleanAll();
    });
    describe("Fetching tasks and clients", () => {
        it("Should fetch and dispatch tasks and clients from the API server", async () => {
            const tasks: Job[] = [{ id: 30 } as Job];
            const clients: SocketClient[] = [{ socket: { id: "client1" } as SocketIO.Socket, state: 0 }];
            const scope: nock.Scope = nock(ADMIN_END_POINT)
                .get("/api/taskmanager")
                .reply(200, { tasks, clients });
            await store.dispatch(fetchRunning());
            store.getActions().should.deep.equal([{
                type: ActionTypes.SET_CLIENTS,
                clients
            }, {
                type: ActionTypes.SET_TASKS,
                tasks
            }]);
            scope.done();
        });
    });
    describe("Kue task management", () => {
        it("Should fetch and dispatch tasks from the API server", async () => {
            const tasks: Job[] = [{ id: 30 } as Job];
            const scope: nock.Scope = nock(ADMIN_END_POINT)
                .get("/api/taskmanager")
                .query({
                    fields: "tasks"
                })
                .reply(200, { tasks });
            await store.dispatch(fetchRunning(["tasks"]));
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.SET_TASKS,
                tasks
            });
            scope.done();
        });
        it("Should start a task and dispatch the updated task list", async () => {
            const task: Job = store.getState().getIn(["tasks", "20"]).toJS();
            const scope: nock.Scope = nock(ADMIN_END_POINT)
                .post(`/api/taskmanager/task/${task.id}`)
                .reply(200, task);
            await store.dispatch(startTask(task.id));
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.SET_TASK,
                task
            });
            scope.done();
        });
        it("Should cancel a task and dispatch the updated task list", async () => {
            const task: Job = store.getState().getIn(["tasks", "20"]).toJS();
            const scope: nock.Scope = nock(ADMIN_END_POINT)
                .delete(`/api/taskmanager/task/${task.id}`)
                .reply(200, {});
            await store.dispatch(cancelTask(task.id));
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.REMOVE_TASK,
                taskId: task.id
            });
            scope.done();
        });
    });
    describe("Socket.IO clients management", () => {
        it("Should fetch and dispatch clients from the API server", async () => {
            const clients: SocketClient[] = [{ socket: { id: "client1" } as SocketIO.Socket, state: 0 }];
            const scope: nock.Scope = nock(ADMIN_END_POINT)
                .get("/api/taskmanager")
                .query({
                    fields: "clients"
                })
                .reply(200, { clients });
            await store.dispatch(fetchRunning(["clients"]));
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.SET_CLIENTS,
                clients
            });
            scope.done();
        });
        it("Should disconnect a client and dispatch the updated client list", async () => {
            const client: SocketClient = store.getState().getIn(["clients", "client1"]).toJS();
            const scope: nock.Scope = nock(ADMIN_END_POINT)
                .delete(`/api/taskmanager/socket/${client.socket.id}`)
                .reply(200, {});
            await store.dispatch(kickClient(client.socket.id));
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.REMOVE_CLIENT,
                clientId: client.socket.id
            });
            scope.done();
        });
    });
    describe("Reducer", () => {
        const tasks: Job[] = [{ id: 30 } as Job];
        const clients: SocketClient[] = [{ socket: { id: "client1" } as SocketIO.Socket, state: 0 }];
        it("Should set the tasks only", () => {
            const [task]: Job[] = tasks;
            is(reducer(initialState, {
                type: ActionTypes.SET_TASKS,
                tasks
            }), initialState.set("tasks", fromJS({ [task.id]: task }))).should.be.true;
        });
        it("Should set the clients only", () => {
            const [client]: SocketClient[] = clients;
            is(reducer(initialState, {
                type: ActionTypes.SET_CLIENTS,
                clients
            }), initialState.set("clients", fromJS({ [client.socket.id]: client }))).should.be.true;
        });
    });
});
