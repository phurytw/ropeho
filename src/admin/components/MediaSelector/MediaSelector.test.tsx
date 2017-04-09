/**
 * @file Tests for the MediaSelector component
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../../test.d.ts" />
import { should, use } from "chai";
import { spy } from "sinon";
import * as sinonChai from "sinon-chai";
import * as React from "react";
import { shallow, ShallowWrapper } from "enzyme";
import { MediaSelectorProps, default as MediaSelector } from "./MediaSelector";
import { productions } from "../../../sampleData/testDb";
import { isUUID } from "validator";
import MediaPreview from "../../../common/components/MediaPreview";
import MediaSelectorButtons from "../MediaSelectorButtons";
should();
use(sinonChai);

import Production = Ropeho.Models.Production;
import Media = Ropeho.Models.Media;

describe("Media selector component", () => {
    const production: Production = productions[0];
    const [mediaA, mediaB, mediaC]: Media[] = production.medias;
    describe("Element", () => {
        it("Should show a preview of each media in the production", () => {
            const wrapper: ShallowWrapper<MediaSelectorProps, {}> = shallow(<MediaSelector
                medias={production.medias}
            />);
            wrapper.find(MediaPreview).should.have.lengthOf(production.medias.length);
        });
        it("Should show an additional element to create a media", () => {
            const wrapper: ShallowWrapper<MediaSelectorProps, {}> = shallow(<MediaSelector
                medias={production.medias}
            />);
            const instance: MediaSelector = wrapper.instance() as MediaSelector;
            wrapper.find({ onClick: instance.createMedia }).should.have.lengthOf(1);
        });
        it("Should have buttons showing for the selected media", () => {
            const wrapper: ShallowWrapper<MediaSelectorProps, {}> = shallow(<MediaSelector
                medias={production.medias}
                selectedMedia={production.medias[0]}
            />);
            wrapper.find(MediaSelectorButtons).should.have.lengthOf(1);
        });
    });
    describe("Methods", () => {
        it("Should create a new media", () => {
            const setMediaSpy: sinon.SinonSpy = spy();
            const instance: MediaSelector = shallow(<MediaSelector setMedia={setMediaSpy} medias={production.medias} />).instance() as MediaSelector;
            instance.createMedia();
            setMediaSpy.should.have.been.calledOnce;
            const media: Media = setMediaSpy.getCall(0).args[0];
            isUUID(media._id, 4).should.be.true;
        });
        it("Should select a media", () => {
            const selectMediaSpy: sinon.SinonSpy = spy();
            const instance: MediaSelector = shallow(<MediaSelector selectMedia={selectMediaSpy} medias={production.medias} />).instance() as MediaSelector;
            instance.selectMedia(mediaC);
            selectMediaSpy.should.have.been.calledOnce;
            selectMediaSpy.should.have.been.calledWith(mediaC._id);
        });
        it("Should move a media up a position", () => {
            const setMediaPositionSpy: sinon.SinonSpy = spy();
            const instance: MediaSelector = shallow(<MediaSelector setMediaPosition={setMediaPositionSpy} medias={production.medias} selectedMedia={mediaB} />).instance() as MediaSelector;
            instance.moveMediaUp();
            setMediaPositionSpy.should.have.been.calledOnce;
            setMediaPositionSpy.should.have.been.calledWith(mediaB._id, 0);
        });
        it("Should move a source down a position", () => {
            const setMediaPositionSpy: sinon.SinonSpy = spy();
            const instance: MediaSelector = shallow(<MediaSelector setMediaPosition={setMediaPositionSpy} medias={production.medias} selectedMedia={mediaA} />).instance() as MediaSelector;
            instance.moveMediaDown();
            setMediaPositionSpy.should.have.been.calledOnce;
            setMediaPositionSpy.should.have.been.calledWith(mediaA._id, 1);
        });
    });
});
