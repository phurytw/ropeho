/**
 * @file Layout for the admin application
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../typings.d.ts" />
/// <reference path="../../../../definitions/react-router-config/index.d.ts" />
import * as React from "react";
import { AppBar, Navigation, Link, IconMenu, MenuItem, MenuDivider } from "react-toolbox";
import Helmet from "react-helmet";
import * as linkStyles from "./link.css";
import { title } from "./title.css";
import * as iconMenuStyles from "./iconMenu.css";
import * as topLinkStyles from "./topLinks.css";
import { container } from "./container.css";
import { fetchCurrentUser, Actions, logout } from "../../modules/session";
import { setError, Actions as ErrorActions } from "../../modules/error";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { RopehoAdminState } from "../../reducer";
import { getCurrentUser, getError, getHasRendered } from "../../selectors";
import { Roles } from "../../../enum";
import ErrorDialog from "../ErrorDialog";
import { Redirect } from "react-router";
import { RouteConfig, renderRoutes } from "react-router-config";

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
    route?: RouteConfig;
}

export class Layout extends React.Component<LayoutProps, {}> {
    goToProductions: () => void = (): void => window.location.assign("/productions");
    goToCategories: () => void = (): void => window.location.assign("/categories");
    goToPresentations: () => void = (): void => window.location.assign("/presentations");
    goToUsers: () => void = (): void => window.location.assign("/users");
    goToTasks: () => void = (): void => window.location.assign("/taskmanager");
    constructor(props: LayoutProps) {
        super(props);
    }
    dismissError: () => void = (): void => this.props.setError(undefined);
    logout: () => Promise<void> = (): Promise<void> => this.props.logout().then(() => window.location.replace("/login"));
    componentWillMount(): void {
        const { hasRendered, getCurrentUser }: LayoutProps = this.props;
        if (!hasRendered) {
            getCurrentUser();
        }
    }
    static fetchData(dispatch: Dispatch<RopehoAdminState>): Promise<Actions.SetCurrentUser> {
        return dispatch(fetchCurrentUser());
    }
    render(): JSX.Element {
        const { currentUser, route }: LayoutProps = this.props;
        if (currentUser && (!currentUser._id || currentUser.role !== Roles.Administrator)) {
            return <Redirect to="/login" />;
        } else {
            return <div className={container}>
                <Helmet>
                    <html lang="fr" />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <title>Ropeho Administration</title>
                    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto" />
                    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
                    {/* tslint:disable-next-line:no-http-string */}
                    <link rel="stylesheet" href="http://localhost:3011/styles.css" />
                </Helmet>
                <AppBar fixed={true}>
                    <h1 className={title}><a href="/">Ropeho Administration</a></h1>
                    <Navigation type="horizontal" theme={topLinkStyles}>
                        <Link theme={linkStyles} href="/productions" label="Productions" icon="photo_camera" />
                        <Link theme={linkStyles} href="/categories" label="Category" icon="photo_album" />
                        <Link theme={linkStyles} href="/presentations" label="Page d'acceuil" icon="home" />
                        <Link theme={linkStyles} href="/users" label="Comptes utilisateurs" icon="person" />
                        <Link theme={linkStyles} href="/taskmanager" label="Gestionnaire" icon="storage" />
                        {currentUser ? <Link theme={linkStyles} onClick={this.logout} label={`Déconnexion (${currentUser.name})`} icon="power_settings_new" /> : ""}
                    </Navigation>
                    <IconMenu icon="menu" theme={iconMenuStyles}>
                        <MenuItem theme={iconMenuStyles} icon="photo_camera" caption="Productions" onClick={this.goToProductions} />
                        <MenuItem theme={iconMenuStyles} icon="photo_album" caption="Category" onClick={this.goToCategories} />
                        <MenuItem theme={iconMenuStyles} icon="home" caption="Page d'acceuil" onClick={this.goToPresentations} />
                        <MenuItem theme={iconMenuStyles} icon="person" caption="Comptes utilisateurs" onClick={this.goToUsers} />
                        <MenuItem theme={iconMenuStyles} icon="storage" caption="Gestionnaire" onClick={this.goToTasks} />
                        {currentUser ? <MenuDivider /> : ""}
                        {currentUser ? <MenuItem theme={iconMenuStyles} onClick={this.logout} caption={`Déconnexion (${currentUser.name})`} icon="power_settings_new" /> : ""}
                    </IconMenu>
                </AppBar>
                {renderRoutes(route.routes)}
                <ErrorDialog error={this.props.error} dismiss={this.dismissError} />
            </div>;
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Layout);
