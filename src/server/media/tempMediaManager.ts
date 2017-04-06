/**
 * @file Exposes a media manager for temporary files
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../typings.d.ts" />
import LocalMediaManager from "./localMediaManager";
import config from "../../config";
export default new LocalMediaManager(config.media.tempDirectory);
