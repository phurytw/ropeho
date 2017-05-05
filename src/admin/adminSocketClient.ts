/**
 * @file Socket.IO application that downloads/uploads files
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import * as socketIoClient from "socket.io-client";
import { Store } from "redux";
import { RopehoAdminState } from "./reducer";
import { API_END_POINT } from "../common/helpers/resolveEndPoint";
import { getActiveUploadQueue, getFile } from "./selectors";
import { SocketEvents } from "../../src/enum";
import { removeEntryFromUploadQueue, setEntryInUploadQueue, setActive } from "./modules/uploadQueue";
import { setError } from "../common/modules/error";
import { socketAuthentication } from "../common/modules/session";
import * as sparkMD5 from "spark-md5";

import UploadEntry = Ropeho.Socket.UploadEntry;
import UploadOptions = Ropeho.Socket.UploadOptions;

const chunkSize: number = process.env.SOCKET_CHUNK_SIZE || 131072;

export default (store: Store<RopehoAdminState>, endPoint: string = API_END_POINT): SocketIOClient.Socket => {
    if (!store || !store.dispatch || !store.getState || !store.subscribe) {
        throw new TypeError("Socket cannot be run without a Redux store");
    }
    // flags
    let isWorking: boolean = false;
    let uploadQueue: UploadEntry[] = [];
    let currentItem: UploadEntry;
    let file: File;

    // socket
    const io: SocketIOClient.Socket = socketIoClient.connect(endPoint, {
        forceNew: true,
        reconnection: false
    });

    const processQueue: () => Promise<void> = async (): Promise<void> => {
        currentItem = uploadQueue[0];
        if (currentItem) {
            isWorking = true;
            try {
                await store.dispatch(socketAuthentication(io.id));
                file = getFile(store.getState(), currentItem.objectURL);
                io.emit(SocketEvents.UploadInit, {
                    target: currentItem.target,
                    filename: file && file.name ? file.name : undefined
                } as UploadOptions);
            } catch (error) {
                isWorking = true;
                store.dispatch(setActive(currentItem.id, false));
            }
        }
    };
    const onError: (message: string) => void =
        (message: string): void => {
            if (currentItem) {
                store.dispatch(setActive(currentItem.id, false));
            }
            isWorking = false;
            store.dispatch(setError({
                developerMessage: message,
                userMessage: "Votre envoi n'a pas pu être éffectué."
            }));
        };

    io.on("connect", () => {
        // state listener
        store.subscribe(() => {
            if (!isWorking) {
                uploadQueue = getActiveUploadQueue(store.getState());
                processQueue();
            }
        });
    });

    // events
    io.on(SocketEvents.UploadInit, async () => {
        const hash: sparkMD5.ArrayBuffer = new sparkMD5.ArrayBuffer();
        const reader: FileReader = new FileReader();
        const max: number = file.size;
        let bytesSent: number = 0;
        let nextChunk: number = Math.min(file.size, chunkSize);
        reader.onload = () => {
            const data: ArrayBuffer = reader.result;
            hash.append(data);

            // update progress in the website
            bytesSent = nextChunk;
            nextChunk = Math.min(file.size, nextChunk + chunkSize);
            store.dispatch(setEntryInUploadQueue({
                ...currentItem,
                max,
                bytesSent
            }));
            if (bytesSent === file.size) {
                io.emit(SocketEvents.Upload, data);
                io.emit(SocketEvents.UploadEnd, hash.end(false));
            } else {
                io.emit(SocketEvents.Upload, data);
                reader.readAsArrayBuffer(file.slice(bytesSent, nextChunk));
            }
        };
        reader.onerror = () => {
            io.emit(SocketEvents.Exception, "An error occurred while uploading");
        };
        reader.readAsArrayBuffer(file.slice(0, nextChunk));
    });
    io.on(SocketEvents.UploadEnd, () => {
        isWorking = false;
        store.dispatch(removeEntryFromUploadQueue(currentItem.id));
    });
    io.on(SocketEvents.BadRequest, onError);
    io.on(SocketEvents.Exception, (message: string) => {
        onError(message);
        io.disconnect();
    });

    return io;
};
