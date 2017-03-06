/**
 * @file Express controller that manages Ropeho categories
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
import { isCategory, filterProduction } from "../helpers/entityUtilities";
import ErrorResponse from "../helpers/errorResponse";
import uriFriendlyFormat from "../helpers/uriFriendlyFormat";
import { v4 } from "uuid";
import { isUUID } from "validator";
import { getLocked } from "../socket";

import Category = Ropeho.Models.Category;
import Production = Ropeho.Models.Production;
import User = Ropeho.Models.User;
import IGenericRepository = Ropeho.Models.IGenericRepository;

const router: Router = express.Router();
const categoryRepository: IGenericRepository<Category> = new GenericRepository<Category>({
    ...config.redis,
    ...config.database.categories
});
const productionRepository: IGenericRepository<Production> = new GenericRepository<Production>({
    ...config.redis,
    ...config.database.productions
});

router.get("/", async (req: Request, res: Response) => {
    try {
        const { query, user }: Request = req;
        const fields: string[] = typeof query.fields === "string" ? map<string, string>(query.fields.split(","), trim) : [];
        const ignoreOwned: boolean = query.public === "1";
        let found: Category[];
        delete query.fields;
        // Fetching
        if (keys(query).length > 0) {
            found = await categoryRepository.search(query);
        } else {
            found = await categoryRepository.get() as Category[];
        }
        // Removing unwanted fields
        if (!isEmpty(fields)) {
            found = map<Category, Category>(found, (c: Category) => pickBy<Category, Category>(c, (value: any, key: string) => key === "productionIds" || includes(fields, key)));
        }
        // If productionIds or productions is not filtered out we get associated productions
        if (isEmpty(fields) || includes<string>(fields, "productionIds") || includes<string>(fields, "productions")) {
            // Only keep productions that the user can access
            let owned: string[] | boolean = [];
            if (user) {
                owned = ignoreOwned ? [] : ((user as User).role === Roles.Administrator ? true : user.productionIds);
            }
            for (const category of found) {
                category.productions = _(await productionRepository.getById(category.productionIds) as Production[])
                    .map<Production>((p: Production) => filterProduction(p, owned))
                    .reject((p: Production) => p === undefined)
                    .value();
                category.productionIds = map<Production, string>(category.productions, (p: Production) => p._id);

                // Remove productions if not requested
                if (!isEmpty(fields) && !includes<string>(fields, "productions")) {
                    delete category.productions;
                }
                // Remove productionIds if not requested
                if (!isEmpty(fields) && !includes<string>(fields, "productionIds")) {
                    delete category.productionIds;
                }
            }
        }
        res.status(200).send(found);
    } catch (error) {
        new ErrorResponse({ developerMessage: error }).send(res);
    }
});

router.get("/:id", async (req: Request, res: Response) => {
    try {
        const { query, user }: Request = req;
        const fields: string[] = typeof query.fields === "string" ? map<string, string>(query.fields.split(","), trim) : [];
        const ignoreOwned: boolean = query.public === "1";
        let found: Category = await categoryRepository.getById(req.params.id);
        // Removing unwanted fields
        if (!isEmpty(fields)) {
            found = pickBy<Category, Category>(found, (value: any, key: string) => key === "productionIds" || includes(fields, key));
        }
        if (!found) {
            new ErrorResponse({
                status: 400,
                developerMessage: `Unable to find category with ID ${req.params.id}`,
                userMessage: "La catégorie n'a pas pu être trouvée",
                errorCode: ErrorCodes.NotFound
            }).send(res);
            return;
        }
        // If productionIds or productions is not filtered out we get associated productions
        if (isEmpty(fields) || includes<string>(fields, "productionIds") || includes<string>(fields, "productions")) {
            // Only keep productions that the user can access
            let owned: string[] | boolean = [];
            if (user) {
                owned = ignoreOwned ? [] : ((user as User).role === Roles.Administrator ? true : user.productionIds);
            }
            found.productions = _(await productionRepository.getById(found.productionIds) as Production[])
                .map<Production>((p: Production) => filterProduction(p, owned))
                .reject((p: Production) => p === undefined)
                .value();
            found.productionIds = map<Production, string>(found.productions, (p: Production) => p._id);

            // Remove productions if not requested
            // console.log(category.productions);
            if (!isEmpty(fields) && !includes<string>(fields, "productions")) {
                delete found.productions;
            }
            // Remove productionIds if not requested
            if (!isEmpty(fields) && !includes<string>(fields, "productionIds")) {
                delete found.productionIds;
            }
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
            let category: Category = req.body;
            const { name, productionIds, banner }: Category = category;
            // Check if valid
            category.productionIds = productionIds || [];
            category._id = v4();
            category.banner = banner || {
                _id: v4(),
                delay: 0,
                description: "",
                sources: [],
                state: MediaPermissions.Public,
                type: MediaTypes.Image
            };
            if (!isCategory(category) || !category.name) {
                new ErrorResponse({
                    status: 400,
                    developerMessage: "Category name is empty or not a string",
                    userMessage: "Nom invalide",
                    errorCode: ErrorCodes.InvalidRequest
                }).send(res);
                return;
            }
            // Create
            category = await categoryRepository.create(category);
            res.status(200).send(category);
        } catch (error) {
            // Check if name is used
            const [category]: Category[] = await categoryRepository.search({ name: req.body.name });
            if (category) {
                new ErrorResponse({
                    status: 400,
                    developerMessage: `There is already a category with the name ${category.name} (${uriFriendlyFormat(category.name)})`,
                    userMessage: `Une catégorie avec le nom ${category.name} (${uriFriendlyFormat(category.name)}) existe déjà`,
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
                res.status(200).send(await categoryRepository.order(order));
            } else {
                new ErrorResponse({
                    status: 400,
                    developerMessage: "The new order must be an array of IDs",
                    userMessage: "Le nouvel ordre des catégories est incorrect",
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
            // Get current category
            let category: Category = await categoryRepository.getById(req.body._id);
            category = {
                ...category,
                ...req.body
            };
            if (!category) {
                new ErrorResponse({
                    status: 400,
                    developerMessage: `Category ${req.params.id} could not be found`,
                    userMessage: "La catégorie est introuvable",
                    errorCode: ErrorCodes.NotFound
                }).send(res);
                return;
            }
            if (!isCategory(category)) {
                new ErrorResponse({
                    status: 400,
                    developerMessage: "Category is invalid",
                    userMessage: "Les modifications sont incorrectes",
                    errorCode: ErrorCodes.InvalidRequest
                }).send(res);
                return;
            }
            if (includes<string>(getLocked(), category._id)) {
                new ErrorResponse({
                    status: 400,
                    developerMessage: "Category is locked",
                    userMessage: "Un utilisateur est en train d'utiliser cette categorie.",
                    errorCode: ErrorCodes.Unavailable
                }).send(res);
                return;
            }
            await categoryRepository.update(req.body);
            res.status(200).send(req.body);
        } catch (error) {
            // Check if name is used
            const [category]: Category[] = await categoryRepository.search(req.body.name);
            if (category) {
                new ErrorResponse({
                    status: 400,
                    developerMessage: `There is already a category with the name ${category.name} (${uriFriendlyFormat(category.name)})`,
                    userMessage: `Une catégorie avec le nom ${category.name} (${uriFriendlyFormat(category.name)}) existe déjà`,
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
                    developerMessage: "Category is locked",
                    userMessage: "Un utilisateur est en train d'utiliser cette categorie.",
                    errorCode: ErrorCodes.Unavailable
                }).send(res);
                return;
            }
            const nDeleted: number = await categoryRepository.delete(req.params.id);
            if (nDeleted === 0) {
                new ErrorResponse({
                    status: 400,
                    developerMessage: `Category ${req.params.id} could not be found`,
                    userMessage: "La catégorie est introuvable",
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
