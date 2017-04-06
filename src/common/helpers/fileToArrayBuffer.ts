/**
 * @file Converts a file into an ArrayBuffer
 * @author François Nguyen <https://github.com/lith-light-g>
 */

export default (file: File): Promise<ArrayBuffer> => new Promise<ArrayBuffer>((resolve: (value?: ArrayBuffer | PromiseLike<ArrayBuffer>) => void, reject: (reason?: any) => void) => {
    try {
        const reader: FileReader = new FileReader();
        reader.onloadend = () => {
            resolve(reader.result);
        };
        reader.readAsArrayBuffer(file);
    } catch (error) {
        reject(error);
    }
});
