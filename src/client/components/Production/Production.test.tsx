/**
 * @file Tests for the Production component
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import { should } from "chai";
import * as React from "react";
import { shallow, ShallowWrapper, mount, ReactWrapper } from "enzyme";
import { productions } from "../../../sampleData/testDb";
import ContainerRenderer from "../../../common/components/ContainerRenderer";
import { StaticRouter } from "react-router-dom";
import hook from "../../../common/helpers/cssModulesHook";
hook();
import { Production, ProductionProps } from "./Production";
import Viewer from "../Viewer";
import Banner from "../../../common/components/Banner";
should();

describe("Production component", () => {
    const [production]: Ropeho.Models.Production[] = productions;
    const props: ProductionProps = {
        production,
        match: {
            params: {
                productionName: production.name
            },
            isExact: false,
            path: "",
            url: ""
        }
    };
    describe("Element", () => {
        it("Should display a banner", () => {
            const wrapper: ShallowWrapper<ProductionProps, {}> = shallow(<Production {...props} />);
            wrapper.find(Banner).find({
                banner: production.banner,
                background: production.background
            }).should.have.lengthOf(1);
        });
        it("Should render all medias in a container renderer", () => {
            const wrapper: ShallowWrapper<ProductionProps, {}> = shallow(<Production {...props} />);
            const containerRenderer: ShallowWrapper<any, any> = wrapper.find(ContainerRenderer);
            containerRenderer.should.have.lengthOf(1);
            containerRenderer.prop("presentations").should.have.lengthOf(production.medias.length);
        });
        it("Should display the currently viewed media", () => {
            const wrapper: ReactWrapper<ProductionProps, {}> = mount(<StaticRouter location={`/${production.name}/0`} context={{}}>
                <Production {...props} />
            </StaticRouter>);
            wrapper.find(Viewer).should.have.lengthOf(1);
        });
    });
});
