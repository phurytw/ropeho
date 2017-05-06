/**
 * @file Tests for the Presentation component
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import { should, use } from "chai";
import * as sinonChai from "sinon-chai";
import * as React from "react";
import { shallow, ShallowWrapper } from "enzyme";
import { presentations } from "../../../sampleData/testDb";
import hook from "../../helpers/cssModulesHook";
hook();
import { PresentationProps, Presentation } from "./Presentation";
import MediaPreview from "../MediaPreview";
should();
use(sinonChai);

describe("Presentation component", () => {
    const presentation: Ropeho.Models.Presentation = presentations[0].presentations[0];
    it("Should display medias", () => {
        const wrapper: ShallowWrapper<PresentationProps, {}> = shallow(<Presentation mainMedia={presentation.mainMedia} alternateMedia={presentation.alternateMedia} />);
        wrapper.find(MediaPreview).should.have.lengthOf(2);
    });
    it("Should display one media if there's no alternate media", () => {
        const wrapper: ShallowWrapper<PresentationProps, {}> = shallow(<Presentation mainMedia={presentation.mainMedia} alternateMedia={{
            ...presentation.alternateMedia,
            sources: []
        }} />);
        wrapper.find(MediaPreview).should.have.lengthOf(1);
    });
    it("Should display the text", () => {
        const text: string = "Hello world";
        const wrapper: ShallowWrapper<PresentationProps, {}> = shallow(<Presentation mainMedia={presentation.mainMedia} alternateMedia={presentation.alternateMedia} mainText={text} />);
        wrapper.findWhere((node: ShallowWrapper<any, any>) => node.text() === text).should.have.length.above(0);
    });
    it("Should not display the alternate text if there's no main text", () => {
        const text: string = "Hello world";
        const wrapper: ShallowWrapper<PresentationProps, {}> = shallow(<Presentation mainMedia={presentation.mainMedia} alternateMedia={presentation.alternateMedia} alternateText={text} />);
        wrapper.findWhere((node: ShallowWrapper<any, any>) => node.text() === text).should.have.lengthOf(0);
    });
    it("Should display the alternate text if there's a main text", () => {
        const text: string = "Hello world";
        const wrapper: ShallowWrapper<PresentationProps, {}> = shallow(<Presentation mainMedia={presentation.mainMedia} alternateMedia={presentation.alternateMedia} mainText={text} alternateText={text} />);
        wrapper.findWhere((node: ShallowWrapper<any, any>) => node.text() === text).should.have.length.above(0);
    });
    it("Should be active when hovering", () => {
        const wrapper: ShallowWrapper<PresentationProps, {}> = shallow(<Presentation mainMedia={presentation.mainMedia} />);
        const instance: Presentation = wrapper.instance() as Presentation;
        wrapper.prop("onMouseEnter").should.equal(instance.setActive);
    });
    it("Should be inactive when leaving", () => {
        const wrapper: ShallowWrapper<PresentationProps, {}> = shallow(<Presentation mainMedia={presentation.mainMedia} />);
        const instance: Presentation = wrapper.instance() as Presentation;
        wrapper.prop("onMouseLeave").should.equal(instance.setInactive);
    });
    it("Should be active or inactive when clicking", () => {
        const wrapper: ShallowWrapper<PresentationProps, {}> = shallow(<Presentation mainMedia={presentation.mainMedia} />);
        const instance: Presentation = wrapper.instance() as Presentation;
        wrapper.prop("onClick").should.equal(instance.switchActive);
    });
    it("Should set the state as active", () => {
        const wrapper: ShallowWrapper<PresentationProps, {}> = shallow(<Presentation />);
        const instance: Presentation = wrapper.instance() as Presentation;
        instance.setActive();
        wrapper.state("active").should.be.true;
    });
    it("Should set the state as inactive", () => {
        const wrapper: ShallowWrapper<PresentationProps, {}> = shallow(<Presentation />);
        const instance: Presentation = wrapper.instance() as Presentation;
        instance.setInactive();
        wrapper.state("active").should.be.false;
    });
    it("Should set the state as the opposite", () => {
        const wrapper: ShallowWrapper<PresentationProps, {}> = shallow(<Presentation />);
        const instance: Presentation = wrapper.instance() as Presentation;
        instance.switchActive();
        wrapper.state("active").should.be.true;
        instance.switchActive();
        wrapper.state("active").should.be.false;
    });
});
