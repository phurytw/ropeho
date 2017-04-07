/**
 * @file Component that shows a dialog box whenever there's an error
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../typings.d.ts" />
import * as React from "react";
import { Dialog } from "react-toolbox";
import { ErrorCodes } from "../../../enum";
import { isEqual } from "lodash";

export interface ErrorDialogProps {
    error?: Ropeho.IErrorResponse;
    dismiss?: () => void;
}

export class ErrorDialog extends React.Component<ErrorDialogProps, {}> {
    constructor(props: ErrorDialogProps) {
        super(props);
    }
    shouldComponentUpdate(nextProps: ErrorDialogProps): boolean {
        return !isEqual(nextProps.error, this.props.error);
    }
    dismiss: () => void = () => this.props.dismiss();
    render(): JSX.Element {
        const { error }: ErrorDialogProps = this.props;
        if (error) {
            // display custom header according to error code
            let errorHeader: string;
            switch (error.errorCode) {
                case ErrorCodes.AuthenticationRequired:
                    errorHeader = "Connexion requise";
                    break;
                case ErrorCodes.Restricted:
                    errorHeader = "Accès restreint";
                default:
                    errorHeader = "Erreur";
                    break;
            }
            return <Dialog active={true} title={errorHeader} actions={[{ label: "OK", onClick: this.dismiss }]}>
                <p>{error.userMessage}</p>
            </Dialog>;
        } else {
            return <Dialog active={false}></Dialog>;
        }
    }
}

export default ErrorDialog;
