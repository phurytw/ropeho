/**
 * @file Tests for the PreviewListItem component
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../../test.d.ts" />
import { should, use } from "chai";
import { spy } from "sinon";
import * as sinonChai from "sinon-chai";
import * as React from "react";
import { ReactWrapper, mount } from "enzyme";
import hook from "../../../common/helpers/cssModulesHook";
import { includes } from "lodash";
hook();
import { PreviewListItemProps, default as PreviewListItem } from "./PreviewListItem";
should();
use(sinonChai);

describe("Preview List Item", () => {
    let wrapper: ReactWrapper<any, {}>;
    const onClickSpy: sinon.SinonSpy = spy(),
        props: PreviewListItemProps = {
            onClick: onClickSpy,
            name: "item name",
            src: "https://source.jpeg"
        };
    before(() => wrapper = mount(<PreviewListItem {...props} />));
    it("Should display a name", () =>
        includes<string>(wrapper.html(), props.name).should.be.true);
    it("Should display a banner", () =>
        wrapper.find("img").prop("src").should.equal(props.src));
    it("Should redirect the href prop URL on click", () => {
        wrapper.simulate("click");
        onClickSpy.should.have.been.calledOnce;
    });
});
