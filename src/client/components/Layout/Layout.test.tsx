/**
 * @file Tests for the Layout component
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../../test.d.ts" />
import * as React from "react";
import { should, use } from "chai";
import * as sinonChai from "sinon-chai";
import { stub, spy } from "sinon";
import { shallow, ShallowWrapper } from "enzyme";
import { RopehoClientState, default as rootReducer } from "../../reducer";
import * as errorModule from "../../../common/modules/error";
import * as selectors from "../../selectors";
import { IStore, default as mockStore } from "redux-mock-store";
import { middlewares } from "../../store";
import hook from "../../../common/helpers/cssModulesHook";
hook();
import { MenuSide } from "../MenuSide";
import { MenuTop } from "../MenuTop";
import { LayoutProps, mapStateToProps, mapDispatchToProps, Layout } from "./Layout";
should();
use(sinonChai);

describe("Layout component", () => {
    let store: IStore<RopehoClientState>,
        dispatchStub: sinon.SinonStub;
    const props: LayoutProps = {
        route: {
            routes: []
        },
        history: {
            replace: () => ({})
        } as any
    };
    before(() => {
        store = mockStore<RopehoClientState>(middlewares())(rootReducer(undefined, { type: "" }));
        dispatchStub = stub(store, "dispatch");
    });
    describe("Element", () => {
        it("Should have a menu on the side", () => {
            const wrapper: ShallowWrapper<LayoutProps, {}> = shallow(<Layout {...props} />);
            wrapper.find(MenuSide).should.have.lengthOf(1);
        });
        it("Should have a menu at the top", () => {
            const wrapper: ShallowWrapper<LayoutProps, {}> = shallow(<Layout {...props} />);
            wrapper.find(MenuTop).should.have.lengthOf(1);
        });
    });
    describe("Props", () => {
        it("Should get the current error from the state", () => {
            const getErrorSpy: sinon.SinonSpy = spy(selectors, "getError");
            mapStateToProps(store.getState());
            getErrorSpy.should.have.been.calledOnce;
            getErrorSpy.restore();
        });
        it("Should set the error in the state", () => {
            const setErrorStub: sinon.SinonStub = stub(errorModule, "setError");
            const error: Ropeho.IErrorResponse = {
                developerMessage: "a nice error"
            };
            mapDispatchToProps(dispatchStub).setError(error);
            setErrorStub.should.have.been.calledOnce;
            setErrorStub.should.have.been.calledWith(error);
            setErrorStub.restore();
        });
    });
});
