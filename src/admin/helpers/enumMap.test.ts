/**
 * @file Tests for the enumMap module
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../test.d.ts" />
import { should } from "chai";
import enumMap from "./enumMap";
import { values } from "lodash";
should();

enum TestEnum {
    Value0 = 20,
    Value1 = 40,
    Value2
}

describe("enumMap module", () => {
    it("Should return a map from an enum with its keys and values", () => {
        const result: { [key: string]: number } = enumMap(TestEnum);
        values<number>(result).should.have.lengthOf(3);
        result["Value0"].should.equal(20);
        result["Value1"].should.equal(40);
        result["Value2"].should.equal(41);
    });
});
