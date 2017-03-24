/**
 * @file Builds the webpack bundle
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import * as webpack from "webpack";
import { adminConfig } from "../webpack.config";

// Build webpack
webpack(adminConfig(process.env.NODE_ENV)).run((err: Error, stats: webpack.Stats) => {
    if (err) {
        throw err;
    }
    console.info(stats.toString({
        colors: true
    }));
});
