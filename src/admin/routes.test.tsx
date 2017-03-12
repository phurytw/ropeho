/**
 * @file Tests for the React routes
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../test.d.ts" />
import * as React from "react";
import { should, use } from "chai";
import * as chaiEnzyme from "chai-enzyme";
import { shallow, ShallowWrapper } from "enzyme";
import { Router, IndexRoute } from "react-router";
import hook from "./helpers/cssModulesHook";
hook();
import Routes from "./routes";
import Login from "./components/Login";
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
should();
use(chaiEnzyme());

describe("Routes", () => {
    it("Should be a Router", () =>
        shallow(<Routes />).type().should.equal(Router));
    it("Should have a login route", () => {
        const login: ShallowWrapper<any, {}> = shallow(<Routes />).find({ path: "/login" });
        login.should.have.lengthOf(1);
        login.should.have.prop("component", Login);
    });
    it("Should have a home dashboard route", () => {
        const route: ShallowWrapper<any, {}> = shallow(<Routes />).find({ path: "/" });
        route.should.have.lengthOf(1);
        route.find(IndexRoute).should.have.lengthOf(1).and.have.prop("component", Dashboard);
    });
    describe("Production routes", () => {
        it("Should have production index route", () => {
            const route: ShallowWrapper<any, {}> = shallow(<Routes />).find({ path: "/productions" });
            route.should.have.lengthOf(1);
            route.should.have.prop("component", ProductionIndex);
        });
        it("Should have a production edit route", () => {
            const route: ShallowWrapper<any, {}> = shallow(<Routes />).find({ path: "/productions/:productionId(/:mediaId)(/:sourceId)" });
            route.should.have.lengthOf(1);
            route.should.have.prop("component", ProductionEdit);
        });
    });
    describe("Category routes", () => {
        it("Should have category index route", () => {
            const route: ShallowWrapper<any, {}> = shallow(<Routes />).find({ path: "/categories" });
            route.should.have.lengthOf(1);
            route.should.have.prop("component", CategoryIndex);
        });
        it("Should have a category edit route", () => {
            const route: ShallowWrapper<any, {}> = shallow(<Routes />).find({ path: "/categories/:categoryId(/banner)(/:sourceId)" });
            route.should.have.lengthOf(1);
            route.should.have.prop("component", CategoryEdit);
        });
    });
    describe("Presentation routes", () => {
        it("Should have container index route", () => {
            const route: ShallowWrapper<any, {}> = shallow(<Routes />).find({ path: "/presentations" });
            route.should.have.lengthOf(1);
            route.should.have.prop("component", PresentationContainerIndex);
        });
        it("Should have a container edit route", () => {
            const route: ShallowWrapper<any, {}> = shallow(<Routes />).find({ path: "/presentations/:containerId(/:presentationId)(/:media)(/:sourceId)" });
            route.should.have.lengthOf(1);
            route.should.have.prop("component", PresentationContainerEdit);
        });
    });
    describe("User routes", () => {
        it("Should have a user index route", () => {
            const route: ShallowWrapper<any, {}> = shallow(<Routes />).find({ path: "/users" });
            route.should.have.lengthOf(1);
            route.should.have.prop("component", UserIndex);
        });
        it("Should have a user edit route", () => {
            const route: ShallowWrapper<any, {}> = shallow(<Routes />).find({ path: "/users/:userId" });
            route.should.have.lengthOf(1);
            route.should.have.prop("component", UserEdit);
        });
    });
    describe("Task manager", () => {
        it("Should have a task manager route", () => {
            const route: ShallowWrapper<any, {}> = shallow(<Routes />).find({ path: "/taskmanager" });
            route.should.have.lengthOf(1);
            route.should.have.prop("component", TaskManager);
        });
    });
});
