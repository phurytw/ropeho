/**
 * @file Layout for the admin application
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../typings.d.ts" />
/// <reference path="../../../../definitions/react-router-config/index.d.ts" />
import * as React from "react";
import { AppBar, Navigation, Link, IconMenu, MenuItem, MenuDivider, Snackbar, ProgressBar } from "react-toolbox";
import Helmet from "react-helmet";
import * as linkStyles from "./link.css";
import { title } from "./title.css";
import * as iconMenuStyles from "./iconMenu.css";
import * as topLinkStyles from "./topLinks.css";
import { container } from "./container.css";
import { fetchCurrentUser, Actions, logout } from "../../../common/modules/session";
import { setError, Actions as ErrorActions } from "../../../common/modules/error";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { RopehoAdminState } from "../../reducer";
import { getCurrentUser, getError, getHasRendered, getActiveUploadQueue } from "../../selectors";
import { Roles } from "../../../enum";
import ErrorDialog from "../ErrorDialog";
import { Redirect } from "react-router-dom";
import { RouteConfig, renderRoutes } from "react-router-config";
import { RouteComponentProps } from "react-router-dom";

export const mapStateToProps: (state: RopehoAdminState, ownProps?: LayoutProps) => LayoutProps =
    (state: RopehoAdminState, ownProps?: LayoutProps): LayoutProps => ({
        currentUser: getCurrentUser(state),
        hasRendered: getHasRendered(state),
        error: getError(state),
        uploadQueue: getActiveUploadQueue(state)
    });

export const mapDispatchToProps: (dispatch: Dispatch<any>, ownProps?: LayoutProps) => LayoutProps =
    (dispatch: Dispatch<any>, ownProps?: LayoutProps): LayoutProps => ({
        getCurrentUser: () => dispatch<Promise<Actions.SetCurrentUser>, {}>(fetchCurrentUser()),
        logout: () => dispatch<Promise<Actions.SetCurrentUser>, {}>(logout()),
        setError: (error: Ropeho.IErrorResponse) => dispatch<ErrorActions.SetError, {}>(setError(error))
    });

export interface LayoutProps extends Partial<RouteComponentProps<void>> {
    currentUser?: Ropeho.Models.User;
    hasRendered?: boolean;
    error?: Ropeho.IErrorResponse;
    uploadQueue?: Ropeho.Socket.UploadEntry[];
    getCurrentUser?: () => Promise<Actions.SetCurrentUser>;
    logout?: () => Promise<Actions.SetCurrentUser>;
    setError?: (error: Ropeho.IErrorResponse) => void;
    route?: RouteConfig;
}

export class Layout extends React.Component<LayoutProps, {}> {
    goToProductions: () => void = (): void => this.props.history.push("/productions");
    goToCategories: () => void = (): void => this.props.history.push("/categories");
    goToPresentations: () => void = (): void => this.props.history.push("/presentations");
    goToUsers: () => void = (): void => this.props.history.push("/users");
    goToTasks: () => void = (): void => this.props.history.push("/taskmanager");
    constructor(props: LayoutProps) {
        super(props);
    }
    dismissError: () => void = (): void => this.props.setError(undefined);
    logout: () => Promise<void> = (): Promise<void> => this.props.logout().then(() => this.props.history.replace("/login"));
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
        const { currentUser, route, uploadQueue }: LayoutProps = this.props;
        const [currentlyUploading]: Ropeho.Socket.UploadEntry[] = uploadQueue;
        if (currentUser && (!currentUser._id || currentUser.role !== Roles.Administrator)) {
            return <Redirect to="/login" />;
        } else {
            return <div className={container}>
                <Helmet>
                    <html lang="fr" />
                    <base href="/" />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <title>Ropeho Administration</title>
                    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto" />
                    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
                </Helmet>
                <AppBar fixed={true}>
                    <h1 className={title}><a href="/">Ropeho Administration</a></h1>
                    <Navigation type="horizontal" theme={topLinkStyles}>
                        <Link theme={linkStyles} onClick={this.goToProductions} label="Productions" icon="photo_camera" />
                        <Link theme={linkStyles} onClick={this.goToCategories} label="Categories" icon="photo_album" />
                        <Link theme={linkStyles} onClick={this.goToPresentations} label="Page d'acceuil" icon="home" />
                        <Link theme={linkStyles} onClick={this.goToUsers} label="Comptes utilisateurs" icon="person" />
                        <Link theme={linkStyles} onClick={this.goToTasks} label="Gestionnaire" icon="storage" />
                        {currentUser ? <Link theme={linkStyles} onClick={this.logout} label={`Déconnexion (${currentUser.name})`} icon="power_settings_new" /> : ""}
                    </Navigation>
                    <IconMenu icon="menu" theme={iconMenuStyles}>
                        <MenuItem theme={iconMenuStyles} icon="photo_camera" caption="Productions" onClick={this.goToProductions} />
                        <MenuItem theme={iconMenuStyles} icon="photo_album" caption="Categories" onClick={this.goToCategories} />
                        <MenuItem theme={iconMenuStyles} icon="home" caption="Page d'acceuil" onClick={this.goToPresentations} />
                        <MenuItem theme={iconMenuStyles} icon="person" caption="Comptes utilisateurs" onClick={this.goToUsers} />
                        <MenuItem theme={iconMenuStyles} icon="storage" caption="Gestionnaire" onClick={this.goToTasks} />
                        {currentUser ? <MenuDivider /> : ""}
                        {currentUser ? <MenuItem theme={iconMenuStyles} onClick={this.logout} caption={`Déconnexion (${currentUser.name})`} icon="power_settings_new" /> : ""}
                    </IconMenu>
                </AppBar>
                {renderRoutes(route.routes)}
                {
                    currentlyUploading ? <Snackbar
                        active={true}>
                        <p>Envoi de {uploadQueue.length} fichiers</p>
                        <ProgressBar
                            max={currentlyUploading.max}
                            mode="determinate"
                            value={currentlyUploading.bytesSent}
                        />
                    </Snackbar> : null
                }
                <ErrorDialog error={this.props.error} dismiss={this.dismissError} />
            </div>;
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Layout);
