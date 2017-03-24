/**
 * @file Tests for the React routes
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../test.d.ts" />
import { should } from "chai";
import { RouteConfig } from "react-router-config";
import hook from "./helpers/cssModulesHook";
hook();
import routeConfig from "./routes";
import Login from "./components/Login";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import ProductionIndex from "./components/ProductionIndex";
import ProductionEdit from "./components/ProductionEdit";
import CategoryIndex from "./components/CategoryIndex";
import CategoryEdit from "./components/CategoryEdit";
import PresentationContainerIndex from "./components/PresentationContainerIndex";
import PresentationContainerEdit from "./components/PresentationContainerEdit";
import UserIndex from "./components/UserIndex";
import UserEdit from "./components/UserEdit";
import TaskManager from "./components/TaskManager";
import * as _ from "lodash";
should();

describe("Router module", () => {
    it("Should have a login route", () =>
        _(routeConfig).filter((route: RouteConfig) => route.component === Login).head().should.be.ok);
    it("Should have a home dashboard route", () => {
        const layoutRoute: RouteConfig = _(routeConfig).filter((route: RouteConfig) => route.component === Layout).head();
        _(layoutRoute.routes).filter((route: RouteConfig) => route.component === Dashboard).head().should.be.ok;
    });
    describe("Production routes", () => {
        it("Should have production index route", () => {
            const layoutRoute: RouteConfig = _(routeConfig).filter((route: RouteConfig) => route.component === Layout).head();
            _(layoutRoute.routes).filter((route: RouteConfig) => route.component === ProductionIndex).head().should.be.ok;
        });
        it("Should have a production edit route", () => {
            const layoutRoute: RouteConfig = _(routeConfig).filter((route: RouteConfig) => route.component === Layout).head();
            _(layoutRoute.routes).filter((route: RouteConfig) => route.component === ProductionEdit).head().should.be.ok;
        });
    });
    describe("Category routes", () => {
        it("Should have category index route", () => {
            const layoutRoute: RouteConfig = _(routeConfig).filter((route: RouteConfig) => route.component === Layout).head();
            _(layoutRoute.routes).filter((route: RouteConfig) => route.component === CategoryIndex).head().should.be.ok;
        });
        it("Should have a category edit route", () => {
            const layoutRoute: RouteConfig = _(routeConfig).filter((route: RouteConfig) => route.component === Layout).head();
            _(layoutRoute.routes).filter((route: RouteConfig) => route.component === CategoryEdit).head().should.be.ok;
        });
    });
    describe("Presentation routes", () => {
        it("Should have container index route", () => {
            const layoutRoute: RouteConfig = _(routeConfig).filter((route: RouteConfig) => route.component === Layout).head();
            _(layoutRoute.routes).filter((route: RouteConfig) => route.component === PresentationContainerIndex).head().should.be.ok;
        });
        it("Should have a container edit route", () => {
            const layoutRoute: RouteConfig = _(routeConfig).filter((route: RouteConfig) => route.component === Layout).head();
            _(layoutRoute.routes).filter((route: RouteConfig) => route.component === PresentationContainerEdit).head().should.be.ok;
        });
    });
    describe("User routes", () => {
        it("Should have a user index route", () => {
            const layoutRoute: RouteConfig = _(routeConfig).filter((route: RouteConfig) => route.component === Layout).head();
            _(layoutRoute.routes).filter((route: RouteConfig) => route.component === UserIndex).head().should.be.ok;
        });
        it("Should have a user edit route", () => {
            const layoutRoute: RouteConfig = _(routeConfig).filter((route: RouteConfig) => route.component === Layout).head();
            _(layoutRoute.routes).filter((route: RouteConfig) => route.component === UserEdit).head().should.be.ok;
        });
    });
    describe("Task manager", () => {
        it("Should have a task manager route", () => {
            const layoutRoute: RouteConfig = _(routeConfig).filter((route: RouteConfig) => route.component === Layout).head();
            _(layoutRoute.routes).filter((route: RouteConfig) => route.component === TaskManager).head().should.be.ok;
        });
    });
});
