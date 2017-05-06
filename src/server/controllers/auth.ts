/**
 * @file Express controller that manages authentication
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../typings.d.ts" />
import { Router, Request, Response, NextFunction } from "express-serve-static-core";
import * as express from "express";
import { authenticate, AuthenticateOptions } from "passport";
import config from "../../config";
import ErrorResponse from "../helpers/errorResponse";
import { assignCookieToClient } from "../socket";
import { parse } from "cookie";
import { ADMIN_END_POINT, CLIENT_END_POINT, API_END_POINT } from "../../common/helpers/resolveEndPoint";

const router: Router = express.Router();

router.get("/", (req: Request, res: Response) => {
    res.status(200).send(req.user || {});
});

router.post("/", (req: Request, res: Response, next: NextFunction) => {
    authenticate("local", (error: any, user?: any, info?: Ropeho.IErrorResponse) => {
        if (user) {
            req.logIn(user, (err: any) => {
                if (err) {
                    new ErrorResponse(err).send(res);
                } else {
                    res.status(200).send(user);
                }
            });
        } else {
            new ErrorResponse(info || {
                developerMessage: error ? error || error.message : ""
            }).send(res);
        }
    })(req, res, next);
});

router.get("/facebook", (req: Request, res: Response, next: NextFunction) => {
    if (req.query.admin) {
        authenticate("facebook", { callbackURL: `${API_END_POINT}/api/auth/facebook?admin=1` } as AuthenticateOptions)(req, res, next);
    } else {
        authenticate("facebook", { callbackURL: `${API_END_POINT}/api/auth/facebook` } as AuthenticateOptions)(req, res, next);
    }
}, (req: Request, res: Response, next: NextFunction) => {
    if (req.query.admin) {
        res.redirect(ADMIN_END_POINT);
    } else {
        res.redirect(CLIENT_END_POINT);
    }
});

router.post("/logout", (req: Request, res: Response) => {
    req.logout();
    res.status(200).send({});
});

router.post("/socket/:clientId", (req: Request, res: Response) => {
    const cookie: string = req.header("Cookie");
    const parsed: { [key: string]: string } = parse(cookie);
    assignCookieToClient(req.params.clientId, parsed[config.session.name]);
    res.status(200).send({});
});

export default router;
