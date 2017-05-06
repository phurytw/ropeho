/**
 * @file Express controller that manages Ropeho users
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../typings.d.ts" />
import { Router, Request, Response, NextFunction } from "express-serve-static-core";
import * as express from "express";
import GenericRepository from "../dal/genericRepository";
import { v4 } from "uuid";
import { isEmail, normalizeEmail } from "validator";
import { isEmpty, keys, map, pickBy, includes, trim } from "lodash";
import { computeHash } from "../accounts/password";
import { computeToken, isTokenValid } from "../accounts/token";
import { isAdmin } from "../accounts/authorize";
import mailer from "../helpers/mailer";
import { renderAsString } from "../app";
import { authenticate, AuthenticateOptions } from "passport";
import config from "../../config";
import { CUSTOMER_END_POINT, API_END_POINT } from "../../common/helpers/resolveEndPoint";
import { isUser } from "../../common/helpers/entityUtilities";
import ErrorResponse from "../helpers/errorResponse";
import { Roles, ErrorCodes } from "../../enum";

import User = Ropeho.Models.User;
import Production = Ropeho.Models.Production;
import IGenericRepository = Ropeho.Models.IGenericRepository;

const router: Router = express.Router();
const userRepository: IGenericRepository<User> = new GenericRepository<User>({
    ...config.redis,
    ...config.database.users
});
const productionRepository: IGenericRepository<Production> = new GenericRepository<Production>({
    ...config.redis,
    ...config.database.productions
});

router.get("/",
    isAdmin,
    async (req: Request, res: Response) => {
        try {
            const { query }: Request = req;
            const fields: string[] = typeof query.fields === "string" ? map<string, string>(query.fields.split(","), trim) : [];
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
                found = map<User, User>(found, (c: User) => pickBy<User, User>(c, (value: any, key: string) => key === "productionIds" || includes(fields, key)));
            }
            // If productionIds or productions is not filtered out we get associated productions
            if (isEmpty(fields) || includes<string>(fields, "productions")) {
                for (const user of found) {
                    user.productions = await productionRepository.getById(user.productionIds) as Production[];
                    // Remove productions if not requested
                    if (!isEmpty(fields) && !includes<string>(fields, "productions")) {
                        delete user.productions;
                    }
                    // Remove productionIds if not requested
                    if (!isEmpty(fields) && !includes<string>(fields, "productionIds")) {
                        delete user.productionIds;
                    }
                }
            }
            res.status(200).send(found);
        } catch (error) {
            new ErrorResponse({ developerMessage: error }).send(res);
        }
    });

router.get("/:id",
    isAdmin,
    async (req: Request, res: Response) => {
        try {
            const { query }: Request = req;
            const fields: string[] = typeof query.fields === "string" ? map<string, string>(query.fields.split(","), trim) : [];
            let found: User = await userRepository.getById(req.params.id);
            // Removing unwanted fields
            if (!isEmpty(fields)) {
                found = pickBy<User, User>(found, (value: any, key: string) => key === "productionIds" || includes(fields, key));
            }
            // If productionIds or productions is not filtered out we get associated productions
            if (isEmpty(fields) || includes<string>(fields, "productions")) {
                found.productions = await productionRepository.getById(found.productionIds) as Production[];
            }
            // Remove productionIds if not requested
            if (!isEmpty(fields) && !includes<string>(fields, "productionIds")) {
                delete found.productionIds;
            }
            res.status(200).send(found);
        } catch (error) {
            new ErrorResponse({ developerMessage: error }).send(res);
        }
    });

router.post("/",
    isAdmin,
    async (req: Request, res: Response) => {
        try {
            // Check if email is valid
            let user: User = req.body;
            const { email }: User = user;
            const { facebookId, name, productionIds }: User = user;
            // Check if email was valid
            if (!email || !isEmail(email)) {
                new ErrorResponse({
                    status: 400,
                    developerMessage: "User does not have a valid email",
                    userMessage: "L'adresse mail est incorrecte",
                    errorCode: ErrorCodes.InvalidRequest
                }).send(res);
                return;
            }
            user.email = normalizeEmail(email) as string;
            // ID
            user._id = user._id || v4();
            // Invitation token
            user.token = computeToken();
            // Other properties
            user.facebookId = facebookId || "";
            user.name = name || "";
            user.password = "";
            user.productionIds = productionIds || [];
            user.role = Roles.User;
            // It prevents users to have unwanted properties stored in the database
            if (!isUser(user)) {
                new ErrorResponse({
                    status: 400,
                    developerMessage: "User is not valid",
                    userMessage: "Les données envoyés sont incorrectes",
                    errorCode: ErrorCodes.InvalidRequest
                }).send(res);
                return;
            }
            user = await userRepository.create(user);
            // Send invitation email
            await mailer.sendMail({
                ...config.mailer.mailOptions,
                to: user.email,
                text: `Vous êtes invités à vous inscrire sur Ropeho Productions. Veuillez suivre le lien suivant: ${CUSTOMER_END_POINT}/register/${user.token}`,
                html: await renderAsString("invitation.html", { name: user.name, token: user.token, host: CUSTOMER_END_POINT })
            });
            res.status(200).send(user);
        } catch (error) {
            const user: User = req.body,
                { email, facebookId }: User = user;
            // Check if email is in use
            const [emailFound]: User[] = await userRepository.search({ email });
            if (emailFound) {
                new ErrorResponse({
                    status: 400,
                    developerMessage: `${email} is already used`,
                    userMessage: `L'adresse mail ${email} est déjà utilisée par un autre compte`,
                    errorCode: ErrorCodes.AlreadyExists
                }).send(res);
                return;
            }
            // Check if facebookId is in use
            const [fbFound]: User[] = await userRepository.search({ facebookId });
            if (fbFound) {
                new ErrorResponse({
                    status: 400,
                    developerMessage: `Facebook account ${facebookId} is already used`,
                    userMessage: `Ce compte Facebook est déjà utilisé par un autre compte`,
                    errorCode: ErrorCodes.AlreadyExists
                }).send(res);
                return;
            }
            // Other errors
            new ErrorResponse({ developerMessage: error }).send(res);
        }
    });

router.post("/register/:token", async (req: Request, res: Response) => {
    try {
        let [user]: User[] = await userRepository.search({ token: req.params.token });
        // Validate token
        if (!user) {
            new ErrorResponse({
                status: 400,
                developerMessage: `User not found with token ${req.params.token}`,
                userMessage: "Lien invalide",
                errorCode: ErrorCodes.NotFound
            }).send(res);
            return;
        }
        if (!isTokenValid(user.token)) {
            new ErrorResponse({
                status: 400,
                developerMessage: `Token is invalid or has expired`,
                userMessage: "Le délai d'inscription a expiré veuillez nous contacter pour renouveller votre lien",
                errorCode: ErrorCodes.AssistanceRequired
            }).send(res);
            return;
        }
        // Check if user is already registered
        if (user.password || user.facebookId) {
            new ErrorResponse({
                status: 400,
                developerMessage: `User is already registered`,
                userMessage: "Ce compte a déjà terminé son inscription",
                errorCode: ErrorCodes.AlreadyExists
            }).send(res);
            return;
        }
        // Validate name and password
        const { name, password }: User = req.body;
        if (!name) {
            new ErrorResponse({
                status: 400,
                developerMessage: "Username is required",
                userMessage: "Un nom est requis",
                errorCode: ErrorCodes.InvalidRequest
            }).send(res);
            return;
        }
        if (!password) {
            new ErrorResponse({
                status: 400,
                developerMessage: "Password is required",
                userMessage: "Un mot de passe est requis",
                errorCode: ErrorCodes.InvalidRequest
            }).send(res);
            return;
        }
        user = {
            ...user,
            name,
            password: (await computeHash(password)).toString("hex")
        };
        // Update user with password
        await userRepository.update(user);
        // Send confirmation email
        await mailer.sendMail({
            ...config.mailer.mailOptions,
            to: user.email,
            subject: "Invitation sur Ropeho Productions",
            text: `Vous êtes invités à vous inscrire sur Ropeho Productions. Veuillez suivre le lien suivant: ${CUSTOMER_END_POINT}/register/${user.token}`,
            html: await renderAsString("invitation.html", { name: user.name, token: user.token, host: CUSTOMER_END_POINT })
        });
        res.status(200).send({});
    } catch (error) {
        new ErrorResponse({ developerMessage: error }).send(res);
    }
});

router.get("/register/:token/facebook", (req: Request, res: Response, next: NextFunction) =>
    authenticate("facebook", { callbackURL: `${API_END_POINT}/api/users/register/${req.params.token}/facebook` } as AuthenticateOptions)(req, res, next),
    async (req: Request, res: Response) => {
        try {
            let [user]: User[] = await userRepository.search({ token: req.params.token });
            // Validate token
            if (!user) {
                new ErrorResponse({
                    status: 400,
                    developerMessage: `User not found with token ${req.params.token}`,
                    userMessage: "Lien invalide",
                    errorCode: ErrorCodes.NotFound
                }).send(res);
                return;
            }
            if (!isTokenValid(user.token)) {
                new ErrorResponse({
                    status: 400,
                    developerMessage: `Token is invalid or has expired`,
                    userMessage: "Le délai d'inscription a expiré veuillez nous contacter pour renouveller votre lien",
                    errorCode: ErrorCodes.AssistanceRequired
                }).send(res);
                return;
            }
            // Check if user is already registered
            if (user.password || user.facebookId) {
                new ErrorResponse({
                    status: 400,
                    developerMessage: `User is already registered`,
                    userMessage: "Ce compte a déjà terminé son inscription",
                    errorCode: ErrorCodes.AlreadyExists
                }).send(res);
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
                text: `${user.name}, vous avez confirmé votre inscription sur Ropeho Productions. Vous pouvez dorénavant aller sur votre espace client et télécharger vos photos sur le lien suivant: ${CUSTOMER_END_POINT}/dashboard`,
                html: await renderAsString("confirmation.html", { name: user.name, host: CUSTOMER_END_POINT })
            });
            res.status(200).send({});
        } catch (error) {
            new ErrorResponse({ developerMessage: error }).send(res);
        }
    });

router.put("/:id",
    isAdmin,
    async (req: Request, res: Response) => {
        try {
            let user: User = await userRepository.getById(req.body._id);
            user = {
                ...user,
                ...req.body
            };
            if (!user) {
                new ErrorResponse({
                    status: 400,
                    developerMessage: `User ${req.params.id} could not be found`,
                    userMessage: "Utilisateur introuvable",
                    errorCode: ErrorCodes.NotFound
                }).send(res);
                return;
            }
            if (!isUser(user)) {
                new ErrorResponse({
                    status: 400,
                    developerMessage: "User is invalid",
                    userMessage: "Les modifications apportés à l'utilisateur ne sont pas valides",
                    errorCode: ErrorCodes.NotFound
                }).send(res);
                return;
            }
            await userRepository.update(user);
            res.status(200).send(req.body);
        } catch (error) {
            new ErrorResponse({ developerMessage: error }).send(res);
        }
    });

router.delete("/:id",
    isAdmin,
    async (req: Request, res: Response) => {
        try {
            const nDeleted: number = await userRepository.delete(req.params.id);
            if (nDeleted === 0) {
                new ErrorResponse({
                    status: 400,
                    developerMessage: `User ${req.params.id} could not be found`,
                    userMessage: "Utilisateur introuvable",
                    errorCode: ErrorCodes.NotFound
                }).send(res);
            } else {
                res.status(200).send({ deleted: nDeleted });
            }
        } catch (error) {
            new ErrorResponse({ developerMessage: error }).send(res);
        }
    });

export default router;
