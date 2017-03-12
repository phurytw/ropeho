/**
 * @file Tests for the ProductionIndex component
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../../test.d.ts" />
import { should, use } from "chai";
import * as sinonChai from "sinon-chai";
import * as chaiEnzyme from "chai-enzyme";
import { shallow } from "enzyme";
import { stub, spy } from "sinon";
import * as React from "react";
import { ProductionIndex, ProductionIndexProps, mapStateToProps, mapDispatchToProps } from "./ProductionIndex";
import { productions } from "../../../sampleData/testDb";
import { ProductionIndexState } from "../../modules/productionIndex";
import * as productionIndexModule from "../../modules/productionIndex";
import { IStore, default as mockStore } from "redux-mock-store";
import { RopehoAdminState, initialState } from "../../reducer";
import * as selectors from "../../selectors";
import { middlewares } from "../../store";
should();
use(sinonChai);
use(chaiEnzyme);

describe("Production Index component", () => {
    let store: IStore<RopehoAdminState>;
    let dispatchStub: sinon.SinonStub;
    before(() => {
        store = mockStore<RopehoAdminState>(middlewares)(initialState);
        dispatchStub = stub(store, "dispatch");
    });
    afterEach(() => store.clearActions());
    describe("Element", () => {
        it("Should have tabs allowing to view productions or create one");
    });
    describe("Props", () => {
        it("Should get productions from the state", () => {
            const fetchSpy: sinon.SinonSpy = spy(selectors, "getProductions");
            mapStateToProps({
                ...store.getState(),
                productionIndex: new ProductionIndexState({
                    productions
                })
            }).productions.should.deep.equal(productions);
            fetchSpy.should.have.been.calledOnce;
            fetchSpy.restore();
        });
        it("Should get if the application has been rendered from the server from the state", () => {
            const getHasRenderedSpy: sinon.SinonSpy = spy(selectors, "getHasRendered");
            mapStateToProps(store.getState());
            getHasRenderedSpy.should.have.been.calledOnce;
            getHasRenderedSpy.restore();
        });
        it("Should be able to fetch productions", () => {
            const fetchSpy: sinon.SinonSpy = stub(productionIndexModule, "fetchProductions");
            mapDispatchToProps(dispatchStub).fetchProductions();
            fetchSpy.should.have.been.calledOnce;
            fetchSpy.restore();
        });
        it("Should be able to create a production", () => {
            const createSpy: sinon.SinonSpy = stub(productionIndexModule, "createProduction");
            mapDispatchToProps(dispatchStub).createProduction({});
            createSpy.should.have.been.calledOnce;
            createSpy.restore();
        });
    });
    describe("Lifecycle", () => {
        it("Should fetch productions on initial render", () => {
            const getProductions: sinon.SinonSpy = spy();
            const props: ProductionIndexProps = {
                fetchProductions: (): Promise<productionIndexModule.Actions.SetProductions> => {
                    getProductions();
                    return Promise.resolve({});
                }
            };
            shallow(<ProductionIndex {...props} />);
            getProductions.should.have.been.calledOnce;
        });
    });
    describe("Server side fetching", () => {
        it("Should fetch productions using the static fetch", () => {
            const fetchProductionsStub: sinon.SinonStub = stub(productionIndexModule, "fetchProductions");
            ProductionIndex.FetchData(dispatchStub);
            fetchProductionsStub.should.have.been.calledOnce;
            fetchProductionsStub.restore();
        });
    });
});
