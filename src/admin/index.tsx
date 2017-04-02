/**
 * @file Main entry of the admin application
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="typings.d.ts" />
import * as React from "react";
import * as ReactDOM from "react-dom";
import { AppContainer } from "react-hot-loader";
import { Provider } from "react-redux";
import createStore from "./store";
import { RopehoAdminState } from "./reducer";
import { Store } from "redux";
import { BrowserRouter } from "react-router-dom";
import { renderRoutes, RouteConfig } from "react-router-config";
import App from "./routes";
import { setRendered } from "../common/modules/rendering";
import "normalize.css";
import "./styles/global.css";

const store: Store<RopehoAdminState> = createStore(window.__REDUX_STATE__);

const render: (routes: RouteConfig[]) => void = (routes: RouteConfig[]) => {
    ReactDOM.render(
        <AppContainer>
            <Provider store={store}>
                <BrowserRouter>
                    {renderRoutes(routes)}
                </BrowserRouter>
            </Provider>
        </AppContainer>,
        document.getElementById("root")
    );
};
render(App);

// enable client side loading
store.dispatch(setRendered(false));

// hot reloading
if (module.hot) {
    module.hot.accept("./routes", () => {
        const App: any = require("./routes").default;
        render(App);
    });
}
