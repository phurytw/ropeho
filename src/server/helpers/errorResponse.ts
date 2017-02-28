/**
 * @file Class to send to as the body of an HTTP response
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../typings.d.ts" />
import { Response } from "express-serve-static-core";
import { ErrorCodes } from "../../enum";

import IErrorResponse = Ropeho.IErrorResponse;

export const defaultErrorMessage: string = "Une erreur est survenue.";

/**
 * Class to send to as the body of an HTTP response
 */
export default class ErrorResponse {
    /**
     * @param {Error|string} devError Error or error message for the developer
     * @param {Error|string} clientError Error or error message to display in the UI
     */
    public developerMessage: string;
    public userMessage: string;
    public errorCode: ErrorCodes;
    public status: number;
    constructor(params?: IErrorResponse) {
        if (!params) {
            this.developerMessage = "";
            this.userMessage = defaultErrorMessage;
            this.errorCode = ErrorCodes.UnexpectedError;
            this.status = 500;
        } else {
            const { developerMessage, errorCode, status, userMessage }: IErrorResponse = params;
            this.developerMessage = developerMessage instanceof Error ? developerMessage.message : (developerMessage || "");
            this.userMessage = userMessage instanceof Error ? userMessage.message : (userMessage || defaultErrorMessage);
            this.status = status || 500;
            this.errorCode = errorCode || ErrorCodes.UnexpectedError;
        }
        if (typeof this.developerMessage !== "string" || typeof this.userMessage !== "string" || typeof this.status !== "number" || typeof this.errorCode !== "number") {
            throw TypeError("Invalid constructor parameters");
        }
    }
    public send(response: Response): void {
        response.status(this.status).send(this);
    }
}
