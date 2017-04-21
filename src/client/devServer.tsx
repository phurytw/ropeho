/**
 * @file Webpack dev server for the client application
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="typings.d.ts" />
import * as express from "express";
import { Express } from "express-serve-static-core";
import config from "../config";
import * as webpackDevMiddleware from "webpack-dev-middleware";
import * as webpackHotMiddleware from "webpack-hot-middleware";
import * as webpack from "webpack";
import { Compiler, Configuration } from "webpack";
import { clientConfig } from "../../webpack.config";
import { createServer, Server } from "http";

const app: Express = express();
// tslint:disable:no-http-string

if (process.env.NODE_ENV !== "production") {
    const port: number = config.endPoints.clientDevServer.port;
    const webpackConfig: Configuration = clientConfig(process.env.NODE_ENV);

    // add hot middleware to the config with the correct port
    (webpackConfig.entry as any).hot = [...(webpackConfig.entry as any).hot, `webpack-hot-middleware/client?path=http://localhost:${port}/__webpack_hmr`];
    webpackConfig.output.publicPath = `http://localhost:${port}${webpackConfig.output.publicPath}`;

    const compiler: Compiler = webpack(webpackConfig);
    app.use(webpackDevMiddleware(compiler, {
        headers: {
            "Access-Control-Allow-Origin": "*"
        },
        publicPath: webpackConfig.output.publicPath,
        stats: {
            colors: true
        },
    }));
    app.use(webpackHotMiddleware(compiler));
    const server: Server = createServer(app);
    server.listen(port, (err: Error) => {
        if (err) {
            throw err;
        }
        console.info(`Client dev server listening on ${port}`);
    });
} else {
    console.info("Client dev server cannot be run in production environment");
}
