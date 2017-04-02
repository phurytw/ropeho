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
import config from "../config";
import app from "./server";
import { includes } from "lodash";
import ProductionIndex from "./components/ProductionIndex";
import * as sessionModule from "../common/modules/session";
import * as renderingModule from "../common/modules/rendering";
import { Dispatch } from "redux";
import { RopehoAdminState } from "./reducer";
import * as nock from "nock";
import { users } from "../sampleData/testDb";
import { API_END_POINT } from "../common/helpers/resolveEndPoint";
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
        port = await detect(config.endPoints.admin.port);
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
        // stub those to prevent promise rejection when lifecycle methods execute
        sandbox.stub(sessionModule, "fetchCurrentUser")
            .callsFake(() => (dispatch: Dispatch<RopehoAdminState>) =>
                Promise.resolve<sessionModule.Actions.SetCurrentUser>({ type: sessionModule.ActionTypes.SET_CURRENT_USER, user: users[0] })
                    .then((action: sessionModule.Actions.SetCurrentUser) => dispatch(action)));
        sandbox.stub(ProductionIndex, "fetchData").callsFake(() => Promise.resolve([]));
    });
    afterEach(() => sandbox.restore());
    after(() => {
        Helmet.canUseDOM = true;
        server.close();
    });
    it("Should render the 404 page when the URL does not match any route", async () => {
        await agent.get("/cantBeFoundYo");
        React.createElement.should.have.been.called;
        let has404: boolean = false;
        for (let i: number = 0; i < (React.createElement as sinon.SinonSpy).callCount; i++) {
            const args: any = (React.createElement as sinon.SinonSpy).getCall(i).args;
            if (includes<string>(args, "404")) {
                has404 = true;
            }
        }
        has404.should.be.true;
    });
    it("Should render the component when the URL matches a route", async () => {
        const indexSpy: sinon.SinonSpy = spy(ProductionIndex.prototype, "render");
        await agent.get("/productions");
        indexSpy.should.have.been.calledOnce;
        indexSpy.restore();
    });
    it("Rendered HTML should include React Helmet tags", async () => {
        const response: supertest.Response = await agent.get("/productions");
        response.text.should.contain("data-react-helmet");
    });
    it("Rendered HTML should include scripts of the admin application", async () => {
        const response: supertest.Response = await agent.get("/productions");
        response.text.should.contain("common.js\"");
        response.text.should.contain("hot.js\"");
        response.text.should.contain("vendor.js\"");
        response.text.should.contain("main.js\"");
    });
    it("hasRenderded action should have been dispatched", async () => {
        const renderingSpy: sinon.SinonSpy = spy(renderingModule, "setRendered");
        await agent.get("/productions");
        renderingSpy.should.have.been.calledOnce;
    });
    it("Should fetch asynchronous data", async () => {
        await agent.get("/productions");
        (ProductionIndex as any).fetchData.should.have.been.calledOnce;
    });
    it("Should proxy requests to the API server", async () => {
        const scope: nock.Scope = nock(API_END_POINT)
            .post("/api/auth")
            .reply(200, {});
        await agent.post("/api/auth");
        scope.done();
    });
    it("Should use client's cookies", async () => {
        (sessionModule.fetchCurrentUser as sinon.SinonStub).restore();
        const cookie: string = "myCookie";
        const scope: nock.Scope = nock(API_END_POINT, {
            reqheaders: {
                "Cookie": cookie
            }
        })
            .get("/api/auth")
            .reply(200, {});
        await agent.get("/").set("Cookie", cookie);
        sandbox.stub(sessionModule, "fetchCurrentUser");
        scope.done();
    });
});
