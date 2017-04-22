/**
 * @file Layout for the client application
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../typings.d.ts" />
/// <reference path="../../../../definitions/react-router-config/index.d.ts" />
import * as React from "react";
import Helmet from "react-helmet";
import { setError, Actions as ErrorActions } from "../../../common/modules/error";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { RopehoClientState } from "../../reducer";
import { getError, getHasRendered } from "../../selectors";
import { RouteConfig, renderRoutes } from "react-router-config";
import { RouteComponentProps } from "react-router-dom";
import MenuSide from "../MenuSide";
import MenuTop from "../MenuTop";
import { container } from "./styles.css";

export const mapStateToProps: (state: RopehoClientState, ownProps?: LayoutProps) => LayoutProps =
    (state: RopehoClientState, ownProps?: LayoutProps): LayoutProps => ({
        hasRendered: getHasRendered(state),
        error: getError(state)
    });

export const mapDispatchToProps: (dispatch: Dispatch<any>, ownProps?: LayoutProps) => LayoutProps =
    (dispatch: Dispatch<any>, ownProps?: LayoutProps): LayoutProps => ({
        setError: (error: Ropeho.IErrorResponse) => dispatch<ErrorActions.SetError, {}>(setError(error))
    });

export interface LayoutProps extends Partial<RouteComponentProps<void>> {
    hasRendered?: boolean;
    error?: Ropeho.IErrorResponse;
    setError?: (error: Ropeho.IErrorResponse) => void;
    route?: RouteConfig;
}

export class Layout extends React.Component<LayoutProps, {}> {
    constructor(props: LayoutProps) {
        super(props);
    }
    dismissError: () => void = (): void => this.props.setError(undefined);
    render(): JSX.Element {
        const { route }: LayoutProps = this.props;
        return <div className={container}>
            <Helmet>
                <html lang="fr" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link href="https://fonts.googleapis.com/css?family=Playfair+Display|Playfair+Display+SC" rel="stylesheet" />
                <script src="https://use.fontawesome.com/c4ead80743.js"></script>
                <title>Ropeho Productions</title>
            </Helmet>
            <MenuTop />
            <MenuSide />
            {renderRoutes(route.routes)}
        </div>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Layout);
