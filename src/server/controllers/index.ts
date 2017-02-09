/**
 * @file Combine all controllers
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../typings.d.ts" />
import { Router } from "express-serve-static-core";
import * as express from "express";
// import presentationController from './presentation';
import categoryController from "./category";
// import productionController from './production';
import authController from "./auth";
import userController from "./user";
const router: Router = express.Router();

// router.use('/presentations', presentationController);
// router.use('/productions', productionController);
router.use("/categories", categoryController);
router.use("/auth", authController);
router.use("/users", userController);

export default router;
