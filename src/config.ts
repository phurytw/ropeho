/**
 * @file Exposes the configuration object according to the environment
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference types="node" />
import { join } from "path";
export const env: string = process.env.NODE_ENV || "development";
export const config: Ropeho.Configuration.Configuration = require(join(__dirname, "..", "config.json"))[env];
export default config;
