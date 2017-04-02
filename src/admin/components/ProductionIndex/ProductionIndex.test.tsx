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
import { productions } from "../../../sampleData/testDb";
import * as productionIndexModule from "../../../common/modules/productionIndex";
import { IStore, default as mockStore } from "redux-mock-store";
import { RopehoAdminState, default as rootReducer } from "../../reducer";
import * as selectors from "../../selectors";
import { middlewares } from "../../store";
import hook from "../../../common/helpers/cssModulesHook";
import { v4 } from "uuid";
hook();
import { ProductionIndex, ProductionIndexProps, mapStateToProps, mapDispatchToProps } from "./ProductionIndex";
import ProductionNew from "../ProductionNew";
import { Tabs, Tab } from "react-toolbox";
import PreviewCard from "../PreviewCard";
import { fromJS } from "immutable";
should();
use(sinonChai);
use(chaiEnzyme);

describe("Production Index component", () => {
    let store: IStore<RopehoAdminState>;
    let dispatchStub: sinon.SinonStub;
    const props: ProductionIndexProps = {
        fetchProductions: (): Promise<productionIndexModule.Actions.SetProductions> => new Promise<any>((resolve: (value?: productionIndexModule.Actions.SetProductions | PromiseLike<productionIndexModule.Actions.SetProductions>) => void) => resolve({
            type: productionIndexModule.ActionTypes.SET_PRODUCTIONS,
            productions: []
        }))
    };
    before(() => {
        store = mockStore<RopehoAdminState>(middlewares())(rootReducer(undefined, { type: "" }));
        dispatchStub = stub(store, "dispatch");
    });
    afterEach(() => store.clearActions());
    describe("Element", () => {
        it("Should have tabs allowing to view productions or create one", () => {
            shallow(<ProductionIndex {...props} />).find(Tabs).should.have.lengthOf(1);
            shallow(<ProductionIndex {...props} />).find(Tab).should.have.lengthOf(2);
        });
        it("Viewing productions should show productions in a list");
        it("Viewing productions should show productions in cards", () => {
            const production: Ropeho.Models.Production = { _id: v4(), name: "Production Name" };
            shallow(<ProductionIndex {...props} productions={[production]} />).find(PreviewCard).should.have.lengthOf(1);
        });
        it("Creating a produciton should show a form", () =>
            shallow(<ProductionIndex {...props} />).setState({ index: 1 }).find(ProductionNew).should.have.lengthOf(1));
    });
    describe("Props", () => {
        it("Should get productions from the state", () => {
            const fetchSpy: sinon.SinonSpy = spy(selectors, "getProductions");
            mapStateToProps({
                ...store.getState(),
                productionIndex: fromJS({
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
            ProductionIndex.fetchData(dispatchStub);
            fetchProductionsStub.should.have.been.calledOnce;
            fetchProductionsStub.restore();
        });
    });
});
