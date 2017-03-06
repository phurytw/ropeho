/**
 * @file Express controller that manages Ropeho productions
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../typings.d.ts" />
import { Router, Request, Response } from "express-serve-static-core";
import * as express from "express";
import GenericRepository from "../dal/genericRepository";
import { isEmpty, keys, map, isArray, includes, pickBy, every, trim } from "lodash";
import * as _ from "lodash";
import { isAdmin } from "../accounts/authorize";
import config from "../../config";
import { MediaPermissions, MediaTypes, ErrorCodes, Roles } from "../../enum";
import { isProduction, filterProduction } from "../helpers/entityUtilities";
import ErrorResponse from "../helpers/errorResponse";
import uriFriendlyFormat from "../helpers/uriFriendlyFormat";
import { v4 } from "uuid";
import { isUUID } from "validator";
import { getLocked } from "../socket";

import Production = Ropeho.Models.Production;
import IGenericRepository = Ropeho.Models.IGenericRepository;

const router: Router = express.Router();
const productionRepository: IGenericRepository<Production> = new GenericRepository<Production>({
    ...config.redis,
    ...config.database.productions
});

router.get("/", async (req: Request, res: Response) => {
    try {
        const { query, user }: Request = req;
        const fields: string[] = typeof query.fields === "string" ? map<string, string>(query.fields.split(","), trim) : [];
        let found: Production[];
        delete query.fields;
        // Fetching
        if (keys(query).length > 0) {
            found = await productionRepository.search(query);
        } else {
            found = await productionRepository.get() as Production[];
        }
        // Filter private productions
        const productionIds: string[] = user ? (user.productionIds || []) : [];
        const role: Roles = user ? user.role : Roles.Anonymous;
        found = _(found)
            .map<Production>((p: Production) => filterProduction(p, role === Roles.Administrator ? true : productionIds))
            .reject((p: Production) => p === undefined)
            .value();
        // Removing unwanted fields
        if (!isEmpty(fields)) {
            found = map<Production, Production>(found, (c: Production) => pickBy<Production, Production>(c, (value: any, key: string) => includes(fields, key)));
        }
        res.status(200).send(found);
    } catch (error) {
        new ErrorResponse({ developerMessage: error }).send(res);
    }
});

router.get("/:id", async (req: Request, res: Response) => {
    try {
        const { query, user, params }: Request = req;
        const fields: string[] = typeof query.fields === "string" ? map<string, string>(query.fields.split(","), trim) : [];
        let found: Production = await productionRepository.getById(params.id);
        found = found ? filterProduction(found, !user ? [] : (user.role === Roles.Administrator ? true : user.productionIds)) : found;
        // Reject if private
        if (!found) {
            new ErrorResponse({
                status: 400,
                developerMessage: `Production ${req.params.id} could not be found`,
                userMessage: "La production est introuvable",
                errorCode: ErrorCodes.NotFound
            }).send(res);
            return;
        }
        // Removing unwanted fields
        if (!isEmpty(fields)) {
            found = pickBy<Production, Production>(found, (value: any, key: string) => includes(fields, key));
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
            let production: Production = req.body;
            const { name, banner, background, description, medias, state }: Production = production;
            // Check if valid
            production.medias = medias || [];
            production._id = v4();
            production.banner = banner || {
                _id: v4(),
                delay: 0,
                description: "",
                sources: [],
                state: MediaPermissions.Public,
                type: MediaTypes.Image
            };
            production.background = background || {
                _id: v4(),
                delay: 0,
                description: "",
                sources: [],
                state: MediaPermissions.Public,
                type: MediaTypes.Image
            };
            production.state = state || MediaPermissions.Locked;
            production.description = description || "";
            if (!isProduction(production) || !production.name) {
                new ErrorResponse({
                    status: 400,
                    developerMessage: "Production name is empty or not a string",
                    userMessage: "Nom invalide",
                    errorCode: ErrorCodes.InvalidRequest
                }).send(res);
                return;
            }
            // Create
            production = await productionRepository.create(production);
            res.status(200).send(production);
        } catch (error) {
            // Check if name is used
            const [production]: Production[] = await productionRepository.search({ name: req.body.name });
            if (production) {
                new ErrorResponse({
                    status: 400,
                    developerMessage: `There is already a production with the name ${production.name} (${uriFriendlyFormat(production.name)})`,
                    userMessage: `Une production avec le nom ${production.name} (${uriFriendlyFormat(production.name)}) existe déjà`,
                    errorCode: ErrorCodes.AlreadyExists
                }).send(res);
                return;
            }
            new ErrorResponse({ developerMessage: error }).send(res);
        }
    });

router.post("/order",
    isAdmin,
    async (req: Request, res: Response) => {
        try {
            const order: string[] = req.body;
            if (isArray(order) && every<string>(order, (o: string) => typeof o === "string" && isUUID(o))) {
                res.status(200).send(await productionRepository.order(order));
            } else {
                new ErrorResponse({
                    status: 400,
                    developerMessage: "The new order must be an array of IDs",
                    userMessage: "Le nouvel ordre des productions est incorrect",
                    errorCode: ErrorCodes.InvalidRequest
                }).send(res);
            }
        } catch (error) {
            new ErrorResponse({ developerMessage: error }).send(res);
        }
    });

router.put("/:id",
    isAdmin,
    async (req: Request, res: Response) => {
        try {
            // Get current production
            let production: Production = await productionRepository.getById(req.body._id);
            production = {
                ...production,
                ...req.body
            };
            if (!production) {
                new ErrorResponse({
                    status: 400,
                    developerMessage: `Production ${req.params.id} could not be found`,
                    userMessage: "La production est introuvable",
                    errorCode: ErrorCodes.NotFound
                }).send(res);
                return;
            }
            if (!isProduction(production)) {
                new ErrorResponse({
                    status: 400,
                    developerMessage: "Production is invalid",
                    userMessage: "Les modifications sont incorrectes",
                    errorCode: ErrorCodes.InvalidRequest
                }).send(res);
                return;
            }
            if (includes<string>(getLocked(), production._id)) {
                new ErrorResponse({
                    status: 400,
                    developerMessage: "Production is locked",
                    userMessage: "Un utilisateur est en train d'utiliser cette production.",
                    errorCode: ErrorCodes.Unavailable
                }).send(res);
                return;
            }
            await productionRepository.update(req.body);
            res.status(200).send(req.body);
        } catch (error) {
            // Check if name is used
            const [production]: Production[] = await productionRepository.search(req.body.name);
            if (production) {
                new ErrorResponse({
                    status: 400,
                    developerMessage: `There is already a production with the name ${production.name} (${uriFriendlyFormat(production.name)})`,
                    userMessage: `Une production avec le nom ${production.name} (${uriFriendlyFormat(production.name)}) existe déjà`,
                    errorCode: ErrorCodes.AlreadyExists
                }).send(res);
                return;
            }
            new ErrorResponse({ developerMessage: error }).send(res);
        }
    });

router.delete("/:id",
    isAdmin,
    async (req: Request, res: Response) => {
        try {
            if (includes<string>(getLocked(), req.params.id)) {
                new ErrorResponse({
                    status: 400,
                    developerMessage: "Production is locked",
                    userMessage: "Un utilisateur est en train d'utiliser cette production.",
                    errorCode: ErrorCodes.Unavailable
                }).send(res);
                return;
            }
            const nDeleted: number = await productionRepository.delete(req.params.id);
            if (nDeleted === 0) {
                new ErrorResponse({
                    status: 400,
                    developerMessage: `Production ${req.params.id} could not be found`,
                    userMessage: "La production est introuvable",
                    errorCode: ErrorCodes.NotFound
                }).send(res);
            } else {
                res.status(200).send();
            }
        } catch (error) {
            new ErrorResponse({ developerMessage: error }).send(res);
        }
    });

export default router;
