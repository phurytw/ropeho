/**
 * @file Tests for the ProductionIndex component
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../../test.d.ts" />
import { should, use } from "chai";
import * as sinonChai from "sinon-chai";
import { shallow, ShallowWrapper } from "enzyme";
import { stub, spy } from "sinon";
import * as React from "react";
import * as productionIndexModule from "../../../common/modules/productionIndex";
import { IStore, default as mockStore } from "redux-mock-store";
import { RopehoAdminState, default as rootReducer } from "../../reducer";
import * as selectors from "../../selectors";
import { middlewares } from "../../store";
import { productions } from "../../../sampleData/testDb";
import hook from "../../../common/helpers/cssModulesHook";
hook();
import { ProductionIndex, ProductionIndexProps, mapStateToProps, mapDispatchToProps } from "./ProductionIndex";
import ProductionNew from "../ProductionNew";
import { Tabs, Tab, Dialog, Button } from "react-toolbox";
import { CardViewProps, default as CardView } from "../CardView";
import PreviewCard from "../PreviewCard";
should();
use(sinonChai);

import Production = Ropeho.Models.Production;

describe("Production Index component", () => {
    let store: IStore<RopehoAdminState>;
    let dispatchStub: sinon.SinonStub;
    const production: Production = productions[0];
    const props: ProductionIndexProps = {
        fetchProductions: (): Promise<productionIndexModule.Actions.SetProductions> => new Promise<any>((resolve: (value?: productionIndexModule.Actions.SetProductions | PromiseLike<productionIndexModule.Actions.SetProductions>) => void) => resolve({
            type: productionIndexModule.ActionTypes.SET_PRODUCTIONS,
            productions
        })),
        productions
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
            const wrapper: ShallowWrapper<CardViewProps, {}> = shallow(<ProductionIndex {...props} productions={[production]} />).find(CardView);
            wrapper.should.have.lengthOf(1);
            wrapper.find(PreviewCard).should.have.lengthOf(1);
        });
        it("Creating a production should show a form", () =>
            shallow(<ProductionIndex {...props} />).setState({ index: 1 }).find(ProductionNew).should.have.lengthOf(1));
        it("Should have button that saves the production order", () => {
            const wrapper: ShallowWrapper<ProductionIndexProps, {}> = shallow(<ProductionIndex {...props} />);
            const instance: ProductionIndex = wrapper.instance() as ProductionIndex;
            wrapper.findWhere((node: ShallowWrapper<any, any>) => node.type() === Button && node.prop("onClick") === instance.saveOrder).should.have.lengthOf(1);
        });
        it("Should show a dialog when trying to save production order", () => {
            const wrapper: ShallowWrapper<CardViewProps, {}> = shallow(<ProductionIndex {...props} productions={[production]} />);
            wrapper.setState({
                promptNewOrder: true
            });
            wrapper.find(Dialog).find({ active: true }).should.have.lengthOf(1);
        });
    });
    describe("Methods", () => {
        it("Should go to the clicked production", () => {
            const pushSpy: sinon.SinonSpy = spy();
            const wrapper: ShallowWrapper<CardViewProps, {}> = shallow(<ProductionIndex
                {...props}
                productions={[production]}
                history={{ push: pushSpy } as any}
            />);
            const instance: ProductionIndex = wrapper.instance() as ProductionIndex;
            instance.goToProduction(production);
            pushSpy.should.have.been.calledOnce;
            pushSpy.should.have.been.calledWith(`/productions/${production._id}`);
        });
        it("Should change tabs", () => {
            const wrapper: ShallowWrapper<CardViewProps, {}> = shallow(<ProductionIndex {...props} />);
            const instance: ProductionIndex = wrapper.instance() as ProductionIndex;
            instance.handleTabChange(0);
            wrapper.state("index").should.equal(0);
            instance.handleTabChange(1);
            wrapper.state("index").should.equal(1);
        });
        it("Should move a production up a position", () => {
            const setPositionSpy: sinon.SinonSpy = spy();
            const wrapper: ShallowWrapper<CardViewProps, {}> = shallow(<ProductionIndex {...props} setPosition={setPositionSpy} />);
            const instance: ProductionIndex = wrapper.instance() as ProductionIndex;
            instance.moveProductionUp(productions[1]);
            setPositionSpy.should.have.been.calledOnce;
            setPositionSpy.should.have.been.calledWith(productions[1]._id, 0);
        });
        it("Should move a production down a position", () => {
            const setPositionSpy: sinon.SinonSpy = spy();
            const wrapper: ShallowWrapper<CardViewProps, {}> = shallow(<ProductionIndex {...props} setPosition={setPositionSpy} />);
            const instance: ProductionIndex = wrapper.instance() as ProductionIndex;
            instance.moveProductionDown(productions[0]);
            setPositionSpy.should.have.been.calledOnce;
            setPositionSpy.should.have.been.calledWith(productions[0]._id, 1);
        });
        it("Should prompt a dialog message when trying to save the new order", () => {
            const saveOrderSpy: sinon.SinonSpy = spy();
            const wrapper: ShallowWrapper<CardViewProps, {}> = shallow(<ProductionIndex
                {...props}
                saveOrder={saveOrderSpy}
            />);
            const instance: ProductionIndex = wrapper.instance() as ProductionIndex;
            instance.saveOrder();
            saveOrderSpy.should.not.have.been.called;
            wrapper.state("promptNewOrder").should.be.true;
        });
        it("Should save the current order as the new order", () => {
            const saveOrderSpy: sinon.SinonSpy = spy();
            const wrapper: ShallowWrapper<CardViewProps, {}> = shallow(<ProductionIndex
                {...props}
                saveOrder={saveOrderSpy}
            />);
            wrapper.setState({
                promptNewOrder: true
            });
            const instance: ProductionIndex = wrapper.instance() as ProductionIndex;
            instance.saveOrder();
            saveOrderSpy.should.have.been.calledOnce;
            saveOrderSpy.should.have.been.calledWith(productions.map<string>((p: Production) => p._id));
            wrapper.state("promptNewOrder").should.be.false;
        });
        it("Should close the dialog message", () => {
            const wrapper: ShallowWrapper<CardViewProps, {}> = shallow(<ProductionIndex
                {...props}
            />);
            wrapper.setState({
                promptNewOrder: true
            });
            const instance: ProductionIndex = wrapper.instance() as ProductionIndex;
            instance.closeDialog();
            wrapper.state("promptNewOrder").should.be.false;
        });
    });
    describe("Props", () => {
        it("Should get productions from the state", () => {
            const fetchSpy: sinon.SinonSpy = spy(selectors, "getProductions");
            mapStateToProps(store.getState());
            fetchSpy.should.have.been.calledOnce;
            fetchSpy.restore();
        });
        it("Should get if the application has been rendered from the server from the state", () => {
            const getHasRenderedSpy: sinon.SinonSpy = spy(selectors, "getHasRendered");
            mapStateToProps(store.getState());
            getHasRenderedSpy.should.have.been.calledOnce;
            getHasRenderedSpy.restore();
        });
        it("Should fetch productions", () => {
            const fetchStub: sinon.SinonSpy = stub(productionIndexModule, "fetchProductions");
            mapDispatchToProps(dispatchStub).fetchProductions();
            fetchStub.should.have.been.calledOnce;
            fetchStub.restore();
        });
        it("Should create a production", () => {
            const createStub: sinon.SinonSpy = stub(productionIndexModule, "createProduction");
            mapDispatchToProps(dispatchStub).createProduction({});
            createStub.should.have.been.calledOnce;
            createStub.restore();
        });
        it("Should set the position of a production", () => {
            const setProductionPositionStub: sinon.SinonStub = stub(productionIndexModule, "setProductionPosition");
            mapDispatchToProps(dispatchStub).setPosition("prodId", 10);
            setProductionPositionStub.should.have.been.calledOnce;
            setProductionPositionStub.should.have.been.calledWith("prodId", 10);
            setProductionPositionStub.restore();
        });
        it("Should save the new production order", () => {
            const saveOrderStub: sinon.SinonStub = stub(productionIndexModule, "saveOrder");
            const order: string[] = ["id1", "id2", "id3"];
            mapDispatchToProps(dispatchStub).saveOrder(order);
            saveOrderStub.should.have.been.calledOnce;
            saveOrderStub.should.have.been.calledWith(order);
            saveOrderStub.restore();
        });
    });
    describe("Lifecycle", () => {
        it("Should fetch productions on initial render", () => {
            const getProductions: sinon.SinonSpy = spy(() => Promise.resolve({}));
            shallow(<ProductionIndex
                {...props}
                fetchProductions={getProductions}
            />);
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
