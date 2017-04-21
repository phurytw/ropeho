/**
 * @file Tests for the AsyncSwitch component
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import { should, use } from "chai";
import * as sinonChai from "sinon-chai";
import { stub, spy } from "sinon";
import * as React from "react";
import { Redirect, StaticRouter } from "react-router-dom";
import { shallow, ShallowWrapper, mount, ReactWrapper } from "enzyme";
import * as selectors from "../../selectors";
import { IStore, default as mockStore } from "redux-mock-store";
import { RopehoClientState, default as rootReducer } from "../../reducer";
import { middlewares } from "../../store";
import * as productionModule from "../../modules/production";
import * as categoryIndexModule from "../../modules/categoryIndex";
import { productions, categories } from "../../../sampleData/testDb";
import uriFriendlyFormat from "../../../common/helpers/uriFriendlyFormat";
import hook from "../../../common/helpers/cssModulesHook";
hook();
import { AsyncSwitch, AsyncSwitchProps, mapDispatchToProps, mapStateToProps } from "./AsyncSwitch";
import ProductionComponent from "../Production";
should();
use(sinonChai);

describe("AsyncSwitch component", () => {
    let store: IStore<RopehoClientState>,
        dispatchStub: sinon.SinonStub;
    const fetchProductionSpy: sinon.SinonSpy = spy(() => Promise.resolve({ productions }));
    const selectProductionSpy: sinon.SinonSpy = spy();
    const fetchCategoriesSpy: sinon.SinonSpy = spy(() => Promise.resolve({ categories }));
    const selectCategorySpy: sinon.SinonSpy = spy();
    const replaceSpy: sinon.SinonSpy = spy();
    const props: AsyncSwitchProps = {
        match: {
            params: {
                name: "prod"
            }
        },
        fetchProduction: fetchProductionSpy,
        fetchCategories: fetchCategoriesSpy,
        selectProduction: selectProductionSpy,
        selectCategory: selectCategorySpy,
        production: productions[0],
        category: categories[0],
        categories,
        history: {
            replace: replaceSpy
        } as any
    };
    before(() => {
        store = mockStore<RopehoClientState>(middlewares())(rootReducer(undefined, { type: "" }));
        dispatchStub = stub(store, "dispatch");
    });
    afterEach(() => {
        dispatchStub.reset();
        fetchProductionSpy.reset();
        fetchCategoriesSpy.reset();
        selectProductionSpy.reset();
        selectCategorySpy.reset();
        replaceSpy.reset();
    });
    describe("Element", () => {
        it("Should render the Production component", () => {
            const wrapper: ReactWrapper<AsyncSwitchProps, any> = mount(<StaticRouter history={undefined} location="/prod" context={{}}><AsyncSwitch {...props} /></StaticRouter>);
            wrapper.find(ProductionComponent).should.have.lengthOf(1);
        });
    });
    describe("Props", () => {
        it("Should get if the application has been rendered from the server", () => {
            const getHasRenderedSpy: sinon.SinonSpy = spy(selectors, "getHasRendered");
            mapStateToProps(store.getState());
            getHasRenderedSpy.should.have.been.calledOnce;
            getHasRenderedSpy.restore();
        });
        it("Should get the selected production from the state", () => {
            const getSelectedProductionSpy: sinon.SinonSpy = spy(selectors, "getSelectedProduction");
            mapStateToProps(store.getState());
            getSelectedProductionSpy.should.have.been.calledOnce;
            getSelectedProductionSpy.restore();
        });
        it("Should get the selected category from the state", () => {
            const getSelectedCategorySpy: sinon.SinonSpy = spy(selectors, "getSelectedCategory");
            mapStateToProps(store.getState());
            getSelectedCategorySpy.should.have.been.calledOnce;
            getSelectedCategorySpy.restore();
        });
        it("Should get the categories from the state", () => {
            const getCategoriesSpy: sinon.SinonSpy = spy(selectors, "getCategories");
            mapStateToProps(store.getState());
            getCategoriesSpy.should.have.been.calledOnce;
            getCategoriesSpy.restore();
        });
        it("Should fetch productions by name", () => {
            const fetchSingleProductionStub: sinon.SinonStub = stub(productionModule, "fetchSingleProduction");
            mapDispatchToProps(store.dispatch).fetchProduction("name");
            fetchSingleProductionStub.should.have.been.calledOnce;
            fetchSingleProductionStub.should.have.been.calledWith("name");
            fetchSingleProductionStub.restore();
            dispatchStub.should.have.been.calledOnce;
        });
        it("Should fetch categories", () => {
            const fetchCategoriesStub: sinon.SinonStub = stub(categoryIndexModule, "fetchCategories");
            mapDispatchToProps(store.dispatch).fetchCategories();
            fetchCategoriesStub.should.have.been.calledOnce;
            fetchCategoriesStub.restore();
            dispatchStub.should.have.been.calledOnce;
        });
        it("Should select a production", () => {
            const selectProductionStub: sinon.SinonStub = stub(productionModule, "selectProduction");
            mapDispatchToProps(store.dispatch).selectProduction("name");
            selectProductionStub.should.have.been.calledOnce;
            selectProductionStub.should.have.been.calledWith("name");
            selectProductionStub.restore();
            dispatchStub.should.have.been.calledOnce;
        });
        it("Should select a category", () => {
            const selectCategoryStub: sinon.SinonStub = stub(categoryIndexModule, "selectCategory");
            mapDispatchToProps(store.dispatch).selectCategory("name");
            selectCategoryStub.should.have.been.calledOnce;
            selectCategoryStub.should.have.been.calledWith("name");
            selectCategoryStub.restore();
            dispatchStub.should.have.been.calledOnce;
        });
    });
    describe("Lifecycle", () => {
        describe("Initial mount", () => {
            it("Should fetch productions and categories and select when mounting", async () => {
                const wrapper: ShallowWrapper<AsyncSwitchProps, any> = shallow(<AsyncSwitch {...props} />);
                const instance: AsyncSwitch = wrapper.instance() as AsyncSwitch;
                await instance.componentWillMount();
                fetchCategoriesSpy.should.have.been.called;
                fetchProductionSpy.should.have.been.called;
                selectProductionSpy.should.have.been.called;
                selectCategorySpy.should.have.been.called;
            });
            it("Should eventually redirect to the category if a category has been found but no production", async () => {
                const fetchProductionSpy: sinon.SinonSpy = spy(() => Promise.resolve({ productions: [] }));
                const wrapper: ShallowWrapper<AsyncSwitchProps, any> = shallow(<AsyncSwitch {...props} fetchProduction={fetchProductionSpy} match={{ params: { name: uriFriendlyFormat(categories[0].name) } }} />);
                const instance: AsyncSwitch = wrapper.instance() as AsyncSwitch;
                await instance.componentWillMount();
                fetchCategoriesSpy.should.have.been.called;
                fetchProductionSpy.should.have.been.called;
                selectProductionSpy.should.have.been.called;
                selectCategorySpy.should.have.been.called;
                replaceSpy.should.have.been.called;
                replaceSpy.should.have.been.calledWith(`/photographies/${uriFriendlyFormat(categories[0].name)}`);
            });
            it("Should eventually redirect the not found page is neither a category nor a production has been found", async () => {
                const fetchProductionSpy: sinon.SinonSpy = spy(() => Promise.resolve({ productions: [] }));
                const fetchCategoriesSpy: sinon.SinonSpy = spy(() => Promise.resolve({ categories: [] }));
                const wrapper: ShallowWrapper<AsyncSwitchProps, any> = shallow(<AsyncSwitch {...props} fetchProduction={fetchProductionSpy} fetchCategories={fetchCategoriesSpy} />);
                const instance: AsyncSwitch = wrapper.instance() as AsyncSwitch;
                await instance.componentWillMount();
                fetchCategoriesSpy.should.have.been.called;
                fetchProductionSpy.should.have.been.called;
                selectProductionSpy.should.have.been.called;
                selectCategorySpy.should.have.been.called;
                replaceSpy.should.have.been.called;
                replaceSpy.should.have.been.calledWith("/404");
            });
        });
        describe("Receiving props", () => {
            it("Should fetch productions and categories and select if the name has changed", async () => {
                const wrapper: ShallowWrapper<AsyncSwitchProps, any> = shallow(<AsyncSwitch {...props} />);
                const instance: AsyncSwitch = wrapper.instance() as AsyncSwitch;
                await instance.componentWillReceiveProps({ match: { params: { name: "new" } } });
                fetchCategoriesSpy.should.have.been.called;
                fetchProductionSpy.should.have.been.called;
                selectProductionSpy.should.have.been.called;
                selectCategorySpy.should.have.been.called;
            });
            it("Should eventually redirect to the category if a category has been found but no production", async () => {
                const fetchProductionSpy: sinon.SinonSpy = spy(() => Promise.resolve({ productions: [] }));
                const wrapper: ShallowWrapper<AsyncSwitchProps, any> = shallow(<AsyncSwitch {...props} fetchProduction={fetchProductionSpy} />);
                const instance: AsyncSwitch = wrapper.instance() as AsyncSwitch;
                await instance.componentWillReceiveProps({ match: { params: { name: uriFriendlyFormat(categories[0].name) } } });
                fetchCategoriesSpy.should.have.been.called;
                fetchProductionSpy.should.have.been.called;
                selectProductionSpy.should.have.been.called;
                selectCategorySpy.should.have.been.called;
                replaceSpy.should.have.been.called;
                replaceSpy.should.have.been.calledWith(`/photographies/${uriFriendlyFormat(categories[0].name)}`);
            });
            it("Should eventually redirect the not found page is neither a category nor a production has been found", async () => {
                const fetchProductionSpy: sinon.SinonSpy = spy(() => Promise.resolve({ productions: [] }));
                const wrapper: ShallowWrapper<AsyncSwitchProps, any> = shallow(<AsyncSwitch {...props} fetchProduction={fetchProductionSpy} fetchCategories={fetchCategoriesSpy} />);
                const instance: AsyncSwitch = wrapper.instance() as AsyncSwitch;
                await instance.componentWillReceiveProps({ match: { params: { name: "uwontfindit" } } });
                fetchCategoriesSpy.should.have.been.called;
                fetchProductionSpy.should.have.been.called;
                selectProductionSpy.should.have.been.called;
                selectCategorySpy.should.have.been.called;
                replaceSpy.should.have.been.called;
                replaceSpy.should.have.been.calledWith("/404");
            });
        });
    });
    describe("Server side fetching", () => {
        it("Should fetch productions and categories and select", async () => {
            const fetchSingleProductionStub: sinon.SinonStub = stub(productionModule, "fetchSingleProduction")
                .callsFake(() => Promise.resolve());
            const fetchCategoriesStub: sinon.SinonStub = stub(categoryIndexModule, "fetchCategories")
                .callsFake(() => Promise.resolve());
            const selectProductionStub: sinon.SinonStub = stub(productionModule, "selectProduction");
            const selectCategoryStub: sinon.SinonStub = stub(categoryIndexModule, "selectCategory");
            await AsyncSwitch.fetchData(dispatchStub, {
                name: "name"
            });
            fetchSingleProductionStub.should.have.been.calledOnce;
            fetchSingleProductionStub.restore();
            fetchCategoriesStub.should.have.been.calledOnce;
            fetchCategoriesStub.restore();
            selectProductionStub.should.have.been.calledOnce;
            selectProductionStub.restore();
            selectCategoryStub.should.have.been.calledOnce;
            selectCategoryStub.restore();
        });
    });
    describe("Server side redirection", () => {
        it("Should redirect to the category if a category has been found", () => {
            const wrapper: ShallowWrapper<AsyncSwitchProps, any> = shallow(<AsyncSwitch {...props} hasRendered category={categories[0]} production={undefined} />);
            wrapper.find(Redirect).find({ to: `/photographies/${uriFriendlyFormat(categories[0].name)}` }).should.have.lengthOf(1);
        });
        it("Should redirect to NotFound page if neither a category or a production has been found", () => {
            const wrapper: ShallowWrapper<AsyncSwitchProps, any> = shallow(<AsyncSwitch {...props} hasRendered category={undefined} production={undefined} />);
            wrapper.find(Redirect).find({ to: "/404" }).should.have.lengthOf(1);
        });
    });
});
