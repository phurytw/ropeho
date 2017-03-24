/**
 * @file Express controller that manages authentication
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../typings.d.ts" />
import { Router, Request, Response, NextFunction } from "express-serve-static-core";
import * as express from "express";
import { authenticate, AuthenticateOptions } from "passport";
import config from "../../config";
import { trim } from "lodash";
import ErrorResponse from "../helpers/errorResponse";

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
    const baseUrl: string = `${config.endPoints.api.host}:${config.endPoints.api.port}`;
    if (req.query.admin) {
        authenticate("facebook", { callbackURL: `${baseUrl}/api/auth/facebook?admin=1` } as AuthenticateOptions)(req, res, next);
    } else {
        authenticate("facebook", { callbackURL: `${baseUrl}/api/auth/facebook` } as AuthenticateOptions)(req, res, next);
    }
}, (req: Request, res: Response, next: NextFunction) => {
    let host: string,
        port: number,
        url: string;
    if (req.query.admin) {
        host = trim(config.endPoints.admin.host, ":");
        port = config.endPoints.admin.port;
    } else {
        host = trim(config.endPoints.client.host, ":");
        port = config.endPoints.client.port;
    }
    url = port === 80 || port === 443 ? host : `${host}:${port}`;
    res.redirect(url);
});

router.post("/logout", (req: Request, res: Response) => {
    req.logout();
    res.status(200).send({});
});

export default router;
