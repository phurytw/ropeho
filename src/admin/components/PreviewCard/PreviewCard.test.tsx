/**
 * @file Tests for the PreviewCard component
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../../test.d.ts" />
import { should, use } from "chai";
import { spy } from "sinon";
import * as sinonChai from "sinon-chai";
import * as React from "react";
import { ShallowWrapper, shallow } from "enzyme";
import hook from "../../../common/helpers/cssModulesHook";
hook();
import { PreviewCardProps, default as PreviewCard } from "./PreviewCard";
import MediaPreview from "../../../common/components/MediaPreview";
import { CardTitle, CardMedia, Button } from "react-toolbox";
should();
use(sinonChai);

describe("Preview Card", () => {
    let wrapper: ShallowWrapper<PreviewCardProps, {}>;
    const onClickSpy: sinon.SinonSpy = spy(),
        props: PreviewCardProps = {
            onClick: onClickSpy,
            name: "item name",
            media: {
                _id: "id",
                sources: []
            }
        };
    before(() => wrapper = shallow(<PreviewCard {...props} />));
    it("Should display a name", () =>
        wrapper.find(CardTitle).prop("title").should.equal(props.name));
    it("Should display a banner", () =>
        wrapper.find(CardMedia).findWhere((node: ShallowWrapper<any, any>) => node.type() === MediaPreview && node.prop("media") === props.media).should.have.lengthOf(1));
    it("Should have an onClick handler", () => {
        wrapper.find("div").first().simulate("click");
        onClickSpy.should.have.been.calledOnce;
    });
    it("Should display ordering buttons when onLeft or onRight is set", () => {
        const onLeft: () => any = (): any => ({});
        wrapper = shallow(<PreviewCard {...props} onLeft={onLeft} />);
        wrapper.find(Button).should.have.lengthOf(2);
    });
});
