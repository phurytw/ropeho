/**
 * @file Tests for the ProductionIndex component
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import { should, use } from "chai";
import * as sinonChai from "sinon-chai";
import { stub, spy } from "sinon";
import * as React from "react";
import { Redirect } from "react-router-dom";
import { shallow, ShallowWrapper } from "enzyme";
import * as selectors from "../../selectors";
import { IStore, default as mockStore } from "redux-mock-store";
import { RopehoClientState, default as rootReducer } from "../../reducer";
import { middlewares } from "../../store";
import * as productionIndexModule from "../../modules/productionIndex";
import * as categoryIndexModule from "../../modules/categoryIndex";
import { productions, categories } from "../../../sampleData/testDb";
import ContainerRenderer from "../../../common/components/ContainerRenderer";
import hook from "../../../common/helpers/cssModulesHook";
hook();
import { ProductionIndex, ProductionIndexProps, mapDispatchToProps, mapStateToProps } from "./ProductionIndex";
should();
use(sinonChai);

describe("ProductionIndex component", () => {
    let store: IStore<RopehoClientState>,
        dispatchStub: sinon.SinonStub;
    const fetchProductionsSpy: sinon.SinonSpy = spy();
    const selectCategorySpy: sinon.SinonSpy = spy();
    const fetchCategoriesSpy: sinon.SinonSpy = spy(() => Promise.resolve({ categories }));
    const props: ProductionIndexProps = {
        match: {
            params: {
                param: "photographies"
            }
        },
        fetchProductions: fetchProductionsSpy,
        fetchCategories: fetchCategoriesSpy,
        selectCategory: selectCategorySpy,
        productions,
        categories,
        history: {
            replace: () => ({})
        } as any
    };
    before(() => {
        store = mockStore<RopehoClientState>(middlewares())(rootReducer(undefined, { type: "" }));
        dispatchStub = stub(store, "dispatch");
    });
    afterEach(() => {
        dispatchStub.reset();
        fetchProductionsSpy.reset();
        fetchCategoriesSpy.reset();
        selectCategorySpy.reset();
    });
    describe("Element", () => {
        it("Should show productions in a masonry layout", () => {
            const wrapper: ShallowWrapper<ProductionIndexProps, any> = shallow(<ProductionIndex {...props} />);
            const masonryContainer: ShallowWrapper<any, any> = wrapper.find(ContainerRenderer);
            masonryContainer.should.have.lengthOf(1);
            masonryContainer.prop("presentations").should.have.property("length", productions.length);
        });
        it("Should shows categories when browsingCategories is true", () => {
            const wrapper: ShallowWrapper<ProductionIndexProps, any> = shallow(<ProductionIndex {...props} />);
            wrapper.setState({
                browsingCategories: true
            });
            wrapper.find("li").should.have.lengthOf(categories.length + 1);
        });
    });
    describe("Methods", () => {
        it("Should show categories", () => {
            const wrapper: ShallowWrapper<ProductionIndexProps, any> = shallow(<ProductionIndex {...props} />);
            const instance: ProductionIndex = wrapper.instance() as ProductionIndex;
            instance.showCategories();
            wrapper.state("browsingCategories").should.be.true;
        });
        it("Should hide categories", () => {
            const wrapper: ShallowWrapper<ProductionIndexProps, any> = shallow(<ProductionIndex {...props} />);
            const instance: ProductionIndex = wrapper.instance() as ProductionIndex;
            instance.hideCategories();
            wrapper.state("browsingCategories").should.be.false;
        });
        it("Should change URL to the selected category", () => {
            const pushSpy: sinon.SinonSpy = spy();
            const wrapper: ShallowWrapper<ProductionIndexProps, any> = shallow(<ProductionIndex {...props} history={{ push: pushSpy, replace: () => ({}) } as any} />);
            const instance: ProductionIndex = wrapper.instance() as ProductionIndex;
            instance.goToCategory("name");
            pushSpy.should.have.been.calledOnce;
            pushSpy.should.have.been.calledWith("/photographies/name");
        });
    });
    describe("Props", () => {
        it("Should get productions selected by the category from the state", () => {
            const getProductionsFromSelectedCategorySpy: sinon.SinonSpy = spy(selectors, "getProductionsFromSelectedCategory");
            mapStateToProps(store.getState());
            getProductionsFromSelectedCategorySpy.should.have.been.calledOnce;
            getProductionsFromSelectedCategorySpy.restore();
        });
        it("Should get categories from the state", () => {
            const getCategoriesSpy: sinon.SinonSpy = spy(selectors, "getCategories");
            mapStateToProps(store.getState());
            getCategoriesSpy.should.have.been.calledOnce;
            getCategoriesSpy.restore();
        });
        it("Should get the selected category from the state", () => {
            const getSelectedCategorySpy: sinon.SinonSpy = spy(selectors, "getSelectedCategory");
            mapStateToProps(store.getState());
            // also called in get productions
            getSelectedCategorySpy.should.have.been.calledTwice;
            getSelectedCategorySpy.restore();
        });
        it("Should get if the application has been rendered from the server", () => {
            const getHasRenderedSpy: sinon.SinonSpy = spy(selectors, "getHasRendered");
            mapStateToProps(store.getState());
            getHasRenderedSpy.should.have.been.calledOnce;
            getHasRenderedSpy.restore();
        });
        it("Should fetch productions from the server", () => {
            const fetchProductionsStub: sinon.SinonStub = stub(productionIndexModule, "fetchProductions");
            mapDispatchToProps(store.dispatch).fetchProductions();
            dispatchStub.should.have.been.calledOnce;
            fetchProductionsStub.should.have.been.calledOnce;
            fetchProductionsStub.restore();
        });
        it("Should fetch the categories from the server", () => {
            const fetchCategoriesStub: sinon.SinonStub = stub(categoryIndexModule, "fetchCategories");
            mapDispatchToProps(store.dispatch).fetchCategories();
            dispatchStub.should.have.been.calledOnce;
            fetchCategoriesStub.should.have.been.calledOnce;
            fetchCategoriesStub.restore();
        });
        it("Should select a category", () => {
            const selectCategoryStub: sinon.SinonStub = stub(categoryIndexModule, "selectCategory");
            mapDispatchToProps(store.dispatch).selectCategory("name");
            dispatchStub.should.have.been.calledOnce;
            selectCategoryStub.should.have.been.calledOnce;
            selectCategoryStub.should.have.been.calledWith("name");
            selectCategoryStub.restore();
        });
    });
    describe("Lifecycle", () => {
        it("Should get productions and categories and select the category when mounting", () => {
            shallow(<ProductionIndex {...props} selectCategory={selectCategorySpy} />);
            fetchProductionsSpy.should.have.been.calledOnce;
            fetchCategoriesSpy.should.have.been.calledOnce;
            selectCategorySpy.should.have.been.calledOnce;
        });
        it("Should get categories when mounting and redirect if it doesn't match the URL", (done: MochaDone) => {
            const replaceSpy: sinon.SinonSpy = spy(() => {
                replaceSpy.should.have.been.calledWith("/photographies");
                done();
            });
            shallow(<ProductionIndex {...props} history={{ replace: replaceSpy } as any} match={{ params: { param: "photographies", category: "nope" } }} />);
            fetchCategoriesSpy.should.have.been.calledOnce;
        });
        it("Should select the category when receiving props", () => {
            const wrapper: ShallowWrapper<ProductionIndexProps, any> = shallow(<ProductionIndex {...props} />);
            const instance: ProductionIndex = wrapper.instance() as ProductionIndex;
            instance.componentWillReceiveProps({ match: { params: { category: "name" } } });
            // once in componentWillMount and the second one in componentWillReceiveProps
            selectCategorySpy.should.have.been.calledTwice;
            selectCategorySpy.should.have.been.calledWith("name");
        });
    });
    describe("Server side fetching", () => {
        it("Should get productions, categories and select the category", async () => {
            const fetchProductionsStub: sinon.SinonStub = stub(productionIndexModule, "fetchProductions")
                .callsFake(() => Promise.resolve());
            const fetchCategoriesStub: sinon.SinonStub = stub(categoryIndexModule, "fetchCategories")
                .callsFake(() => Promise.resolve());
            const selectCategoryStub: sinon.SinonStub = stub(categoryIndexModule, "selectCategory");
            await ProductionIndex.fetchData(store.dispatch, { category: "name" });
            dispatchStub.should.have.been.calledThrice;
            fetchProductionsStub.should.have.been.calledOnce;
            fetchProductionsStub.restore();
            fetchCategoriesStub.should.have.been.calledOnce;
            fetchCategoriesStub.restore();
            selectCategoryStub.should.have.been.calledOnce;
            selectCategoryStub.restore();
        });
    });
    describe("Server side redirection", () => {
        it("Should redirect to /photographies if the path is not photographies", () => {
            const wrapper: ShallowWrapper<ProductionIndexProps, any> = shallow(<ProductionIndex {...props} match={{
                params: {
                    param: "productions"
                }
            }} />);
            const instance: ProductionIndex = wrapper.instance() as ProductionIndex;
            instance.shouldRedirect().should.be.true;
            wrapper.find(Redirect).find({ to: "/photographies" }).should.have.lengthOf(1);
        });
        it("Should not redirect if the path is /photographies", () => {
            const wrapper: ShallowWrapper<ProductionIndexProps, any> = shallow(<ProductionIndex {...props} />);
            const instance: ProductionIndex = wrapper.instance() as ProductionIndex;
            instance.shouldRedirect().should.be.false;
            wrapper.find(Redirect).should.have.lengthOf(0);
        });
        it("Should redirect to /photographies if rendering from the server and categories don't match", () => {
            const wrapper: ShallowWrapper<ProductionIndexProps, any> = shallow(<ProductionIndex {...props} hasRendered match={{ params: { param: "photographies", category: "nope" } }} categories={categories} selectedCategory={undefined} />);
            const instance: ProductionIndex = wrapper.instance() as ProductionIndex;
            instance.shouldRedirect().should.be.true;
            wrapper.find(Redirect).find({ to: "/photographies" }).should.have.lengthOf(1);
        });
    });
});
