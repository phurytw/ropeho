/**
 * @file Tests for the admin server
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../test.d.ts" />
import * as React from "react";
import { should, use } from "chai";
import { sandbox as sinonSandbox, spy } from "sinon";
import * as sinonChai from "sinon-chai";
import * as supertest from "supertest";
import { Server } from "http";
import * as detect from "detect-port";
import { endPoints } from "../common/helpers/resolveEndPoint";
import app from "./server";
import * as renderingModule from "../common/modules/rendering";
import * as nock from "nock";
import { API_END_POINT } from "../common/helpers/resolveEndPoint";
import Home from "./components/Home";
import AsyncSwitch from "./components/AsyncSwitch";
import "isomorphic-fetch";
import Helmet from "react-helmet";
should();
use(sinonChai);

describe("Admin server", () => {
    let server: Server,
        port: number,
        sandbox: sinon.SinonSandbox;
    let agent: supertest.SuperTest<supertest.Test>;
    before(async () => {
        // start the server
        port = await detect(endPoints.admin.port);
        await new Promise<void>((resolve: () => void, reject: (reason?: any) => void) => {
            server = app.listen(port, (err: Error) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });

        // supertest
        sandbox = sinonSandbox.create();
        agent = supertest(app);

        // this is needed to run the tests along with jsdom
        Helmet.canUseDOM = false;
        // this is needed to clear previous Helmet calls (from other tests)
        Helmet.renderStatic();
    });
    beforeEach(() => {
        sandbox.spy(React, "createElement");
        sandbox.stub(Home, "fetchData").callsFake(() => Promise.resolve([]));
        sandbox.stub(AsyncSwitch, "fetchData").callsFake(() => Promise.resolve());
    });
    afterEach(() => sandbox.restore());
    after(() => {
        Helmet.canUseDOM = true;
        server.close();
    });
    it("Should render the 404 page when the URL does not match any route", async () => {
        const response: supertest.Response = await agent.get("/cantBeFoundYo");
        response.redirect.should.be.true;
        response.header.should.have.property("location", "/404");
    });
    it("Should render the component when the URL matches a route", async () => {
        const homeSpy: sinon.SinonSpy = spy(Home.prototype, "render");
        await agent.get("/");
        homeSpy.should.have.been.calledOnce;
        homeSpy.restore();
    });
    it("Rendered HTML should include React Helmet tags", async () => {
        const response: supertest.Response = await agent.get("/");
        response.text.should.contain("data-react-helmet");
    });
    it("Rendered HTML should include scripts of the admin application", async () => {
        const response: supertest.Response = await agent.get("/");
        response.text.should.contain("common.js\"");
        response.text.should.contain("hot.js\"");
        response.text.should.contain("vendor.js\"");
        response.text.should.contain("main.js\"");
    });
    it("hasRenderded action should have been dispatched", async () => {
        const renderingSpy: sinon.SinonSpy = spy(renderingModule, "setRendered");
        await agent.get("/");
        renderingSpy.should.have.been.calledOnce;
    });
    it("Should fetch asynchronous data", async () => {
        await agent.get("/");
        (Home as any).fetchData.should.have.been.calledOnce;
    });
    it("Should proxy requests to the API server", async () => {
        const scope: nock.Scope = nock(API_END_POINT)
            .post("/api/auth")
            .reply(200, {});
        await agent.post("/api/auth");
        scope.done();
    });
    it("Should use client's cookies", async () => {
        const cookie: string = "myCookie";
        const scope: nock.Scope = nock(API_END_POINT, {
            reqheaders: {
                "Cookie": cookie
            }
        })
            .get("/api/auth")
            .reply(200, {});
        await agent.get("/api/auth").set("Cookie", cookie);
        scope.done();
    });
});
