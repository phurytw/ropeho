/**
 * @file Unit tests for the {ErrorResponse} class
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../../test.d.ts" />
import { should, use } from "chai";
import * as sinonChai from "sinon-chai";
import { spy } from "sinon";
import ErrorResponse from "../helpers/errorResponse";
import { defaultErrorMessage } from "../helpers/errorResponse";
should();
use(sinonChai);

describe("ErrorResponse class", () => {
    describe("Constructor", () => {
        it("Should be able to initialize from another error", () => {
            const devMessage: string = "A developer error message";
            const clientMessage: string = "A client error message";
            const er: ErrorResponse = new ErrorResponse({
                developerMessage: new TypeError(devMessage),
                userMessage: new Error(clientMessage)
            });
            er.developerMessage.should.equal(devMessage);
            er.userMessage.should.equal(clientMessage);
        });
        it("Should be able to initialize from strings", () => {
            const devMessage: string = "A developer error message";
            const clientMessage: string = "A client error message";
            const er: ErrorResponse = new ErrorResponse({
                developerMessage: devMessage,
                userMessage: clientMessage
            });
            er.developerMessage.should.equal(devMessage);
            er.userMessage.should.equal(clientMessage);
        });
        it("Should be able to initialize without any params and have a default user message", () => {
            const er: ErrorResponse = new ErrorResponse();
            er.status.should.equal(500);
            er.developerMessage.should.be.empty;
            er.userMessage.should.equal(defaultErrorMessage);
        });
        it("Should throw if any of the parameters are invalid", () => {
            should().throw(ErrorResponse.constructor.bind(null, { status: "500" }));
            should().throw(ErrorResponse.constructor.bind(null, { developerMessage: {} }));
            should().throw(ErrorResponse.constructor.bind(null, { userMessage: {} }));
            should().throw(ErrorResponse.constructor.bind(null, { errorCode: {} }));
        });
    });
    describe("Methods", () => {
        it("Should be able to send the HTTP reponse", () => {
            const sendSpy: sinon.SinonSpy = spy();
            const statusSpy: sinon.SinonSpy = spy();
            class FakeResponse {
                public send(...params: any[]): FakeResponse {
                    sendSpy(...params);
                    return this;
                }
                public status(code: number): FakeResponse {
                    statusSpy(code);
                    return this;
                }
            }
            const er: ErrorResponse = new ErrorResponse();
            const res: any = new FakeResponse() as any;
            er.send(res);
            sendSpy.should.have.been.calledWith(er);
            statusSpy.should.have.been.calledWith(er.status);
        });
    });
});
