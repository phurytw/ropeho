/**
 * @file Exposes a media manager according to the environment
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../typings.d.ts" />
import LocalMediaManager from "./localMediaManager";

let mediaManager: Ropeho.Media.IMediaManager;

if (process.env.NODE_ENV === "production") {
    mediaManager = new LocalMediaManager();
} else {
    mediaManager = new LocalMediaManager();
}

export default mediaManager;
