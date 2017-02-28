/**
 * @file Express controller that manages Ropeho presentations
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../typings.d.ts" />
import { Router, Request, Response } from "express-serve-static-core";
import * as express from "express";
import GenericRepository from "../dal/genericRepository";
import { isEmpty, keys, map, isArray, includes, pickBy, every, trim } from "lodash";
import { isAdmin } from "../accounts/authorize";
import config from "../../config";
import { PresentationTypes, ErrorCodes } from "../../enum";
import { isPresentationContainer } from "../helpers/entityUtilities";
import ErrorResponse from "../helpers/errorResponse";
import { v4 } from "node-uuid";
import { isUUID } from "validator";
import { getLocked } from "../socket";

import PresentationContainer = Ropeho.Models.PresentationContainer;
import IGenericRepository = Ropeho.Models.IGenericRepository;

const router: Router = express.Router();
const presentationRepository: IGenericRepository<PresentationContainer> = new GenericRepository<PresentationContainer>({
    ...config.redis,
    ...config.database.presentations
});

router.get("/", async (req: Request, res: Response) => {
    try {
        const { query }: Request = req;
        const fields: string[] = typeof query.fields === "string" ? map<string, string>(query.fields.split(","), trim) : [];
        let found: PresentationContainer[];
        delete query.fields;
        // Fetching
        if (keys(query).length > 0) {
            found = await presentationRepository.search(query);
        } else {
            found = await presentationRepository.get() as PresentationContainer[];
        }
        // Removing unwanted fields
        if (!isEmpty(fields)) {
            found = map<PresentationContainer, PresentationContainer>(found, (c: PresentationContainer) => pickBy<PresentationContainer, PresentationContainer>(c, (value: any, key: string) => includes(fields, key)));
        }
        res.status(200).send(found);
    } catch (error) {
        new ErrorResponse({ developerMessage: error }).send(res);
    }
});

router.get("/:id", async (req: Request, res: Response) => {
    try {
        const fields: string[] = typeof req.query.fields === "string" ? map<string, string>(req.query.fields.split(","), trim) : [];
        let found: PresentationContainer = await presentationRepository.getById(req.params.id);
        // Removing unwanted fields
        if (!isEmpty(fields)) {
            found = pickBy<PresentationContainer, PresentationContainer>(found, (value: any, key: string) => includes(fields, key));
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
            let presentation: PresentationContainer = req.body;
            const { presentations, type }: PresentationContainer = presentation;
            // Check if valid
            presentation.presentations = presentations || [];
            presentation._id = v4();
            presentation.type = type || PresentationTypes.Horizontal;
            if (!isPresentationContainer(presentation)) {
                new ErrorResponse({
                    status: 400,
                    developerMessage: "Container is invalid",
                    userMessage: "Requête invalide",
                    errorCode: ErrorCodes.InvalidRequest
                }).send(res);
                return;
            }
            // Create
            presentation = await presentationRepository.create(presentation);
            res.status(200).send(presentation);
        } catch (error) {
            new ErrorResponse({ developerMessage: error }).send(res);
        }
    });

router.post("/order",
    isAdmin,
    async (req: Request, res: Response) => {
        try {
            const order: string[] = req.body;
            if (isArray(order) && every<string>(order, (o: string) => typeof o === "string" && isUUID(o))) {
                res.status(200).send(await presentationRepository.order(order));
            } else {
                new ErrorResponse({
                    status: 400,
                    developerMessage: "The new order must be an array of IDs",
                    userMessage: "Le nouvel ordre des presentations est incorrect",
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
            // Get current presentation
            let presentation: PresentationContainer = await presentationRepository.getById(req.body._id);
            presentation = {
                ...presentation,
                ...req.body
            };
            if (!presentation) {
                new ErrorResponse({
                    status: 400,
                    developerMessage: `PresentationContainer ${req.params.id} could not be found`,
                    userMessage: "La presentation est introuvable",
                    errorCode: ErrorCodes.NotFound
                }).send(res);
                return;
            }
            if (!isPresentationContainer(presentation)) {
                new ErrorResponse({
                    status: 400,
                    developerMessage: "Container is invalid",
                    userMessage: "Les modifications sont incorrectes",
                    errorCode: ErrorCodes.InvalidRequest
                }).send(res);
                return;
            }
            if (includes<string>(getLocked(), presentation._id)) {
                new ErrorResponse({
                    status: 400,
                    developerMessage: "Presentation is locked",
                    userMessage: "Un utilisateur est en train d'utiliser cette présentation.",
                    errorCode: ErrorCodes.Unavailable
                }).send(res);
                return;
            }
            await presentationRepository.update(req.body);
            res.status(200).send(req.body);
        } catch (error) {
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
                    developerMessage: "Presentation is locked",
                    userMessage: "Un utilisateur est en train d'utiliser cette présentation.",
                    errorCode: ErrorCodes.Unavailable
                }).send(res);
                return;
            }
            const nDeleted: number = await presentationRepository.delete(req.params.id);
            if (nDeleted === 0) {
                new ErrorResponse({
                    status: 400,
                    developerMessage: `Container ${req.params.id} could not be found`,
                    userMessage: "La presentation est introuvable",
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
