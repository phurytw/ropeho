/**
 * @file Tests for the MediaSelectorButtons component
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../../test.d.ts" />
import { should } from "chai";
import { shallow, ShallowWrapper } from "enzyme";
import * as React from "react";
import hook from "../../../common/helpers/cssModulesHook";
hook();
import { MediaSelectorButtonsProps, MediaSelectorButtons } from "./MediaSelectorButtons";
import { Button } from "react-toolbox";
should();

describe("Media selector buttons component", () => {
    const onMoveUp: () => void = () => ({});
    const onMoveDown: () => void = () => ({});
    const onDelete: () => void = () => ({});
    const props: MediaSelectorButtonsProps = {
        onMoveDown,
        onMoveUp,
        onDelete
    };
    it("Should have a button to move up a position", () => {
        const wrapper: ShallowWrapper<MediaSelectorButtonsProps, {}> = shallow(<MediaSelectorButtons {...props} />);
        wrapper.find(Button).find({ onClick: onMoveUp }).should.have.lengthOf(1);
    });
    it("Should have a button to move down a position", () => {
        const wrapper: ShallowWrapper<MediaSelectorButtonsProps, {}> = shallow(<MediaSelectorButtons {...props} />);
        wrapper.find(Button).find({ onClick: onMoveDown }).should.have.lengthOf(1);
    });
    it("Should have a button to select a media", () => {
        const wrapper: ShallowWrapper<MediaSelectorButtonsProps, {}> = shallow(<MediaSelectorButtons {...props} />);
        wrapper.find(Button).find({ onClick: onDelete }).should.have.lengthOf(1);
    });
});
