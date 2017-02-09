/**
 * @file Creates and verifies random tokens
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../typings.d.ts" />
import * as moment from "moment";
import { randomBytes } from "crypto";
import config from "../../config";

/**
 * Creates an invitation token
 * @param {number} tokenLength Length of the base token
 * @param {number} daysValid Days until the token is expired
 * @returns {string} An invitation token
 */
export const computeToken: (tokenLength?: number, daysValid?: number) => string =
    (tokenLength?: number, daysValid?: number): string => {
        tokenLength = tokenLength || config.users.tokenLength;
        daysValid = daysValid || config.users.daysTokenValid;
        return `${randomBytes(tokenLength).toString("hex")}-${moment().utc().add(daysValid, "days").valueOf()}`;
    };

/**
 * Verifies if an invitation token is still valid (has not expired)
 * @param {string} token The token to verify
 * @returns {boolean} true if the token is valid
 */
export const isTokenValid: (token: string, tokenLength?: number) => boolean =
    (token: string, tokenLength?: number): boolean => {
        tokenLength = tokenLength || config.users.tokenLength;
        const [tokenBase, expirationDate]: string[] = token.split("-");
        const expirationMoment: moment.Moment = moment(parseInt(expirationDate)).utc();
        return expirationMoment.isValid() && moment().utc().isBefore(expirationMoment) && new Buffer(tokenBase, "hex").length === tokenLength;
    };
