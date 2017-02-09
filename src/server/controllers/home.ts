/**
 * @file Default API express controller
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../typings.d.ts" />
import { Router, Request, Response } from "express-serve-static-core";
import * as express from "express";
const router: Router = express.Router();

router.get("/", (req: Request, res: Response) =>
        res.send("Hello World"));

export default router;
