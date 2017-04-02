/**
 * @file Tests for the Production New component
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../../test.d.ts" />
import * as React from "react";
import { should, use } from "chai";
import { spy } from "sinon";
import { shallow, ShallowWrapper } from "enzyme";
import * as chaiEnzyme from "chai-enzyme";
import hook from "../../../common/helpers/cssModulesHook";
hook();
import ProductionNew from "./ProductionNew";
import { Input } from "react-toolbox";
should();
use(chaiEnzyme);

describe("Production New compoennt", () => {
    it("Should show a form with inputs for name and description", () => {
        shallow(<ProductionNew />).find(Input).findWhere((node: ShallowWrapper<any, {}>) => node.prop("label") === "Nom").should.have.lengthOf(1);
        shallow(<ProductionNew />).find(Input).findWhere((node: ShallowWrapper<any, {}>) => node.prop("label") === "Description").should.have.lengthOf(1);
    });
    it("Should have a onSubmit handler", () => {
        const form: ShallowWrapper<any, {}> = shallow(<ProductionNew />).find("form");
        form.should.have.lengthOf(1);
        (typeof form.prop("onSubmit")).should.equal("function");
    });
    it("Should create an empty production with the name and description taken from the inputs", () => {
        const createSpy: sinon.SinonSpy = spy((production: Ropeho.Models.Production) => Promise.resolve());
        const component: ProductionNew = shallow(<ProductionNew createProduction={createSpy} />).instance() as ProductionNew;
        component.name = "name";
        component.description = "desc";
        component.createProduction();
        createSpy.should.have.been.calledWith({
            name: component.name,
            description: component.description
        });
    });
});
