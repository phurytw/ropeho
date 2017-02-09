/**
 * @file Unit tests for the socket.io app
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../typings.d.ts" />
import * as socketIo from "socket.io";
import * as socketIoClient from "socket.io-client";
import { stub, mock, spy } from "sinon";
import genericRepository from "../../src/server/dal/genericRepository";
import { productions } from "./dal/testDb";
import { filter } from "lodash";
import { attach, socketEvents } from "../../src/server/socket";
import { Response } from "node-fetch";
import * as fetchModule from "node-fetch";
import fetch from "node-fetch";
import { v4 } from "node-uuid";
import { Roles } from "../../src/enum";

import Production = Ropeho.Models.Production;
import User = Ropeho.Models.User;

interface OrGetQuery {
    $or: {
        _id: string;
    }[];
}

interface GetQuery {
    _id: string;
}

describe("Socket IO Server", () => {
    const testPort: number = 5000,
        authPath: string = `https://localhost:${process.env.PORT || 8000}/auth`;
    let serverIo: SocketIO.Server,
        clientIo: SocketIOClient.Socket,
        getStub: sinon.SinonStub,
        authStub: sinon.SinonStub;
    before(() => {
        getStub = stub(genericRepository.prototype, "get", (rawQuery: any) =>
            new Promise<Production[]>((resolve: (value?: Production | PromiseLike<Production>) => void, reject: (reason?: any) => void) => {
                if (rawQuery.$or) {
                    const query: OrGetQuery = rawQuery;
                    resolve(filter<Production>(productions, (prod: Production) => filter<{ _id: string; }>(query.$or, (or: { _id: string }) => or._id === prod._id).length > 0));
                } else {
                    const query: GetQuery = rawQuery;
                    resolve(filter<Production>(productions, (prod: Production) => prod._id === query._id));
                }
            }));
        authStub = stub(fetchModule, "default", () => {
            console.log("I HAS BEEN CALLED");
            new Promise<Response>((resolve: (value?: Response | PromiseLike<Response>) => void, reject: (reason?: any) => void) => resolve({
                then: undefined,
                status: 200,
                json: () => new Promise<User>((resolve: (value?: User | PromiseLike<User>) => void, reject: (reason?: any) => void) => resolve({
                    _id: v4(),
                    type: Roles.Administrator
                }))
            }));
        });
        serverIo = socketIo.listen(5000);
        attach(serverIo);
    });
    beforeEach(() => clientIo = socketIoClient.connect(`http://localhost:${testPort}`, {
        transports: ["websocket"],
        forceNew: true,
        reconnection: false
    }));
    after(() => {
        getStub.restore();
        authStub.restore();
        serverIo.close();
    });
    afterEach(() => {
        getStub.reset();
        authStub.reset();
        clientIo.disconnect();
    });
    describe("Permissions", () => {
        it("Should be restricted to users who do not own the content");
        it("Should be restricted to non admin users");
    });
    describe("Media management", () => {
        it("Should receive a file for a specific media source");
        it("Should reject an upload if there are more than one destination");
        it("Should reject an upload if the MD5 hash is not provided");
        it("Should resume upload if the destination media source already exists");
        it("Should upload and overwrite if the destination media source already exists but has a different signature");
        it("Should send a file for a specific media source");
        it("Should reject download if any entity is not found");
        it("Should reject upload if the entity is not found");
        it("Should reject if the request is not valid", (done: MochaDone) => {
            clientIo.on(socketEvents.BadRequest, () => {
                done();
            });
            clientIo.on("connect", () => {
                clientIo.emit(socketEvents.DownloadInit);
            });
        });
    });
});
