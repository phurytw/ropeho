/**
 * @file Tests for the Layout component
 */
/// <reference path="../../../test.d.ts" />
// tslint:disable:react-this-binding-issue
import * as React from "react";
import * as Helmet from "react-helmet";
import { fetchCurrentUser, Actions, logout, login } from "../../modules/session";
import { setError, Actions as ErrorActions } from "../../modules/error";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { RopehoAdminState } from "../../reducer";
import { getCurrentUser, getError, getHasRendered } from "../../selectors";
import { Input, Button, Card, CardTitle, CardText } from "react-toolbox";
import { container, errorBox, element, logo as logoStyles } from "./container.css";
import { isEmail } from "validator";
import { logo } from "../../assets";
import { Roles, ErrorCodes } from "../../../enum";

export const mapStateToProps: (state: RopehoAdminState, ownProps?: LoginProps) => LoginProps =
    (state: RopehoAdminState, ownProps?: LoginProps): LoginProps => ({
        currentUser: getCurrentUser(state),
        hasRendered: getHasRendered(state),
        error: getError(state)
    });

export const mapDispatchToProps: (dispatch: Dispatch<any>, ownProps?: LoginProps) => LoginProps =
    (dispatch: Dispatch<any>, ownProps?: LoginProps): LoginProps => ({
        getCurrentUser: () => dispatch<Promise<Actions.SetCurrentUser>, {}>(fetchCurrentUser()),
        login: (email: string, password: string) => dispatch<Promise<Actions.SetCurrentUser>, {}>(login(email, password)),
        logout: () => dispatch<Promise<Actions.SetCurrentUser>, {}>(logout()),
        setError: (error: Ropeho.IErrorResponse) => dispatch<ErrorActions.SetError, {}>(setError(error))
    });

export interface LoginProps {
    currentUser?: Ropeho.Models.User;
    hasRendered?: boolean;
    error?: Ropeho.IErrorResponse;
    getCurrentUser?: () => Promise<Actions.SetCurrentUser>;
    logout?: () => Promise<Actions.SetCurrentUser>;
    setError?: (error: Ropeho.IErrorResponse) => void;
    login?: (email: string, password: string) => Promise<Actions.SetCurrentUser>;
}

export interface LoginState {
    emailErrorMessage?: string;
    passwordErrorMessage?: string;
}

export class Login extends React.Component<LoginProps, LoginState> {
    email: string = "";
    password: string = "";
    constructor(props: LoginProps) {
        super(props);
        this.state = {
            emailErrorMessage: "",
            passwordErrorMessage: ""
        };
    }
    dismissError: () => void = (): void => this.props.setError(undefined);
    login(event?: React.FormEvent<HTMLFormElement>): void {
        // monkey patching for the tests
        if (event) {
            event.preventDefault();
        }
        const { email, password }: Login = this;
        if (!email || !isEmail(email)) {
            this.setState({
                emailErrorMessage: "L'email n'est pas valide"
            });
        }
        if (!password) {
            this.setState({
                passwordErrorMessage: "Le mot de passe est vide"
            });
        }
        if (isEmail(email) && password) {
            this.props.login(email, password).then(this.continueToDashboard);
        }
    }
    logout: () => Promise<Actions.SetCurrentUser> = (): Promise<Actions.SetCurrentUser> => this.props.logout();
    continueToDashboard: () => void = (): void => window.location.replace("/");
    setEmail(email: string): void {
        this.email = email;
    }
    setPassword(password: string): void {
        this.password = password;
    }
    componentWillMount(): void {
        const { hasRendered, getCurrentUser, setError }: LoginProps = this.props;
        if (!hasRendered) {
            getCurrentUser()
                .then((userAction: Actions.SetCurrentUser) => {
                    if (userAction.user && userAction.user._id && userAction.user.role !== Roles.Administrator) {
                        setError({
                            developerMessage: "User is not administrator",
                            errorCode: ErrorCodes.Restricted,
                            status: 400,
                            userMessage: "Cet utilisateur n'est pas autorisé à accéder à cette interface"
                        });
                    }
                });
        }
    }
    static FetchData(dispatch: Dispatch<RopehoAdminState>): Promise<Actions.SetCurrentUser> {
        return dispatch(fetchCurrentUser());
    }
    render(): JSX.Element {
        const { error, currentUser }: LoginProps = this.props;
        const { emailErrorMessage, passwordErrorMessage }: LoginState = this.state;
        return <div className={container}>
            <Helmet
                htmlAttributes={{ lang: "fr" }}
                meta={[
                    { name: "viewport", content: "width=device-width, initial-scale=1" }
                ]}
                title="Admin Ropeho"
                link={[
                    { rel: "stylesheet", href: "https://fonts.googleapis.com/css?family=Roboto" },
                    { rel: "stylesheet", href: "https://fonts.googleapis.com/icon?family=Material+Icons" },
                    // tslint:disable-next-line:no-http-string
                    { rel: "stylesheet", href: "http://localhost:3011/styles.css" }
                ]}
            />
            <div className={element}>
                <img className={logoStyles} src={`data:image/jpeg;base64,${logo}`} alt="Ropeho Productions logo" />
            </div>
            {
                currentUser && currentUser._id ?
                    <div className={element}>
                        <p>Actuellement connecté en tant que {currentUser.name} ({currentUser.email})</p>
                        {currentUser.role === Roles.Administrator ? <Button primary={true} onClick={this.continueToDashboard}>Accéder à l'interface</Button> : ""}
                        <Button accent={true} onClick={this.logout}>Déconnexion</Button>
                    </div>
                    :
                    <form className={element} onSubmit={this.login.bind(this)}>
                        <Input label="Email" required={true} type="email" error={emailErrorMessage} onChange={this.setEmail.bind(this)} />
                        <Input label="Mot de passe" required={true} type="password" error={passwordErrorMessage} onChange={this.setPassword.bind(this)} />
                        <Button type="submit" label="Connexion" primary={true} />
                    </form>
            }
            {error ? <Card className={`${errorBox} ${element}`}>
                <CardTitle title="Erreur" />
                <CardText>{error.userMessage}</CardText>
            </Card> : ""}
        </div>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);