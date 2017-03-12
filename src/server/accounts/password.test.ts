/**
 * @file Unit test for the password module
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../../test.d.ts" />
import { should, use } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import { computeHash, computeHashSync, verifyPassword } from "../accounts/password";
import config from "../../config";
const { users: { passwordHashBytes, passwordSaltBytes } }: Ropeho.Configuration.ConfigurationObject = config;
const password: string = "MyPassword1";
should();
use(chaiAsPromised);

describe("Password tools", () => {
    describe("Generating passwords", () => {
        it("Should create a hash (sync)", () => {
            const hash: Buffer = computeHashSync(password);
            hash.length.should.equal(passwordHashBytes + passwordSaltBytes + 8);
        });
        it("Should create a hash (async)", async () => {
            const hash: Buffer = await computeHash(password);
            hash.length.should.equal(passwordHashBytes + passwordSaltBytes + 8);
        });
    });
    describe("Verifying passwords", () => {
        let basePw: Buffer;
        before(async () => {
            basePw = await computeHash(password);
        });
        describe("From Buffer", () => {
            it("Should be a valid password", () =>
                verifyPassword(password, basePw)
                    .should.eventually.be.true);
            it("Should not be a valid password", () =>
                verifyPassword("123456", basePw)
                    .should.eventually.be.false);
        });
        describe("From hexadecimal string", () => {
            it("Should be a valid password", () =>
                verifyPassword(password, basePw.toString("hex"))
                    .should.eventually.be.true);
            it("Should not be a valid password", () =>
                verifyPassword("123456", basePw.toString("hex"))
                    .should.eventually.be.false);
        });
        describe("Type checking", () => {
            it("Should throw if the input password is not a string", () =>
                verifyPassword(undefined, basePw)
                    .should.be.rejected);
            it("Should throw if the source password is not a string or a Buffer", () =>
                verifyPassword("123456", undefined)
                    .should.be.rejected);
        });
    });
});
