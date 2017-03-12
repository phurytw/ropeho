/**
 * @file Test for the end point resolve helper function
 * @author François Nguyen <https://github.com/lith-light-g>
 */
// tslint:disable:no-http-string
import { should } from "chai";
import {
    default as resolveEndPoint,
    ADMIN_DEV_SERVER_END_POINT,
    ADMIN_END_POINT,
    API_END_POINT,
    CLIENT_DEV_SERVER_END_POINT,
    CLIENT_END_POINT,
    CUSTOMER_DEV_SERVER_END_POINT,
    CUSTOMER_END_POINT,
    MEDIA_END_POINT
} from "./resolveEndPoint";
import config from "../../config";
const endPoints: Ropeho.Configuration.EndPointsConfiguration = config.endPoints;
should();

describe("End point helpers", () => {
    describe("Resolver function", () => {
        it("Should combine port and host", () => {
            resolveEndPoint("http://localhost", 8000).should.equal("http://localhost:8000");
            resolveEndPoint("https://localhost", 8000).should.equal("https://localhost:8000");
        });
        it("Should accept with undefined port", () =>
            resolveEndPoint("http://localhost").should.equal("http://localhost"));
        it("Should convert to lowercase automatically", () =>
            resolveEndPoint("HTTP://LOCALHOST", 8000).should.equal("http://localhost:8000"));
        it("Should strip out slashes automatically", () =>
            resolveEndPoint("http://example.com/", 8000).should.equal("http://example.com:8000"));
        it("Should trim automatically", () =>
            resolveEndPoint("   http://example.com/ ", 8000).should.equal("http://example.com:8000"));
        it("Should strip out slashes commas automatically", () =>
            resolveEndPoint("http://example.com:", 8000).should.equal("http://example.com:8000"));
        it("Should not include port if protocol is http or https and port is respectively 80 or 443", () => {
            resolveEndPoint("https://example.com:", 80).should.equal("https://example.com:80");
            resolveEndPoint("http://example.com:", 443).should.equal("http://example.com:443");
            resolveEndPoint("https://example.com:", 443).should.equal("https://example.com");
            resolveEndPoint("http://example.com:", 80).should.equal("http://example.com");
        });
    });
    describe("Pre resolved end points", () => {
        it("Should expose a string to the API server", () =>
            API_END_POINT.should.equal(resolveEndPoint(endPoints.api.host, endPoints.api.port)));
        it("Should expose a string to the media server", () =>
            MEDIA_END_POINT.should.equal(resolveEndPoint(endPoints.media.host, endPoints.media.port)));
        it("Should expose a string to the admin server", () =>
            ADMIN_END_POINT.should.equal(resolveEndPoint(endPoints.admin.host, endPoints.admin.port)));
        it("Should expose a string to the admin dev server", () =>
            ADMIN_DEV_SERVER_END_POINT.should.equal(resolveEndPoint(endPoints.adminDevServer.host, endPoints.adminDevServer.port)));
        it("Should expose a string to the client server", () =>
            CLIENT_END_POINT.should.equal(resolveEndPoint(endPoints.client.host, endPoints.client.port)));
        it("Should expose a string to the client dev server", () =>
            CLIENT_DEV_SERVER_END_POINT.should.equal(resolveEndPoint(endPoints.clientDevServer.host, endPoints.clientDevServer.port)));
        it("Should expose a string to the customer server", () =>
            CUSTOMER_END_POINT.should.equal(resolveEndPoint(endPoints.customer.host, endPoints.customer.port)));
        it("Should expose a string to the customer dev server", () =>
            CUSTOMER_DEV_SERVER_END_POINT.should.equal(resolveEndPoint(endPoints.customerDevServer.host, endPoints.customerDevServer.port)));
    });
});
