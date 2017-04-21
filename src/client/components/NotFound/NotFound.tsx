/**
 * @file Rendered when nothing matches. It sets an error and redirects the user to the homepage
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import * as React from "react";
import { Dispatch } from "redux";
import * as errorModule from "../../../common/modules/error";
import { connect } from "react-redux";
import { PartialRouteComponentProps, Redirect } from "react-router-dom";
import { RouteConfig } from "react-router-config";

export const mapDispatchToProps: (dispatch: Dispatch<any>, ownProps?: NotFoundProps) => NotFoundProps =
    (dispatch: Dispatch<any>, ownProps?: NotFoundProps): NotFoundProps => ({
        setError: (error: Ropeho.IErrorResponse) => dispatch<errorModule.Actions.SetError, {}>(errorModule.setError(error))
    });

export interface NotFoundProps extends PartialRouteComponentProps<void> {
    setError?: (error: Ropeho.IErrorResponse) => void;
    route?: RouteConfig;
}

export class NotFound extends React.Component<NotFoundProps, {}> {
    constructor(props: NotFoundProps) {
        super(props);
    }
    componentWillMount(): void {
        const { setError, location: { pathname, query } }: NotFoundProps = this.props;
        setError({
            developerMessage: `Not found ${pathname}${query ? `?${query}` : ""}`,
            userMessage: "Page non trouvée"
        });
    }
    render(): JSX.Element {
        return <Redirect to="/" />;
    }
}

export default connect(undefined, mapDispatchToProps)(NotFound);
