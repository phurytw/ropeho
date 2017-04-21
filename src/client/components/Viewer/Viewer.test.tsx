/**
 * @file Tests for the Viewer component
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import * as React from "react";
import { should, use } from "chai";
import * as sinonChai from "sinon-chai";
import { spy } from "sinon";
import { shallow, ShallowWrapper } from "enzyme";
import hook from "../../../common/helpers/cssModulesHook";
import { productions } from "../../../sampleData/testDb";
import { MediaPermissions, MediaTypes } from "../../../enum";
import { v4 } from "uuid";
hook();
import { Viewer, ViewerProps } from "./Viewer";
import MediaPreview from "../../../common/components/MediaPreview";
import MediaBrowser from "../MediaBrowser";
import ContainerRenderer from "../../../common/components/ContainerRenderer";
should();
use(sinonChai);

import Media = Ropeho.Models.Media;
import Presentation = Ropeho.Models.Presentation;

describe("Viewer component", () => {
    const props: ViewerProps = {
        match: {
            params: {
                productionName: productions[0].name,
                mediaNumber: "0"
            }
        }
    };
    const imageMedia: Media = {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "imgPrev",
            src: "imgSrc",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    };
    const videoMedia: Media = {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "videoFallback",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "videoPrev",
            src: "videoSrc",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Video
    };
    const slideshowMedia: Media = {
        _id: v4(),
        delay: 3,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "slidePrevA",
            src: "slideSrcA",
            zoom: 1
        }, {
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "slidePrevB",
            src: "slideSrcB",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Slideshow
    };
    const textMedia: Media = {
        _id: v4(),
        delay: 3,
        description: "Just a well written text",
        sources: [],
        state: MediaPermissions.Public,
        type: MediaTypes.Text
    };
    it("Should display the image in full screen in a img", () => {
        const wrapper: ShallowWrapper<ViewerProps, {}> = shallow(<Viewer {...props} medias={[imageMedia]} />);
        wrapper.find("img").find({ src: imageMedia.sources[0].preview }).should.have.lengthOf(1);
    });
    it("Should display the video in full screen in a video", () => {
        const wrapper: ShallowWrapper<ViewerProps, {}> = shallow(<Viewer {...props} medias={[videoMedia]} />);
        wrapper.find("video").find("source").find({ src: videoMedia.sources[0].preview }).should.have.lengthOf(1);
        wrapper.find("video").find("source").find({ src: videoMedia.sources[0].src }).should.have.lengthOf(1);
    });
    it("Should display the slideshow in full screen in a MediaPreview", () => {
        const wrapper: ShallowWrapper<ViewerProps, {}> = shallow(<Viewer {...props} medias={[slideshowMedia]} />);
        wrapper.find(MediaPreview).find({ media: slideshowMedia }).should.have.lengthOf(1);
    });
    it("Should display the text in full screen in a MediaPreview", () => {
        const wrapper: ShallowWrapper<ViewerProps, {}> = shallow(<Viewer {...props} medias={[textMedia]} />);
        wrapper.find(MediaPreview).find({ media: textMedia }).should.have.lengthOf(1);
    });
    it("Should display medias in a media browser via a container renderer", () => {
        const medias: Media[] = productions[0].medias;
        const wrapper: ShallowWrapper<ViewerProps, {}> = shallow(<Viewer {...props} medias={medias} />);
        const containerRenderer: ShallowWrapper<any, any> = wrapper.find(ContainerRenderer);
        containerRenderer.should.have.lengthOf(1);
        containerRenderer.prop("presentations").should.deep.equal(medias.map<Presentation>((m: Media, i: number) => ({
            _id: m._id,
            mainMedia: m,
            href: `/${productions[0].name}/${i}`
        })));
        containerRenderer.find(MediaBrowser).should.have.lengthOf(1);
    });
    it("Should go back to the production when closing", () => {
        const pushSpy: sinon.SinonSpy = spy();
        const medias: Media[] = productions[0].medias;
        const wrapper: ShallowWrapper<ViewerProps, {}> = shallow(<Viewer {...props} medias={medias} history={{ push: pushSpy } as any} />);
        const instance: Viewer = wrapper.instance() as Viewer;
        instance.close();
        pushSpy.should.have.been.calledOnce;
        pushSpy.should.have.been.calledWith(`/${productions[0].name}`);
    });
});
