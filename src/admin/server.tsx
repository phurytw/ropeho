/**
 * @file Admin server
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="./typings.d.ts" />
import * as React from "react";
import { renderToStaticMarkup, renderToString } from "react-dom/server";
import * as express from "express";
import { Express, Request, Response, NextFunction } from "express-serve-static-core";
import * as detect from "detect-port";
import { Store, Dispatch } from "redux";
import { RopehoAdminState } from "./reducer";
import { StaticRouter } from "react-router-dom";
import { matchRoutes, renderRoutes, MatchedRoute } from "react-router-config";
import "isomorphic-fetch";
import * as serialize from "serialize-javascript";
import { setRendered } from "../common/modules/rendering";
import { Provider } from "react-redux";
import { Helmet, HelmetData } from "react-helmet";
import config from "../config";
import { ADMIN_DEV_SERVER_END_POINT, API_END_POINT } from "../common/helpers/resolveEndPoint";
import createStore from "./store";
import * as httpProxy from "http-proxy";

// hook to handle css modules
import hook from "../common/helpers/cssModulesHook";
hook();
import routeConfig from "./routes";

const app: Express = express();

// serving files
app.use(express.static("./dist/admin/static"));

// proxying api requests
const apiProxy: httpProxy = httpProxy.createProxyServer({});
app.all("/api*", (req: Request, res: Response, next: NextFunction) => {
    apiProxy.web(req, res, { target: API_END_POINT });
});

// server side rendering
app.get("*", (req: Request, res: Response) => {
    try {
        const store: Store<RopehoAdminState> = createStore(undefined, {
            host: API_END_POINT,
            init: {
                credentials: "include",
                headers: {
                    "Cookie": req.get("Cookie")
                }
            }
        });
        const dispatch: Dispatch<RopehoAdminState> = store.dispatch;
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
                    [`${ADMIN_DEV_SERVER_END_POINT}/common.js`, `${ADMIN_DEV_SERVER_END_POINT}/vendor.js`, `${ADMIN_DEV_SERVER_END_POINT}/hot.js`, `${ADMIN_DEV_SERVER_END_POINT}/main.js`];
                const head: HelmetData = Helmet.renderStatic();
                const reactAppElement: string = renderToString(<Provider store={store}>
                    <StaticRouter location={req.originalUrl} context={context} history={undefined}>
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
    detect(config.endPoints.admin.port, (err: Error, port: number) => {
        if (err) {
            throw err;
        }
        app.listen(port, (err: Error) => {
            if (err) {
                throw err;
            }
            console.info(`Admin server listening on ${port}`);
        });
    });
}

export default app;
