/**
 * @file Express controller that manages Ropeho categories
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../typings.d.ts" />
import { Router, Request, Response } from "express-serve-static-core";
import * as express from "express";
import GenericRepository from "../dal/genericRepository";
import { isEmpty, isString, keys, map, isArray, includes, pickBy, every } from "lodash";
import { isAdmin } from "../accounts/authorize";
import config from "../../config";

import Category = Ropeho.Models.Category;
import IGenericRepository = Ropeho.IGenericRepository;

const router: Router = express.Router();
const categoryRepository: IGenericRepository<Category> = new GenericRepository<Category>({
    ...config.redis,
    ...config.database.categories
});

router.get("/", async (req: Request, res: Response) => {
    try {
        const { query }: Request = req;
        const fields: string[] = isString(query.fields) ? map<string, string>(query.fields.split(","), (f: string) => f.trim()) : [];
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
            found = map<Category, Category>(found, (c: Category) => pickBy<Category, Category>(c, (value: any, key: string) => includes(fields, key)));
        }
        res.status(200).send(found);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.get("/:id", async (req: Request, res: Response) => {
    try {
        const fields: string[] = isString(req.query.fields) ? map<string, string>(req.query.fields.split(","), (f: string) => f.trim()) : [];
        let found: Category = await categoryRepository.getById(req.params.id);
        // Removing unwanted fields
        if (!isEmpty(fields)) {
            found = pickBy<Category, Category>(found, (value: any, key: string) => includes(fields, key));
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
            const category: Category = req.body,
                { name }: Category = category;
            // Check if valid
            if (!name || !isString(name) || isEmpty(name)) {
                res.status(401).send("Category name is empty or not a string");
                return;
            }
            // Check if normalized name is used
            const [normalized]: Category[] = await categoryRepository.search({ name });
            if (normalized) {
                res.status(401).send(`There is already a category with the name ${name} (${normalized})`);
                return;
            }
            // Set IDs for medias and sources
            res.status(200).send(await categoryRepository.create(category));
        } catch (error) {
            res.status(500).send(error.message);
        }
    });

router.post("/order",
    isAdmin,
    async (req: Request, res: Response) => {
        try {
            const order: string[] = req.body;
            if (isArray(order) && every<string>(order, (o: string) => isString(o))) {
                res.status(200).send(await categoryRepository.order(order));
            } else {
                res.status(401).send("The new order must be an array of IDs");
            }
        } catch (error) {
            res.status(500).send(error.message);
        }
    });

router.put("/:id",
    isAdmin,
    async (req: Request, res: Response) => {
        try {
            // Get current category
            const nUpdated: number = await categoryRepository.update(req.body);
            if (nUpdated === 0) {
                res.status(404).send(`Category ${req.params.id} could not be found`);
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
            const nDeleted: number = await categoryRepository.delete(req.params.id);
            if (nDeleted === 0) {
                res.status(404).send(`Category ${req.params.id} could not be found`);
            } else {
                res.status(200).send();
            }
        } catch (error) {
            res.status(500).send(error.message);
        }
    });

export default router;
