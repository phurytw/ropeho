/**
 * @file Unit test for the token module
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../../typings.d.ts" />
import { should } from "chai";
import { computeToken, isTokenValid } from "../../../src/server/accounts/token";
import config from "../../../src/config";
import * as moment from "moment";
import { randomBytes } from "crypto";
const { users: { daysTokenValid, tokenLength } }: Ropeho.Configuration.Configuration = config;
should();

describe("Token tools", () => {
    describe("Creating tokens", () => {
        it("Should create a token", () => {
            const tokenRaw: string = computeToken(),
                [token, timestamp]: string[] = tokenRaw.split("-"),
                tokenMoment: moment.Moment = moment(parseInt(timestamp)).utc();
            new Buffer(token, "hex").should.have.lengthOf(tokenLength);
            tokenMoment.isValid().should.be.true;
            tokenMoment.isBefore(moment().utc()).should.be.false;
        });
        it("Should create a token (with parameters)", () => {
            const tokenLength: number = 32,
                daysTokenValid: number = 2,
                tokenRaw: string = computeToken(tokenLength, daysTokenValid),
                [token, timestamp]: string[] = tokenRaw.split("-"),
                tokenMoment: moment.Moment = moment(parseInt(timestamp)).utc();
            new Buffer(token, "hex").should.have.lengthOf(tokenLength);
            tokenMoment.isValid().should.be.true;
            tokenMoment.isBefore(moment().utc()).should.be.false;
        });
    });
    describe("Validating token", () => {
        it("Should be a valid token", () => isTokenValid(computeToken()).should.be.true);
        it("Should not be a valid token if it does not have a timestamp", () => {
            const [token, timestamp]: string[] = computeToken().split("-");
            isTokenValid(token).should.be.false;
        });
        it("Should not be a valid token if it does a correct length", () =>
            isTokenValid(`${randomBytes(tokenLength + 10).toString("hex")}-${moment().utc().add(daysTokenValid, "days").valueOf()}`)
                .should.be.false);
        it("Should not be a valid token if the token is expired", () =>
            isTokenValid(computeToken(undefined, -1)).should.be.false);
    });
});
