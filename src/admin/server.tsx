/**
 * @file Admin server
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="./typings.d.ts" />
import * as React from "react";
import { renderToStaticMarkup, renderToString } from "react-dom/server";
import * as express from "express";
import { Express, Request, Response } from "express-serve-static-core";
import * as detect from "detect-port";
import createStore from "./store";
import { Store, Dispatch } from "redux";
import { RopehoAdminState } from "./reducer";
import { match, RouterContext } from "react-router";
import "isomorphic-fetch";
import * as serialize from "serialize-javascript";
import { setRendered } from "./modules/rendering";
import { Provider } from "react-redux";
import * as Helmet from "react-helmet";
import config from "../config";
import { ADMIN_DEV_SERVER_END_POINT } from "./helpers/resolveEndPoint";

// hook to handle css modules
import hook from "./helpers/cssModulesHook";
hook();
import routes from "./routes";

const app: Express = express();

// serving files
app.use(express.static("./dist/admin/static"));

// server side rendering
app.get("*", (req: Request, res: Response) => {
    match({ location: req.originalUrl, routes: routes() } as any, (err: Error, redirectionLocation: Location, renderProps: any) => {
        if (err) {
            res.status(500).send(err.message);
        } else if (redirectionLocation) {
            res.redirect(302, `${redirectionLocation.pathname}${redirectionLocation.search}`);
        } else if (renderProps) {
            const store: Store<RopehoAdminState> = createStore();
            const dispatch: Dispatch<RopehoAdminState> = store.dispatch;

            // dispatch this action to prevent data from being fetched from lifecycle metehods
            setRendered(true);

            // fetch async data here
            let promises: Promise<void>[] = [];
            for (const component of (renderProps.components as any[])) {
                if (component && component.FetchData && typeof component.FetchData === "function") {
                    const promise: Promise<void> = component.FetchData(dispatch);
                    if (typeof promise.then === "function") {
                        promises = [...promises, promise];
                    }
                }
            }

            Promise.all(promises).then(() => {
                const scripts: string[] = process.env.NODE_ENV === "production" ?
                    ["common.js", "vendor.js", "main.js"] :
                    [`${ADMIN_DEV_SERVER_END_POINT}/common.js`, `${ADMIN_DEV_SERVER_END_POINT}/vendor.js`, `${ADMIN_DEV_SERVER_END_POINT}/hot.js`, `${ADMIN_DEV_SERVER_END_POINT}/main.js`];
                const head: Helmet.HelmetData = Helmet.rewind();
                const reactAppElement: string = renderToString(<Provider store={store}>
                    <RouterContext {...renderProps} />
                </Provider>);
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
            }, (err: Error) => res.status(500).send(err.message));
        } else {
            // should never reach
            res.sendStatus(404);
        }
    });
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
