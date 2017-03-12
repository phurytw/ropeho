/**
 * @file React routes for the admin application
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="typings.d.ts" />
import * as React from "react";
import { Router, Route, IndexRoute, browserHistory } from "react-router";
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

export default (): JSX.Element => <Router history={browserHistory}>
    <Route path="/login" component={Login} />
    <Route path="/" component={Layout}>
        <IndexRoute component={Dashboard} />
        <Route path="/productions" component={ProductionIndex} />
        <Route path="/productions/:productionId(/:mediaId)(/:sourceId)" component={ProductionEdit} />
        <Route path="/categories" component={CategoryIndex} />
        <Route path="/categories/:categoryId(/banner)(/:sourceId)" component={CategoryEdit} />
        <Route path="/presentations" component={PresentationContainerIndex} />
        <Route path="/presentations/:containerId(/:presentationId)(/:media)(/:sourceId)" component={PresentationContainerEdit} />
        <Route path="/users" component={UserIndex} />
        <Route path="/users/:userId" component={UserEdit} />
        <Route path="/taskmanager" component={TaskManager} />
        <Route path="*" component={NotFound} />
    </Route>
</Router>;
