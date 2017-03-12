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
import Routes from "./routes";
import { Store } from "redux";
import "normalize.css";
import "./styles/global.css";

const store: Store<RopehoAdminState> = createStore();

const render: (component: () => JSX.Element) => void = (Component: () => JSX.Element) => {
    ReactDOM.render(
        <AppContainer>
            <Provider store={store}>
                <Component />
            </Provider>
        </AppContainer>,
        document.getElementById("root")
    );
};
render(Routes);

// hot reloading
if (module.hot) {
    module.hot.accept("./routes", () => {
        const App: any = require("./routes").default;
        render(App);
    });
}
