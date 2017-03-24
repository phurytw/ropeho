/**
 * @file Tests for the task manager module
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../test.d.ts" />
import { should } from "chai";
import { is } from "immutable";
import { ActionTypes, ITaskManagerState, TaskManagerState, cancelTask, fetchRunning, kickClient, setTransferQueue, startTask, default as reducer } from "./taskManager";
import { ADMIN_END_POINT } from "../helpers/resolveEndPoint";
import { head, filter } from "lodash";
import { default as mockStore, IStore } from "redux-mock-store";
import "isomorphic-fetch";
import { middlewares } from "../store";
import * as nock from "nock";
import { Job } from "kue";
import { ActionTypes as ErrorTypes } from "./error";
should();

import SocketClient = Ropeho.Socket.SocketClient;
import SourceData = Ropeho.Socket.SourceData;

describe("Task manager module", () => {
    let store: IStore<TaskManagerState>;
    const initialState: ITaskManagerState = {
        tasks: [{ id: 20 } as Job, { id: 40 } as Job],
        clients: [{ socket: { id: "client1" } as SocketIO.Socket, state: 0 }, { socket: { id: "client2" } as SocketIO.Socket, state: 0 }]
    };
    before(() => {
        store = mockStore<TaskManagerState>(middlewares({
            host: ADMIN_END_POINT,
            error: {
                type: ErrorTypes.SET_ERROR
            }
        }))(new TaskManagerState(initialState));
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
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.SET_TASKS_AND_CLIENTS,
                tasks,
                clients
            });
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
                type: ActionTypes.SET_TASKS_AND_CLIENTS,
                tasks
            });
            scope.done();
        });
        it("Should start a task and dispatch the updated task list", async () => {
            const tasks: Job[] = store.getState().tasks;
            const [task]: Job[] = tasks;
            const scope: nock.Scope = nock(ADMIN_END_POINT)
                .post(`/api/taskmanager/task/${task.id}`)
                .reply(200, task);
            await store.dispatch(startTask(task.id));
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.SET_TASKS_AND_CLIENTS,
                tasks,
            });
            scope.done();
        });
        it("Should cancel a task and dispatch the updated task list", async () => {
            const tasks: Job[] = store.getState().tasks;
            const [task]: Job[] = tasks;
            const scope: nock.Scope = nock(ADMIN_END_POINT)
                .delete(`/api/taskmanager/task/${task.id}`)
                .reply(200, {});
            await store.dispatch(cancelTask(task.id));
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.SET_TASKS_AND_CLIENTS,
                tasks: filter<Job>(tasks, (t: Job) => t.id !== task.id)
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
                type: ActionTypes.SET_TASKS_AND_CLIENTS,
                clients
            });
            scope.done();
        });
        it("Should disconnect a client and dispatch the updated client list", async () => {
            const clients: SocketClient[] = store.getState().clients;
            const [client]: SocketClient[] = clients;
            const scope: nock.Scope = nock(ADMIN_END_POINT)
                .delete(`/api/taskmanager/socket/${client.socket.id}`)
                .reply(200, {});
            await store.dispatch(kickClient(client.socket.id));
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.SET_TASKS_AND_CLIENTS,
                clients: filter<SocketClient>(clients, (c: SocketClient) => c.socket.id !== client.socket.id)
            });
            scope.done();
        });
    });
    describe("File transfer queue", () => {
        it("Should set the transfer queue", () => {
            const transferQueue: SourceData[] = [{
                data: new ArrayBuffer(100),
                isUpload: true,
                target: {
                    mainId: "p1",
                    mediaId: "m1",
                    sourceId: "s1"
                }
            }, {
                data: new ArrayBuffer(100),
                isUpload: false,
                target: {
                    mainId: "p2",
                    mediaId: "m2",
                    sourceId: "s2"
                }
            }];
            store.dispatch(setTransferQueue(transferQueue));
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.SET_TRANSFER_QUEUE,
                transferQueue
            });
        });
    });
    describe("Reducer", () => {
        const tasks: Job[] = [{ id: 30 } as Job];
        const clients: SocketClient[] = [{ socket: { id: "client1" } as SocketIO.Socket, state: 0 }];
        it("Should set the tasks only", () => {
            is(reducer(new TaskManagerState(initialState), {
                type: ActionTypes.SET_TASKS_AND_CLIENTS,
                tasks
            }), new TaskManagerState({
                ...initialState,
                tasks
            })).should.be.true;
        });
        it("Should set the clients only", () => {
            is(reducer(new TaskManagerState(initialState), {
                type: ActionTypes.SET_TASKS_AND_CLIENTS,
                clients
            }), new TaskManagerState({
                ...initialState,
                clients
            })).should.be.true;
        });
        it("Should set both the tasks and the clients only", () => {
            is(reducer(new TaskManagerState(initialState), {
                type: ActionTypes.SET_TASKS_AND_CLIENTS,
                tasks,
                clients
            }), new TaskManagerState({
                ...initialState,
                tasks,
                clients
            })).should.be.true;
        });
        it("Should set the transfer queue", () => {
            const transferQueue: SourceData[] = [{
                data: new ArrayBuffer(100),
                isUpload: true,
                target: {
                    mainId: "p1",
                    mediaId: "m1",
                    sourceId: "s1"
                }
            }, {
                data: new ArrayBuffer(100),
                isUpload: false,
                target: {
                    mainId: "p2",
                    mediaId: "m2",
                    sourceId: "s2"
                }
            }];
            is(reducer(new TaskManagerState(initialState), {
                type: ActionTypes.SET_TRANSFER_QUEUE,
                transferQueue
            }), new TaskManagerState({
                ...initialState,
                transferQueue
            })).should.be.true;
        });
    });
});
