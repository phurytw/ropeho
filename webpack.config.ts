/**
 * @file Webpack config
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import { resolve } from "path";
import { Configuration, optimize, HotModuleReplacementPlugin, NamedModulesPlugin, Entry, DefinePlugin, Plugin, LoaderOptionsPlugin, OldLoader, Rule } from "webpack";
import * as ExtractTextPlugin from "extract-text-webpack-plugin";

export const cssModulePattern: string = "[name]__[local]___[hash:base64:8]";

const envDefines: { [key: string]: string } = {
    "process.env.SOCKET_CHUNK_SIZE": JSON.stringify(process.env.SOCKET_CHUNK_SIZE),
    "process.env.API_ADDR": JSON.stringify(process.env.API_ADDR),
    "process.env.API_PORT": JSON.stringify(process.env.API_PORT),
    "process.env.ADMIN_ADDR": JSON.stringify(process.env.ADMIN_ADDR),
    "process.env.ADMIN_PORT": JSON.stringify(process.env.ADMIN_PORT),
    "process.env.CLIENT_ADDR": JSON.stringify(process.env.CLIENT_ADDR),
    "process.env.CLIENT_PORT": JSON.stringify(process.env.CLIENT_PORT),
    "process.env.CUSTOMER_ADDR": JSON.stringify(process.env.CUSTOMER_ADDR),
    "process.env.CUSTOMER_PORT": JSON.stringify(process.env.CUSTOMER_PORT),
    "process.env.ADMIN_DEV_ADDR": JSON.stringify(process.env.ADMIN_DEV_ADDR),
    "process.env.ADMIN_DEV_PORT": JSON.stringify(process.env.ADMIN_DEV_PORT),
    "process.env.CLIENT_DEV_ADDR": JSON.stringify(process.env.CLIENT_DEV_ADDR),
    "process.env.CLIENT_DEV_PORT": JSON.stringify(process.env.CLIENT_DEV_PORT),
    "process.env.CUSTOMER_DEV_ADDR": JSON.stringify(process.env.CUSTOMER_DEV_ADDR),
    "process.env.CUSTOMER_DEV_PORT": JSON.stringify(process.env.CUSTOMER_DEV_PORT)
};

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
        }),
        new ExtractTextPlugin("styles.css")];
        // set plugins hot module replacement plugins if not in production
        plugins = env === "production" ? [...plugins, new DefinePlugin({
            "process.env.NODE_ENV": JSON.stringify("production"),
            ...envDefines
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
        })] : [...plugins, new DefinePlugin(envDefines),
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
                path: resolve(__dirname, "dist", "admin", "static"),
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
                        use: ["awesome-typescript-loader"],
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
            "process.env.NODE_ENV": JSON.stringify("production"),
            ...envDefines
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
        })] : [...plugins, new DefinePlugin(envDefines),
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
                path: resolve(__dirname, "dist", "client", "static"),
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
                        use: ["awesome-typescript-loader"],
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
