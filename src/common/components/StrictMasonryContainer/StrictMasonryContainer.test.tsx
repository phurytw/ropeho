/**
 * @file Tests for the StrictMasonryContainer
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import { should } from "chai";
import * as React from "react";
import { shallow, ShallowWrapper } from "enzyme";
import { v4 } from "uuid";
import { PresentationTypes } from "../../../enum";
import { StrictMasonryContainer, StrictMasonryContainerState, StrictMasonryContainerProps, defaultBlockSize } from "./StrictMasonryContainer";
import PresentationWithHref from "../PresentationWithHref";
should();

import Container = Ropeho.Models.PresentationContainer;
import Presentation = Ropeho.Models.Presentation;

describe("StrictMasonryContainer component", () => {
    const container: Container = {
        _id: v4(),
        type: PresentationTypes.StrictMasonry,
        presentations: [{
            _id: v4(),
            options: {
                columnSpan: 2,
                rowSpan: 1
            } as Ropeho.Models.StrictMasonryPresentationOptions,
            mainMedia: {
                _id: v4()
            }
        }, {
            _id: v4(),
            options: {
                columnSpan: 1,
                rowSpan: 2
            } as Ropeho.Models.StrictMasonryPresentationOptions,
            mainMedia: {
                _id: v4()
            }
        }, {
            _id: v4(),
            options: {
                columnSpan: 1,
                rowSpan: 2
            } as Ropeho.Models.StrictMasonryPresentationOptions,
            mainMedia: {
                _id: v4()
            }
        }, {
            _id: v4(),
            options: {
                columnSpan: 1,
                rowSpan: 1
            } as Ropeho.Models.StrictMasonryPresentationOptions,
            mainMedia: {
                _id: v4()
            }
        }, {
            _id: v4(),
            options: {
                columnSpan: 2,
                rowSpan: 1
            } as Ropeho.Models.StrictMasonryPresentationOptions,
            mainMedia: {
                _id: v4()
            }
        }]
    };
    describe("Element", () => {
        it("Should display presentations in rows", () => {
            const [aa, ba, bb, ca, cb]: Presentation[] = container.presentations;
            const wrapper: ShallowWrapper<StrictMasonryContainerProps, StrictMasonryContainerState> = shallow(<StrictMasonryContainer presentations={container.presentations} />);
            wrapper.findWhere((node: ShallowWrapper<any, any>) => {
                return node.type() === "div"
                    && node.children().length === 1
                    && node.children({ mainMedia: aa.mainMedia }).length === 1;
            }).should.have.lengthOf(1);
            wrapper.findWhere((node: ShallowWrapper<any, any>) => {
                return node.type() === "div"
                    && node.children().length === 2
                    && node.children({ mainMedia: ba.mainMedia }).length === 1
                    && node.children({ mainMedia: bb.mainMedia }).length === 1;
            }).should.have.lengthOf(1);
            wrapper.findWhere((node: ShallowWrapper<any, any>) => {
                return node.type() === "div"
                    && node.children().length === 2
                    && node.children({ mainMedia: ca.mainMedia }).length === 1
                    && node.children({ mainMedia: cb.mainMedia }).length === 1;
            }).should.have.lengthOf(1);
        });
        it("Should pass additional class names via props", () => {
            const containerClass: string = "containerClass";
            const presentationClass: string = "presentationClass";
            const wrapper: ShallowWrapper<StrictMasonryContainerProps, StrictMasonryContainerState> = shallow(<StrictMasonryContainer presentations={container.presentations}
                containerClassName={containerClass}
                presentationClassName={presentationClass}
            />);
            wrapper.hasClass("containerClass");
            wrapper.findWhere((node: ShallowWrapper<any, any>) => node.type() === PresentationWithHref
                && node.hasClass(presentationClass)).should.have.lengthOf(container.presentations.length);
        });
    });
    describe("Methods", () => {
        it("Should set the block size and the amount of blocks per row", () => {
            const wrapper: ShallowWrapper<StrictMasonryContainerProps, StrictMasonryContainerState> = shallow(<StrictMasonryContainer presentations={container.presentations} />);
            const instance: StrictMasonryContainer = wrapper.instance() as StrictMasonryContainer;
            instance.element = {
                clientWidth: 1000
            } as any;
            instance.setBlockSize();
            wrapper.state("blockSize").should.equal(1000 / Math.trunc(1000 / defaultBlockSize));
            wrapper.state("blocksPerRow").should.equal(Math.trunc(1000 / defaultBlockSize));
        });
        it("Should force the block size and rows from the props", () => {
            const blockSize: number = 10;
            const blocksPerRow: number = 100;
            const wrapper: ShallowWrapper<StrictMasonryContainerProps, StrictMasonryContainerState> = shallow(<StrictMasonryContainer presentations={container.presentations} blockSize={blockSize} blocksPerRow={blocksPerRow} />);
            const instance: StrictMasonryContainer = wrapper.instance() as StrictMasonryContainer;
            instance.element = {
                clientWidth: 1000
            } as any;
            instance.setBlockSize();
            wrapper.state("blockSize").should.equal(blockSize);
            wrapper.state("blocksPerRow").should.equal(blocksPerRow);
        });
        it("Should the element ref", () => {
            const wrapper: ShallowWrapper<StrictMasonryContainerProps, StrictMasonryContainerState> = shallow(<StrictMasonryContainer presentations={container.presentations} />);
            const instance: StrictMasonryContainer = wrapper.instance() as StrictMasonryContainer;
            const element: HTMLDivElement = document.createElement("div");
            instance.setRef(element);
            instance.element.should.equal(element);
        });
    });
    describe("Lifecycle", () => {
        it("Should set the block size after mounting", () => {
            const wrapper: ShallowWrapper<StrictMasonryContainerProps, StrictMasonryContainerState> = shallow(<StrictMasonryContainer presentations={container.presentations} />);
            const instance: StrictMasonryContainer = wrapper.instance() as StrictMasonryContainer;
            instance.element = {
                clientWidth: 1000
            } as any;
            instance.componentDidMount();
            wrapper.state("blockSize").should.equal(1000 / Math.trunc(1000 / defaultBlockSize));
            wrapper.state("blocksPerRow").should.equal(Math.trunc(1000 / defaultBlockSize));
        });
    });
});
