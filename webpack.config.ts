/**
 * @file Webpack config
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import { resolve } from "path";
import { Configuration, optimize, HotModuleReplacementPlugin, NamedModulesPlugin, Entry, DefinePlugin, Plugin, LoaderOptionsPlugin, OldLoader, Rule } from "webpack";
import * as ExtractTextPlugin from "extract-text-webpack-plugin";

export const cssModulePattern: string = "[name]__[local]___[hash:base64:8]";

export const adminConfig: (env: string) => Configuration =
    (env: string): Configuration => {
        // add hot module replacement if not in production
        let entry: Entry = {
            main: "./src/admin/index.tsx",
            vendor: ["react", "react-dom", "react-router-dom", "redux", "react-helmet", "react-redux", "serialize-javascript"]
        };
        entry = env !== "production" ? {
            hot: ["react-hot-loader/patch"],
            ...entry
        } : entry;
        // set devtool according to the environment
        const devtool: "source-map" | "eval-source-map" = env === "production" ? "source-map" : "source-map";
        let plugins: Plugin[] = [new optimize.CommonsChunkPlugin({
            names: ["vendor", "common"]
        }), new ExtractTextPlugin("styles.css")];
        // set plugins hot module replacement plugins if not in production
        plugins = env === "production" ? [...plugins, new DefinePlugin({
            "process.env.NODE_ENV": JSON.stringify("production")
        }),
        new LoaderOptionsPlugin({
            minimize: true,
            debug: false
        }),
        new optimize.UglifyJsPlugin({
            compress: {
                screw_ie8: true,
                warnings: false
            },
            sourceMap: true
        })] : [...plugins,
        new HotModuleReplacementPlugin(),
        new NamedModulesPlugin()];
        const cssRule: Rule = env === "production" ? {
            test: /\.css$/,
            use: ExtractTextPlugin.extract([{
                loader: "css-loader",
                options: {
                    modules: true,
                    sourceMap: true,
                    importLoaders: 1,
                    localIdentName: cssModulePattern
                }
            } as OldLoader, "postcss-loader"])
        } : {
                test: /\.css$/,
                use: ["style-loader", {
                    loader: "css-loader",
                    options: {
                        modules: true,
                        sourceMap: true,
                        importLoaders: 1,
                        localIdentName: cssModulePattern
                    }
                } as OldLoader, "postcss-loader"]
            };

        return {
            entry,
            output: {
                filename: "[name].js",
                path: resolve(__dirname, "dist", "static"),
                publicPath: "/"
            },
            devtool,
            resolve: {
                extensions: [".tsx", ".ts", ".js", ".css", ".scss", ".sass"]
            },
            module: {
                rules: [
                    {
                        test: /\.tsx?$/,
                        use: ["awesome-typescript-loader?configFileName=tsconfig.admin.json"],
                        exclude: /node_modules/
                    },
                    cssRule
                ]
            },
            plugins
        };
    };

export const clientConfig: (env: string) => Configuration =
    (env: string): Configuration => {
        // add hot module replacement if not in production
        let entry: Entry = {
            main: "./src/client/index.tsx",
            vendor: ["react", "react-dom", "react-router-dom", "redux", "react-helmet", "react-redux", "serialize-javascript"]
        };
        entry = env !== "production" ? {
            hot: ["react-hot-loader/patch"],
            ...entry
        } : entry;
        // set devtool according to the environment
        const devtool: "source-map" | "eval-source-map" = env === "production" ? "source-map" : "source-map";
        let plugins: Plugin[] = [new optimize.CommonsChunkPlugin({
            names: ["vendor", "common"]
        }), new ExtractTextPlugin("styles.css")];
        // set plugins hot module replacement plugins if not in production
        plugins = env === "production" ? [...plugins, new DefinePlugin({
            "process.env.NODE_ENV": JSON.stringify("production")
        }),
        new LoaderOptionsPlugin({
            minimize: true,
            debug: false
        }),
        new optimize.UglifyJsPlugin({
            compress: {
                screw_ie8: true,
                warnings: false
            },
            sourceMap: true
        })] : [...plugins,
        new HotModuleReplacementPlugin(),
        new NamedModulesPlugin()];
        const cssRule: Rule = env === "production" ? {
            test: /\.css$/,
            use: ExtractTextPlugin.extract([{
                loader: "css-loader",
                options: {
                    modules: true,
                    sourceMap: true,
                    importLoaders: 1,
                    localIdentName: cssModulePattern
                }
            } as OldLoader, "postcss-loader"])
        } : {
                test: /\.css$/,
                use: ["style-loader", {
                    loader: "css-loader",
                    options: {
                        modules: true,
                        sourceMap: true,
                        importLoaders: 1,
                        localIdentName: cssModulePattern
                    }
                } as OldLoader, "postcss-loader"]
            };

        return {
            entry,
            output: {
                filename: "[name].js",
                path: resolve(__dirname, "dist", "static"),
                publicPath: "/"
            },
            devtool,
            resolve: {
                extensions: [".tsx", ".ts", ".js", ".css", ".scss", ".sass"]
            },
            module: {
                rules: [
                    {
                        test: /\.tsx?$/,
                        use: ["awesome-typescript-loader?configFileName=tsconfig.client.json"],
                        exclude: /node_modules/
                    },
                    cssRule,
                    {
                        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
                        use: "url-loader?limit=10000&mimetype=application/font-woff"
                    },
                    {
                        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
                        use: "url-loader?limit=10000&mimetype=application/font-woff"
                    },
                    {
                        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                        use: "url-loader?limit=10000&mimetype=application/octet-stream"
                    },
                    {
                        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                        use: "file-loader"
                    },
                    {
                        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                        use: "url-loader?limit=10000&mimetype=image/svg+xml"
                    }
                ]
            },
            plugins
        };
    };
