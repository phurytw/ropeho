/**
 * @file Unit tests for the socket.io app
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../test.d.ts" />
import * as socketIo from "socket.io";
import * as socketIoClient from "socket.io-client";
import { spy, sandbox as sinonSandbox } from "sinon";
import { should, use } from "chai";
import * as sinonChai from "sinon-chai";
import GenericRepository from "./dal/genericRepository";
import GlobalRepository from "./dal/globalRepository";
import mediaManager from "./media/mediaManager";
import { filter, isArray, includes, range, head, last, keys, cloneDeep } from "lodash";
import * as _ from "lodash";
import { attach, getClients, getLocked, kickClient, getUploading, getDownloading, assignCookieToClient } from "./socket";
import { v4 } from "uuid";
import { Roles, EntityType, MediaTypes, SocketEvents } from "../../src/enum";
import config from "../../src/config";
import { productions, categories as cats, presentations } from "../sampleData/testDb";
import * as authorize from "./accounts/authorize";
import { basename } from "path";
import * as task from "./media/taskQueue";
import { createHash } from "crypto";
import { getAllSourceTargetOptionsFromEntity } from "../common/helpers/entityUtilities";
import { uriFriendlyFormat } from "../common/helpers/uriFriendlyFormat";
import { bufferToStream } from "./media/buffer";
should();
use(sinonChai);

import RS = Ropeho.Socket;
import Production = Ropeho.Models.Production;
import PresentationContainer = Ropeho.Models.PresentationContainer;
import Presentation = Ropeho.Models.Presentation;
import Category = Ropeho.Models.Category;
import Media = Ropeho.Models.Media;
import Source = Ropeho.Models.Source;
import User = Ropeho.Models.User;

type Entity = Production | Category | PresentationContainer;

describe("Socket IO Server", () => {
    const testPort: number = 5000,
        chunkSize: number = config.media.chunkSize,
        socketIoUrl: string = `http://localhost:${testPort}`,
        socketIoOptions: SocketIOClient.ConnectOpts = {
            transports: ["websocket"],
            forceNew: true,
            reconnection: false
        },
        categories: Category[] = [...cats, cloneDeep<Category>({
            ...head<Category>(cats),
            _id: v4()
        })],
        [productionA, productionB, productionC]: Production[] = productions,
        users: User[] = [{
            _id: v4(),
            email: "admin@test.com",
            role: Roles.Administrator
        }, {
            _id: v4(),
            email: "client@test.com",
            role: Roles.User,
            productionIds: [productionB._id, productionC._id]
        }, {
            _id: v4(),
            email: "user@test.com",
            role: Roles.User
        }],
        [admin, client, user]: User[] = users;
    let serverIo: SocketIO.Server,
        clientIo: SocketIOClient.Socket,
        throttleTime: number,
        expectedBuffer: Buffer,
        expectedHash: string,
        sandbox: sinon.SinonSandbox,
        entityType: number,
        authenticatedUser: User;
    before(() => {
        sandbox = sinonSandbox.create();
        serverIo = socketIo.listen(testPort);
        attach(serverIo);
    });
    beforeEach(() => {
        // stubs
        sandbox.stub(GlobalRepository.prototype, "getById")
            .callsFake((ids: string | string[]) => {
                let collection: Entity[];
                let results: Entity[] = [];
                const { database }: Ropeho.Configuration.ConfigurationObject = config;
                const _ids: string[] = isArray<string>(ids) ? ids : [ids];
                for (const id of _ids) {
                    let [ns, _id]: string[] = id.split(":");
                    ns = `${ns}:`;
                    switch (ns) {
                        case database.productions.namespace:
                            collection = productions;
                            break;
                        case database.categories.namespace:
                            collection = categories;
                            break;
                        case database.presentations.namespace:
                            collection = presentations;
                            break;
                        case database.users.namespace:
                            collection = users;
                            break;
                        default:
                            collection = [...productions, ...categories, ...presentations, ...users];
                            _id = id;
                            break;
                    }
                    results = [...results, _(collection).filter((e: Entity) => e._id === _id).head()];
                }
                return Promise.resolve<Entity | Entity[]>(cloneDeep<Entity>(isArray<string>(ids) ? results : head(results)));
            });
        sandbox.stub(GenericRepository.prototype, "getById")
            .callsFake((id: string | string[]) => {
                if (isArray<string>(id)) {
                    return Promise.resolve<User[]>(_(users).filter((u: User) => includes<string>(id, u._id)).cloneDeep());
                } else {
                    return Promise.resolve<User>(_(users).filter((u: User) => u._id === id).thru(cloneDeep).head());
                }
            });
        sandbox.stub(authorize, "deserializeCookie")
            .callsFake(() => {
                const id: string = authenticatedUser._id;
                return Promise.resolve<string>(id);
            });
        sandbox.stub(mediaManager, "startDownload")
            .callsFake((file: string): NodeJS.ReadableStream => {
                if (_(productions).map<string[]>((p: Production) =>
                    _([p.banner, p.background, ...p.medias]).map<Source>((m: Media) => m.sources).flatten<Source>().map<string>((s: Source) => s.src).value())
                    .flatten().includes(file)) {
                    return bufferToStream(expectedBuffer);
                } else {
                    throw new Error("File not found");
                }
            });
        sandbox.stub(mediaManager, "startUpload")
            .callsFake((media: string): NodeJS.WritableStream => ({
                writable: true,
                write: (data: Buffer | string, cb?: Function) => true,
                end: () => true
            } as any));
        sandbox.stub(mediaManager, "filesize")
            .callsFake((media: string): Promise<number> =>
                new Promise<number>((resolve: (value?: number | PromiseLike<number>) => void) => {
                    setTimeout(() => {
                        resolve(expectedBuffer.byteLength);
                    }, throttleTime);
                }));
        sandbox.stub(mediaManager, "newName")
            .callsFake((param: string) => Promise.resolve<string>(param));
        sandbox.stub(GlobalRepository.prototype, "update");
        sandbox.stub(task, "createFileUploadTask");
        sandbox.stub(task, "createProcessImageTask");
        sandbox.stub(task, "createProcessVideoTask");

        // reset setup
        clientIo = socketIoClient.connect(socketIoUrl, socketIoOptions);
        clientIo.on("connect", () => {
            assignCookieToClient(clientIo.id, "cookie");
        });
        authenticatedUser = admin;
        entityType = EntityType.Production;
        expectedBuffer = new Buffer(10);
        expectedHash = createHash("md5").update(expectedBuffer).digest("hex");
        throttleTime = 100;
    });
    afterEach(() => {
        sandbox.restore();
        clientIo.disconnect();
    });
    after(() => serverIo.close());
    describe("Media management", () => {
        describe("Downloading", () => {
            it("Should reject if the request is not valid", (done: MochaDone) => {
                const queue: RS.DownloadOptions[] = [
                    // Cannot be empty
                    {
                    } as RS.DownloadOptions,
                    // Must be an object
                    {
                        targets: (0 as any)
                    } as RS.DownloadOptions,
                    // Must be an object
                    {
                        targets: ("stuff" as any)
                    } as RS.DownloadOptions,
                    // Must be an object with 3 IDs
                    {
                        targets: [{
                            mainId: v4(),
                            mediaId: v4(),
                        }]
                    } as RS.DownloadOptions,
                    // Must be an object with valid UUIDs
                    {
                        targets: [{
                            mainId: "id",
                            mediaId: "id",
                            sourceId: "id"
                        }]
                    } as RS.DownloadOptions
                ];
                clientIo.on(SocketEvents.BadRequest, () => {
                    const next: RS.DownloadOptions = queue.pop();
                    if (next) {
                        clientIo.emit(SocketEvents.DownloadInit, next);
                    } else {
                        done();
                    }
                });
                clientIo.on("connect", () => clientIo.emit(SocketEvents.DownloadInit, queue.pop()));
            });
            it("Should reject if the user is not logged in", (done: MochaDone) => {
                authenticatedUser = { _id: undefined };
                clientIo.on(SocketEvents.BadRequest, () => {
                    mediaManager.startDownload.should.have.not.been.called;
                    done();
                });
                clientIo.on("connect", () => clientIo.emit(SocketEvents.DownloadInit, {
                } as RS.DownloadOptions));
            });
            it("Should download a file from the server", (done: MochaDone) => {
                let actualBuffer: Buffer = new Buffer(0);
                let downloadData: RS.DownloadData;
                const [media]: Media[] = productionA.medias,
                    [src]: Source[] = media.sources;
                clientIo.on(SocketEvents.DownloadEnd, (hashes: RS.DownloadHashes) => {
                    mediaManager.startDownload.should.have.been.calledOnce.and.calledWith(src.src);
                    actualBuffer.should.deep.equal(expectedBuffer);
                    downloadData.should.be.ok;
                    downloadData.should.have.property("file", src.src);
                    hashes.should.have.property(src.src, expectedHash);
                    downloadData.should.have.have.property("fileSize", expectedBuffer.length);
                    done();
                });
                clientIo.on(SocketEvents.Download, (data: Buffer) => {
                    actualBuffer = Buffer.concat([actualBuffer, data]);
                });
                clientIo.on(SocketEvents.DownloadInit, (data: RS.DownloadData) => downloadData = data);
                clientIo.on("connect", () => clientIo.emit(SocketEvents.DownloadInit, {
                    targets: filter<RS.SourceTargetOptions>(getAllSourceTargetOptionsFromEntity(productionA), (sto: RS.SourceTargetOptions) => sto.mediaId === media._id)
                } as RS.DownloadOptions));
            });
            it("Should download files owned by the user", (done: MochaDone) => {
                authenticatedUser = client;
                const downloaded: { [key: string]: RS.DownloadData & { data?: Buffer } } = {};
                let currentFile: string;
                const paths: string[] = _([productionB.banner, productionB.background, ...productionB.medias])
                    .map<Source>((m: Media) => m.sources)
                    .flatten<Source>()
                    .filter((s: Source) => s.src.length !== 0)
                    .map((s: Source) => s.src)
                    .value();
                clientIo.on(SocketEvents.DownloadEnd, (hashes: RS.DownloadHashes) => {
                    mediaManager.startDownload.should.have.callCount(paths.length);
                    for (const path of paths) {
                        mediaManager.startDownload.should.have.been.calledWith(path);
                        downloaded.should.have.property(basename(path)).with.property("data").deep.equal(expectedBuffer);
                        downloaded.should.have.property(basename(path)).with.property("file", path);
                        hashes.should.have.property(basename(path), expectedHash);
                        downloaded.should.have.property(basename(path)).with.property("fileSize", expectedBuffer.length);
                    }
                    done();
                });
                clientIo.on(SocketEvents.Download, (data: Buffer) =>
                    downloaded[currentFile].data = Buffer.concat([downloaded[currentFile].data, data]));
                clientIo.on(SocketEvents.DownloadInit, (data: RS.DownloadData) => {
                    currentFile = data.file;
                    downloaded[currentFile] = {
                        ...data,
                        data: new Buffer(0)
                    };
                });
                clientIo.on("connect", () => clientIo.emit(SocketEvents.DownloadInit, {
                    targets: getAllSourceTargetOptionsFromEntity(productionB)
                } as RS.DownloadOptions));
            });
            it("Should reject if files are not owned by the user", (done: MochaDone) => {
                authenticatedUser = user;
                clientIo.on(SocketEvents.BadRequest, () => {
                    mediaManager.startDownload.should.have.not.been.called;
                    done();
                });
                clientIo.on("connect", () => clientIo.emit(SocketEvents.DownloadInit, {
                    targets: getAllSourceTargetOptionsFromEntity(productionA)
                } as RS.DownloadOptions));
            });
            it("Should reject if the client is already doing something", (done: MochaDone) => {
                throttleTime = 1000;
                const [media]: Media[] = productionA.medias;
                clientIo.on(SocketEvents.BadRequest, (message: string) => {
                    mediaManager.filesize.should.have.been.calledOnce;
                    clientIo.disconnect();
                    done();
                });
                clientIo.on("connect", () => {
                    const options: RS.DownloadOptions = {
                        targets: filter<RS.SourceTargetOptions>(getAllSourceTargetOptionsFromEntity(productionA), (sto: RS.SourceTargetOptions) => sto.mediaId === media._id)
                    };
                    clientIo.emit(SocketEvents.DownloadInit, options);
                    clientIo.emit(SocketEvents.DownloadInit, options);
                });
            });
            it("Should reject download if any entity is not found", (done: MochaDone) => {
                clientIo.on(SocketEvents.BadRequest, () => {
                    mediaManager.startDownload.should.have.not.been.called;
                    done();
                });
                clientIo.on("connect", () => clientIo.emit(SocketEvents.DownloadInit, {
                    targets: _(range(0, 2)).map<RS.SourceTargetOptions>(() => ({ mainId: productionA._id, mediaId: v4(), sourceId: v4() })).value()
                } as RS.DownloadOptions));
            });
        });
        describe("Uploading", () => {
            const [category]: Category[] = categories,
                [container]: PresentationContainer[] = presentations;
            it("Should reject if the request is not valid", (done: MochaDone) => {
                const queue: RS.UploadOptions[] = [
                    // Cannot be empty
                    {
                    } as RS.UploadOptions,
                    // Must be an object
                    {
                        target: (0 as any)
                    } as RS.UploadOptions,
                    // Must be an object
                    {
                        target: ("stuff" as any)
                    } as RS.UploadOptions,
                    // Must be an object with an ID
                    {
                        target: ([""] as any)
                    } as RS.UploadOptions
                ];
                clientIo.on(SocketEvents.BadRequest, () => {
                    const next: RS.UploadOptions = queue.pop();
                    if (!next) {
                        done();
                    } else {
                        clientIo.emit(SocketEvents.UploadInit, next);
                    }
                });
                clientIo.on("connect", () => clientIo.emit(SocketEvents.UploadInit, queue.pop()));
            });
            it("Should reject if the user is not logged in", (done: MochaDone) => {
                authenticatedUser = { _id: undefined };
                clientIo.on(SocketEvents.BadRequest, () => {
                    mediaManager.startUpload.should.have.not.been.called;
                    done();
                });
                clientIo.on("connect", () => {
                    clientIo.emit(SocketEvents.UploadInit, {
                    } as RS.DownloadOptions);
                });
            });
            it("Should reject if the user is not an administrator", (done: MochaDone) => {
                authenticatedUser = client;
                const media: Media = category.banner,
                    [src]: Source[] = media.sources;
                clientIo.on(SocketEvents.BadRequest, () => {
                    mediaManager.startUpload.should.have.not.been.called;
                    done();
                });
                clientIo.on("connect", () =>
                    clientIo.emit(SocketEvents.UploadInit, {
                        target: _(getAllSourceTargetOptionsFromEntity(category)).filter((sto: RS.SourceTargetOptions) => sto.sourceId === src._id).head()
                    } as RS.UploadOptions));
            });
            it("Should upload a file to the server for a production", (done: MochaDone) => {
                const media: Media = productionA.medias[2],
                    src: Source = media.sources[1];
                clientIo.on(SocketEvents.UploadEnd, () => {
                    if (media.type === MediaTypes.Video) {
                        task.createProcessVideoTask.should.have.been.calledOnce;
                    } else {
                        task.createProcessImageTask.should.have.been.calledOnce;
                    }
                    task.createFileUploadTask.should.have.been.calledOnce;
                    GlobalRepository.prototype.update.should.have.been.calledOnce;
                    done();
                });
                clientIo.on(SocketEvents.UploadInit, () => {
                    for (let i: number = 0; i < expectedBuffer.length; i += chunkSize) {
                        clientIo.emit(SocketEvents.Upload, expectedBuffer.slice(i, i + chunkSize));
                    }
                    clientIo.emit(SocketEvents.UploadEnd, expectedHash);
                });
                clientIo.on("connect", () =>
                    clientIo.emit(SocketEvents.UploadInit, {
                        target: _(getAllSourceTargetOptionsFromEntity(productionA)).filter((sto: RS.SourceTargetOptions) => sto.sourceId === src._id).head()
                    } as RS.UploadOptions));
            });
            it("Should upload a file to the server for a category", (done: MochaDone) => {
                entityType = EntityType.Category;
                const media: Media = category.banner,
                    [src]: Source[] = media.sources;
                clientIo.on(SocketEvents.UploadEnd, () => {
                    if (media.type === MediaTypes.Video) {
                        task.createProcessVideoTask.should.have.been.calledOnce;
                    } else {
                        task.createProcessImageTask.should.have.been.calledOnce;
                    }
                    task.createFileUploadTask.should.have.been.calledOnce;
                    GlobalRepository.prototype.update.should.have.been.calledOnce;
                    done();
                });
                clientIo.on(SocketEvents.UploadInit, () => {
                    for (let i: number = 0; i < expectedBuffer.length; i += chunkSize) {
                        clientIo.emit(SocketEvents.Upload, expectedBuffer.slice(i, i + chunkSize));
                    }
                    clientIo.emit(SocketEvents.UploadEnd, expectedHash);
                });
                clientIo.on("connect", () =>
                    clientIo.emit(SocketEvents.UploadInit, {
                        target: _(getAllSourceTargetOptionsFromEntity(category)).filter((sto: RS.SourceTargetOptions) => sto.sourceId === src._id).head()
                    } as RS.UploadOptions));
            });
            it("Should upload a file to the server for a presentation", (done: MochaDone) => {
                entityType = EntityType.Presentation;
                const [presentation]: Presentation[] = container.presentations,
                    media: Media = presentation.mainMedia,
                    [src]: Source[] = media.sources;
                clientIo.on(SocketEvents.UploadEnd, () => {
                    if (media.type === MediaTypes.Video) {
                        task.createProcessVideoTask.should.have.been.calledOnce;
                    } else {
                        task.createProcessImageTask.should.have.been.calledOnce;
                    }
                    task.createFileUploadTask.should.have.been.calledOnce;
                    GlobalRepository.prototype.update.should.have.been.calledOnce;
                    done();
                });
                clientIo.on(SocketEvents.UploadInit, () => {
                    for (let i: number = 0; i < expectedBuffer.length; i += chunkSize) {
                        clientIo.emit(SocketEvents.Upload, expectedBuffer.slice(i, i + chunkSize));
                    }
                    clientIo.emit(SocketEvents.UploadEnd, expectedHash);
                });
                clientIo.on("connect", () =>
                    clientIo.emit(SocketEvents.UploadInit, {
                        target: _(getAllSourceTargetOptionsFromEntity(container)).filter((sto: RS.SourceTargetOptions) => sto.sourceId === src._id).head()
                    } as RS.UploadOptions));
            });
            it("Should fail if MD5 check does not pass", (done: MochaDone) => {
                entityType = EntityType.Category;
                const media: Media = category.banner,
                    [src]: Source[] = media.sources;
                clientIo.on(SocketEvents.Exception, (msg: string) => {
                    done();
                });
                clientIo.on(SocketEvents.UploadInit, () => {
                    for (let i: number = 0; i < expectedBuffer.length; i += chunkSize) {
                        clientIo.emit(SocketEvents.Upload, expectedBuffer.slice(i, i + chunkSize));
                    }
                    clientIo.emit(SocketEvents.UploadEnd, createHash("md5").update(new Buffer(expectedBuffer.length + 1)).digest("hex"));
                });
                clientIo.on("connect", () =>
                    clientIo.emit(SocketEvents.UploadInit, {
                        target: _(getAllSourceTargetOptionsFromEntity(category)).filter((sto: RS.SourceTargetOptions) => sto.sourceId === src._id).head()
                    } as RS.UploadOptions));
            });
            it("Should reject if the client is already doing something", (done: MochaDone) => {
                throttleTime = 1000;
                const media: Media = category.banner,
                    [src]: Source[] = media.sources;
                clientIo.on(SocketEvents.BadRequest, () => {
                    clientIo.disconnect();
                    done();
                });
                clientIo.on("connect", () => {
                    const options: RS.UploadOptions = {
                        target: _(getAllSourceTargetOptionsFromEntity(category)).filter((sto: RS.SourceTargetOptions) => sto.sourceId === src._id).head()
                    };
                    clientIo.emit(SocketEvents.UploadInit, options);
                    clientIo.emit(SocketEvents.UploadInit, options);
                });
            });
            it("Should reject upload if any entity is not found", (done: MochaDone) => {
                const media: Media = category.banner;
                clientIo.on(SocketEvents.BadRequest, () => {
                    mediaManager.startUpload.should.have.not.been.calledOnce;
                    done();
                });
                clientIo.on("connect", () =>
                    clientIo.emit(SocketEvents.UploadInit, {
                        target: { mainId: category._id, mediaId: media._id, sourceId: v4() }
                    } as RS.UploadOptions));
            });
            it("Should reject upload and upload_end if upload_init has not been emitted", (done: MochaDone) => {
                let firstDone: boolean = false;
                clientIo.on(SocketEvents.BadRequest, () => {
                    task.createFileUploadTask.should.have.not.been.called;
                    task.createProcessVideoTask.should.have.not.been.called;
                    task.createProcessImageTask.should.have.not.been.called;
                    firstDone = firstDone ? done() : true;
                });
                clientIo.on("connect", () => {
                    clientIo.emit(SocketEvents.Upload);
                    clientIo.emit(SocketEvents.UploadEnd);
                });
            });
            it("Should create a new name if it is its first upload", (done: MochaDone) => {
                entityType = EntityType.Category;
                const category: Category = last<Category>(categories),
                    media: Media = category.banner,
                    [src]: Source[] = media.sources;
                src.src = "";
                const expectedSrc: string = `categories/${uriFriendlyFormat(category.name)}/${uriFriendlyFormat(`${src._id}_`)}`;
                clientIo.on(SocketEvents.UploadEnd, () => {
                    if (media.type === MediaTypes.Video) {
                        task.createProcessVideoTask.should.have.been.calledOnce;
                    } else {
                        task.createProcessImageTask.should.have.been.calledOnce;
                    }
                    task.createFileUploadTask.should.have.been.calledOnce;
                    task.createFileUploadTask.should.have.been.calledWith({ source: expectedSrc, dest: expectedSrc } as Ropeho.Tasks.FileUploadOptions);
                    GlobalRepository.prototype.update.should.have.been.calledOnce;
                    done();
                });
                clientIo.on(SocketEvents.UploadInit, () => {
                    for (let i: number = 0; i < expectedBuffer.length; i += chunkSize) {
                        clientIo.emit(SocketEvents.Upload, expectedBuffer.slice(i, i + chunkSize));
                    }
                    clientIo.emit(SocketEvents.UploadEnd, expectedHash);
                });
                clientIo.on("connect", () =>
                    clientIo.emit(SocketEvents.UploadInit, {
                        target: _(getAllSourceTargetOptionsFromEntity(category)).filter((sto: RS.SourceTargetOptions) => sto.sourceId === src._id).head()
                    } as RS.UploadOptions));
            });
            it("Should create a new name if it is its first upload with an optional filename", (done: MochaDone) => {
                entityType = EntityType.Category;
                const category: Category = last<Category>(categories),
                    media: Media = category.banner,
                    [src]: Source[] = media.sources,
                    filename: string = "test.txt";
                src.src = "";
                const expectedSrc: string = `categories/${uriFriendlyFormat(category.name)}/${uriFriendlyFormat(`${src._id}_${filename}`)}`;
                clientIo.on(SocketEvents.UploadEnd, () => {
                    if (media.type === MediaTypes.Video) {
                        task.createProcessVideoTask.should.have.been.calledOnce;
                    } else {
                        task.createProcessImageTask.should.have.been.calledOnce;
                    }
                    task.createFileUploadTask.should.have.been.calledOnce;
                    task.createFileUploadTask.should.have.been.calledWith({ source: expectedSrc, dest: expectedSrc } as Ropeho.Tasks.FileUploadOptions);
                    GlobalRepository.prototype.update.should.have.been.calledOnce;
                    done();
                });
                clientIo.on(SocketEvents.UploadInit, () => {
                    for (let i: number = 0; i < expectedBuffer.length; i += chunkSize) {
                        clientIo.emit(SocketEvents.Upload, expectedBuffer.slice(i, i + chunkSize));
                    }
                    clientIo.emit(SocketEvents.UploadEnd, expectedHash);
                });
                clientIo.on("connect", () =>
                    clientIo.emit(SocketEvents.UploadInit, {
                        target: _(getAllSourceTargetOptionsFromEntity(category)).filter((sto: RS.SourceTargetOptions) => sto.sourceId === src._id).head(),
                        hash: expectedHash,
                        filename
                    } as RS.UploadOptions));
            });
            it("Should lock an entity from upload it until upload has been finished", (done: MochaDone) => {
                entityType = EntityType.Category;
                let bothConnected: boolean = false;
                const media: Media = category.banner,
                    [src]: Source[] = media.sources,
                    sto: RS.SourceTargetOptions = _(getAllSourceTargetOptionsFromEntity(category)).filter((sto: RS.SourceTargetOptions) => sto.sourceId === src._id).head(),
                    anotherClient: SocketIOClient.Socket = socketIoClient.connect(socketIoUrl, socketIoOptions),
                    badSpy: sinon.SinonSpy = spy();
                const sendStuff: () => boolean = () => {
                    clientIo.emit(SocketEvents.UploadInit, {
                        target: sto
                    } as RS.UploadOptions);
                    anotherClient.emit(SocketEvents.UploadInit, {
                        target: sto
                    } as RS.UploadOptions);
                    return true;
                };
                clientIo.on(SocketEvents.UploadEnd, () => {
                    if (media.type === MediaTypes.Video) {
                        task.createProcessVideoTask.should.have.been.calledOnce;
                        task.createProcessImageTask.should.have.not.been.calledOnce;
                    } else {
                        task.createProcessImageTask.should.have.been.calledOnce;
                        task.createProcessVideoTask.should.have.not.been.called;
                    }
                    task.createFileUploadTask.should.have.been.calledOnce;
                    GlobalRepository.prototype.update.should.have.been.calledOnce;
                    badSpy.should.have.been.calledOnce;
                    anotherClient.disconnect();
                    done();
                });
                clientIo.on(SocketEvents.UploadInit, () => {
                    for (let i: number = 0; i < expectedBuffer.length; i += chunkSize) {
                        clientIo.emit(SocketEvents.Upload, expectedBuffer.slice(i, i + chunkSize));
                    }
                    clientIo.emit(SocketEvents.UploadEnd, expectedHash);
                });
                anotherClient.on(SocketEvents.BadRequest, () => {
                    badSpy();
                });
                clientIo.on("connect", () => bothConnected = bothConnected ? sendStuff() : true);
                anotherClient.on("connect", () => bothConnected = bothConnected ? sendStuff() : true);
            });
        });
    });
    describe("API", () => {
        let clientA: SocketIOClient.Socket;
        let clientB: SocketIOClient.Socket;
        beforeEach(() => {
            clientA = socketIoClient.connect(socketIoUrl, socketIoOptions);
            clientB = socketIoClient.connect(socketIoUrl, socketIoOptions);
        });
        afterEach(() => {
            clientA.disconnect();
            clientB.disconnect();
        });
        it("Should return all locked files", (done: MochaDone) => {
            throttleTime = 500;
            const [category]: Category[] = categories;
            const [stoA]: RS.SourceTargetOptions[] = getAllSourceTargetOptionsFromEntity(productionA);
            const [stoB]: RS.SourceTargetOptions[] = getAllSourceTargetOptionsFromEntity(productionB);
            const [stoC]: RS.SourceTargetOptions[] = getAllSourceTargetOptionsFromEntity(category);
            const doneFunc: Function = () => setTimeout(() => {
                const locked: string[] = getLocked();
                const uploading: string[] = getUploading();
                const downloading: string[] = getDownloading();
                locked.should.have.lengthOf(3);
                locked.should.contain(stoA.mainId);
                locked.should.contain(stoB.mainId);
                locked.should.contain(stoC.mainId);
                uploading.should.have.lengthOf(2);
                uploading.should.contain(stoB.mainId);
                uploading.should.contain(stoC.mainId);
                downloading.should.have.lengthOf(1);
                downloading.should.contain(stoA.mainId);
                done();
            }, 250);
            let nConnected: number = 0;
            clientIo.on("connect", () => {
                clientIo.emit(SocketEvents.UploadInit, {
                    target: stoC,
                    hash: expectedHash
                } as RS.UploadOptions);
                nConnected++;
                if (nConnected === 3) {
                    doneFunc();
                }
            });
            clientA.on("connect", () => {
                assignCookieToClient(clientA.id, "cookie");
                clientA.emit(SocketEvents.UploadInit, {
                    target: stoB,
                    hash: expectedHash
                } as RS.UploadOptions);
                nConnected++;
                if (nConnected === 3) {
                    doneFunc();
                }
            });
            clientB.on("connect", () => {
                assignCookieToClient(clientB.id, "cookie");
                clientB.emit(SocketEvents.DownloadInit, {
                    targets: [stoA]
                } as RS.DownloadOptions);
                nConnected++;
                if (nConnected === 3) {
                    doneFunc();
                }
            });
        });
        it("Should return all clients", (done: MochaDone) => {
            const doneFunc: Function = () => {
                const clients: { [key: string]: RS.SocketClient } = getClients();
                keys(clients).should.have.lengthOf(3);
                done();
            };
            let nConnected: number = 0;
            clientIo.on("connect", () => {
                nConnected++;
                if (nConnected === 3) {
                    doneFunc();
                }
            });
            clientA.on("connect", () => {
                nConnected++;
                if (nConnected === 3) {
                    doneFunc();
                }
            });
            clientB.on("connect", () => {
                nConnected++;
                if (nConnected === 3) {
                    doneFunc();
                }
            });
        });
        it("Should forcefully disconnect a client", (done: MochaDone) => {
            const doneFunc: Function = () => {
                kickClient(clientB.id);
                const clients: { [key: string]: RS.SocketClient } = getClients();
                keys(clients).should.have.lengthOf(2);
                done();
            };
            let nConnected: number = 0;
            clientIo.on("connect", () => {
                nConnected++;
                if (nConnected === 3) {
                    doneFunc();
                }
            });
            clientA.on("connect", () => {
                nConnected++;
                if (nConnected === 3) {
                    doneFunc();
                }
            });
            clientB.on("connect", () => {
                nConnected++;
                if (nConnected === 3) {
                    doneFunc();
                }
            });
        });
        it("Should set a user to a client", (done: MochaDone) => {
            const cookie: string = "anicecookie";
            clientIo.on("connect", () => {
                assignCookieToClient(clientIo.id, cookie);
                getClients()[clientIo.id].cookie.should.deep.equal(cookie);
                done();
            });
        });
    });
});
