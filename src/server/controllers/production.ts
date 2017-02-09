/**
 * @file Express controller that manages Ropeho productions
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../typings.d.ts" />
import { Router, Request, Response } from "express-serve-static-core";
import * as express from "express";
import GenericRepository from "../dal/genericRepository";
import { productionCollection } from "../dal/dbInstance";

import Production = Ropeho.Models.Production;
import IGenericRepository = Ropeho.IGenericRepository;

const router: Router = express.Router();
const productionRepository: IGenericRepository<Production> = new GenericRepository<Production>(productionCollection);

router.get("/", async (req: Request, res: Response) => {
    try {
        res.send();
    } catch (error) {
        res.send(500, error);
    }
});

router.get("/:id", async (req: Request, res: Response) => {
    try {
        res.send();
    } catch (error) {
        res.send(500, error);
    }
});

router.post("/", async (req: Request, res: Response) => {
    try {
        res.send(await productionRepository.create(req.body));
    } catch (error) {
        res.send(500, error);
    }
});

router.put("/:id", async (req: Request, res: Response) => {
    try {
        await productionRepository.update(req.body);
        res.send(req.body);
    } catch (error) {
        res.send(500, error);
    }
});

router.delete("/:id", async (req: Request, res: Response) => {
    try {
        await productionRepository.delete(req.params.id);
        res.send(req.body);
    } catch (error) {
        res.send(500, error);
    }
});

export default router;
