/**
 * @file Tests for the ProductionEdit component
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../../test.d.ts" />
import { should, use } from "chai";
import * as sinonChai from "sinon-chai";
import * as chaiEnzyme from "chai-enzyme";
import { shallow, ShallowWrapper } from "enzyme";
import { stub, spy } from "sinon";
import * as React from "react";
import { productions } from "../../../sampleData/testDb";
import { ProductionEditState } from "../../modules/productionEdit";
import * as productionEditModule from "../../modules/productionEdit";
import { IStore, default as mockStore } from "redux-mock-store";
import { RopehoAdminState, initialState } from "../../reducer";
import * as selectors from "../../selectors";
import { middlewares } from "../../store";
import hook from "../../helpers/cssModulesHook";
hook();
import { ProductionEdit, ProductionEditProps, mapStateToProps, mapDispatchToProps } from "./ProductionEdit";
import { Button } from "react-toolbox";
should();
use(sinonChai);
use(chaiEnzyme);

describe("Production Edit component", () => {
    const production: Ropeho.Models.Production = productions[0];
    let store: IStore<RopehoAdminState>;
    let dispatchStub: sinon.SinonStub;
    const props: ProductionEditProps = {
        fetchProduction: (): Promise<productionEditModule.Actions.SetProduction> => Promise.resolve<productionEditModule.Actions.SetProduction>({
            type: productionEditModule.ActionTypes.SET_PRODUCTION,
            production
        }),
        production,
        match: {
            params: {
                productionId: "id"
            }
        }
    };
    before(() => {
        store = mockStore<RopehoAdminState>(middlewares())(initialState);
        dispatchStub = stub(store, "dispatch");
    });
    afterEach(() => store.clearActions());
    describe("Element", () => {
        describe("Header", () => {
            it("Should display the production title", () =>
                shallow(<ProductionEdit {...props} />).findWhere((node: ShallowWrapper<any, {}>) => node.type() === "h2" && node.text() === production.name).should.have.lengthOf(1));
            it("Should display an save changes button", () => {
                const wrapper: ShallowWrapper<any, {}> = shallow(<ProductionEdit {...props} />);
                const instance: ProductionEdit = wrapper.instance() as ProductionEdit;
                wrapper.find(Button).find({ onClick: instance.promptSave }).should.have.lengthOf(1);
            });
            it("Should display an delete button", () => {
                const wrapper: ShallowWrapper<any, {}> = shallow(<ProductionEdit {...props} />);
                const instance: ProductionEdit = wrapper.instance() as ProductionEdit;
                wrapper.find(Button).find({ onClick: instance.promptDelete }).should.have.lengthOf(1);
            });
        });
    });
    describe("Props", () => {
        it("Should get the production being edited from the state", () => {
            const fetchSpy: sinon.SinonSpy = spy(selectors, "getProduction");
            mapStateToProps({
                ...store.getState(),
                productionEdit: new ProductionEditState({
                    production: production
                })
            }).production.should.deep.equal(production);
            fetchSpy.should.have.been.calledOnce;
            fetchSpy.restore();
        });
        it("Should get if the application has been rendered from the server from the state", () => {
            const getHasRenderedSpy: sinon.SinonSpy = spy(selectors, "getHasRendered");
            mapStateToProps(store.getState());
            getHasRenderedSpy.should.have.been.calledOnce;
            getHasRenderedSpy.restore();
        });
        it("Should be able to fetch a single production", () => {
            const fetchSpy: sinon.SinonSpy = stub(productionEditModule, "fetchProductionById");
            mapDispatchToProps(dispatchStub).fetchProduction("id");
            fetchSpy.should.have.been.calledOnce;
            fetchSpy.restore();
        });
        it("Should be able to save modifications made to a production", () => {
            const updateSpy: sinon.SinonSpy = stub(productionEditModule, "updateProduction");
            mapDispatchToProps(dispatchStub).updateProduction({});
            updateSpy.should.have.been.calledOnce;
            updateSpy.restore();
        });
        it("Should be able to delete a production", () => {
            const deleteSpy: sinon.SinonSpy = stub(productionEditModule, "deleteProduction");
            mapDispatchToProps(dispatchStub).deleteProduction("id");
            deleteSpy.should.have.been.calledOnce;
            deleteSpy.restore();
        });
    });
    describe("Lifecycle", () => {
        it("Should fetch the production on initial render", () => {
            const getProduction: sinon.SinonSpy = spy();
            const props: ProductionEditProps = {
                fetchProduction: (id: string): Promise<productionEditModule.Actions.SetProduction> => {
                    getProduction(id);
                    return Promise.resolve({});
                },
                match: {
                    params: {
                        productionId: "id"
                    }
                }
            };
            shallow(<ProductionEdit {...props} />);
            getProduction.should.have.been.calledOnce;
            getProduction.should.have.been.calledWith("id");
        });
    });
    describe("Server side fetching", () => {
        it("Should fetch productions using the static fetch", () => {
            const fetchProductionsStub: sinon.SinonStub = stub(productionEditModule, "fetchProductionById");
            ProductionEdit.fetchData(dispatchStub, {
                productionId: "id"
            });
            fetchProductionsStub.should.have.been.calledOnce;
            fetchProductionsStub.should.have.been.calledWith("id");
            fetchProductionsStub.restore();
        });
    });
});
