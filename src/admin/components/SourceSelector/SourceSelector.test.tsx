/**
 * @file Tests for the SourceSelector component
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../../test.d.ts" />
import { should, use } from "chai";
import { spy } from "sinon";
import * as sinonChai from "sinon-chai";
import * as React from "react";
import { shallow, ShallowWrapper } from "enzyme";
import { default as SourceSelector } from "./SourceSelector";
import SourceInterface from "../SourceInterface";
import { MediaTypes } from "../../../enum";
import { productions } from "../../../sampleData/testDb";
import { isUUID } from "validator";
should();
use(sinonChai);

import Source = Ropeho.Models.Source;
import Media = Ropeho.Models.Media;

describe("Source selector component", () => {
    const imgMedia: Media = productions[0].banner;
    const imgSource: Source = imgMedia.sources[0];
    const videoMedia: Media = productions[0].medias[1];
    const videoSource: Source = videoMedia.sources[0];
    describe("Element", () => {
        it("Should show nothing if it's a media of type text", () => {
            shallow(<SourceSelector sources={[imgSource]}
                media={{
                    _id: "idmedia",
                    type: MediaTypes.Text
                }} />).find(SourceInterface).should.have.lengthOf(0);
        });
        it("Should show one source interface if type is image but there is no source", () => {
            const sourceInterface: ShallowWrapper<any, {}> = shallow(<SourceSelector sources={[]}
                media={{
                    _id: "idmedia",
                    type: MediaTypes.Image
                }} />).find(SourceInterface);
            sourceInterface.should.have.lengthOf(1);
            should().not.exist(sourceInterface.prop("source"));
        });
        it("Should show the exisiting source if type is image", () => {
            const sourceInterface: ShallowWrapper<any, {}> = shallow(<SourceSelector sources={[imgSource]}
                media={imgMedia} />).find(SourceInterface);
            sourceInterface.should.have.lengthOf(1);
            sourceInterface.prop("source").should.equal(imgSource);
        });
        it("Should show one source interface if type is video but there is no source", () => {
            const sourceInterface: ShallowWrapper<any, {}> = shallow(<SourceSelector sources={[]}
                media={{
                    _id: "idmedia",
                    type: MediaTypes.Video
                }} />).find(SourceInterface);
            sourceInterface.should.have.lengthOf(1);
            should().not.exist(sourceInterface.prop("source"));
        });
        it("Should show the exisiting source if type is video", () => {
            const sourceInterface: ShallowWrapper<any, {}> = shallow(<SourceSelector sources={[videoSource]}
                media={videoMedia} />).find(SourceInterface);
            sourceInterface.should.have.lengthOf(1);
            sourceInterface.prop("source").should.equal(videoSource);
        });
    });
    describe("Methods", () => {
        it("Should set the source with the new URL", () => {
            const setSourceSpy: sinon.SinonSpy = spy();
            const instance: SourceSelector = shallow(<SourceSelector setSource={setSourceSpy} />).instance() as SourceSelector;
            const newUrl: string = "newUrl";
            instance.setFromUrl(imgSource, newUrl);
            setSourceSpy.should.have.been.calledOnce;
            setSourceSpy.should.have.been.calledWith({
                ...imgSource,
                preview: newUrl
            });
        });
        it("Should set the source with the new URL on a new source", () => {
            const setSourceSpy: sinon.SinonSpy = spy();
            const instance: SourceSelector = shallow(<SourceSelector setSource={setSourceSpy} />).instance() as SourceSelector;
            const newUrl: string = "newUrl";
            instance.setFromUrl(undefined, newUrl);
            setSourceSpy.should.have.been.calledOnce;
            const source: Source = setSourceSpy.getCall(0).args[0];
            source.preview.should.equal(newUrl);
            isUUID(source._id, 4).should.be.true;
        });
        it("Should move a source up a position", () => {
            const setSourcePositionSpy: sinon.SinonSpy = spy();
            const instance: SourceSelector = shallow(<SourceSelector setSourcePosition={setSourcePositionSpy} sources={[videoSource, imgSource]} />).instance() as SourceSelector;
            instance.moveSourceUp(imgSource._id);
            setSourcePositionSpy.should.have.been.calledOnce;
            setSourcePositionSpy.should.have.been.calledWith(imgSource._id, 0);
        });
        it("Should move a source down a position", () => {
            const setSourcePositionSpy: sinon.SinonSpy = spy();
            const instance: SourceSelector = shallow(<SourceSelector setSourcePosition={setSourcePositionSpy} sources={[videoSource, imgSource]} />).instance() as SourceSelector;
            instance.moveSourceDown(videoSource._id);
            setSourcePositionSpy.should.have.been.calledOnce;
            setSourcePositionSpy.should.have.been.calledWith(videoSource._id, 1);
        });
    });
});
