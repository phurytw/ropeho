/**
 * @file Express controller that manages Ropeho users
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../typings.d.ts" />
import { Router, Request, Response, NextFunction } from "express-serve-static-core";
import * as express from "express";
import GenericRepository from "../dal/genericRepository";
import { v4 } from "node-uuid";
import { isEmail, normalizeEmail } from "validator";
import { isEmpty, isString, keys, map, pickBy, includes } from "lodash";
import { computeHash } from "../accounts/password";
import { computeToken, isTokenValid } from "../accounts/token";
import { isAdmin } from "../accounts/authorize";
import mailer from "../helpers/mailer";
import { renderAsString } from "../app";
import { authenticate, AuthenticateOptions } from "passport";
import config from "../../config";

import User = Ropeho.Models.User;
import IGenericRepository = Ropeho.IGenericRepository;

const router: Router = express.Router();
const userRepository: IGenericRepository<User> = new GenericRepository<User>({
    ...config.redis,
    ...config.database.users
});

router.get("/",
    isAdmin,
    async (req: Request, res: Response) => {
        try {
            const { query }: Request = req;
            const fields: string[] = isString(query.fields) ? map<string, string>(query.fields.split(","), (f: string) => f.trim()) : [];
            let found: User[];
            delete query.fields;
            // Fetching
            if (keys(query).length > 0) {
                found = await userRepository.search(query);
            } else {
                found = await userRepository.get() as User[];
            }
            // Removing unwanted fields
            if (!isEmpty(fields)) {
                found = map<User, User>(found, (c: User) => pickBy<User, User>(c, (value: any, key: string) => includes(fields, key)));
            }
            res.status(200).send(found);
        } catch (error) {
            res.status(500).send(error.message);
        }
    });

router.get("/:id",
    isAdmin,
    async (req: Request, res: Response) => {
        try {
            const fields: string[] = isString(req.query.fields) ? map<string, string>(req.query.fields.split(","), (f: string) => f.trim()) : [];
            let found: User = await userRepository.getById(req.params.id);
            // Removing unwanted fields
            if (!isEmpty(fields)) {
                found = pickBy<User, User>(found, (value: any, key: string) => includes(fields, key));
            }
            res.status(200).send(found);
        } catch (error) {
            res.status(500).send(error.message);
        }
    });

router.post("/",
    isAdmin,
    async (req: Request, res: Response) => {
        try {
            // Check if email is valid
            let user: User = req.body,
                { email }: User = user;
            if (!email || !isEmail(email)) {
                res.status(400).send("User does not have a valid email");
                return;
            }
            email = normalizeEmail(email) as string;
            // Check if email is in use
            const [found]: User[] = await userRepository.search({ email });
            if (found) {
                res.status(401).send(`${email} is already used`);
                return;
            }
            // ID
            user._id = user._id || v4();
            // Invitation token
            user.token = computeToken();
            user = await userRepository.create(user);
            // Send invitation email
            await mailer.sendMail({
                ...config.mailer.mailOptions,
                to: user.email,
                text: `Vous êtes invités à vous inscrire sur Ropeho Productions. Veuillez suivre le lien suivant: ${config.hosts.client}/register/${user.token}`,
                html: await renderAsString("invitation.html", { name: user.name, token: user.token, host: config.hosts.client })
            });
            res.status(200).send(user);
        } catch (error) {
            res.status(500).send(error.message);
        }
    });

router.post("/register/:token", async (req: Request, res: Response) => {
    try {
        let [user]: User[] = await userRepository.search({ token: req.params.token });
        // Validate token
        if (!user) {
            res.status(404).send(`User not found with token ${req.params.token}`);
            return;
        }
        if (!isTokenValid(user.token)) {
            res.status(401).send(`Token is invalid or has expired`);
            return;
        }
        // Check if user is already registered
        if (user.password || user.facebookId) {
            res.status(401).send(`User is already registered`);
            return;
        }
        // Validate name and password
        user = {
            ...user,
            name: req.body.name,
            password: req.body.password
        };
        if (isEmpty(user.name)) {
            res.status(400).send("Username is required");
            return;
        }
        if (isEmpty(user.password)) {
            res.status(400).send("Password is required");
            return;
        }
        // Update user with password
        user.password = (await computeHash(user.password)).toString("hex");
        await userRepository.update(user);
        // Send confirmation email
        await mailer.sendMail({
            ...config.mailer.mailOptions,
            to: user.email,
            subject: "Invitation sur Ropeho Productions",
            text: `Vous êtes invités à vous inscrire sur Ropeho Productions. Veuillez suivre le lien suivant: ${config.hosts.client}/register/${user.token}`,
            html: await renderAsString("invitation.html", { name: user.name, token: user.token, host: config.hosts.client })
        });
        res.status(200).send();
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.get("/register/:token/facebook", (req: Request, res: Response, next: NextFunction) =>
    authenticate("facebook", { callbackURL: `${config.hosts.api}/api/users/register/${req.params.token}/facebook` } as AuthenticateOptions)(req, res, next),
    async (req: Request, res: Response) => {
        try {
            let [user]: User[] = await userRepository.search({ token: req.params.token });
            // Validate token
            if (!user) {
                res.status(404).send(`User not found with token ${req.params.token}`);
                return;
            }
            if (!isTokenValid(user.token)) {
                res.status(401).send(`Token is invalid or has expired`);
                return;
            }
            // Check if user is already registered
            if (user.password || user.facebookId) {
                res.status(401).send(`User is already registered`);
                return;
            }
            // Fuse facebook account and user
            user = { ...user, ...req.user, _id: user._id };
            // Update the user with the fusion and delete the facebook account from the database
            await userRepository.update(user);
            await userRepository.delete(req.user._id);
            // Send confirmation email
            await mailer.sendMail({
                ...config.mailer.mailOptions,
                to: user.email,
                subject: "Confirmation de votre inscription sur Ropeho Productions",
                text: `${user.name}, vous avez confirmé votre inscription sur Ropeho Productions. Vous pouvez dorénavant aller sur votre espace client et télécharger vos photos sur le lien suivant: ${config.hosts.client}/dashboard`,
                html: await renderAsString("confirmation.html", { name: user.name, host: config.hosts.client })
            });
            res.status(200).send();
        } catch (error) {
            res.status(500).send(error.message);
        }
    });

router.put("/:id",
    isAdmin,
    async (req: Request, res: Response) => {
        try {
            const nUpdated: number = await userRepository.update(req.body);
            if (nUpdated === 0) {
                res.status(404).send(`User ${req.params.id} could not be found`);
            } else {
                res.status(200).send(req.body);
            }
        } catch (error) {
            res.status(500).send(error.message);
        }
    });

router.delete("/:id",
    isAdmin,
    async (req: Request, res: Response) => {
        try {
            const nDeleted: number = await userRepository.delete(req.params.id);
            if (nDeleted === 0) {
                res.status(404).send(`User ${req.params.id} could not be found`);
            } else {
                res.status(200).send();
            }
        } catch (error) {
            res.status(500).send(error.message);
        }
    });

export default router;
