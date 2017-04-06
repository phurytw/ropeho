type WindowArrayBuffer = ArrayBuffer;

declare module "spark-md5" {
    type SparkMD5State = any;
    /**
     * Appends a string, encoding it to UTF8 if necessary.
     * @param {string} str String to append
     */
    export function append(str: string): void;
    /**
     * Appends a binary string (e.g.: string returned from the deprecated readAsBinaryString).
     * @param {string} str String to append
     */
    export function appendBinary(str: string): void;
    /**
     * Finishes the computation of the md5, returning the hex result.
     * @param {boolean} raw If raw is true, the result as a binary string will be returned instead.
     */
    export function end(raw: boolean): string;
    /**
     * Resets the internal state of the computation.
     */
    export function reset(): void;
    /**
     * Returns an object representing the internal computation state. You can pass this state to setState().
     * This feature is useful to resume an incremental md5.
     */
    export function getState(): SparkMD5State;
    /**
     * Sets the internal computation state. See: getState().
     * @param {SparkMD5State} state State to use
     */
    export function setState(state: SparkMD5State): void;
    /**
     * Releases memory used by the incremental buffer and other additional resources.
     */
    export function destroy(): void;
    /**
     * Hashes a string directly, returning the hex result. Note that this function is static.
     * @param {string} str String to hash
     * @param {boolean} raw If raw is true, the result as a binary string will be returned instead.
     */
    export function hash(str: string, raw: boolean): string;
    /**
     * Hashes a binary string directly (e.g.: string returned from the deprecated readAsBinaryString), returning the hex result.
     * Note that this function is static.
     * @param {string} str String to hash
     * @param {boolea} raw If raw is true, the result as a binary string will be returned instead. 
     */
    export function hashBinary(str: string, raw: boolean): string;
    export class ArrayBuffer {
        /**
         * Appends an array buffer.
         * @param {WindowArrayBuffer} arr ArrayBuffer to append
         */
        append(arr: WindowArrayBuffer): void;
        /**
         * Finishes the computation of the md5, returning the hex result.
         * @param {boolean} raw If raw is true, the result as a binary string will be returned instead.
         */
        end(raw: boolean): string;
        /**
         * Resets the internal state of the computation.
         */
        reset(): void;
        /**
         * Releases memory used by the incremental buffer and other additional resources.
         */
        destroy(): void;
        /**
         * Returns an object representing the internal computation state. You can pass this state to setState().
         * This feature is useful to resume an incremental md5.
         */
        getState(): SparkMD5State;
        /**
         * Sets the internal computation state. See: getState().
         * @param {SparkMD5State} state State to use
         */
        setState(state: SparkMD5State): void;
        /**
         * Hashes an array buffer directly, returning the hex result. Note that this function is static.
         * @param {WindowArrayBuffer} arr Array Buffer to hash
         * @param {boolean} raw If raw is true, the result as a binary string will be returned instead.
         */
        static hash(arr: WindowArrayBuffer, raw: boolean): string;
    }
}