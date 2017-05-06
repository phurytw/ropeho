/**
 * @file Builds the webpack bundle
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import * as webpack from "webpack";
import { adminConfig, clientConfig } from "../webpack.config";
import { includes } from "lodash";

let webpackConfig: webpack.Configuration;
if (includes<string>(process.argv, "admin")) {
    webpackConfig = adminConfig(process.env.NODE_ENV);
    console.info("Building the webpack bundle for the admin app");
} else {
    webpackConfig = clientConfig(process.env.NODE_ENV);
    console.info("Building the webpack bundle for the client app");
}

webpack(webpackConfig).run((err: Error, stats: webpack.Stats) => {
    if (err) {
        throw err;
    }
    console.info(stats.toString({
        colors: true
    }));
    console.info("Bundle built in", webpackConfig.output.path);
});
