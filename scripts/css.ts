/**
 * @file Copies CSS files in the dist directory
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import { createReadStream, createWriteStream } from "fs";
import { dirname } from "path";
import * as glob from "glob";
import * as mkdirp from "mkdirp";

const baseDir: string = "./src";
const destDir: string = "./dist/src";

console.info("Copying CSS files ...");
glob(`${baseDir}/**/*.css`, (err: Error, matches: string[]) => {
    if (err) {
        throw err;
    }
    for (const file of matches) {
        const baseFile: string = file;
        const destFile: string = file.replace(new RegExp(`^${baseDir}`), destDir);
        mkdirp(dirname(destFile), (err: Error) => {
            if (err) {
                throw err;
            }
            const stream: NodeJS.ReadableStream = createReadStream(baseFile);
            stream.pipe(createWriteStream(destFile));
            stream.on("end", () => console.info("Copied", baseFile, "to", destFile));
            stream.on("error", (err: NodeJS.ErrnoException) => {
                throw err;
            });
        });
    }
});
