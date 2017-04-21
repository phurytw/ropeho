/**
 * @file Tests for the MenuTop component
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../../test.d.ts" />
import * as React from "react";
import { should } from "chai";
import { shallow, ShallowWrapper } from "enzyme";
import hook from "../../../common/helpers/cssModulesHook";
hook();
import { Link } from "react-router-dom";
import { MenuTop } from "./MenuTop";
should();

describe("Side menu component", () => {
    describe("Element", () => {
        describe("Navigation links", () => {
            it("Should have a menu with a link to the production index", () => {
                const wrapper: ShallowWrapper<any, {}> = shallow(<MenuTop />);
                wrapper.find(Link).find({ to: "/photographies" }).should.have.lengthOf(1);
            });
            it("Should have a menu with a link to the homepage", () => {
                const wrapper: ShallowWrapper<any, {}> = shallow(<MenuTop />);
                wrapper.find(Link).find({ to: "/" }).should.have.lengthOf(1);
            });
            it("Should have a menu with a link to the contact page", () => {
                const wrapper: ShallowWrapper<any, {}> = shallow(<MenuTop />);
                wrapper.find(Link).find({ to: "/contact" }).should.have.lengthOf(1);
            });
            it("Should have a menu with a link to the about page", () => {
                const wrapper: ShallowWrapper<any, {}> = shallow(<MenuTop />);
                wrapper.find(Link).find({ to: "/about" }).should.have.lengthOf(1);
            });
        });
    });
});
