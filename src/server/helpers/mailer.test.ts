/**
 * @file Unit tests for the mailer module
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../../test.d.ts" />
import { should, use } from "chai";
import { stub } from "sinon";
import * as sinonChai from "sinon-chai";
import mailer from "../helpers/mailer";
import * as nodemailer from "nodemailer";
should();
use(sinonChai);

describe("Mailer", () => {
    let sendMailStub: sinon.SinonStub;
    before(() => {
        sendMailStub = stub(mailer, "sendMail", (...args: any[]) =>
        new Promise<nodemailer.SendMailOptions>((resolve: (value?: nodemailer.SendMailOptions | PromiseLike<nodemailer.SendMailOptions>) => void, reject: (reason?: any) => void) => {
            resolve(args);
        }));
    });
    after(() => {
        sendMailStub.restore();
    });
    it("Should use the send mail from nodemailer and return a promise", async () => {
        const mailOptions: nodemailer.SendMailOptions = {
            to: "test@test.com",
            subject: "Subject",
            text: "Content",
            html: "Content"
        };
        await mailer.sendMail(mailOptions);
        sendMailStub.should.have.been.calledWith(mailOptions);
    });
});
