/**
 * @file Tests for the admin socket client
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../test.d.ts" />
import { should, use } from "chai";
import { stub } from "sinon";
import * as sinonChai from "sinon-chai";
import { SocketEvents } from "../../src/enum";
import * as socketIo from "socket.io";
import socketClient from "./adminSocketClient";
import createStore from "./store";
import { Store, Dispatch } from "redux";
import { RopehoAdminState } from "./reducer";
import { v4 } from "uuid";
import { productions } from "../sampleData/testDb";
import config from "../config";
import { setEntryInUploadQueue, replaceUploadQueue } from "./modules/uploadQueue";
import { setFile } from "./modules/objectURL";
import * as sessionModule from "../common/modules/session";
import { getError } from "./selectors";
should();
use(sinonChai);

import UploadEntry = Ropeho.Socket.UploadEntry;
import UploadOptions = Ropeho.Socket.UploadOptions;
import Production = Ropeho.Models.Production;

describe("Admin socket client", () => {
    const port: number = 5000;
    const endPoint: string = `http://localhost:${port}`;
    const [production]: Production[] = productions;
    const file: File = new File([new ArrayBuffer(100)], "file.jpeg");
    const entry: UploadEntry = {
        id: v4(),
        bytesSent: 0,
        max: 100,
        target: {
            mainId: production._id,
            mediaId: production.banner._id,
            sourceId: production.banner.sources[0]._id
        },
        active: true,
        objectURL: "blob:http://localhost/myObjectURLThankYou"
    };
    let store: Store<RopehoAdminState>,
        client: SocketIOClient.Socket,
        server: SocketIO.Server,
        socketAuthStub: sinon.SinonStub;
    beforeEach(() => {
        store = createStore();
        socketAuthStub = stub(sessionModule, "socketAuthentication")
            .callsFake(() => (dispatch: Dispatch<any>) => Promise.resolve({}));
    });
    afterEach(() => {
        if (client) {
            client.disconnect();
        }
        if (server) {
            server.close();
        }
        socketAuthStub.restore();
    });
    it("Should throw if it doesn't have a store", () => {
        should().throw(socketClient.bind(null, undefined));
    });
    describe("Uploading", () => {
        it("Should start uploading when receiving a new file to upload", (done: MochaDone) => {
            server = socketIo.listen(port);
            server.on("connect", (client: SocketIO.Socket) => {
                client.on(SocketEvents.UploadInit, (options: UploadOptions) => {
                    options.should.deep.equal({
                        target: entry.target
                    } as UploadOptions);
                    done();
                });
            });

            client = socketClient(store, endPoint);
            client.on("connect", () => {
                store.dispatch(setEntryInUploadQueue(entry));
            });
        });
        it("Should keep processing the upload queue after finish upload the first file", (done: MochaDone) => {
            server = socketIo.listen(port);
            let callCount: number = 0;
            server.on("connect", (client: SocketIO.Socket) => {
                client.on(SocketEvents.UploadInit, (options: UploadOptions) => {
                    callCount++;
                    client.emit(SocketEvents.UploadEnd);
                    if (callCount === 2) {
                        done();
                    }
                });
            });

            client = socketClient(store, endPoint);
            client.on("connect", () => {
                store.dispatch(replaceUploadQueue([{
                    ...entry,
                    id: v4()
                }, {
                    ...entry,
                    id: v4()
                }]));
            });
        });
        it("Should disconnect on error (exceptions) and dispatch the error in the store and disable the item", (done: MochaDone) => {
            server = socketIo.listen(port);
            const error: Ropeho.IErrorResponse = {
                developerMessage: "Whoops"
            };
            server.on("connect", (client: SocketIO.Socket) => {
                client.emit(SocketEvents.Exception, error.developerMessage);
            });

            client = socketClient(store, endPoint);
            client.on("connect", () => {
                client.on("disconnect", () => {
                    getError(store.getState()).should.have.property("developerMessage", error.developerMessage);
                    done();
                });
            });
        });
        it("Should dispatch an error for caught errors but not disconnect", (done: MochaDone) => {
            server = socketIo.listen(port);
            const error: Ropeho.IErrorResponse = {
                developerMessage: "Whoops"
            };
            server.on("connect", (client: SocketIO.Socket) => {
                client.emit(SocketEvents.BadRequest, error.developerMessage);
            });

            client = socketClient(store, endPoint);
            client.on("connect", () => {
                client.on(SocketEvents.BadRequest, () => {
                    getError(store.getState()).should.have.property("developerMessage", error.developerMessage);
                    client.connected.should.be.true;
                    done();
                });
            });
        });
        it("Should send file and update the store with the progression", (done: MochaDone) => {
            server = socketIo.listen(port);
            let receivedData: Buffer = new Buffer(0);
            let bytesSent: number = 0;
            server.on("connect", (client: SocketIO.Socket) => {
                client.on(SocketEvents.UploadInit, ({ filename }: Ropeho.Socket.UploadOptions) => {
                    filename.should.equal(file.name);
                    client.emit(SocketEvents.UploadInit);
                });
                client.on(SocketEvents.Upload, (data: ArrayBuffer) => {
                    receivedData = new Buffer([receivedData, data]);
                    bytesSent += config.media.chunkSize;
                    bytesSent = Math.min(bytesSent, data.byteLength);
                    store.getState().uploadQueue.getIn(["uploadQueue", entry.id]).get("bytesSent").should.equal(bytesSent);
                });
                client.on(SocketEvents.UploadEnd, () => done());
            });

            client = socketClient(store, endPoint);
            client.on("connect", () => {
                store.dispatch(setFile(entry.objectURL, file));
                store.dispatch(setEntryInUploadQueue(entry));
            });
        });
    });
});
