/**
 * @file Tests for the transfer queue module
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../test.d.ts" />
import { should } from "chai";
import { IStore, default as mockStore } from "redux-mock-store";
import { ActionTypes, defaultState, TransferQueueState, addToQueue, removeFromQueue, setTransferQueue, default as reducer } from "./transferQueue";
import { productions } from "../../sampleData/testDb";
import { head } from "lodash";
import { is, fromJS } from "immutable";
import reduxThunk from "redux-thunk";
should();

import SourceData = Ropeho.Socket.SourceData;

describe("Transfer queue modoule", () => {
    let store: IStore<TransferQueueState>;
    const target: Ropeho.Socket.SourceTargetOptions = {
        mainId: productions[0]._id,
        mediaId: productions[0].background._id,
        sourceId: productions[0].background.sources[0]._id
    };
    const data: ArrayBuffer = new ArrayBuffer(100);
    before(() => store = mockStore<TransferQueueState>([reduxThunk])(defaultState));
    afterEach(() => store.clearActions());
    describe("Action creators", () => {
        it("Should dispatch a source data to be added to the queue", () => {
            const item: SourceData = {
                isUpload: true,
                data,
                target
            };
            store.dispatch(addToQueue(item));
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.ADD_TO_QUEUE,
                item
            });
        });
        it("Should dispatch multiple source datas to replace the current queue", () => {
            const item: SourceData = {
                isUpload: true,
                data,
                target
            };
            store.dispatch(setTransferQueue([item, item]));
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.SET_QUEUE,
                transferQueue: [item, item]
            });
        });
        it("Should dispatch a source id to be removed", () => {
            store.dispatch(removeFromQueue(target.sourceId));
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.REMOVE_FROM_QUEUE,
                target: target.sourceId
            });
        });
    });
    describe("Reducer", () => {
        const item: SourceData = {
            isUpload: true,
            data,
            target
        };
        it("Should add an item to the queue", () => {
            is(reducer(undefined, {
                type: ActionTypes.ADD_TO_QUEUE,
                item
            }), fromJS({
                order: [target.sourceId],
                transferQueue: { [target.sourceId]: item }
            }));
        });
        it("Should update an item from the queue", () => {
            is(reducer(fromJS({
                order: [target.sourceId],
                transferQueue: { [target.sourceId]: item }
            }), {
                    type: ActionTypes.ADD_TO_QUEUE,
                    item
                }), fromJS({
                    order: [target.sourceId],
                    transferQueue: { [target.sourceId]: item }
                }));
        });
        it("Should replace the queue", () => {
            is(reducer(fromJS({
                order: ["someId"],
                transferQueue: { someId: item }
            }), {
                    type: ActionTypes.SET_QUEUE,
                    transferQueue: [item]
                }), fromJS({
                    order: [target.sourceId],
                    transferQueue: { [target.sourceId]: item }
                }));
        });
        it("Should remove an item from the queue", () => {
            is(reducer(fromJS({
                order: [target.sourceId],
                transferQueue: { [target.sourceId]: item }
            }), {
                    type: ActionTypes.REMOVE_FROM_QUEUE,
                    target: target.sourceId
                }), fromJS({
                    order: [],
                    transferQueue: {}
                }));
        });
    });
});
