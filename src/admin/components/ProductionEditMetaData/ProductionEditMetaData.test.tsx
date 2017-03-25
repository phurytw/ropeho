/**
 * @file Tests for the ProductionEditMetaData component
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../../test.d.ts" />
import { should, use } from "chai";
import { spy } from "sinon";
import * as sinonChai from "sinon-chai";
import * as React from "react";
import { shallow, ShallowWrapper } from "enzyme";
import hook from "../../helpers/cssModulesHook";
hook();
import { ProductionEditMetaData, ProductionEditMetaDataProps } from "./ProductionEditMetaData";
import { Input, Dropdown } from "react-toolbox";
should();
use(sinonChai);

describe("Production Edit Metadata component", () => {
    const production: Ropeho.Models.Production = {
        description: "desc",
        name: "name",
        state: 0
    };
    const setProductionSpy: sinon.SinonSpy = spy();
    const props: ProductionEditMetaDataProps = {
        production,
        setProduction: setProductionSpy
    };
    afterEach(() => setProductionSpy.reset());
    it("Should have an input for the name", () => {
        const wrapper: ShallowWrapper<ProductionEditMetaDataProps, {}> = shallow(<ProductionEditMetaData {...props} />);
        const input: ShallowWrapper<any, {}> = wrapper.find(Input).find({ label: "Nom" });
        input.should.have.lengthOf(1);
        input.prop("onChange").should.equal((wrapper.instance() as ProductionEditMetaData).setName);
    });
    it("Should have an input for the description", () => {
        const wrapper: ShallowWrapper<ProductionEditMetaDataProps, {}> = shallow(<ProductionEditMetaData {...props} />);
        const input: ShallowWrapper<any, {}> = wrapper.find(Input).find({ label: "Description" });
        input.should.have.lengthOf(1);
        input.prop("onChange").should.equal((wrapper.instance() as ProductionEditMetaData).setDescription);
    });
    it("Should have a drop for the media permissions", () => {
        const wrapper: ShallowWrapper<ProductionEditMetaDataProps, {}> = shallow(<ProductionEditMetaData {...props} />);
        const input: ShallowWrapper<any, {}> = wrapper.find(Dropdown).find({ label: "Accès" });
        input.should.have.lengthOf(1);
        input.prop("source").should.have.lengthOf(3);
        input.prop("onChange").should.equal((wrapper.instance() as ProductionEditMetaData).setMediaPermissions);
    });
});
