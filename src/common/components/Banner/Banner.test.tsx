/**
 * @file Tests for the Banner component
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../../test.d.ts" />
import { should, use } from "chai";
import * as sinonChai from "sinon-chai";
import { spy } from "sinon";
import * as React from "react";
import { shallow, ShallowWrapper } from "enzyme";
import { productions } from "../../../sampleData/testDb";
import { includes } from "lodash";
import hook from "../../helpers/cssModulesHook";
hook();
import { BannerProps, default as Banner } from "./Banner";
import MediaPreview from "../MediaPreview";
should();
use(sinonChai);

describe("Banner component", () => {
    const [production]: Ropeho.Models.Production[] = productions;
    const props: BannerProps = {
        background: production.background,
        banner: production.banner,
        description: production.description,
        title: production.name,
        models: "ABC",
        date: new Date().toLocaleDateString(),
        location: "In the park"
    };
    describe("Element", () => {
        it("Should display the banner", () => {
            const wrapper: ShallowWrapper<BannerProps, {}> = shallow(<Banner {...props} />);
            wrapper.find(MediaPreview).find({ media: props.banner }).should.have.lengthOf(1);
        });
        it("Should display the background", () => {
            const wrapper: ShallowWrapper<BannerProps, {}> = shallow(<Banner {...props} />);
            wrapper.find(MediaPreview).find({ media: props.background }).should.have.lengthOf(1);
        });
        it("Should display the title", () => {
            const wrapper: ShallowWrapper<BannerProps, {}> = shallow(<Banner {...props} />);
            wrapper.findWhere((node: ShallowWrapper<BannerProps, {}>) => node.type() === "h1" && node.text() === props.title).should.have.lengthOf(1);
        });
        it("Should display the description", () => {
            const wrapper: ShallowWrapper<BannerProps, {}> = shallow(<Banner {...props} />);
            wrapper.findWhere((node: ShallowWrapper<BannerProps, {}>) => node.type() === "p" && node.text() === props.description).should.have.lengthOf(1);
        });
        it("Should display models", () => {
            const wrapper: ShallowWrapper<BannerProps, {}> = shallow(<Banner {...props} />);
            wrapper.findWhere((node: ShallowWrapper<BannerProps, {}>) => node.type() === "p" && includes<string>(node.text(), props.models)).should.have.lengthOf(1);
        });
        it("Should display location", () => {
            const wrapper: ShallowWrapper<BannerProps, {}> = shallow(<Banner {...props} />);
            wrapper.findWhere((node: ShallowWrapper<BannerProps, {}>) => node.type() === "p" && includes<string>(node.text(), props.location)).should.have.lengthOf(1);
        });
        it("Should display date", () => {
            const wrapper: ShallowWrapper<BannerProps, {}> = shallow(<Banner {...props} />);
            wrapper.findWhere((node: ShallowWrapper<BannerProps, {}>) => node.type() === "p" && includes<string>(node.text(), props.date)).should.have.lengthOf(1);
        });
    });
    it("Should force update after the transition", (done: MochaDone) => {
        const wrapper: ShallowWrapper<BannerProps, {}> = shallow(<Banner {...props} />);
        const instance: Banner = wrapper.instance() as Banner;
        const forceUpdateSpy: sinon.SinonSpy = spy(instance, "forceUpdate");
        instance.refresh();
        forceUpdateSpy.should.not.have.been.called;
        setTimeout(() => {
            forceUpdateSpy.should.have.been.calledOnce;
            forceUpdateSpy.restore();
            done();
        }, 250);
    });
});
