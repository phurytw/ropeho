/**
 * @file Creates and verifies passwords
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../typings.d.ts" />
import { pbkdf2, pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";
import config from "../../config";

/**
 * Generates a PBKDF2 hash of a provided password
 * @param {string} password The password that needs to be hashed
 * @param {number} saltSize (optional) Size in bytes of the salt
 * @param {number} hashSize (optional) Size in bytes of the hash (not the final salt/hash combination)
 * @param {number} iterations (optional) Number of iterations
 * @param {string} algorithm (optional) Hash algorithm
 * @returns {Promise<Buffer>} A Promise that resolves to a Buffer of the salt and hash combined
 */
export const computeHash: (password: string, saltSize?: number, hashSize?: number, iterations?: number, algorithm?: string) => Promise<Buffer> =
    (password: string, saltSize?: number, hashSize?: number, iterations?: number, algorithm?: string): Promise<Buffer> => {
        return new Promise<Buffer>((resolve: (value?: Buffer | PromiseLike<Buffer>) => void, reject: (reason?: any) => void) => {
            const { users: { passwordHashBytes, passwordIteration, passwordSaltBytes, passwordAlgorithm } }: Ropeho.Configuration.Configuration = config;
            saltSize = saltSize || passwordSaltBytes;
            hashSize = hashSize || passwordHashBytes;
            iterations = iterations || passwordIteration;
            algorithm = algorithm || passwordAlgorithm;
            // Generate salt
            randomBytes(saltSize, (err: Error, salt: Buffer) => {
                if (err) {
                    reject(err);
                } else {
                    // Generate hash
                    pbkdf2(password, salt, iterations, hashSize, algorithm, (err: Error, hash: Buffer) => {
                        if (err) {
                            reject(err);
                        }
                        const combined: Buffer = new Buffer(hash.length + salt.length + 8);
                        combined.writeUInt32BE(salt.length, 0, true);
                        combined.writeUInt32BE(iterations, 4, true);
                        salt.copy(combined, 8);
                        hash.copy(combined, salt.length + 8);
                        resolve(combined);
                    });
                }
            });
        });
    };

/**
 * Generates a PBKDF2 hash of a provided password
 * Synchronous version of computeHash
 * @param {string} password The password that needs to be hashed
 * @param {number} saltSize (optional) Size in bytes of the salt
 * @param {number} hashSize (optional) Size in bytes of the hash (not the final salt/hash combination)
 * @param {number} iterations (optional) Number of iterations
 * @param {string} algorithm (optional) Hash algorithm
 * @returns {Buffer} A Buffer of the salt and hash combined
 */
export const computeHashSync: (password: string, saltSize?: number, hashSize?: number, iterations?: number, algorithm?: string) => Buffer =
    (password: string, saltSize?: number, hashSize?: number, iterations?: number, algorithm?: string): Buffer => {
        const { users: { passwordHashBytes, passwordIteration, passwordSaltBytes, passwordAlgorithm } }: Ropeho.Configuration.Configuration = config;
        saltSize = saltSize || passwordSaltBytes;
        hashSize = hashSize || passwordHashBytes;
        iterations = iterations || passwordIteration;
        algorithm = algorithm || passwordAlgorithm;
        // Generate salt
        const salt: Buffer = randomBytes(saltSize);
        // Generate hash
        const hash: Buffer = pbkdf2Sync(password, salt, iterations, hashSize, algorithm);
        // Combine salt and hash
        const combined: Buffer = new Buffer(hash.length + salt.length + 8);
        combined.writeUInt32BE(salt.length, 0, true);
        combined.writeUInt32BE(iterations, 4, true);
        salt.copy(combined, 8);
        hash.copy(combined, salt.length + 8);
        return combined;
    };

/**
 * Verifies that password matches the combined hash
 * @param {string} password The password that needs to be verified
 * @param {Buffer|string} combined The hash that the password needs to match
 * @param {string} algorithm Hash algorithm used in the hash
 * @returns {Promise<boolean>} A promise that resolves to true if the password matches and false otherwise
 */
export const verifyPassword: (password: string, combined: Buffer | string, algorithm?: string) => Promise<boolean> =
    (password: string, combined: Buffer | string = "", algorithm?: string): Promise<boolean> => {
        return new Promise<boolean>((resolve: (value?: boolean | PromiseLike<boolean>) => void, reject: (reason?: any) => void) => {
            if (typeof password !== "string") {
                throw new Error("Input password must be a string");
            }
            if (typeof combined === "string") {
                combined = new Buffer(combined, "hex");
            }
            if (combined instanceof Buffer === false) {
                throw new TypeError("Source password must be a Buffer or a string");
            }
            const { users: { passwordAlgorithm } }: Ropeho.Configuration.Configuration = config,
                saltBytes: number = combined.readUInt32BE(0),
                hashBytes: number = combined.length - saltBytes - 8,
                iterations: number = combined.readUInt32BE(4),
                salt: Buffer = combined.slice(8, saltBytes + 8),
                hash: Buffer = combined.slice(saltBytes + 8, combined.length);

            pbkdf2(password, salt, iterations, hashBytes, passwordAlgorithm, (err: Error, verify: Buffer) => {
                if (err) {
                    return reject(err);
                }
                resolve(timingSafeEqual(verify, hash));
            });
        });
    };
