/**
 * @file Express controller that manages Ropeho presentations
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../typings.d.ts" />
import { Router, Request, Response } from "express-serve-static-core";
import * as express from "express";
import GenericRepository from "../dal/genericRepository";
import { presentationCollection } from "../dal/dbInstance";

import PresentationContainer = Ropeho.Models.PresentationContainer;

const router: Router = express.Router();
const presentationRepository: GenericRepository<PresentationContainer> = new GenericRepository<PresentationContainer>(presentationCollection);

router.get("/", async (req: Request, res: Response) => {
    try {
        res.send(await presentationRepository.get());
    } catch (error) {
        res.send(500, error);
    }
});

router.get("/:id", async (req: Request, res: Response) => {
    try {
        res.send(await presentationRepository.getById(req.params.id));
    } catch (error) {
        res.send(500, error);
    }
});

router.post("/", async (req: Request, res: Response) => {
    try {
        res.send(await presentationRepository.create(req.body));
    } catch (error) {
        res.send(500, error);
    }
});

router.put("/:id", async (req: Request, res: Response) => {
    try {
        await presentationRepository.update(req.body);
        res.send(req.body);
    } catch (error) {
        res.send(500, error);
    }
});

router.delete("/:id", async (req: Request, res: Response) => {
    try {
        await presentationRepository.delete(req.body);
        res.send(req.body);
    } catch (error) {
        res.send(500, error);
    }
});

export default router;
