/**
 * @file Tests for the file to ArrayBuffer utility
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import { should, use } from "chai";
import * as chaiAsPromise from "chai-as-promised";
import fileToAB from "./fileToArrayBuffer";
should();
use(chaiAsPromise);

describe("File to ArrayBuffer", () => {
    it("Should fulfill with an ArrayBuffer", () => {
        const data: ArrayBuffer = new ArrayBuffer(100);
        const file: File = new File([data], "file.txt");
        return fileToAB(file).should.eventually.deep.equal(data);
    });
});
