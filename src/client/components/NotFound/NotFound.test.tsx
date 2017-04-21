/**
 * @file Tests for the NotFound component
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import * as React from "react";
import { should, use } from "chai";
import * as sinonChai from "sinon-chai";
import { stub, spy } from "sinon";
import { shallow, ShallowWrapper } from "enzyme";
import * as errorModule from "../../../common/modules/error";
import { IStore, default as mockStore } from "redux-mock-store";
import { RopehoClientState, default as rootReducer } from "../../reducer";
import { middlewares } from "../../store";
import { Redirect } from "react-router-dom";
import hook from "../../../common/helpers/cssModulesHook";
hook();
import { NotFound, NotFoundProps, mapDispatchToProps } from "./NotFound";
should();
use(sinonChai);

describe("NotFound component", () => {
    let store: IStore<RopehoClientState>,
        dispatchStub: sinon.SinonStub;
    const setErrorSpy: sinon.SinonSpy = spy();
    const props: NotFoundProps = {
        location: {
            pathname: "/something",
            query: ""
        },
        setError: setErrorSpy
    } as any;
    before(() => {
        store = mockStore<RopehoClientState>(middlewares())(rootReducer(undefined, { type: "" }));
        dispatchStub = stub(store, "dispatch");
    });
    it("Should have a Redirect to the home page", () => {
        const wrapper: ShallowWrapper<NotFoundProps, {}> = shallow(<NotFound {...props} />);
        wrapper.find(Redirect).find({ to: "/" }).should.have.lengthOf(1);
    });
    it("Should set an error", () => {
        const setErrorStub: sinon.SinonStub = stub(errorModule, "setError");
        const error: Ropeho.IErrorResponse = {
            developerMessage: "aNiceError"
        };
        mapDispatchToProps(dispatchStub).setError(error);
        dispatchStub.should.have.been.calledOnce;
        setErrorStub.should.have.been.calledOnce;
        setErrorStub.restore();
    });
    it("Should set an error", () => {
        setErrorSpy.reset();
        shallow(<NotFound {...props} />);
        setErrorSpy.should.have.been.calledOnce;
    });
});
