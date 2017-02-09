/**
 * @file Express controller that manages Ropeho categories
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../typings.d.ts" />
import { Router, Request, Response } from "express-serve-static-core";
import * as express from "express";
import GenericRepository from "../dal/genericRepository";
import { categoryCollection } from "../dal/dbInstance";
import { isEmpty, isString } from "lodash";
import { isAdmin } from "../accounts/authorize";
import { uriFriendlyFormat } from "../helpers/uriFriendlyFormat";

import Category = Ropeho.Models.Category;
import IGenericRepository = Ropeho.IGenericRepository;

const router: Router = express.Router();
const categoryRepository: IGenericRepository<Category> = new GenericRepository<Category>(categoryCollection);

router.get("/", async (req: Request, res: Response) => {
    try {
        res.status(200).send(await categoryRepository.get(req.query.fields, req.query.projection));
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.get("/:id", async (req: Request, res: Response) => {
    try {
        res.status(200).send(await categoryRepository.getById(req.params.id, req.query.projection));
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
            } else {
                category.normalizedName = uriFriendlyFormat(name);
            }
            // Set IDs for medias and sources
            res.status(200).send(await categoryRepository.create(category));
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

router.delete("/:id", isAdmin, async (req: Request, res: Response) => {
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
