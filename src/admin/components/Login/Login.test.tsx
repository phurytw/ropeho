/**
 * @file Tests for the login component
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../../test.d.ts" />
import * as React from "react";
import { should, use } from "chai";
import * as sinonChai from "sinon-chai";
import * as chaiEnzyme from "chai-enzyme";
import { stub, spy } from "sinon";
import { shallow, mount, ReactWrapper, ShallowWrapper } from "enzyme";
import { RopehoAdminState, default as rootReducer } from "../../reducer";
import * as selectors from "../../selectors";
import * as sessionModule from "../../../common/modules/session";
import { IStore, default as mockStore } from "redux-mock-store";
import { middlewares } from "../../store";
import { Roles } from "../../../enum";
import { includes } from "lodash";
import { v4 } from "uuid";
import { ADMIN_END_POINT } from "../../../common/helpers/resolveEndPoint";
import hook from "../../../common/helpers/cssModulesHook";
hook();
import { LoginProps, mapDispatchToProps, mapStateToProps, Login } from "./Login";
import { Card } from "react-toolbox";
should();
use(chaiEnzyme);
use(sinonChai);

describe("Login component", () => {
    let store: IStore<RopehoAdminState>,
        dispatchStub: sinon.SinonStub;
    before(() => {
        store = mockStore<RopehoAdminState>(middlewares())(rootReducer(undefined, { type: "" }));
        dispatchStub = stub(store, "dispatch");
    });
    describe("Element", () => {
        const props: LoginProps = {
            getCurrentUser: (): Promise<sessionModule.Actions.SetCurrentUser> => new Promise<any>((resolve: (value?: sessionModule.Actions.SetCurrentUser | PromiseLike<sessionModule.Actions.SetCurrentUser>) => void) => resolve({
                type: sessionModule.ActionTypes.SET_CURRENT_USER,
                user: { _id: v4(), role: Roles.Administrator }
            }))
        };
        describe("Current user", () => {
            it("Should show the currently logged in user and a disconnect button", () => {
                const testUser: Ropeho.Models.User = { _id: v4(), name: "TestName", email: "test@test.com", role: Roles.User };
                const mounted: ReactWrapper<any, {}> = mount(<Login {...props} currentUser={testUser} />);
                mounted.findWhere((node: ReactWrapper<any, {}>) => node.type() === "button" && node.text() === "Déconnexion").should.have.lengthOf(1);
                mounted.findWhere((node: ReactWrapper<any, {}>) => {
                    if (node.type() === "p") {
                        const text: string = node.text();
                        return includes<string>(text, testUser.name) && includes<string>(text, testUser.email);
                    } else {
                        return false;
                    }
                });
            });
            it("Should also show a continue button that leads to the dashboard", () =>
                mount(<Login {...props} currentUser={{ _id: v4(), role: Roles.Administrator }} />).findWhere((node: ReactWrapper<any, {}>) => node.type() === "button").should.have.lengthOf(2));
            it("Should be able to disconnect via the button", () => {
                const testUser: Ropeho.Models.User = { _id: v4(), name: "TestName", email: "test@test.com", role: Roles.User };
                mount(<Login {...props} currentUser={testUser} />).findWhere((node: ReactWrapper<any, {}>) => node.type() === "button" && typeof node.prop("onClick") === "function").should.have.lengthOf(1);
            });
        });
        describe("Form", () => {
            it("Should have an input for the email", () => {
                mount(<Login {...props} />).findWhere((child: ReactWrapper<LoginProps, {}>) =>
                    child.type() === "input" &&
                    child.parent().findWhere((label: ReactWrapper<LoginProps, {}>) => label.type() === "label" && includes<string>(label.text(), "Email")).length === 1).exists().should.be.true;
            });
            it("Should have an input for the password", () => {
                mount(<Login {...props} />).findWhere((child: ReactWrapper<LoginProps, {}>) =>
                    child.type() === "input" &&
                    child.parent().findWhere((label: ReactWrapper<LoginProps, {}>) => label.type() === "label" && includes<string>(label.text(), "Mot de passe")).length === 1).exists().should.be.true;
            });
            it("Should have a form with an onSubmit handler", () => {
                const loginShallow: ShallowWrapper<LoginProps, {}> = shallow(<Login {...props} />);
                const onSubmitProp: any = loginShallow.find("form").prop("onSubmit");
                (typeof onSubmitProp).should.equal("function");
            });
            it("Should have a connect with Facebook button", () =>
                mount(<Login {...props} />).findWhere((node: ReactWrapper<any, {}>) => node.type() === "button" && node.text() === "Connexion avec Facebook" && typeof node.prop("onClick") === "function").should.have.lengthOf(1));
        });
        describe("Errors", () => {
            it("Should show errors on the page", () =>
                mount(<Login {...props} error={{ userMessage: "testerror" }} />).html().should.contain("testerror"));
            it("Should not show if there is no error", () =>
                shallow(<Login {...props} />).find(Card).should.have.lengthOf(0));
        });
    });
    describe("Methods", () => {
        let getCurrentUser: () => Promise<sessionModule.Actions.SetCurrentUser>;
        before(() => getCurrentUser = (): Promise<sessionModule.Actions.SetCurrentUser> => new Promise<any>((resolve: (value?: sessionModule.Actions.SetCurrentUser | PromiseLike<sessionModule.Actions.SetCurrentUser>) => void) => resolve({
            type: sessionModule.ActionTypes.SET_CURRENT_USER,
            user: { role: Roles.Administrator }
        })));
        describe("Classic login handler", () => {
            let setErrorSpy: sinon.SinonSpy;
            before(() => setErrorSpy = spy());
            afterEach(() => setErrorSpy.reset());
            it("Should not do anything if there's no user", () => {
                const replaceStub: sinon.SinonStub = stub();
                const loginInstance: Login = shallow(<Login setError={setErrorSpy} getCurrentUser={getCurrentUser} history={{ replace: replaceStub } as any} />).instance() as Login;
                loginInstance.handleLogin({ type: sessionModule.ActionTypes.SET_CURRENT_USER, user: {} });
                replaceStub.should.not.have.been.called;
                setErrorSpy.should.have.been.calledOnce;
            });
            it("Should notify if the user is not an administrator", () => {
                const replaceStub: sinon.SinonStub = stub();
                const loginInstance: Login = shallow(<Login setError={setErrorSpy} getCurrentUser={getCurrentUser} history={{ replace: replaceStub } as any} />).instance() as Login;
                loginInstance.handleLogin({ type: sessionModule.ActionTypes.SET_CURRENT_USER, user: { _id: v4(), role: Roles.User } });
                replaceStub.should.not.have.been.called;
                setErrorSpy.should.have.been.calledOnce;
            });
            it("Should login if the user is an administrator", () => {
                const replaceStub: sinon.SinonStub = stub();
                const loginInstance: Login = shallow(<Login setError={setErrorSpy} getCurrentUser={getCurrentUser} history={{ replace: replaceStub } as any} />).instance() as Login;
                loginInstance.handleLogin({ type: sessionModule.ActionTypes.SET_CURRENT_USER, user: { _id: v4(), role: Roles.Administrator } });
                replaceStub.should.have.been.calledOnce;
                setErrorSpy.should.not.have.been.called;
            });
        });
        describe("Classic login", () => {
            let loginSpy: sinon.SinonSpy;
            let props: LoginProps;
            before(() => {
                loginSpy = spy();
                props = {
                    getCurrentUser,
                    login: (email: string, password: string): any => loginSpy(email, password)
                };
            });
            afterEach(() => loginSpy.reset());
            it("Should login using the email and password inputs", (done: MochaDone) => {
                const email: string = "email@test.com",
                    password: string = "MyPasswordNobodyWillEverFind";
                const loginProp: sinon.SinonSpy = spy((email: string, password: string): Promise<sessionModule.Actions.SetCurrentUser> =>
                    Promise.resolve<sessionModule.Actions.SetCurrentUser>({
                        type: sessionModule.ActionTypes.SET_CURRENT_USER,
                        user: { _id: v4(), role: Roles.Administrator }
                    }));
                const loginInstance: Login = mount(<Login {...props} login={loginProp} />).instance() as Login;
                stub(loginInstance, "handleLogin")
                    .callsFake(() => {
                        loginProp.should.have.been.calledOnce;
                        loginProp.should.have.been.calledWith(email, password);
                        done();
                    });
                loginInstance.email = email;
                loginInstance.password = password;
                loginInstance.login();
            });
            it("Should not login if the email is not valid", () => {
                const email: string = "email@test",
                    password: string = "MyPasswordNobodyWillEverFind";
                const loginInstance: Login = mount(<Login {...props} />).instance() as Login;
                loginInstance.email = email;
                loginInstance.password = password;
                loginInstance.login();
                loginSpy.should.have.not.been.calledOnce;
            });
            it("Should not login if the password is empty", () => {
                const email: string = "email@test.com",
                    password: string = "";
                const loginInstance: Login = mount(<Login {...props} />).instance() as Login;
                loginInstance.email = email;
                loginInstance.password = password;
                loginInstance.login();
                loginSpy.should.have.not.been.calledOnce;
            });
        });
        describe("Logout", () => {
            it("Should disconnect the current user", () => {
                const logoutSpy: sinon.SinonSpy = spy();
                (mount(<Login logout={logoutSpy} getCurrentUser={getCurrentUser} />).instance() as Login).logout();
                logoutSpy.should.have.been.calledOnce;
            });
        });
        describe("Facebook login", () => {
            it("Should prompt facebook connection", () => {
                const replaceStub: sinon.SinonStub = stub(window.location, "replace");
                (mount(<Login getCurrentUser={getCurrentUser} error={{}} />).instance() as Login).facebookLogin();
                replaceStub.should.have.been.calledWith(`${ADMIN_END_POINT}/api/auth/facebook?admin=1`);
                replaceStub.restore();
            });
        });
    });
    describe("Props", () => {
        it("Should check if user is logged in", () => {
            const fetchCurrentStub: sinon.SinonStub = stub(sessionModule, "fetchCurrentUser");
            const props: LoginProps = mapDispatchToProps(dispatchStub);
            props.getCurrentUser();
            fetchCurrentStub.should.have.been.calledOnce;
            fetchCurrentStub.restore();
        });
        it("Should log the user in", () => {
            const loginStub: sinon.SinonStub = stub(sessionModule, "login");
            const props: LoginProps = mapDispatchToProps(dispatchStub);
            props.login("email", "password");
            loginStub.should.have.been.calledOnce;
            loginStub.restore();
        });
        it("Should log the user out", () => {
            const logoutStub: sinon.SinonStub = stub(sessionModule, "logout");
            const props: LoginProps = mapDispatchToProps(dispatchStub);
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
        it("Should get the user", () => {
            const getCurrentSpy: sinon.SinonSpy = spy();
            const props: LoginProps = {
                getCurrentUser: (): Promise<sessionModule.Actions.SetCurrentUser> => {
                    getCurrentSpy();
                    return new Promise<any>((resolve: (value?: sessionModule.Actions.SetCurrentUser | PromiseLike<sessionModule.Actions.SetCurrentUser>) => void) => resolve({
                        type: sessionModule.ActionTypes.SET_CURRENT_USER,
                        user: { role: Roles.Administrator }
                    }));
                }
            };
            shallow(<Login {...props} />);
            getCurrentSpy.should.have.been.calledOnce;
        });
    });
    describe("Server side fetching", () => {
        it("Should get the current user using the static fetch", () => {
            const fetchCurrentStub: sinon.SinonStub = stub(sessionModule, "fetchCurrentUser");
            Login.fetchData(dispatchStub);
            fetchCurrentStub.should.have.been.calledOnce;
            fetchCurrentStub.restore();
        });
    });
});
