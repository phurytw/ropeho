/**
 * @file Tests for the Layout component
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../../test.d.ts" />
import * as React from "react";
import { should, use } from "chai";
import * as sinonChai from "sinon-chai";
import * as chaiEnzyme from "chai-enzyme";
import { stub, spy } from "sinon";
import { shallow } from "enzyme";
import hook from "../../helpers/cssModulesHook";
import { RopehoAdminState, initialState } from "../../reducer";
import * as selectors from "../../selectors";
import * as sessionModule from "../../modules/session";
import { IStore, default as mockStore } from "redux-mock-store";
import { middlewares } from "../../store";
import { ErrorCodes, Roles } from "../../../enum";
hook();
import { Link, AppBar } from "react-toolbox";
import { LayoutProps, mapDispatchToProps, mapStateToProps, Layout } from "./Layout";
should();
use(chaiEnzyme);
use(sinonChai);

describe("Layout component", () => {
    let store: IStore<RopehoAdminState>,
        dispatchStub: sinon.SinonStub;
    before(() => {
        store = mockStore<RopehoAdminState>(middlewares)(initialState);
        dispatchStub = stub(store, "dispatch");
    });
    describe("Element", () => {
        const props: LayoutProps = {
            getCurrentUser: (): Promise<sessionModule.Actions.SetCurrentUser> => new Promise<any>((resolve: (value?: sessionModule.Actions.SetCurrentUser | PromiseLike<sessionModule.Actions.SetCurrentUser>) => void) => resolve({
                type: sessionModule.ActionTypes.SET_CURRENT_USER,
                user: { role: Roles.Administrator }
            }))
        };
        describe("Navigation links", () => {
            it("Should have a navbar with a link to the production index", () =>
                shallow(<Layout {...props} />).find(AppBar).find(Link).find({ href: "/productions" }).should.have.lengthOf(1));
            it("Should have a navbar with a link to the category index", () =>
                shallow(<Layout {...props} />).find(AppBar).find(Link).find({ href: "/categories" }).should.have.lengthOf(1));
            it("Should have a navbar with a link to the presentation index", () =>
                shallow(<Layout {...props} />).find(AppBar).find(Link).find({ href: "/presentations" }).should.have.lengthOf(1));
            it("Should have a navbar with a link to the user index", () =>
                shallow(<Layout {...props} />).find(AppBar).find(Link).find({ href: "/users" }).should.have.lengthOf(1));
            it("Should have a navbar with a link to the task manager route", () =>
                shallow(<Layout {...props} />).find(AppBar).find(Link).find({ href: "/taskmanager" }).should.have.lengthOf(1));
        });
    });
    describe("Props", () => {
        it("Should check if user is logged in", () => {
            const fetchCurrentStub: sinon.SinonStub = stub(sessionModule, "fetchCurrentUser");
            const props: LayoutProps = mapDispatchToProps(dispatchStub);
            props.getCurrentUser();
            fetchCurrentStub.should.have.been.calledOnce;
            fetchCurrentStub.restore();
        });
        it("Should get the current user from the state", () => {
            const getCurrentSpy: sinon.SinonSpy = spy(selectors, "getCurrentUser");
            mapStateToProps(store.getState());
            getCurrentSpy.should.have.been.calledOnce;
            getCurrentSpy.restore();
        });
        it("Should get the current error from the state", () => {
            const getErrorSpy: sinon.SinonSpy = spy(selectors, "getError");
            mapStateToProps(store.getState());
            getErrorSpy.should.have.been.calledOnce;
            getErrorSpy.restore();
        });
        it("Should get if the application has been rendered from the server from the state", () => {
            const getHasRenderedSpy: sinon.SinonSpy = spy(selectors, "getHasRendered");
            mapStateToProps(store.getState());
            getHasRenderedSpy.should.have.been.calledOnce;
            getHasRenderedSpy.restore();
        });
    });
    describe("Lifecycle", () => {
        it("Should get the current user", () => {
            const getCurrentSpy: sinon.SinonSpy = spy();
            const props: LayoutProps = {
                getCurrentUser: (): Promise<sessionModule.Actions.SetCurrentUser> => {
                    getCurrentSpy();
                    return new Promise<any>((resolve: (value?: sessionModule.Actions.SetCurrentUser | PromiseLike<sessionModule.Actions.SetCurrentUser>) => void) => resolve({
                        type: sessionModule.ActionTypes.SET_CURRENT_USER,
                        user: { role: Roles.Administrator }
                    }));
                }
            };
            shallow(<Layout {...props} />);
            getCurrentSpy.should.have.been.calledOnce;
        });
        it("Should redirect to login page is user is not logged in", async () => {
            const windowLocationStub: sinon.SinonStub = stub(window.location, "replace");
            let promise: Promise<any>;
            const props: LayoutProps = {
                getCurrentUser: () => {
                    promise = new Promise<sessionModule.Actions.SetCurrentUser>((resolve: (value?: sessionModule.Actions.SetCurrentUser | PromiseLike<sessionModule.Actions.SetCurrentUser>) => void, reject: (reason?: any) => void) =>
                        reject({
                            errorCode: ErrorCodes.AuthenticationRequired
                        } as Ropeho.IErrorResponse));
                    return promise;
                }
            };
            shallow(<Layout {...props} />);
            try {
                await promise;
            } catch (error) {
                (error as Ropeho.IErrorResponse).errorCode.should.equal(ErrorCodes.AuthenticationRequired);
                windowLocationStub.should.have.been.calledWith("/login");
                windowLocationStub.restore();
            }
        });
        it("Should disconnect and redirect to login page is user is not authorized", async () => {
            const windowLocationStub: sinon.SinonStub = stub(window.location, "replace");
            let promise: Promise<any>;
            const props: LayoutProps = {
                getCurrentUser: () => {
                    promise = new Promise<sessionModule.Actions.SetCurrentUser>((resolve: (value?: sessionModule.Actions.SetCurrentUser | PromiseLike<sessionModule.Actions.SetCurrentUser>) => void) =>
                        resolve({
                            type: sessionModule.ActionTypes.SET_CURRENT_USER,
                            user: {
                                role: Roles.User
                            }
                        } as sessionModule.Actions.SetCurrentUser));
                    return promise;
                }
            };
            shallow(<Layout {...props} />);
            await promise;
            windowLocationStub.should.have.been.calledWith("/login");
            windowLocationStub.restore();
        });
    });
    describe("Server side fetching", () => {
        it("Should get the current user using the static fetch", () => {
            const fetchCurrentStub: sinon.SinonStub = stub(sessionModule, "fetchCurrentUser");
            Layout.FetchData(dispatchStub);
            fetchCurrentStub.should.have.been.calledOnce;
            fetchCurrentStub.restore();
        });
    });
});
