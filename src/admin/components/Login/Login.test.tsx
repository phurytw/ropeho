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
import hook from "../../helpers/cssModulesHook";
import { RopehoAdminState, initialState } from "../../reducer";
import * as selectors from "../../selectors";
import * as sessionModule from "../../modules/session";
import { IStore, default as mockStore } from "redux-mock-store";
import { middlewares } from "../../store";
import { Roles } from "../../../enum";
import { includes } from "lodash";
import { v4 } from "uuid";
hook();
import { LoginProps, mapDispatchToProps, mapStateToProps, Login } from "./Login";
should();
use(chaiEnzyme);
use(sinonChai);

describe("Login component", () => {
    let store: IStore<RopehoAdminState>,
        dispatchStub: sinon.SinonStub;
    before(() => {
        store = mockStore<RopehoAdminState>(middlewares)(initialState);
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
        });
        describe("Errors", () => {
            it("Should show errors on the page", () =>
                mount(<Login {...props} error={{ userMessage: "testerror" }} />).html().should.contain("testerror"));
            it("Should not show if there is no error", () =>
                mount(<Login {...props} error={{ userMessage: "testerror" }} />).html().should.contain("testerror"));
        });
        describe("Methods", () => {
            const loginSpy: sinon.SinonSpy = spy();
            const logoutSpy: sinon.SinonSpy = spy();
            const props: LoginProps = {
                getCurrentUser: (): Promise<sessionModule.Actions.SetCurrentUser> => new Promise<any>((resolve: (value?: sessionModule.Actions.SetCurrentUser | PromiseLike<sessionModule.Actions.SetCurrentUser>) => void) => resolve({
                    type: sessionModule.ActionTypes.SET_CURRENT_USER,
                    user: { role: Roles.Administrator }
                })),
                login: (email: string, password: string): any => loginSpy(email, password),
                logout: (): any => logoutSpy()
            };
            afterEach(() => loginSpy.reset());
            it("Should login using the email and password inputs", (done: MochaDone) => {
                const email: string = "email@test.com",
                    password: string = "MyPasswordNobodyWillEverFind";
                const loginProp: (email: string, password: string) => Promise<sessionModule.Actions.SetCurrentUser> =
                    (email: string, password: string): Promise<sessionModule.Actions.SetCurrentUser> => new Promise<any>((resolve: (value?: sessionModule.Actions.SetCurrentUser | PromiseLike<sessionModule.Actions.SetCurrentUser>) => void) => {
                        loginSpy(email, password);
                        done();
                    });
                const loginInstance: Login = mount(<Login {...props} login={loginProp} />).instance() as Login;
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
            it("Should not login if the password is not empty", () => {
                const email: string = "email@test.com",
                    password: string = "";
                const loginInstance: Login = mount(<Login {...props} />).instance() as Login;
                loginInstance.email = email;
                loginInstance.password = password;
                loginInstance.login();
                loginSpy.should.have.not.been.calledOnce;
            });
            it("Should disconnect the current user", () => {
                (mount(<Login {...props} />).instance() as Login).logout();
                logoutSpy.should.have.been.calledOnce;
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
        it("Should get the current user", () => {
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
        it("Should dispatch an error if the user is not an administrator", (done: MochaDone) => {
            const props: LoginProps = {
                getCurrentUser: (): Promise<sessionModule.Actions.SetCurrentUser> => {
                    return new Promise<any>((resolve: (value?: sessionModule.Actions.SetCurrentUser | PromiseLike<sessionModule.Actions.SetCurrentUser>) => void) => resolve({
                        type: sessionModule.ActionTypes.SET_CURRENT_USER,
                        user: { _id: v4(), role: Roles.User }
                    }));
                },
                setError: (): any => {
                    done();
                }
            };
            shallow(<Login {...props} />);
        });
    });
    describe("Server side fetching", () => {
        it("Should get the current user using the static fetch", () => {
            const fetchCurrentStub: sinon.SinonStub = stub(sessionModule, "fetchCurrentUser");
            Login.FetchData(dispatchStub);
            fetchCurrentStub.should.have.been.calledOnce;
            fetchCurrentStub.restore();
        });
    });
});
