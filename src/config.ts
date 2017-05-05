/**
 * @file Exposes the configuration object according to the environment
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference types="node" />
import { resolve } from "path";
const env: string = process.env.NODE_ENV || "development";
export let config: Ropeho.Configuration.ConfigurationObject = require(resolve(`config.${env}.json`));
config.redis.host = process.env.REDIS_ADDR || config.redis.host;
config.redis.port = process.env.REDIS_PORT || config.redis.port;
export default config;
