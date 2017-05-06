/**
 * @file Tests for the Layout component
 */
/// <reference path="../../../test.d.ts" />
import * as React from "react";
import Helmet from "react-helmet";
import { fetchCurrentUser, Actions, logout, login } from "../../../common/modules/session";
import { setError, Actions as ErrorActions } from "../../../common/modules/error";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { RopehoAdminState } from "../../reducer";
import { getCurrentUser, getError, getHasRendered } from "../../selectors";
import { Input, Button, Card, CardTitle, CardText } from "react-toolbox";
import { container, errorBox, element, logo as logoStyles } from "./container.css";
import { isEmail } from "validator";
import { logo } from "../../assets";
import { RouteComponentProps } from "react-router-dom";
import { Roles, ErrorCodes } from "../../../enum";
import { ADMIN_END_POINT } from "../../../common/helpers/resolveEndPoint";
import * as facebookButtonStyles from "./facebook.css";

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

export interface LoginProps extends Partial<RouteComponentProps<void>> {
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

export class Login extends React.PureComponent<LoginProps, LoginState> {
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
    login: (event?: React.FormEvent<HTMLFormElement>) => void = (event?: React.FormEvent<HTMLFormElement>): void => {
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
        this.setState({
            emailErrorMessage: "",
            passwordErrorMessage: ""
        });
        if (isEmail(email) && password) {
            this.props.login(email, password)
                .then(this.handleLogin);
        }
    }
    logout: () => Promise<Actions.SetCurrentUser> = (): Promise<Actions.SetCurrentUser> => this.props.logout();
    continueToDashboard: () => void = (): void => this.props.history.replace("/");
    setEmail: (email: string) => void = (email: string): void => {
        this.email = email;
    }
    setPassword: (password: string) => void = (password: string): void => {
        this.password = password;
    }
    handleLogin: (userAction: Actions.SetCurrentUser) => void = (userAction: Actions.SetCurrentUser): void => {
        if (userAction.user && userAction.user._id) {
            if (userAction.user.role === Roles.Administrator) {
                this.continueToDashboard();
            } else {
                this.props.setError({
                    developerMessage: "User is not administrator",
                    errorCode: ErrorCodes.Restricted,
                    status: 400,
                    userMessage: "Cet utilisateur n'est pas autorisé à accéder à cette interface"
                });
            }
        } else {
            this.props.setError({
                developerMessage: "Credentials do not match any user",
                errorCode: ErrorCodes.NotFound,
                status: 400,
                userMessage: "L'email ou le mot de passe est incorrect"
            });
        }
    }
    facebookLogin: () => void = (): void => window.location.replace(`${ADMIN_END_POINT}/api/auth/facebook?admin=1`);
    componentWillMount(): void {
        const { hasRendered, getCurrentUser }: LoginProps = this.props;
        if (!hasRendered) {
            getCurrentUser();
        }
    }
    static fetchData(dispatch: Dispatch<RopehoAdminState>): Promise<Actions.SetCurrentUser> {
        return dispatch(fetchCurrentUser());
    }
    render(): JSX.Element {
        const { error, currentUser }: LoginProps = this.props;
        const { emailErrorMessage, passwordErrorMessage }: LoginState = this.state;
        return <div className={container}>
            <Helmet>
                <html lang="fr" />
                <base href="/" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>Ropeho Administration</title>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto" />
                <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
            </Helmet>
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
                    <form className={element} onSubmit={this.login}>
                        <Input label="Email" required={true} type="email" error={emailErrorMessage} onChange={this.setEmail} />
                        <Input label="Mot de passe" required={true} type="password" error={passwordErrorMessage} onChange={this.setPassword} />
                        <Button type="submit" label="Connexion" primary={true} />
                        <Button type="button" label="Connexion avec Facebook" onClick={this.facebookLogin} theme={facebookButtonStyles} />
                    </form>
            }
            {error ? <Card className={`${errorBox} ${element}`}>
                <CardTitle title="Erreur" />
                <CardText>{error.userMessage}</CardText>
            </Card > : ""}
        </div>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
