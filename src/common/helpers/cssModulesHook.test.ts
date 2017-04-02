/**
 * @file Tests for the CSS Modules hook
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../test.d.ts" />
import { should } from "chai";
import hook from "./cssModulesHook";
hook();
should();

describe("CSS modules hook", () => {
    it("Should not crash", () => {
        const hello: string = require("./cssModulesHook.test.css");
        hello.should.have.property("test");
    });
});
