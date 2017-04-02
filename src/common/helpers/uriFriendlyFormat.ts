/**
 * @file Transforms any string into an URI friendly version (i.e. spaces are replaced, accents are removed, no non alphanumeric characters)
 * @author François Nguyen <https://github.com/lith-light-g>
 */

import { deburr } from "lodash";
/**
 * Convert a string into an URI friendly format
 * @param {string} input input string
 * @returns {string} formatted string
 */
export const uriFriendlyFormat: (input: string) => string =
    (input: string): string => deburr(input.toLowerCase()).replace(/[^a-z0-9\._~-]/g, "_");
export default uriFriendlyFormat;
