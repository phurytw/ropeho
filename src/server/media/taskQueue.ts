/**
 * @file Module that manages the task queue
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../typings.d.ts" />
import * as kue from "kue";
import { Job } from "kue";
import mediaManager from "./mediaManager";
import config from "../../config";
import { createWebp, createWebm } from "./fileEncoder";
import { indexOf, map } from "lodash";

import ProcessImageOptions = Ropeho.Tasks.ProcessImageOptions;
import ProcessVideoOptions = Ropeho.Tasks.ProcessVideoOptions;
import FileUploadOptions = Ropeho.Tasks.FileUploadOptions;
import JobData = Ropeho.Tasks.JobData;

export const queue: kue.Queue = kue.createQueue({
    redis: {
        port: config.redis.port,
        host: config.redis.host
    }
});
const { taskQueue: { retriesOnFailure, imageProcessingConcurrency, videoProcessingConcurrency, fileUploadConcurrency } }: Ropeho.Configuration.ConfigurationObject = config;

// Export the tasks for unit testing
export const processImageTask: (jobData: JobData<ProcessImageOptions>, cb: Function) => Promise<void> =
    (jobData: JobData<ProcessImageOptions>, cb: Function): Promise<void> => new Promise<void>(async (resolve: () => void, reject: (reason?: any) => void) => {
        const { data, dest }: ProcessImageOptions = jobData.data;
        await mediaManager.upload(dest, await createWebp(data) as Buffer);
        cb();
        resolve();
    });

export const processVideoTask: (jobData: JobData<ProcessVideoOptions>, cb: Function) => Promise<void> =
    (jobData: JobData<ProcessVideoOptions>, cb: Function): Promise<void> => new Promise<void>(async (resolve: () => void, reject: (reason?: any) => void) => {
        const { data, dest, fallbackDest }: ProcessVideoOptions = jobData.data;
        const [webm, thumb]: Buffer[] = await createWebm(data);
        await mediaManager.upload(dest, webm);
        await mediaManager.upload(fallbackDest, thumb);
        cb();
        resolve();
    });

export const processUploadTask: (jobData: JobData<FileUploadOptions>, cb: Function) => Promise<void> =
    (jobData: JobData<FileUploadOptions>, cb: Function): Promise<void> => new Promise<void>(async (resolve: () => void, reject: (reason?: any) => void) => {
        const { data, dest }: FileUploadOptions = jobData.data;
        await mediaManager.upload(dest, data);
        cb();
        resolve();
    });

queue.process("image", imageProcessingConcurrency, processImageTask);
queue.process("video", videoProcessingConcurrency, processVideoTask);
queue.process("upload", fileUploadConcurrency, processUploadTask);

export const createProcessImageTask: (options: ProcessImageOptions) => Job =
    (options: ProcessImageOptions): Job => {
        const task: Job = queue.create("image", options);
        task.removeOnComplete(true);
        task.attempts(retriesOnFailure);
        task.save();
        return task;
    };

export const createProcessVideoTask: (options: ProcessVideoOptions) => Job =
    (options: ProcessVideoOptions): Job => {
        const task: Job = queue.create("video", options);
        task.removeOnComplete(true);
        task.attempts(retriesOnFailure);
        task.save();
        return task;
    };

export const createFileUploadTask: (options: FileUploadOptions) => Job =
    (options: ProcessVideoOptions): Job => {
        const task: Job = queue.create("upload", options);
        task.removeOnComplete(true);
        task.attempts(retriesOnFailure);
        task.save();
        return task;
    };

export const getTasks: (filter?: string) => Promise<Job[]> =
    async (filter?: string): Promise<Job[]> => {
        let jobs: Job[] = [];
        switch (filter) {
            case "active":
            case "inactive":
            case "complete":
            case "failed":
            case "delayed":
                queue[filter]((err: any, ids: number[]) => {
                    ids.forEach((id: number) => {
                        Job.get(id, (err: any, job: Job) => {
                            jobs = [...jobs, job];
                        });
                    });
                });
                break;
            default:
                jobs = [...await getTasks("active"),
                ...await getTasks("inactive"),
                ...await getTasks("complete"),
                ...await getTasks("failed"),
                ...await getTasks("delayed")];
                break;
        }
        return jobs;
    };

export const cancelTask: (task: Job | number) => Promise<void> =
    (task: Job | number): Promise<void> =>
        new Promise<void>((resolve: () => void, reject: (reason?: any) => void) => {
            if (typeof task === "number") {
                Job.get(task, (err: any, job: Job) => {
                    job.remove();
                    resolve();
                });
            } else {
                task.remove();
                resolve();
            }
        });

export const startTask: (task: Job | number) => Promise<Job> =
    (task: Job | number): Promise<Job> =>
        new Promise<Job>((resolve: (value?: Job | PromiseLike<Job>) => void, reject: (reason?: any) => void) => {
            if (typeof task === "number") {
                getTasks("active").then((activeTasks: Job[]) => {
                    if (indexOf<number>(map<Job, number>(activeTasks, (t: Job) => t.id), task) >= 0) {
                        reject(new Error(`Task ${task} is currently active`));
                    }
                    Job.get(task, (err: any, job: Job) => {
                        if (err) {
                            throw err;
                        }
                        job.save();
                        resolve(job);
                    });
                });
            } else {
                startTask(task.id).then(() => resolve());
            }
        });
