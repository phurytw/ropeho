/**
 * @file Tests for the PresentationWithHref component
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import { should } from "chai";
import { shallow, ShallowWrapper } from "enzyme";
import * as React from "react";
import { PresentationWithHref, PresentationWithHrefProps } from "./PresentationWithHref";
import Presentation from "../Presentation";
import { Link } from "react-router-dom";
should();

describe("PresentationWithHref component", () => {
    const presentation: Ropeho.Models.Presentation = {
        mainMedia: {
            _id: "main"
        },
        alternateMedia: {
            _id: "alternate"
        },
        mainText: "main",
        alternateText: "alternate"
    };
    const props: PresentationWithHrefProps = {
        ...presentation,
        className: "className",
        style: {
            height: "auto"
        }
    };
    it("Should only render a presentation without a href and pass in styles and className", () => {
        const wrapper: ShallowWrapper<PresentationWithHrefProps, {}> = shallow(<PresentationWithHref {...props} />);
        wrapper.type().should.equal(Presentation);
        wrapper.find(Presentation).find(props).should.have.lengthOf(1);
    });
    it("Should render a presentation wrapped into a Link component if the href is relative", () => {
        const href: string = "/wew";
        const wrapper: ShallowWrapper<PresentationWithHrefProps, {}> = shallow(<PresentationWithHref {...props} href={href} />);
        wrapper.type().should.equal(Link);
        wrapper.find(Link).find({
            className: props.className,
            style: props.style
        }).should.have.lengthOf(1);
        wrapper.find(Presentation).find(presentation).should.have.lengthOf(1);
    });
    it("Should render a presentation wrapped into a Link component if the href is relative", () => {
        const href: string = "/wew";
        const wrapper: ShallowWrapper<PresentationWithHrefProps, {}> = shallow(<PresentationWithHref {...props} href={href} />);
        wrapper.type().should.equal(Link);
        wrapper.find(Link).find({
            className: props.className,
            style: props.style
        }).should.have.lengthOf(1);
        wrapper.find(Presentation).find(presentation).should.have.lengthOf(1);
    });
    it("Should render a presentation wrapped into a <a> tag if the href is absolute", () => {
        const href: string = "https://facebook.com";
        const wrapper: ShallowWrapper<PresentationWithHrefProps, {}> = shallow(<PresentationWithHref {...props} href={href} />);
        wrapper.type().should.equal("a");
        wrapper.find("a").find({
            className: props.className,
            style: props.style
        }).should.have.lengthOf(1);
        wrapper.find(Presentation).find(presentation).should.have.lengthOf(1);
    });
});
