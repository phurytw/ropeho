/**
 * @file Utility fonctions for Object URLs
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import fileToArrayBuffer from "./fileToArrayBuffer";

export const objectURLToFile: (objectURL: string) => Promise<File> =
    (objectURL: string): Promise<File> => new Promise<File>((resolve: (value?: File | PromiseLike<File>) => void, reject: (reason?: any) => void) => {
        const xhr: XMLHttpRequest = new XMLHttpRequest();
        xhr.open("GET", objectURL, true);
        xhr.responseType = "blob";
        xhr.onload = () => {
            if (xhr.status === 200) {
                resolve(xhr.response);
            } else {
                resolve(xhr.response);
            }
        };
        xhr.send();
    });

export const objectURLToArrayBuffer: (objectURL: string) => Promise<ArrayBuffer> =
    (objectURL: string): Promise<ArrayBuffer> => objectURLToFile(objectURL).then((file: File) => fileToArrayBuffer(file));
