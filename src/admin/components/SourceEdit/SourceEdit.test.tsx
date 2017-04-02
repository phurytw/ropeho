/**
 * @file Tests for the SourceEdit component
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../../test.d.ts" />
import { should } from "chai";
import * as React from "react";
import { shallow, ShallowWrapper } from "enzyme";
import hook from "../../../common/helpers/cssModulesHook";
hook();
import { SourceEdit, SourceEditProps } from "./SourceEdit";
import { SourceEditMetaData } from "../SourceEditMetaData";
should();

describe("Source Edit component", () => {
    const source: Ropeho.Models.Source = {
        _id: "sourceId",
        posX: 0,
        posY: 0,
        zoom: 0
    };
    it("Should have a source edit form", () => {
        const wrapper: ShallowWrapper<SourceEditProps, {}> = shallow(<SourceEdit source={source} />);
        wrapper.find(SourceEditMetaData).should.have.lengthOf(1);
    });
});
