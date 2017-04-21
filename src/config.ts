/**
 * @file Exposes the configuration object according to the environment
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference types="node" />
import development from "./configurations/config.development";
import production from "./configurations/config.production";
import test from "./configurations/config.test";

export const config: Ropeho.Configuration.ConfigurationObject = process.env.NODE_ENV === "production" ? production : (process.env.NODE_ENV === "test" ? test : development);
export default config;
