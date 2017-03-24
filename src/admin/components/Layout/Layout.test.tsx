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
import { shallow, ShallowWrapper } from "enzyme";
import hook from "../../helpers/cssModulesHook";
import { RopehoAdminState, initialState } from "../../reducer";
import * as selectors from "../../selectors";
import * as sessionModule from "../../modules/session";
import { IStore, default as mockStore } from "redux-mock-store";
import { middlewares } from "../../store";
import { Roles } from "../../../enum";
import { includes } from "lodash";
hook();
import { Link, AppBar } from "react-toolbox";
import { LayoutProps, mapDispatchToProps, mapStateToProps, Layout } from "./Layout";
import { Redirect } from "react-router-dom";
should();
use(chaiEnzyme);
use(sinonChai);

describe("Layout component", () => {
    let store: IStore<RopehoAdminState>,
        dispatchStub: sinon.SinonStub;
    const user: Ropeho.Models.User = { _id: "id", role: Roles.Administrator };
    const props: LayoutProps = {
        getCurrentUser: (): Promise<sessionModule.Actions.SetCurrentUser> => new Promise<any>((resolve: (value?: sessionModule.Actions.SetCurrentUser | PromiseLike<sessionModule.Actions.SetCurrentUser>) => void) => resolve({
            type: sessionModule.ActionTypes.SET_CURRENT_USER,
            user
        })),
        currentUser: user,
        route: {
            routes: []
        }
    };
    before(() => {
        store = mockStore<RopehoAdminState>(middlewares())(initialState);
        dispatchStub = stub(store, "dispatch");
    });
    describe("Element", () => {
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
            it("Should have a navbar with a link to a disconnect button", () =>
                shallow(<Layout {...props} />).find(AppBar).find(Link).findWhere((link: ShallowWrapper<any, {}>) => {
                    const props: any = link.props();
                    return typeof props.onClick === "function" && includes(props.label, "Déconnexion");
                }).should.have.lengthOf(1));
        });
        describe("Redirection", () => {
            it("Should have a redirection element if the user is not allowed", () =>
                shallow(<Layout {...props} currentUser={{ _id: "id", role: Roles.User }} />).find(Redirect).should.have.lengthOf(1));
        });
    });
    describe("Methods", () => {
        let windowLocationAssignStub: sinon.SinonStub;
        before(() => windowLocationAssignStub = stub(window.location, "assign"));
        afterEach(() => windowLocationAssignStub.reset());
        after(() => windowLocationAssignStub.restore());
        describe("Redirection methods", () => {
            it("Should redirect to productions", () => {
                (shallow(<Layout {...props} />).instance() as Layout).goToProductions();
                windowLocationAssignStub.should.have.been.calledOnce;
                windowLocationAssignStub.should.have.been.calledWith("/productions");
            });
            it("Should redirect to categories", () => {
                (shallow(<Layout {...props} />).instance() as Layout).goToCategories();
                windowLocationAssignStub.should.have.been.calledOnce;
                windowLocationAssignStub.should.have.been.calledWith("/categories");
            });
            it("Should redirect to users", () => {
                (shallow(<Layout {...props} />).instance() as Layout).goToUsers();
                windowLocationAssignStub.should.have.been.calledOnce;
                windowLocationAssignStub.should.have.been.calledWith("/users");
            });
            it("Should redirect to presentations", () => {
                (shallow(<Layout {...props} />).instance() as Layout).goToPresentations();
                windowLocationAssignStub.should.have.been.calledOnce;
                windowLocationAssignStub.should.have.been.calledWith("/presentations");
            });
            it("Should redirect to task manager", () => {
                (shallow(<Layout {...props} />).instance() as Layout).goToTasks();
                windowLocationAssignStub.should.have.been.calledOnce;
                windowLocationAssignStub.should.have.been.calledWith("/taskmanager");
            });
        });
        it("Should log the user out", () => {
            const logoutSpy: sinon.SinonSpy = spy(() => Promise.resolve());
            (shallow(<Layout {...props} logout={logoutSpy} />).instance() as Layout).logout();
            logoutSpy.should.have.been.calledOnce;
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
        it("Should log out the user", () => {
            const logoutStub: sinon.SinonStub = stub(sessionModule, "logout");
            const props: LayoutProps = mapDispatchToProps(dispatchStub);
            props.logout();
            logoutStub.should.have.been.calledOnce;
            logoutStub.restore();
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
            const spiedProps: LayoutProps = {
                ...props,
                getCurrentUser: (): Promise<sessionModule.Actions.SetCurrentUser> => {
                    getCurrentSpy();
                    return new Promise<any>((resolve: (value?: sessionModule.Actions.SetCurrentUser | PromiseLike<sessionModule.Actions.SetCurrentUser>) => void) => resolve({
                        type: sessionModule.ActionTypes.SET_CURRENT_USER,
                        user: { role: Roles.Administrator }
                    }));
                }
            };
            shallow(<Layout {...spiedProps} />);
            getCurrentSpy.should.have.been.calledOnce;
        });
    });
    describe("Server side fetching", () => {
        it("Should get the current user using the static fetch", () => {
            const fetchCurrentStub: sinon.SinonStub = stub(sessionModule, "fetchCurrentUser");
            Layout.fetchData(dispatchStub);
            fetchCurrentStub.should.have.been.calledOnce;
            fetchCurrentStub.restore();
        });
    });
});
