/**
 * @file React routes for the admin application
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="typings.d.ts" />
import { RouteConfig } from "react-router-config";
import Layout from "./components/Layout";
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
import NotFound from "./components/NotFound";

const routeConfig: RouteConfig[] = [
    // login
    {
        component: Login,
        path: "/login",
        exact: true
    },
    // main app
    {
        component: Layout,
        path: "/",
        routes: [{
            component: Dashboard,
            path: "/",
            exact: true
        }, {
            component: ProductionIndex,
            path: "/productions",
            exact: true
        }, {
            component: ProductionEdit,
            path: "/productions/:productionId",
        }, {
            component: CategoryIndex,
            path: "/categories",
            exact: true
        }, {
            component: CategoryEdit,
            path: "/categories/:categoryId",
        }, {
            component: PresentationContainerIndex,
            path: "/presentations",
            exact: true
        }, {
            component: PresentationContainerEdit,
            path: "/presentations/:containerId",
        }, {
            component: UserIndex,
            path: "/users",
            exact: true
        }, {
            component: UserEdit,
            path: "/users/:userId",
        }, {
            component: TaskManager,
            path: "/taskmanager",
        }, {
            component: NotFound,
            path: "*"
        }]
    }
];

export default routeConfig;
