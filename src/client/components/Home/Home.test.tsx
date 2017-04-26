/**
 * @file Tests for the Home component
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import * as React from "react";
import { should, use } from "chai";
import * as sinonChai from "sinon-chai";
import { stub, spy } from "sinon";
import { shallow, ShallowWrapper } from "enzyme";
import { presentations } from "../../../sampleData/testDb";
import { PresentationTypes } from "../../../enum";
import * as presentationModule from "../../modules/presentation";
import * as selectors from "../../selectors";
import { IStore, default as mockStore } from "redux-mock-store";
import { RopehoClientState, default as rootReducer } from "../../reducer";
import { middlewares } from "../../store";
import hook from "../../../common/helpers/cssModulesHook";
hook();
import { Home, HomeProps, mapStateToProps, mapDispatchToProps, interval } from "./Home";
import StrictMasonryContainer from "../../../common/components/StrictMasonryContainer";
import * as contentLoadedModule from "../../../common/helpers/contentLoaded";
should();
use(sinonChai);

import PresentationContainer = Ropeho.Models.PresentationContainer;

describe("Home page", () => {
    let store: IStore<RopehoClientState>,
        dispatchStub: sinon.SinonStub;
    before(() => {
        // this is necessary because the server app overwrites window
        delete require.cache[require.resolve("../../../common/helpers/rAFTimers")];
        require("../../../common/helpers/rAFTimers");
        store = mockStore<RopehoClientState>(middlewares())(rootReducer(undefined, { type: "" }));
        dispatchStub = stub(store, "dispatch");
    });
    describe("Element", () => {
        it("Should display presentations in StrictMasonryContainer", () => {
            const container: PresentationContainer = {
                _id: "id",
                type: PresentationTypes.StrictMasonry,
                presentations: []
            };
            const wrapper: ShallowWrapper<HomeProps, {}> = shallow(<Home presentations={[container]} hasRendered />);
            wrapper.find(StrictMasonryContainer).should.have.lengthOf(1);
        });
    });
    describe("Methods", () => {
        it("Should increase the amount of containers to render progressively", (done: MochaDone) => {
            const [cA, cB]: PresentationContainer[] = [{
                _id: "id",
                type: PresentationTypes.StrictMasonry,
                presentations: [{}, {}]
            }, {
                _id: "id",
                type: PresentationTypes.StrictMasonry,
                presentations: [{}, {}]
            }];
            const wrapper: ShallowWrapper<HomeProps, {}> = shallow(<Home presentations={[cA, cB]} hasRendered />);
            const instance: Home = wrapper.instance() as Home;
            instance.renderAll();
            wrapper.state("take").should.equal(1);
            setTimeout(() => {
                wrapper.state("take").should.equal(2);
                done();
            }, cA.presentations.length * interval);
        });
    });
    describe("Props", () => {
        it("Should get the presentations from the state", () => {
            const getPresentationsSpy: sinon.SinonSpy = spy(selectors, "getPresentations");
            mapStateToProps(store.getState());
            getPresentationsSpy.should.have.been.calledOnce;
            getPresentationsSpy.restore();
        });
        it("Should get if the application has been rendered from the server from the state", () => {
            const getHasRenderedSpy: sinon.SinonSpy = spy(selectors, "getHasRendered");
            mapStateToProps(store.getState());
            getHasRenderedSpy.should.have.been.calledOnce;
            getHasRenderedSpy.restore();
        });
        it("Should fetch the presentations", () => {
            const fetchPresentationsStub: sinon.SinonStub = stub(presentationModule, "fetchPresentations");
            mapDispatchToProps(dispatchStub).fetchPresentations();
            fetchPresentationsStub.should.have.been.calledOnce;
            fetchPresentationsStub.restore();
        });
    });
    describe("Lifecycle", () => {
        it("Should fetch presentations", () => {
            const fetchPresentationsSpy: sinon.SinonSpy = spy();
            shallow(<Home fetchPresentations={fetchPresentationsSpy} presentations={presentations} />);
            fetchPresentationsSpy.should.have.been.calledOnce;
        });
        it("Should wait for medias to load then render containers after mounting", (done: MochaDone) => {
            const waitForContentStub: sinon.SinonStub = stub(contentLoadedModule, "waitForContent")
                .callsFake(() => Promise.resolve());
            const wrapper: ShallowWrapper<HomeProps, {}> = shallow(<Home presentations={presentations} hasRendered />);
            const instance: Home = wrapper.instance() as Home;
            const renderAllSpy: sinon.SinonStub = stub(instance, "renderAll")
                .callsFake(() => {
                    waitForContentStub.should.have.been.calledOnce;
                    waitForContentStub.restore();
                    renderAllSpy.restore();
                    instance.timeout.should.be.ok;
                    done();
                });
            instance.componentDidMount();
        });
        it("Should clear timeouts and intervals when unmounting", (done: MochaDone) => {
            const waitForContentStub: sinon.SinonStub = stub(contentLoadedModule, "waitForContent")
                .callsFake(() => Promise.resolve());
            const wrapper: ShallowWrapper<HomeProps, {}> = shallow(<Home presentations={presentations} hasRendered />);
            const instance: Home = wrapper.instance() as Home;
            const renderAllSpy: sinon.SinonStub = stub(instance, "renderAll")
                .callsFake(() => {
                    waitForContentStub.should.have.been.calledOnce;
                    waitForContentStub.restore();
                    renderAllSpy.restore();
                    instance.componentWillUnmount();
                    should().not.exist(instance.timeout);
                    should().not.exist(instance.interval);
                    done();
                });
            instance.componentDidMount();
        });
        it("Should render after updating", (done: MochaDone) => {
            const waitForContentStub: sinon.SinonStub = stub(contentLoadedModule, "waitForContent")
                .callsFake(() => Promise.resolve());
            const wrapper: ShallowWrapper<HomeProps, {}> = shallow(<Home hasRendered presentations={[]} />);
            const instance: Home = wrapper.instance() as Home;
            const renderAllSpy: sinon.SinonStub = stub(instance, "renderAll")
                .callsFake(() => {
                    waitForContentStub.should.have.been.calledOnce;
                    waitForContentStub.restore();
                    renderAllSpy.restore();
                    done();
                });
            instance.componentDidUpdate({ presentations });
        });
    });
    describe("Server side fetching", () => {
        it("Should fetch presentations", () => {
            const fetchPresentationsStub: sinon.SinonSpy = stub(presentationModule, "fetchPresentations");
            Home.fetchData(dispatchStub);
            fetchPresentationsStub.should.have.been.calledOnce;
            fetchPresentationsStub.restore();
        });
    });
});
