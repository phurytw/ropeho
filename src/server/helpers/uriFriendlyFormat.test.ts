/**
 * @file Unit tests for the URI friendly format function
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../../test.d.ts" />
import { should } from "chai";
import uriFriendlyFormat from "../helpers/uriFriendlyFormat";
should();

describe("URI friendly format function", () => {
    it("Should replace spaces by underscores", () =>
        uriFriendlyFormat("my uri").should.equal("my_uri"));
    it("Should put alphabetic characters to lowercase", () =>
        uriFriendlyFormat("AzErTy").should.equal("azerty"));
    it("Should replace non alphanumeric letters by theirs non accent version", () =>
        uriFriendlyFormat("éàïôù").should.equal("eaiou"));
    it("Should replace non letters and non URI friendly characters by underscores", () =>
        uriFriendlyFormat("#,@}'").should.equal("_____"));
});
