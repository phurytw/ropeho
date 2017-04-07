/**
 * @file Tests for the MediaPreviewPointer component
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../../test.d.ts" />
import { should, use } from "chai";
import { stub, spy } from "sinon";
import * as sinonChai from "sinon-chai";
import * as React from "react";
import { shallow, ShallowWrapper, mount, ReactWrapper } from "enzyme";
import hook from "../../../common/helpers/cssModulesHook";
hook();
import { MediaPreviewPointer, MediaPreviewPointerProps } from "./MediaPreviewPointer";
import { image, video } from "../../../sampleData/testMedias";
import { MediaTypes } from "../../../enum";
import Pointer from "../Pointer";
should();
use(sinonChai);

import Source = Ropeho.Models.Source;

describe("MediaPreviewPointer component", () => {
    describe("Pointer positionning", () => {
        it("Should have a properly positionned pointer", () => {
            const props: MediaPreviewPointerProps = {
                source: {
                    _id: "sourceId",
                    posX: 350,
                    posY: 50,
                    zoom: 1,
                    preview: `data:image/png;base64, ${image}`
                },
                type: MediaTypes.Image,
                width: 800,
                height: 600,
                offsetX: 300,
                offsetY: 0
            };
            const wrapper: ReactWrapper<MediaPreviewPointerProps, {}> = mount(<MediaPreviewPointer {...props} />);
            const instance: MediaPreviewPointer = wrapper.instance() as MediaPreviewPointer;
            (instance as any).element = {
                clientHeight: 100,
                clientWidth: 100
            };
            wrapper.findWhere((pointer: ReactWrapper<any, any>) => {
                const style: React.CSSProperties = pointer.prop("style");
                return pointer.type() === Pointer && style && style.top === "50px" && style.left === "50px";
            }).should.have.lengthOf(1);
        });
        it("Should place the pointer according to the zoom", () => {
            const props: MediaPreviewPointerProps = {
                source: {
                    _id: "sourceId",
                    posX: 400,
                    posY: 50,
                    zoom: 2,
                    preview: `data:image/png;base64, ${image}`
                },
                type: MediaTypes.Image,
                width: 800,
                height: 600,
                offsetX: 750,
                offsetY: 50
            };
            const wrapper: ReactWrapper<MediaPreviewPointerProps, {}> = mount(<MediaPreviewPointer {...props} />);
            const instance: MediaPreviewPointer = wrapper.instance() as MediaPreviewPointer;
            (instance as any).element = {
                clientHeight: 100,
                clientWidth: 100
            };
            wrapper.findWhere((pointer: ReactWrapper<any, any>) => {
                const style: React.CSSProperties = pointer.prop("style");
                return pointer.type() === Pointer && style && style.top === "50px" && style.left === "50px";
            }).should.have.lengthOf(1);
        });
    });
    describe("Source handler", () => {
        it("Should set a source's dimensions from an image", (done: MochaDone) => {
            const setDimensionsSpy: sinon.SinonSpy = spy(() => done());
            shallow(<MediaPreviewPointer
                source={{ _id: "sourceId", posX: 0, posY: 0, zoom: 1, preview: `data:image/png;base64, ${image}` }}
                setDimensions={setDimensionsSpy}
                type={MediaTypes.Image}
            />);
        });
        it("Should set a source's dimensions from a video", (done: MochaDone) => {
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
            shallow(<MediaPreviewPointer
                source={{ _id: "sourceId", posX: 0, posY: 0, zoom: 1, preview: `data:image/png;base64, ${video}` }}
                setDimensions={setDimensionsSpy}
                type={MediaTypes.Video}
            />);
        });
    });
    describe("Setting POI", () => {
        it("Should have an onClick event listener", () => {
            const wrapper: ShallowWrapper<MediaPreviewPointerProps, {}> = shallow(<MediaPreviewPointer source={{
                _id: "sourceId",
                posX: 350,
                posY: 50,
                zoom: 1,
                preview: `data:image/png;base64, ${image}`
            }} />);
            const instance: MediaPreviewPointer = wrapper.instance() as MediaPreviewPointer;
            wrapper.find("div").first().prop("onClick").should.equal(instance.setPOI);
        });
        it("Should clicking should update the source with the new POI", () => {
            const source: Source = {
                _id: "sourceId",
                posX: 400,
                posY: 50,
                zoom: 2,
                preview: `data:image/png;base64, ${image}`
            };
            const setSourceSpy: sinon.SinonSpy = spy();
            const props: MediaPreviewPointerProps = {
                source,
                type: MediaTypes.Image,
                width: 800,
                height: 600,
                offsetX: 750,
                offsetY: 50,
                setSource: setSourceSpy
            };
            const wrapper: ReactWrapper<MediaPreviewPointerProps, {}> = mount(<MediaPreviewPointer {...props} />);
            const instance: MediaPreviewPointer = wrapper.instance() as MediaPreviewPointer;
            (instance as any).element = {
                clientHeight: 100,
                clientWidth: 100,
                getBoundingClientRect: () => ({
                    left: 0,
                    top: 0
                })
            };
            wrapper.simulate("click", {
                clientX: 100,
                clientY: 50
            });
            setSourceSpy.should.have.been.calledOnce;
            setSourceSpy.should.have.been.calledWith({
                ...source,
                posX: 425,
                posY: 50
            });
        });
    });
    describe("Zooming", () => {
        it("Should have an onWheel event listener", () => {
            const wrapper: ShallowWrapper<MediaPreviewPointerProps, {}> = shallow(<MediaPreviewPointer source={{
                _id: "sourceId",
                posX: 350,
                posY: 50,
                zoom: 1,
                preview: `data:image/png;base64, ${image}`
            }} />);
            const instance: MediaPreviewPointer = wrapper.instance() as MediaPreviewPointer;
            wrapper.find("div").first().prop("onWheel").should.equal(instance.setZoom);
        });
        it("Should zoom out when scrolling down", () => {
            const source: Source = {
                _id: "sourceId",
                posX: 350,
                posY: 50,
                zoom: 1,
                preview: `data:image/png;base64, ${image}`
            };
            const setSourceSpy: sinon.SinonSpy = spy();
            const wrapper: ShallowWrapper<MediaPreviewPointerProps, {}> = shallow(<MediaPreviewPointer source={source}
                setSource={setSourceSpy} />);
            const instance: MediaPreviewPointer = wrapper.instance() as MediaPreviewPointer;
            instance.setZoom({
                deltaY: 1,
                preventDefault: () => ({})
            } as any);
            setSourceSpy.should.have.been.calledOnce;
            setSourceSpy.should.have.been.calledWith({
                ...source,
                zoom: 0.9
            });
        });
        it("Should zoom out when scrolling up", () => {
            const source: Source = {
                _id: "sourceId",
                posX: 350,
                posY: 50,
                zoom: 1,
                preview: `data:image/png;base64, ${image}`
            };
            const setSourceSpy: sinon.SinonSpy = spy();
            const wrapper: ShallowWrapper<MediaPreviewPointerProps, {}> = shallow(<MediaPreviewPointer source={source}
                setSource={setSourceSpy} />);
            const instance: MediaPreviewPointer = wrapper.instance() as MediaPreviewPointer;
            instance.setZoom({
                deltaY: -1,
                preventDefault: () => ({})
            } as any);
            setSourceSpy.should.have.been.calledOnce;
            setSourceSpy.should.have.been.calledWith({
                ...source,
                zoom: 1.1
            });
        });
    });
    describe("Lifecycle", () => {
        it("Should set source dimensions when mounting", () => {
            const wrapper: ShallowWrapper<MediaPreviewPointerProps, {}> = shallow(<MediaPreviewPointer />);
            const instance: MediaPreviewPointer = wrapper.instance() as MediaPreviewPointer;
            const loadSourceStub: sinon.SinonStub = stub(instance, "loadSource");
            instance.componentWillMount();
            loadSourceStub.should.have.been.calledOnce;
        });
        it("Should set source dimensions when receiving a new source", () => {
            const wrapper: ShallowWrapper<MediaPreviewPointerProps, {}> = shallow(<MediaPreviewPointer
                source={{ _id: "sourceId" }}
            />);
            const instance: MediaPreviewPointer = wrapper.instance() as MediaPreviewPointer;
            const loadSourceStub: sinon.SinonStub = stub(instance, "loadSource");
            instance.componentWillReceiveProps({ source: { _id: "anotherSourceId", posX: 0, posY: 0, preview: "", zoom: 1 } });
            loadSourceStub.should.have.been.calledOnce;
        });
    });
});
