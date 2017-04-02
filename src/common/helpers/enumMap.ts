/**
 * @file Returns a map of keys and values from a TypeScript enum
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/**
 * Returns a map of keys and values from a TypeScript enum
 * @param {enum} input a TypeScript enum
 */
export default (input: any): { [key: string]: number } => {
    const output: { [key: string]: number } = {};
    const keys: string[] = Object.keys(input);
    const length: number = keys.length;
    for (let i: number = 0; i < length; i++) {
        if (i >= length / 2) {
            output[keys[i]] = input[keys[i]];
        }
    }
    return output;
};
