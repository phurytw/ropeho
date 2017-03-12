/**
 * @file Layout for the admin application
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../typings.d.ts" />
import * as React from "react";
import { AppBar, Navigation, Link, IconMenu, MenuItem } from "react-toolbox";
import * as Helmet from "react-helmet";
import * as linkStyles from "./Link.css";
import { title } from "./Title.css";
import * as iconMenuStyles from "./IconMenu.css";
import * as topLinkStyles from "./TopLinks.css";
import { container } from "./Container.css";
import { fetchCurrentUser, Actions, logout } from "../../modules/session";
import { setError, Actions as ErrorActions } from "../../modules/error";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { RopehoAdminState } from "../../reducer";
import { getCurrentUser, getError, getHasRendered } from "../../selectors";
import { Roles } from "../../../enum";
import ErrorDialog from "../ErrorDialog";

export const mapStateToProps: (state: RopehoAdminState, ownProps?: LayoutProps) => LayoutProps =
    (state: RopehoAdminState, ownProps?: LayoutProps): LayoutProps => ({
        currentUser: getCurrentUser(state),
        hasRendered: getHasRendered(state),
        error: getError(state)
    });

export const mapDispatchToProps: (dispatch: Dispatch<any>, ownProps?: LayoutProps) => LayoutProps =
    (dispatch: Dispatch<any>, ownProps?: LayoutProps): LayoutProps => ({
        getCurrentUser: () => dispatch<Promise<Actions.SetCurrentUser>, {}>(fetchCurrentUser()),
        logout: () => dispatch<Promise<Actions.SetCurrentUser>, {}>(logout()),
        setError: (error: Ropeho.IErrorResponse) => dispatch<ErrorActions.SetError, {}>(setError(error))
    });

export interface LayoutProps {
    currentUser?: Ropeho.Models.User;
    hasRendered?: boolean;
    error?: Ropeho.IErrorResponse;
    getCurrentUser?: () => Promise<Actions.SetCurrentUser>;
    logout?: () => Promise<Actions.SetCurrentUser>;
    setError?: (error: Ropeho.IErrorResponse) => void;
}

export class Layout extends React.Component<LayoutProps, {}> {
    goToProductions: () => string = (): string => window.location.href = "/productions";
    goToCategories: () => string = (): string => window.location.href = "/categories";
    goToPresentations: () => string = (): string => window.location.href = "/presentations";
    goToUsers: () => string = (): string => window.location.href = "/users";
    goToTasks: () => string = (): string => window.location.href = "/taskmanager";
    constructor(props: LayoutProps) {
        super(props);
    }
    componentWillMount(): void {
        const { hasRendered, getCurrentUser, logout }: LayoutProps = this.props;
        const redirectToLogin: () => void = () => window.location.replace("/login");
        if (!hasRendered) {
            getCurrentUser()
                .then((userAction: Actions.SetCurrentUser) => {
                    if (!userAction.user || userAction.user.role !== Roles.Administrator) {
                        return logout().then(redirectToLogin, redirectToLogin);
                    }
                })
                .catch(redirectToLogin);
        }
    }
    static FetchData(dispatch: Dispatch<RopehoAdminState>): Promise<Actions.SetCurrentUser> {
        return dispatch(fetchCurrentUser());
    }
    render(): JSX.Element {
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
            <AppBar fixed={true}>
                <h1 className={title}>Ropeho Administration</h1>
                <Navigation type="horizontal" theme={topLinkStyles}>
                    <Link theme={linkStyles} href="/productions" label="Productions" icon="photo_camera" />
                    <Link theme={linkStyles} href="/categories" label="Category" icon="photo_album" />
                    <Link theme={linkStyles} href="/presentations" label="Page d'acceuil" icon="home" />
                    <Link theme={linkStyles} href="/users" label="Comptes utilisateurs" icon="person" />
                    <Link theme={linkStyles} href="/taskmanager" label="Gestionnaire" icon="storage" />
                </Navigation>
                <IconMenu icon="menu" theme={iconMenuStyles}>
                    <MenuItem icon="photo_camera" caption="Productions" onClick={this.goToProductions} />
                    <MenuItem icon="photo_album" caption="Category" onClick={this.goToCategories} />
                    <MenuItem icon="home" caption="Page d'acceuil" onClick={this.goToPresentations} />
                    <MenuItem icon="person" caption="Comptes utilisateurs" onClick={this.goToUsers} />
                    <MenuItem icon="storage" caption="Gestionnaire" onClick={this.goToTasks} />
                </IconMenu>
            </AppBar>
            {this.props.children}
            <ErrorDialog error={this.props.error} />
        </div>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Layout);
