/**
 * @file Tests for the PreviewCard component
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../../test.d.ts" />
import { should, use } from "chai";
import { stub } from "sinon";
import * as sinonChai from "sinon-chai";
import * as React from "react";
import { ReactWrapper, mount } from "enzyme";
import hook from "../../helpers/cssModulesHook";
import { includes } from "lodash";
hook();
import { PreviewCardProps, default as PreviewCard } from "./PreviewCard";
import { CardTitle, CardMedia } from "react-toolbox";
should();
use(sinonChai);

describe("Preview Card", () => {
    let wrapper: ReactWrapper<any, {}>;
    const props: PreviewCardProps = {
        href: "https://nice.url",
        name: "item name",
        src: "https://source.jpeg"
    };
    before(() => wrapper = mount(<PreviewCard {...props} />));
    it("Should display a name", () =>
        includes<string>(wrapper.find(CardTitle).text(), props.name).should.be.true);
    it("Should display a banner", () =>
        wrapper.find(CardMedia).prop("image").should.equal(props.src));
    it("Should redirect the href prop URL on click", () => {
        const windowLocationAssignStub: sinon.SinonStub = stub(window.location, "assign");
        wrapper.simulate("click");
        windowLocationAssignStub.should.have.been.calledOnce;
        windowLocationAssignStub.should.have.been.calledWith(props.href);
        windowLocationAssignStub.restore();
    });
});
