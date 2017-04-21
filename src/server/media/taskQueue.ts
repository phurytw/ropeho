/**
 * @file Module that manages the task queue
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../typings.d.ts" />
import * as kue from "kue";
import { Job } from "kue";
import mediaManager from "./mediaManager";
import tempMediaManager from "./tempMediaManager";
import config from "../../config";
import { createJpeg, createWebm, createScreenshot } from "./fileEncoder";
import { indexOf, map, includes } from "lodash";
import { join, dirname, basename, extname } from "path";
import * as mkdirp from "mkdirp";

import ProcessImageOptions = Ropeho.Tasks.ProcessImageOptions;
import ProcessVideoOptions = Ropeho.Tasks.ProcessVideoOptions;
import FileUploadOptions = Ropeho.Tasks.FileUploadOptions;
import JobData = Ropeho.Tasks.JobData;

export const queue: kue.Queue = kue.createQueue({
    redis: {
        port: config.redis.port,
        host: config.redis.host,
        db: parseInt(config.redis.db),
        auth: config.redis.password
    }
});
queue.watchStuckJobs(10000);
const { taskQueue: { retriesOnFailure, imageProcessingConcurrency, videoProcessingConcurrency, fileUploadConcurrency } }: Ropeho.Configuration.ConfigurationObject = config;

// Export the tasks for unit testing
export const processImageTask: (jobData: JobData<ProcessImageOptions>, cb: Function) => Promise<void> =
    (jobData: JobData<ProcessImageOptions>, cb: Function): Promise<void> => new Promise<void>(async (resolve: () => void, reject: (reason?: any) => void) => {
        const { source, dest }: ProcessImageOptions = jobData.data;
        try {
            if (await tempMediaManager.exists(source)) {
                // create a temp webp
                const tempSource: string = join(tempMediaManager.baseDirectory, source);
                const tempWebP: string = join(tempMediaManager.baseDirectory, dest);
                mkdirp.sync(dirname(tempWebP));
                await createJpeg(tempSource, tempWebP);
                // upload the webp to the destination
                const destStream: NodeJS.WritableStream = mediaManager.startUpload(dest);
                const tempStream: NodeJS.ReadableStream = tempMediaManager.startDownload(dest);
                tempStream.on("error", (error: NodeJS.ErrnoException) => reject(error))
                    .on("end", async () => {
                        tempMediaManager.delete(dest);
                        // delete the temp webp
                        const isStillInUse: boolean = await isSourceUsed(source, [jobData.id]);
                        if (!isStillInUse) {
                            tempMediaManager.delete(source);
                        }
                        cb();
                        resolve();
                    })
                    .pipe(destStream);
            } else {
                reject(new Error("Source does not exist"));
            }
        } catch (error) {
            Job.get(jobData.id, async (err: any, job: Job) => {
                job.failed();
            });
        }
    });

export const processVideoTask: (jobData: JobData<ProcessVideoOptions>, cb: Function) => Promise<void> =
    (jobData: JobData<ProcessVideoOptions>, cb: Function): Promise<void> => new Promise<void>(async (resolve: () => void, reject: (reason?: any) => void) => {
        const { source, dest, fallbackDest, duration, offset }: ProcessVideoOptions = jobData.data;
        // ffmpeg adds a png extension automatically
        const screenshot: string = `${basename(fallbackDest, extname(fallbackDest))}.png`;
        try {
            if (await tempMediaManager.exists(source)) {
                // real paths
                const tempSource: string = join(tempMediaManager.baseDirectory, source);
                const tempDest: string = join(tempMediaManager.baseDirectory, dest);
                const tempFallback: string = join(tempMediaManager.baseDirectory, fallbackDest);
                // ffmpeg adds a png extension automatically
                const tempScreenshot: string = join(tempMediaManager.baseDirectory, screenshot);

                // get the job to notify progress
                Job.get(jobData.id, async (err: any, job: Job) => {
                    if (err) {
                        reject(err);
                    }
                    let oneDone: boolean = false;
                    const resolveWhenDone: Function = async () => {
                        if (oneDone) {
                            tempMediaManager.delete(dest);
                            tempMediaManager.delete(fallbackDest);
                            tempMediaManager.delete(screenshot);
                            const isStillInUse: boolean = await isSourceUsed(source, [jobData.id]);
                            if (!isStillInUse) {
                                tempMediaManager.delete(source);
                            }
                            cb();
                            resolve();
                        } else {
                            oneDone = true;
                        }
                    };
                    // create a temp webm
                    mkdirp.sync(dirname(tempDest));
                    await createWebm(tempSource, {
                        dest: tempDest,
                        duration,
                        offset,
                        setProgress: (percent: number) => job.progress(percent, 100)
                    });
                    // upload the temp webm to the destination
                    const destStream: NodeJS.WritableStream = mediaManager.startUpload(dest);
                    const webMStream: NodeJS.ReadableStream = tempMediaManager.startDownload(dest);
                    webMStream.on("error", (error: NodeJS.ErrnoException) => reject(error))
                        .on("end", resolveWhenDone)
                        .pipe(destStream);
                    // create a temp screenshot
                    mkdirp.sync(dirname(tempFallback));
                    await createScreenshot(tempSource, tempScreenshot);
                    await createJpeg(tempScreenshot, tempFallback);
                    const fallbackDestStream: NodeJS.WritableStream = mediaManager.startUpload(fallbackDest);
                    const ssStream: NodeJS.ReadableStream = tempMediaManager.startDownload(fallbackDest);
                    ssStream.on("error", (error: NodeJS.ErrnoException) => reject(error))
                        .on("end", resolveWhenDone)
                        .pipe(fallbackDestStream);
                });
            } else {
                reject(new Error("Source does not exist"));
            }
        } catch (error) {
            Job.get(jobData.id, async (err: any, job: Job) => {
                job.failed();
            });
        }
    });

export const processUploadTask: (jobData: JobData<FileUploadOptions>, cb: Function) => Promise<void> =
    (jobData: JobData<FileUploadOptions>, cb: Function): Promise<void> => new Promise<void>(async (resolve: () => void, reject: (reason?: any) => void) => {
        const { source, dest }: FileUploadOptions = jobData.data;
        try {
            if (await tempMediaManager.exists(source)) {
                const destStream: NodeJS.WritableStream = mediaManager.startUpload(dest);
                const sourceStream: NodeJS.ReadableStream = tempMediaManager.startDownload(source);
                sourceStream.on("error", (error: NodeJS.ErrnoException) => reject(error))
                    .on("end", async () => {
                        const isStillInUse: boolean = await isSourceUsed(source, [jobData.id]);
                        if (!isStillInUse) {
                            tempMediaManager.delete(source);
                        }
                        cb();
                        resolve();
                    })
                    .pipe(destStream);
            } else {
                reject(new Error("Source does not exist"));
            }
        } catch (error) {
            Job.get(jobData.id, async (err: any, job: Job) => {
                job.failed();
            });
        }
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
    async (filter?: string): Promise<Job[]> => new Promise<Job[]>(async (resolve: (value?: Job[] | PromiseLike<Job[]>) => void, reject: (reason?: any) => void) => {
        let jobs: Job[] = [];
        switch (filter) {
            case "active":
            case "inactive":
            case "complete":
            case "failed":
            case "delayed":
                queue[filter]((err: any, ids: number[]) => {
                    if (err) {
                        reject(err);
                    }
                    let promises: Promise<Job>[] = [];
                    ids.forEach((id: number) => {
                        promises = [...promises, new Promise<Job>((resolve: (value?: Job | PromiseLike<Job>) => void, reject: (reason?: any) => void) => {
                            Job.get(id, (err: any, job: Job) => {
                                if (err) {
                                    reject(err);
                                }
                                resolve(job);
                            });
                        })];
                    });
                    Promise.all<Job>(promises).then((jobs: Job[]) => resolve(jobs), (err: any) => reject(err));
                });
                break;
            default:
                jobs = [...await getTasks("active"),
                ...await getTasks("inactive"),
                ...await getTasks("complete"),
                ...await getTasks("failed"),
                ...await getTasks("delayed")];
                resolve(jobs);
                break;
        }
    });

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

export const isSourceUsed: (source: string, ignoredJobIds?: number[]) => Promise<boolean> =
    async (source: string, ignoredJobIds: number[] = []): Promise<boolean> => {
        const tasks: kue.Job[] = [...await getTasks("active"),
        ...await getTasks("inactive"),
        ...await getTasks("failed"),
        ...await getTasks("delayed")];
        for (const task of tasks) {
            if (task.data.source === source && !includes<number>(ignoredJobIds, task.id)) {
                return true;
            }
        }
        return false;
    };
