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
import hook from "../../../common/helpers/cssModulesHook";
import { RopehoAdminState, default as rootReducer } from "../../reducer";
import * as selectors from "../../selectors";
import * as sessionModule from "../../../common/modules/session";
import { IStore, default as mockStore } from "redux-mock-store";
import { middlewares } from "../../store";
import { Roles } from "../../../enum";
import { includes } from "lodash";
hook();
import { Link, AppBar, Snackbar } from "react-toolbox";
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
        },
        history: {
            replace: () => ({})
        } as any,
        uploadQueue: []
    };
    before(() => {
        store = mockStore<RopehoAdminState>(middlewares())(rootReducer(undefined, { type: "" }));
        dispatchStub = stub(store, "dispatch");
    });
    describe("Element", () => {
        describe("Navigation links", () => {
            it("Should have a navbar with a link to the production index", () => {
                const wrapper: ShallowWrapper<any, {}> = shallow(<Layout {...props} />);
                const instance: Layout = wrapper.instance() as Layout;
                wrapper.find(AppBar).find(Link).find({ onClick: instance.goToProductions }).should.have.lengthOf(1);
            });
            it("Should have a navbar with a link to the category index", () => {
                const wrapper: ShallowWrapper<any, {}> = shallow(<Layout {...props} />);
                const instance: Layout = wrapper.instance() as Layout;
                wrapper.find(AppBar).find(Link).find({ onClick: instance.goToCategories }).should.have.lengthOf(1);
            });
            it("Should have a navbar with a link to the presentation index", () => {
                const wrapper: ShallowWrapper<any, {}> = shallow(<Layout {...props} />);
                const instance: Layout = wrapper.instance() as Layout;
                wrapper.find(AppBar).find(Link).find({ onClick: instance.goToPresentations }).should.have.lengthOf(1);
            });
            it("Should have a navbar with a link to the user index", () => {
                const wrapper: ShallowWrapper<any, {}> = shallow(<Layout {...props} />);
                const instance: Layout = wrapper.instance() as Layout;
                wrapper.find(AppBar).find(Link).find({ onClick: instance.goToUsers }).should.have.lengthOf(1);
            });
            it("Should have a navbar with a link to the task manager route", () => {
                const wrapper: ShallowWrapper<any, {}> = shallow(<Layout {...props} />);
                const instance: Layout = wrapper.instance() as Layout;
                wrapper.find(AppBar).find(Link).find({ onClick: instance.goToTasks }).should.have.lengthOf(1);
            });
            it("Should have a navbar with a link to a disconnect button", () => {
                shallow(<Layout {...props} />).find(AppBar).find(Link).findWhere((link: ShallowWrapper<any, {}>) => {
                    const props: any = link.props();
                    return typeof props.onClick === "function" && includes(props.label, "Déconnexion");
                }).should.have.lengthOf(1);
            });
            it("Should display currently transferring files at the bottom", () => {
                shallow(<Layout {...props} uploadQueue={[{ bytesSent: 0, id: "id", max: 0, target: undefined, active: true, objectURL: "" }]} />).find(Snackbar).should.have.lengthOf(1);
            });
        });
        describe("Redirection", () => {
            it("Should have a redirection element if the user is not allowed", () =>
                shallow(<Layout {...props} currentUser={{ _id: "id", role: Roles.User }} />).find(Redirect).should.have.lengthOf(1));
        });
    });
    describe("Methods", () => {
        let pushStub: sinon.SinonStub;
        before(() => pushStub = stub());
        afterEach(() => pushStub.reset());
        describe("Redirection methods", () => {
            it("Should redirect to productions", () => {
                (shallow(<Layout {...props} history={({ push: pushStub } as any)} />).instance() as Layout).goToProductions();
                pushStub.should.have.been.calledOnce;
                pushStub.should.have.been.calledWith("/productions");
            });
            it("Should redirect to categories", () => {
                (shallow(<Layout {...props} history={({ push: pushStub } as any)} />).instance() as Layout).goToCategories();
                pushStub.should.have.been.calledOnce;
                pushStub.should.have.been.calledWith("/categories");
            });
            it("Should redirect to users", () => {
                (shallow(<Layout {...props} history={({ push: pushStub } as any)} />).instance() as Layout).goToUsers();
                pushStub.should.have.been.calledOnce;
                pushStub.should.have.been.calledWith("/users");
            });
            it("Should redirect to presentations", () => {
                (shallow(<Layout {...props} history={({ push: pushStub } as any)} />).instance() as Layout).goToPresentations();
                pushStub.should.have.been.calledOnce;
                pushStub.should.have.been.calledWith("/presentations");
            });
            it("Should redirect to task manager", () => {
                (shallow(<Layout {...props} history={({ push: pushStub } as any)} />).instance() as Layout).goToTasks();
                pushStub.should.have.been.calledOnce;
                pushStub.should.have.been.calledWith("/taskmanager");
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
        it("Should get the upload queue", () => {
            const getActiveUploadQueueSpy: sinon.SinonSpy = spy(selectors, "getActiveUploadQueue");
            mapStateToProps(store.getState());
            getActiveUploadQueueSpy.should.have.been.calledOnce;
            getActiveUploadQueueSpy.restore();
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
