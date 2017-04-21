/**
 * @file Tests for the React routes
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../test.d.ts" />
import { should } from "chai";
import { RouteConfig } from "react-router-config";
import hook from "../common/helpers/cssModulesHook";
hook();
import routeConfig from "./routes";
import Layout from "./components/Layout";
import Home from "./components/Home";
import ProductionIndex from "./components/ProductionIndex";
import * as _ from "lodash";
should();

describe("Router module", () => {
    it("Should have a homepage route", () => {
        const layoutRoute: RouteConfig = _(routeConfig).filter((route: RouteConfig) => route.component === Layout).head();
        _(layoutRoute.routes).filter((route: RouteConfig) => route.component === Home && route.path === "/").head().should.be.ok;
    });
    it("Should have a production index route", () => {
        const layoutRoute: RouteConfig = _(routeConfig).filter((route: RouteConfig) => route.component === Layout).head();
        _(layoutRoute.routes).filter((route: RouteConfig) => route.component === ProductionIndex && route.path === "/:param(photographies?|productions?|categories?)/:category?").head().should.be.ok;
    });
});
