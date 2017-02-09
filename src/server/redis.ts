/**
 * @file Exposes a Redis client
 * @author François Nguyen <https://github.com/lith-light-g>
 */

import * as redis from "redis";
import config from "../config";
export default redis.createClient(config.redis);
