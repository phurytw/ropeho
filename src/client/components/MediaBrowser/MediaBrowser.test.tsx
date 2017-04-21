/**
 * @file Tests for the MediaBrowser component
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import * as React from "react";
import { should } from "chai";
import { shallow, ShallowWrapper } from "enzyme";
import uriFriendlyFormat from "../../../common/helpers/uriFriendlyFormat";
import { productions } from "../../../sampleData/testDb";
import hook from "../../../common/helpers/cssModulesHook";
hook();
import { Link, LinkProps } from "react-router-dom";
import { MediaBrowser, MediaBrowserProps } from "../MediaBrowser";
import MediaPreview from "../../../common/components/MediaPreview";
should();

import Presentation = Ropeho.Models.Presentation;
import Media = Ropeho.Models.Media;

describe("MediaBrowser component", () => {
    const presentations: Presentation[] = productions[0].medias.map<Presentation>((m: Media) => ({
        _id: m._id,
        mainMedia: m,
        href: uriFriendlyFormat(productions[0].name)
    }));
    describe("Element", () => {
        it("Should display all medias in clickable links", () => {
            const wrapper: ShallowWrapper<MediaBrowserProps, {}> = shallow(<MediaBrowser presentations={presentations} />);
            const links: ShallowWrapper<LinkProps, any> = wrapper.find(Link);
            links.should.have.lengthOf(presentations.length);
            links.find(MediaPreview).should.have.lengthOf(presentations.length);
        });
    });
});
