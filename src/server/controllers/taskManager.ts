/**
 * @file Express controller that manages kue tasks and socket connections
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../typings.d.ts" />
import * as express from "express";
import { Router, Request, Response } from "express-serve-static-core";
import { isEmpty, map, trim, values } from "lodash";
import { isAdmin } from "../accounts/authorize";
import ErrorResponse from "../helpers/errorResponse";
import { getClients, getDownloading, getUploading, kickClient } from "../socket";
import { getTasks, startTask, cancelTask } from "../media/taskQueue";

const router: Router = express.Router();

import TaskList = Ropeho.TaskList;
import SocketClient = Ropeho.Socket.SocketClient;

router.get("/",
    isAdmin,
    async (req: Request, res: Response) => {
        try {
            const fields: string[] = typeof req.query.fields === "string" ? map<string, string>(req.query.fields.split(","), trim) : [];
            if (isEmpty(fields)) {
                res.status(200).send({
                    clients: values<SocketClient>(getClients()),
                    downloading: getDownloading(),
                    uploading: getUploading(),
                    tasks: await getTasks()
                } as TaskList);
            } else {
                const responseData: TaskList = {};
                for (const f of fields) {
                    switch (f) {
                        case "clients":
                            responseData.clients = values<SocketClient>(getClients());
                            break;
                        case "downloading":
                            responseData.downloading = getDownloading();
                            break;
                        case "uploading":
                            responseData.uploading = getUploading();
                            break;
                        case "tasks":
                            responseData.tasks = await getTasks();
                            break;
                    }
                }
                res.status(200).send(responseData);
            }
        } catch (error) {
            new ErrorResponse({ developerMessage: error }).send(res);
        }
    });

router.delete("/task/:taskId",
    isAdmin,
    async (req: Request, res: Response) => {
        try {
            await cancelTask(parseInt(req.params.taskId));
            res.status(200).send({});
        } catch (error) {
            new ErrorResponse({ developerMessage: error }).send(res);
        }
    });

router.post("/task/:taskId",
    isAdmin,
    async (req: Request, res: Response) => {
        try {
            res.status(200).send(await startTask(parseInt(req.params.taskId)));
        } catch (error) {
            new ErrorResponse({ developerMessage: error }).send(res);
        }
    });

router.delete("/socket/:clientId",
    isAdmin,
    (req: Request, res: Response) => {
        try {
            kickClient(req.params.clientId);
            res.status(200).send({});
        } catch (error) {
            new ErrorResponse({ status: 400, developerMessage: error, userMessage: "Client introuvable" }).send(res);
        }
    });

export default router;
