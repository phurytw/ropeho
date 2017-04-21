/**
 * @file Tests for the media dimensions utility functions
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import { Dimensions, getImageDimensions, getVideoDimensions, getMediaDimensions } from "./mediaDimensionsUtilities";
import * as mediaLoadingModule from "./mediaDimensionsUtilities";
import { image, video } from "../../sampleData/testMedias";
import { should, use } from "chai";
import * as sinonChai from "sinon-chai";
import { stub } from "sinon";
import { MediaTypes } from "../../enum";
should();
use(sinonChai);

describe("Media dimensions utility functions", () => {
    describe("Getting dimensions", () => {
        it("Should get the dimensions for an image", async () => {
            const dimensions: Dimensions = await getImageDimensions(`data:image/png;base64, ${image}`);
            (typeof dimensions.width).should.equal("number");
            (typeof dimensions.height).should.equal("number");
        });
        it("Should get the dimensions for a video", async () => {
            const videoElement: HTMLVideoElement = document.createElement("video");
            const addEventListenerStub: sinon.SinonStub = stub(videoElement.constructor.prototype, "addEventListener")
                .callsFake((event: string, handler: Function) => {
                    if (event === "loadedmetadata") {
                        handler();
                    }
                });
            const dimensions: Dimensions = await getVideoDimensions(`data:video/mp4;base64, ${video}`);
            addEventListenerStub.should.have.been.calledOnce;
            addEventListenerStub.restore();
            (typeof dimensions.width).should.equal("number");
            (typeof dimensions.height).should.equal("number");
        });
    });
    describe("Combining values", () => {
        it("Should get the dimensions of a media (image)", async () => {
            const getImageDimensionsStub: sinon.SinonStub = stub(mediaLoadingModule, "getImageDimensions")
                .callsFake(() => Promise.resolve<Dimensions>({
                    width: 300,
                    height: 100
                }));
            const dimensions: Dimensions = await getMediaDimensions({
                sources: [{}],
                type: MediaTypes.Image
            });
            getImageDimensionsStub.should.have.been.calledOnce;
            getImageDimensionsStub.restore();
            dimensions.should.have.property("width", 300);
            dimensions.should.have.property("height", 100);
        });
        it("Should get the dimensions of a media (video)", async () => {
            const getVideoDimensionsStub: sinon.SinonStub = stub(mediaLoadingModule, "getVideoDimensions")
                .callsFake(() => Promise.resolve<Dimensions>({
                    width: 300,
                    height: 100
                }));
            const dimensions: Dimensions = await getMediaDimensions({
                sources: [{}],
                type: MediaTypes.Video
            });
            getVideoDimensionsStub.should.have.been.calledOnce;
            getVideoDimensionsStub.restore();
            dimensions.should.have.property("width", 300);
            dimensions.should.have.property("height", 100);
        });
        it("Should get the smallest dimensions possible out of multiple sources", async () => {
            const getImageDimensionsStub: sinon.SinonStub = stub(mediaLoadingModule, "getImageDimensions")
                .callsFake(() => {
                    const callCount: number = getImageDimensionsStub.callCount;
                    let dimensions: Dimensions;
                    switch (callCount) {
                        case 0:
                            dimensions = {
                                width: 300,
                                height: 100
                            };
                            break;
                        case 1:
                            dimensions = {
                                width: 50,
                                height: 150
                            };
                            break;
                        case 2:
                            dimensions = {
                                width: 200,
                                height: 150
                            };
                            break;
                        default:
                            dimensions = {
                                width: 400,
                                height: 100
                            };
                            break;
                    }
                    return Promise.resolve<Dimensions>(dimensions);
                });
            const dimensions: Dimensions = await getMediaDimensions({
                sources: [{}, {}, {}, {}, {}],
                type: MediaTypes.Slideshow
            });
            getImageDimensionsStub.callCount.should.equal(5);
            getImageDimensionsStub.restore();
            dimensions.should.have.property("width", 50);
            dimensions.should.have.property("height", 100);
        });
        it("Should get the smallest dimensions out of multiple medias", async () => {
            const getImageDimensionsStub: sinon.SinonStub = stub(mediaLoadingModule, "getImageDimensions")
                .callsFake(() => {
                    const callCount: number = getImageDimensionsStub.callCount;
                    let dimensions: Dimensions;
                    switch (callCount) {
                        case 0:
                            dimensions = {
                                width: 300,
                                height: 100
                            };
                            break;
                        case 1:
                            dimensions = {
                                width: 50,
                                height: 150
                            };
                            break;
                        case 2:
                            dimensions = {
                                width: 200,
                                height: 150
                            };
                            break;
                        default:
                            dimensions = {
                                width: 400,
                                height: 100
                            };
                            break;
                    }
                    return Promise.resolve<Dimensions>(dimensions);
                });
            const dimensions: Dimensions = await getMediaDimensions([{
                sources: [{}, {}],
                type: MediaTypes.Slideshow
            }, {
                sources: [{}, {}],
                type: MediaTypes.Slideshow
            }]);
            getImageDimensionsStub.callCount.should.equal(4);
            getImageDimensionsStub.restore();
            dimensions.should.have.property("width", 50);
            dimensions.should.have.property("height", 100);
        });
    });
});
