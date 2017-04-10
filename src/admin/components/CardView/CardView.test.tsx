/**
 * @file Tests for the CardView component
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import { should } from "chai";
import * as React from "react";
import { shallow, ShallowWrapper } from "enzyme";
import hook from "../../../common/helpers/cssModulesHook";
hook();
import { CardViewProps, default as CardView } from "./CardView";
should();

describe("CardView component", () => {
    it("Should render childrens", () => {
        const text: string = "Hey !!";
        const wrapper: ShallowWrapper<CardViewProps, {}> = shallow(<CardView>
            <p>{text}</p>
        </CardView>);
        wrapper.find("p").text().should.equal(text);
    });
});
