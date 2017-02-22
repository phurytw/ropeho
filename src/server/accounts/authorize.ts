/**
 * @file Express middlewares that authenticates and authorize a user using passport
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../typings.d.ts" />
import { Request, Response, NextFunction } from "express-serve-static-core";
import { Roles } from "../../enum";
import redis from "../redis";
import config from "../../config";
import { unsign } from "cookie-signature";

/**
 * Request handler that checks if user is authenticated
 * Short circuits if otherwise
 * @param {Request} req request object that must contain the user
 * @param {Response} res response object
 * @param {NextFunction} next function that passes to the next handler
 */
export const isAuthenticated: (req: Request, res: Response, next: NextFunction) => void =
    (req: Request, res: Response, next: NextFunction): void => {
        if (req.user) {
            next();
        } else {
            res.status(403).send("User is not authenticated");
        }
    };

/**
 * Request handler that checks if user is authenticated and administrator
 * Short circuits if otherwise
 * @param {Request} req request object that must contain the user
 * @param {Response} res response object
 * @param {NextFunction} next function that passes to the next handler
 */
export const isAdmin: (req: Request, res: Response, next: NextFunction) => void =
    (req: Request, res: Response, next: NextFunction): void => {
        if (req.user) {
            if ((req.user as Ropeho.Models.User).role === Roles.Administrator) {
                next();
            } else {
                res.status(403).send("User is not an administrator");
            }
        } else {
            res.status(403).send("User is not authenticated");
        }
    };

/**
 * Request handler that checks if user is authenticated and has a fecebook ID
 * Short circuits if otherwise
 * @param {Request} req request object that must contain the user
 * @param {Response} res response object
 * @param {NextFunction} next function that passes to the next handler
 */
export const isFacebook: (req: Request, res: Response, next: NextFunction) => void =
    (req: Request, res: Response, next: NextFunction): void => {
        const { user: { facebookId } }: Request = req;
        if (facebookId) {
            next();
        } else {
            res.status(403).send("User is not authenticated");
        }
    };

/**
 * Get an user ID from a cookie value
 * @param {string} cookie cookie value
 */
export const deserializeCookie: (cookie: string) => Promise<string> =
    (cookie: string): Promise<string> => new Promise<string>((resolve: (value?: string | PromiseLike<string>) => void, reject: (reason?: any) => void) => {
        cookie = decodeURIComponent(cookie);
        if (cookie.substr(0, 2) === "s:") {
            redis.get(`sess:${unsign(cookie.slice(2), config.session.secret)}`, (err: Error, res: string): void => {
                const parsed: Express.Session = JSON.parse(res);
                err ? reject(err) : resolve(parsed["passport"]["user"]);
            });
        } else {
            reject();
        }
    });
