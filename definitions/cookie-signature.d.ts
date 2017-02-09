declare module "cookie-signature" {
    /**
     * Sign the given `val` with `secret`.
     * @param {string} val
     * @param {string} secret
     * @return {string}
     */
    export function sign(value: string, secret: string): string;

    /**
     * Unsign and decode the given `val` with `secret`,
     * returning `false` if the signature is invalid.
     * @param {string} val
     * @param {string} secret
     * @return {string|boolean}
     */
    export function unsign(value: string, secret: string): string | boolean;
}
