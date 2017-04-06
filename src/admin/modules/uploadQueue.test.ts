/**
 * @file Tests for the transfer queue module
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../test.d.ts" />
import { should } from "chai";
import { IStore, default as mockStore } from "redux-mock-store";
import { ActionTypes, defaultState, UploadQueueState, setEntryInUploadQueue, removeEntryFromUploadQueue, replaceUploadQueue, setActive, default as reducer } from "./uploadQueue";
import { productions } from "../../sampleData/testDb";
import { head } from "lodash";
import { is, fromJS } from "immutable";
import reduxThunk from "redux-thunk";
import { v4 } from "uuid";
should();

import UploadEntry = Ropeho.Socket.UploadEntry;

describe("Transfer queue modoule", () => {
    let store: IStore<UploadQueueState>;
    const target: Ropeho.Socket.SourceTargetOptions = {
        mainId: productions[0]._id,
        mediaId: productions[0].background._id,
        sourceId: productions[0].background.sources[0]._id
    };
    const data: ArrayBuffer = new ArrayBuffer(100);
    const item: UploadEntry = {
        id: v4(),
        bytesSent: 0,
        data,
        target,
        active: true,
        objectURL: ""
    };
    before(() => store = mockStore<UploadQueueState>([reduxThunk])(defaultState));
    afterEach(() => store.clearActions());
    describe("Action creators", () => {
        it("Should dispatch a source data to be added to the queue", () => {
            store.dispatch(setEntryInUploadQueue(item));
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.SET_ENTRY,
                item
            });
        });
        it("Should dispatch multiple source datas to replace the current queue", () => {
            store.dispatch(replaceUploadQueue([item, item]));
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.REPLACE_QUEUE,
                uploadQueue: [item, item]
            });
        });
        it("Should dispatch an item to be removed", () => {
            store.dispatch(removeEntryFromUploadQueue(item.id));
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.REMOVE_ENTRY,
                id: item.id
            });
        });
        it("Should dispatch an item to enable or disable", () => {
            store.dispatch(setActive(item.id, true));
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.SET_ACTIVE,
                id: item.id,
                active: true
            });
        });
    });
    describe("Reducer", () => {
        it("Should add an item to the queue", () => {
            is(reducer(undefined, {
                type: ActionTypes.SET_ENTRY,
                item
            }), fromJS({
                order: [item.id],
                uploadQueue: { [item.id]: item }
            })).should.be.true;
        });
        it("Should update an item from the queue", () => {
            is(reducer(fromJS({
                order: [item.id],
                uploadQueue: { [item.id]: {} }
            }), {
                    type: ActionTypes.SET_ENTRY,
                    item
                }), fromJS({
                    order: [item.id],
                    uploadQueue: { [item.id]: item }
                })).should.be.true;
        });
        it("Should replace the queue", () => {
            is(reducer(fromJS({
                order: ["someId"],
                uploadQueue: { someId: item }
            }), {
                    type: ActionTypes.REPLACE_QUEUE,
                    uploadQueue: [item]
                }), fromJS({
                    order: [item.id],
                    uploadQueue: { [item.id]: item }
                })).should.be.true;
        });
        it("Should remove an item from the queue", () => {
            is(reducer(fromJS({
                order: [item.id],
                uploadQueue: { [item.id]: item }
            }), {
                    type: ActionTypes.REMOVE_ENTRY,
                    id: item.id
                }), fromJS({
                    order: [],
                    uploadQueue: {}
                })).should.be.true;
        });
        it("Should set the active state of an item", () => {
            is(reducer(fromJS({
                order: [item.id],
                uploadQueue: { [item.id]: item }
            }), {
                    type: ActionTypes.SET_ACTIVE,
                    id: item.id,
                    active: false
                }), fromJS({
                    order: [item.id],
                    uploadQueue: {
                        [item.id]: {
                            ...item,
                            active: false
                        }
                    }
                })).should.be.true;
        });
    });
});
