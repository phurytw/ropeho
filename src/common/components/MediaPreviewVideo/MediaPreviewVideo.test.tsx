/**
 * @file Tests for the MediaPreviewVideo component
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../../test.d.ts" />
import { should, use } from "chai";
import { stub, spy } from "sinon";
import * as sinonChai from "sinon-chai";
import * as React from "react";
import { shallow, ShallowWrapper } from "enzyme";
import { MediaPreviewVideo } from "./MediaPreviewVideo";
import { MediaPreviewProps } from "../MediaPreviewCore";
import { video } from "../../../sampleData/testMedias";
should();
use(sinonChai);

describe("MediaPreviewVideo component", () => {
    describe("Source handler", () => {
        it("Should set a source's dimensions", (done: MochaDone) => {
            const setDimensionsSpy: sinon.SinonSpy = spy(() => {
                addEventListenerStub.restore();
                done();
            });
            const videoElement: HTMLVideoElement = document.createElement("video");
            const addEventListenerStub: sinon.SinonStub = stub(videoElement.constructor.prototype, "addEventListener")
                .callsFake((event: string, handler: Function) => {
                    if (event === "loadedmetadata") {
                        handler();
                    }
                });
            shallow(<MediaPreviewVideo
                source={{ _id: "sourceId", posX: 0, posY: 0, zoom: 0, preview: `data:image/png;base64, ${video}` }}
                setDimensions={setDimensionsSpy}
            />);
        });
    });
    describe("Lifecycle", () => {
        it("Should set source dimensions when mounting", () => {
            const wrapper: ShallowWrapper<MediaPreviewProps, {}> = shallow(<MediaPreviewVideo />);
            const instance: MediaPreviewVideo = wrapper.instance() as MediaPreviewVideo;
            const loadSourceStub: sinon.SinonStub = stub(instance, "loadSource");
            instance.componentWillMount();
            loadSourceStub.should.have.been.calledOnce;
        });
        it("Should set source dimensions when receiving a new source", () => {
            const wrapper: ShallowWrapper<MediaPreviewProps, {}> = shallow(<MediaPreviewVideo source={{ _id: "sourceId" }} />);
            const instance: MediaPreviewVideo = wrapper.instance() as MediaPreviewVideo;
            const loadSourceStub: sinon.SinonStub = stub(instance, "loadSource");
            instance.componentWillReceiveProps({ source: { _id: "anotherSourceId", posX: 0, posY: 0, preview: "", zoom: 1 } });
            loadSourceStub.should.have.been.calledOnce;
        });
        it("Should disable auto zoom when mounting with noFit", () => {
            const shouldFitSpy: sinon.SinonSpy = spy();
            shallow(<MediaPreviewVideo shouldFit={shouldFitSpy} noFit />);
            shouldFitSpy.should.have.been.calledOnce;
            shouldFitSpy.should.have.been.calledWith(false);
        });
        it("Should set auto zoom when updating with a new noFit value", () => {
            const shouldFitSpy: sinon.SinonSpy = spy();
            const wrapper: ShallowWrapper<MediaPreviewProps, {}> = shallow(<MediaPreviewVideo shouldFit={shouldFitSpy} noFit />);
            const instance: MediaPreviewVideo = wrapper.instance() as MediaPreviewVideo;
            shouldFitSpy.should.have.been.calledOnce;
            shouldFitSpy.should.have.been.calledWith(false);
            instance.componentWillReceiveProps({ noFit: false });
            shouldFitSpy.should.have.been.calledTwice;
            shouldFitSpy.should.have.been.calledWith(true);
        });
    });
});
