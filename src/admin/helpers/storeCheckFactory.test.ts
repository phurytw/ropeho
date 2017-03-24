/**
 * @file Tests for the storeCheckFactory function
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../test.d.ts" />
import { should, use } from "chai";
import { spy } from "sinon";
import * as sinonChai from "sinon-chai";
import storeCheckFactory from "./storeCheckFactory";
import { fetchProductionById } from "../modules/productionEdit";
import { getProduction } from "../selectors";
import { RouterState } from "react-router";
import { RopehoAdminState, initialState } from "../reducer";
import { middlewares } from "../store";
import { IStore, default as mockStore } from "redux-mock-store";
import { ProductionEditState, ActionTypes, Actions } from "../modules/productionEdit";
import { v4 } from "uuid";
import { Dispatch } from "redux";
should();
use(sinonChai);

import Production = Ropeho.Models.Production;

describe("Store check hook factory", () => {
    let store: IStore<RopehoAdminState>;
    before(() => store = mockStore<RopehoAdminState>(middlewares())(initialState));
    afterEach(() => store.clearActions());
    describe("Validation", () => {
        it("Should redirect if there's no store", (done: MochaDone) => {
            const replaceSpy: sinon.SinonSpy = spy();
            const cb: (...params: any[]) => void = () => {
                replaceSpy.should.have.been.calledWith(replacePath);
                done();
            };
            const replacePath: string = "/test";
            storeCheckFactory(undefined, getProduction, (production: Production) => production && production._id && true, (nextState: RouterState) => fetchProductionById(nextState.params.productionId), replacePath)({
                params: {
                    productionId: ""
                }
            } as any, replaceSpy, cb);
        });
        it("Should redirect if there's no selector", (done: MochaDone) => {
            const replaceSpy: sinon.SinonSpy = spy();
            const cb: (...params: any[]) => void = () => {
                replaceSpy.should.have.been.calledWith(replacePath);
                done();
            };
            const replacePath: string = "/test";
            storeCheckFactory<RopehoAdminState>(store as any, undefined, (production: Production) => production && production._id && true, (nextState: RouterState) => fetchProductionById(nextState.params.productionId), replacePath)({
                params: {
                    productionId: ""
                }
            } as any, replaceSpy, cb);
        });
        it("Should redirect if there's no verification function", (done: MochaDone) => {
            const replaceSpy: sinon.SinonSpy = spy();
            const cb: (...params: any[]) => void = () => {
                replaceSpy.should.have.been.calledWith(replacePath);
                done();
            };
            const replacePath: string = "/test";
            storeCheckFactory<RopehoAdminState>(store as any, getProduction, undefined, (nextState: RouterState) => fetchProductionById(nextState.params.productionId), replacePath)({
                params: {
                    productionId: ""
                }
            } as any, replaceSpy, cb);
        });
        it("Should redirect if verification is needed but the request function is not a function", (done: MochaDone) => {
            const replaceSpy: sinon.SinonSpy = spy();
            const cb: (...params: any[]) => void = () => {
                replaceSpy.should.have.been.calledWith(replacePath);
                done();
            };
            const replacePath: string = "/test";
            storeCheckFactory<RopehoAdminState>(store as any, getProduction, (production: Production) => production && production._id && true, undefined, replacePath)({
                params: {
                    productionId: ""
                }
            } as any, replaceSpy, cb);
        });
    });
    describe("Calling without requiring a request", () => {
        it("Should not redirect if verification returns true", (done: MochaDone) => {
            const replaceSpy: sinon.SinonSpy = spy();
            const requestSpy: sinon.SinonSpy = spy();
            const cb: (...params: any[]) => void = () => {
                replaceSpy.should.not.have.been.called;
                requestSpy.should.not.have.been.called;
                done();
            };
            const replacePath: string = "/test";
            store = mockStore<RopehoAdminState>(middlewares())({
                productionEdit: new ProductionEditState({
                    production: {
                        _id: v4()
                    }
                })
            });
            storeCheckFactory<RopehoAdminState>(store as any,
                getProduction,
                (production: Production) => production && production._id && true,
                undefined,
                replacePath)({
                    params: {
                        productionId: ""
                    }
                } as any, replaceSpy, cb);
        });
        it("Should redirect if verification returns false but without calling the request function", (done: MochaDone) => {
            const replaceSpy: sinon.SinonSpy = spy();
            const requestSpy: sinon.SinonSpy = spy();
            const cb: (...params: any[]) => void = () => {
                replaceSpy.should.have.been.calledWith(replacePath);
                requestSpy.should.not.have.been.called;
                done();
            };
            const replacePath: string = "/test";
            store = mockStore<RopehoAdminState>(middlewares())({
                productionEdit: new ProductionEditState({
                    production: undefined
                })
            });
            storeCheckFactory<RopehoAdminState>(store as any,
                getProduction,
                (production: Production) => {
                    if (production && production._id) {
                        return true;
                    } else {
                        return false;
                    }
                },
                requestSpy,
                replacePath)({
                    params: {
                        productionId: ""
                    }
                } as any, replaceSpy, cb);
        });
    });
    describe("Calling and requesting data", () => {
        const productionId: string = v4();
        it("Should redirect if the verification eventually returns false", (done: MochaDone) => {
            const replaceSpy: sinon.SinonSpy = spy();
            const requestSpy: sinon.SinonSpy = spy();
            const cb: (...params: any[]) => void = () => {
                replaceSpy.should.have.been.calledWith(replacePath);
                requestSpy.should.not.have.been.called;
                done();
            };
            const replacePath: string = "/test";
            let dontLoopPlease: boolean = false;
            store = mockStore<RopehoAdminState>(middlewares())({
                productionEdit: new ProductionEditState({
                    production: undefined
                })
            });
            storeCheckFactory<RopehoAdminState>(store as any,
                getProduction,
                (production: Production) => {
                    if (production && production._id) {
                        return true;
                    } else if (dontLoopPlease) {
                        return false;
                    } else {
                        dontLoopPlease = true;
                        return null;
                    }
                },
                (nextState: RouterState) => (dispatch: Dispatch<RopehoAdminState>, getState: () => RopehoAdminState, extraArgument: {}) => Promise.resolve<Actions.SetProduction>({
                    type: ActionTypes.SET_PRODUCTION,
                    production: {}
                }).then((action: Actions.SetProduction) => dispatch(action)),
                replacePath)({
                    params: { productionId }
                } as any, replaceSpy, cb);
        });
        it("Should not redirect if the verification eventually returns true", (done: MochaDone) => {
            const replaceSpy: sinon.SinonSpy = spy();
            const requestSpy: sinon.SinonSpy = spy();
            const cb: (...params: any[]) => void = () => {
                replaceSpy.should.not.have.been.called;
                requestSpy.should.not.have.been.called;
                done();
            };
            const replacePath: string = "/test";
            let dontLoopPlease: boolean = false;
            store = mockStore<RopehoAdminState>(middlewares())({
                productionEdit: new ProductionEditState({
                    production: undefined
                })
            });
            storeCheckFactory<RopehoAdminState>(store as any,
                getProduction,
                (production: Production) => {
                    if (production && production._id) {
                        return true;
                    } else if (dontLoopPlease) {
                        return true;
                    } else {
                        dontLoopPlease = true;
                        return null;
                    }
                },
                (nextState: RouterState) => (dispatch: Dispatch<RopehoAdminState>, getState: () => RopehoAdminState, extraArgument: {}) => Promise.resolve<Actions.SetProduction>({
                    type: ActionTypes.SET_PRODUCTION,
                    production: {}
                }).then((action: Actions.SetProduction) => dispatch(action)),
                replacePath)({
                    params: { productionId }
                } as any, replaceSpy, cb);
        });
    });
});
