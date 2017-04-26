/**
 * @file Client server
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="./typings.d.ts" />
import * as React from "react";
import { renderToStaticMarkup, renderToString } from "react-dom/server";
import * as express from "express";
import { Express, Request, Response, NextFunction } from "express-serve-static-core";
import * as detect from "detect-port";
import { Store, Dispatch } from "redux";
import { RopehoClientState } from "./reducer";
import { StaticRouter } from "react-router-dom";
import { matchRoutes, renderRoutes, MatchedRoute } from "react-router-config";
import "isomorphic-fetch";
import * as serialize from "serialize-javascript";
import { setRendered } from "../common/modules/rendering";
import { Provider } from "react-redux";
import { Helmet, HelmetData } from "react-helmet";
import config from "../config";
import { CLIENT_DEV_SERVER_END_POINT, API_END_POINT } from "../common/helpers/resolveEndPoint";
import createStore from "./store";
import * as httpProxy from "http-proxy";
import { createServer, Server } from "http";
import * as serveFavicon from "serve-favicon";

// hook to handle css modules
import hook from "../common/helpers/cssModulesHook";
hook();
// jsdom for document and window
import { jsdom } from "jsdom";
global.document = jsdom("");
global.window = document.defaultView;
global.Image = window.Image;
global.navigator = {
    userAgent: "node.js"
};
import routeConfig from "./routes";

const app: Express = express();

// favicon
app.use(serveFavicon("./favicon.ico"));

// serving files
app.use(express.static("./dist/client/static"));

// proxying api requests
const apiProxy: httpProxy = httpProxy.createProxyServer({
    target: API_END_POINT
});
app.all("/api*", (req: Request, res: Response, next: NextFunction) => {
    apiProxy.web(req, res);
});

// server side rendering
app.get("*", (req: Request, res: Response) => {
    try {
        const store: Store<RopehoClientState> = createStore(undefined, {
            host: API_END_POINT,
            init: {
                credentials: "include",
                headers: {
                    "Cookie": req.get("Cookie")
                }
            }
        });
        const dispatch: Dispatch<RopehoClientState> = store.dispatch;
        const context: { url?: string } = {};

        // dispatch this action to prevent data from being fetched from lifecycle metehods
        dispatch(setRendered(true));

        // fill the store
        let promises: Promise<void>[] = [];
        const matchedRoutes: MatchedRoute<{}>[] = matchRoutes<{}>(routeConfig, req.originalUrl);
        for (const { route, match } of matchedRoutes) {
            const component: any = route.component;
            if (component && component.fetchData && typeof component.fetchData === "function") {
                const promise: Promise<void> = component.fetchData(dispatch, match.params);
                if (typeof promise.then === "function") {
                    promises = [...promises, promise];
                }
            }
        }

        Promise.all(promises).then(() => {
            try {
                const scripts: string[] = process.env.NODE_ENV === "production" ?
                    ["common.js", "vendor.js", "main.js"] :
                    [`${CLIENT_DEV_SERVER_END_POINT}/common.js`, `${CLIENT_DEV_SERVER_END_POINT}/vendor.js`, `${CLIENT_DEV_SERVER_END_POINT}/hot.js`, `${CLIENT_DEV_SERVER_END_POINT}/main.js`];
                const head: HelmetData = Helmet.renderStatic();
                const reactAppElement: string = renderToString(<Provider store={store}>
                    <StaticRouter location={req.originalUrl} context={context}>
                        {renderRoutes(routeConfig)}
                    </StaticRouter>
                </Provider>);

                // if redirect has been used
                if (context.url) {
                    res.redirect(302, context.url);
                    return;
                }

                res.send(`<!DOCTYPE html>${renderToStaticMarkup(<html lang="fr" {...head.htmlAttributes.toComponent() }>
                    <head>
                        {head.base.toComponent()}
                        {head.title.toComponent()}
                        {head.meta.toComponent()}
                        {head.link.toComponent()}
                        <link rel="stylesheet" href="styles.css"/>
                    </head>
                    <body>
                        <div id="root" dangerouslySetInnerHTML={{ __html: reactAppElement }}>
                        </div>
                        <script src="https://cdn.polyfill.io/v2/polyfill.min.js"></script>
                        <script dangerouslySetInnerHTML={{ __html: `window.__REDUX_STATE__=${serialize(store.getState())}` }} charSet="UTF-8"></script>
                        {scripts.map<JSX.Element>((src: string, i: number) => <script src={src} key={i}></script>)}
                    </body>
                </html>)}`);
            } catch (error) {
                res.status(500).send(error.message);
            }
        }, (err: Error) => {
            res.status(500).send(err.message);
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// start the app if not in test
if (process.env.NODE_ENV !== "test") {
    detect(config.endPoints.client.port, (err: Error, port: number) => {
        if (err) {
            throw err;
        }
        const server: Server = createServer(app);
        server.listen(port, (err: Error) => {
            if (err) {
                throw err;
            }
            console.info(`Client server listening on ${port}`);
        });
    });
}

export default app;
