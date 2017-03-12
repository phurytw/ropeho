/**
 * @file Tests for the admin server
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../test.d.ts" />
import * as React from "react";
import { should, use } from "chai";
import { spy, stub } from "sinon";
import * as sinonChai from "sinon-chai";
import * as supertest from "supertest";
import { Server } from "http";
import * as detect from "detect-port";
import config from "../config";
import app from "./server";
import { includes } from "lodash";
import ProductionIndex from "./components/ProductionIndex";
import * as sessionModule from "./modules/session";
import Layout from "./components/Layout";
import * as renderingReducer from "./modules/rendering";
import * as Helmet from "react-helmet";
import { Dispatch } from "redux";
import { RopehoAdminState } from "./reducer";
should();
use(sinonChai);

describe("Admin server", () => {
    let server: Server,
        port: number,
        agent: supertest.SuperTest<supertest.Test>,
        createElementSpy: sinon.SinonSpy;
    let fetchCurrenUserStub: sinon.SinonStub;
    let fetchDataStub: sinon.SinonStub;
    before(async () => {
        createElementSpy = spy(React, "createElement");
        // stub those to prevent promise rejection when lifecycle methods execute
        fetchCurrenUserStub = stub(sessionModule, "fetchCurrentUser", () => (dispatch: Dispatch<RopehoAdminState>) => new Promise<any>((resolve: (value?: any) => void) => dispatch(({ type: "" }))));
        fetchDataStub = stub(Layout, "FetchData", () => new Promise<void>((resolve: () => void) => resolve()));

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
        agent = supertest(app);

        // prevent react helmet to be run with jsdom
        (Helmet as any).canUseDOM = false;
    });
    afterEach(() => createElementSpy.reset());
    after(() => {
        createElementSpy.restore();
        fetchCurrenUserStub.restore();
        fetchDataStub.restore();
        server.close();
        (Helmet as any).canUseDOM = true;
    });
    it("Should render the 404 page when the URL does not match any route", async () => {
        await agent.get("/cantBeFoundYo");
        createElementSpy.should.have.been.called;
        let has404: boolean = false;
        for (let i: number = 0; i < createElementSpy.callCount; i++) {
            const args: any = createElementSpy.getCall(i).args;
            if (includes<string>(args, "404")) {
                has404 = true;
            }
        }
        has404.should.be.true;
    });
    it("Should render the component when the URL matches a round", async () => {
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
        const renderingSpy: sinon.SinonSpy = spy(renderingReducer, "setRendered");
        await agent.get("/productions");
        renderingSpy.should.have.been.calledOnce;
    });
    it("Should fetch asynchronous data", async () => {
        const fetchSpy: sinon.SinonSpy = stub(ProductionIndex, "FetchData", () => new Promise<void>((resolve: () => void) => resolve()));
        await agent.get("/productions");
        fetchSpy.should.have.been.calledOnce;
        fetchSpy.restore();
    });
});
