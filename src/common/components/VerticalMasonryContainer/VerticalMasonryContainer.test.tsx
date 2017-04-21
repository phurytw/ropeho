/**
 * @file Tests for the VerticalMasonryContainer
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import { should } from "chai";
import * as React from "react";
import { shallow, ShallowWrapper } from "enzyme";
import { v4 } from "uuid";
import { PresentationTypes } from "../../../enum";
import { VerticalMasonryContainer, VerticalMasonryContainerProps } from "./VerticalMasonryContainer";
import PresentationWithHref from "../PresentationWithHref";
should();

import Container = Ropeho.Models.PresentationContainer;

describe("VerticalMasonryContainer component", () => {
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
        it("Should display presentations", () => {
            const wrapper: ShallowWrapper<VerticalMasonryContainerProps, {}> = shallow(<VerticalMasonryContainer presentations={container.presentations} />);
            for (const p of container.presentations) {
                wrapper.findWhere((node: ShallowWrapper<any, any>) => node.type() === PresentationWithHref &&
                    node.prop("mainMedia") === p.mainMedia &&
                    node.prop("alternateMedia") === p.alternateMedia).should.have.lengthOf(1);
            }
        });
    });
});
