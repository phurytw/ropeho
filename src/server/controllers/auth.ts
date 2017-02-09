/**
 * @file Express controller that manages authentication
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../typings.d.ts" />
import { Router, Request, Response, NextFunction } from "express-serve-static-core";
import * as express from "express";
import { authenticate, AuthenticateOptions } from "passport";
import config from "../../config";

const router: Router = express.Router();

router.get("/", (req: Request, res: Response) => {
    res.status(200).send(req.user || {});
});

router.post("/", authenticate("local"), (req: Request, res: Response) => {
    res.status(200).send(req.user);
});

router.get("/facebook", (req: Request, res: Response, next: NextFunction) => {
    if (req.query.admin) {
        authenticate("facebook", { callbackURL: `${config.hosts.api}?admin=1` } as AuthenticateOptions)(req, res, next);
    } else {
        authenticate("facebook", { callbackURL: config.hosts.api } as AuthenticateOptions)(req, res, next);
    }
}, (req: Request, res: Response, next: NextFunction) => {
    if (req.query.admin) {
        res.redirect(config.hosts.admin);
    } else {
        res.redirect(config.hosts.client);
    }
});

router.post("/logout", (req: Request, res: Response) => {
    req.logout();
    res.status(200).send(req.user);
});

export default router;
