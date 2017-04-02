/**
 * @file Tests for the SourceInterfaceButtons component
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../../test.d.ts" />
import { should } from "chai";
import { shallow, ShallowWrapper } from "enzyme";
import * as React from "react";
import hook from "../../../common/helpers/cssModulesHook";
hook();
import { SourceInterfaceButtonsProps, SourceInterfaceButtons } from "./SourceInterfaceButtons";
import { Button } from "react-toolbox";
should();

describe("Source interface buttons component", () => {
    const onMoveUp: () => void = () => ({});
    const onMoveDown: () => void = () => ({});
    const onSelect: () => void = () => ({});
    const props: SourceInterfaceButtonsProps = {
        onMoveDown,
        onMoveUp,
        onSelect
    };
    it("Should have a button to move up a position", () => {
        const wrapper: ShallowWrapper<SourceInterfaceButtonsProps, {}> = shallow(<SourceInterfaceButtons {...props} />);
        wrapper.find(Button).find({ onClick: onMoveUp }).should.have.lengthOf(1);
    });
    it("Should have a button to move down a position", () => {
        const wrapper: ShallowWrapper<SourceInterfaceButtonsProps, {}> = shallow(<SourceInterfaceButtons {...props} />);
        wrapper.find(Button).find({ onClick: onMoveDown }).should.have.lengthOf(1);
    });
    it("Should have a button to select a source", () => {
        const wrapper: ShallowWrapper<SourceInterfaceButtonsProps, {}> = shallow(<SourceInterfaceButtons {...props} />);
        wrapper.find(Button).find({ onClick: onSelect }).should.have.lengthOf(1);
    });
});
