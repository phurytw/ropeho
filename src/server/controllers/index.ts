/**
 * @file Combine all controllers
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../typings.d.ts" />
import { Router } from "express-serve-static-core";
import * as express from "express";
import presentationController from "./presentation";
import categoryController from "./category";
import productionController from "./production";
import authController from "./auth";
import userController from "./user";
import taskManagerController from "./taskManager";
import { Request, Response } from "express-serve-static-core";
import GlobalRepository from "../dal/globalRepository";
import config from "../../config";
import { Roles, MediaPermissions } from "../../enum";
import * as _ from "lodash";
import { includes } from "lodash";
import { isCategory, isProduction, isUser } from "../helpers/entityUtilities";
import ErrorResponse from "../helpers/errorResponse";
const router: Router = express.Router();

import Category = Ropeho.Models.Category;
import Production = Ropeho.Models.Production;
import User = Ropeho.Models.User;
type Entity = Category | Production | User;

const repository: Ropeho.Models.IGenericRepository<any> = new GlobalRepository({
    ...config.redis,
    idProperty: config.database.defaultIdProperty
});

router.use("/presentations", presentationController);
router.use("/productions", productionController);
router.use("/categories", categoryController);
router.use("/auth", authController);
router.use("/users", userController);
router.use("/taskmanager", taskManagerController);
router.use("/search/:searchString*?", async (req: Request, res: Response) => {
    try {
        const { query, user, params }: Request = req;
        const isAdmin: boolean = user && user.role === Roles.Administrator;
        const results: Entity[] = await repository.search({ ...query, name: params.searchString });
        const productionIds: string[] = user ? user.productionIds : [];
        if (isAdmin) {
            // No filtering if admin
            res.status(200).send(_(results)
                .filter((e: Entity) => isUser(e) || isCategory(e) || isProduction(e))
                .groupBy<string>((e: Entity) => isProduction(e) ? "productions" : (isCategory(e) ? "categories" : "users"))
                .value());
        } else {
            res.status(200).send(
                _(results)
                    // Only keep categories, and productions
                    .filter((e: Entity) => isCategory(e) || isProduction(e))
                    // Filter productions
                    .reject((p: Production) => isProduction(p) && ((p.state === MediaPermissions.OwnerOnly && !includes(productionIds, p._id)) || p.state === MediaPermissions.Locked))
                    // Remove productionIds in categories for quicker filtering
                    .map<Entity>((c: Category) => isCategory(c) ? { ...c, productionIds: undefined } : c)
                    // Format
                    .groupBy<string>((e: Entity) => isProduction(e) ? "productions" : "categories")
                    .value()
            );
        }
    } catch (error) {
        new ErrorResponse({ developerMessage: error }).send(res);
    }
});

export default router;
