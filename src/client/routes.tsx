/**
 * @file React routes for the admin application
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="typings.d.ts" />
import { RouteConfig } from "react-router-config";
import Layout from "./components/Layout";
import Home from "./components/Home";
import NotFound from "./components/NotFound";
import ProductionIndex from "./components/ProductionIndex";
import AsyncSwitch from "./components/AsyncSwitch";

const routeConfig: RouteConfig[] = [
    {
        component: Layout,
        path: "/",
        routes: [{
            component: Home,
            path: "/",
            exact: true
        }, {
            component: ProductionIndex,
            path: "/:param(photographies?|productions?|categories?)/:category?"
        }, {
            component: NotFound,
            path: "/404"
        }, {
            component: AsyncSwitch,
            path: "/:name"
        }]
    }
];

export default routeConfig;
