/**
 * @file Tests for the ContainerRenderer component
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../../test.d.ts" />
import { should, use } from "chai";
import { stub, spy } from "sinon";
import * as sinonChai from "sinon-chai";
import * as React from "react";
import { shallow, ShallowWrapper } from "enzyme";
import { presentations } from "../../../sampleData/testDb";
import * as _ from "lodash";
import hook from "../../helpers/cssModulesHook";
import * as mediaDimensionsModule from "../../helpers/mediaDimensionsUtilities";
hook();
import { ContainerRendererProps, ContainerRendererState, default as ContainerRenderer } from "./ContainerRenderer";
should();
use(sinonChai);

import Presentation = Ropeho.Models.Presentation;

describe("ContainerRenderer component", () => {
    const props: ContainerRendererProps = {
        presentations: presentations[0].presentations
    };
    describe("Element", () => {
        it("Should throw if there is more than one children", (done: MochaDone) => {
            try {
                shallow(<ContainerRenderer>
                    <div></div>
                    <div></div>
                </ContainerRenderer>);
            } catch (error) {
                done();
            }
        });
        it("Should pass all presentations down to its children", () => {
            const wrapper: ShallowWrapper<ContainerRendererProps, ContainerRendererState> = shallow(<ContainerRenderer {...props}>
                <div></div>
            </ContainerRenderer>);
            wrapper.find("div").find({
                presentations: props.presentations
            }).should.have.lengthOf(1);
        });
        it("Should set the hidden option to true if the presentation index is above the amount of presentations to display in the state", () => {
            const nTake: number = 1;
            const wrapper: ShallowWrapper<ContainerRendererProps, ContainerRendererState> = shallow(<ContainerRenderer {...props}>
                <div></div>
            </ContainerRenderer>);
            wrapper.setState({
                take: nTake
            });
            const receivedPres: Presentation[] = wrapper.find("div").find({
                presentations: props.presentations
            }).prop("presentations");
            _(receivedPres).take(nTake).every((p: Presentation) => p.options.hidden === false).should.be.true;
            _(receivedPres).drop(nTake).every((p: Presentation) => p.options.hidden === true).should.be.true;
        });
        it("Should set the width and height options to each presentations when available", () => {
            const wrapper: ShallowWrapper<ContainerRendererProps, ContainerRendererState> = shallow(<ContainerRenderer {...props}>
                <div></div>
            </ContainerRenderer>);
            const instance: ContainerRenderer = wrapper.instance() as ContainerRenderer;
            instance.presentationDimensions = _(props.presentations).mapKeys<string>((p: Presentation) => p._id).mapValues<Presentation, mediaDimensionsModule.Dimensions>((p: Presentation) => ({
                width: 100,
                height: 100
            })).value();
            wrapper.setState({});
            const receivedPres: Presentation[] = wrapper.find("div").find({
                presentations: props.presentations
            }).prop("presentations");
            for (const p of receivedPres) {
                p.options.should.have.property("width", 100);
                p.options.should.have.property("height", 100);
            }
        });
    });
    describe("Methods", () => {
        it("Should set the element ref", () => {
            const el: HTMLDivElement = document.createElement("div");
            const wrapper: ShallowWrapper<ContainerRendererProps, ContainerRendererState> = shallow(<ContainerRenderer {...props}><div></div></ContainerRenderer>);
            const instance: ContainerRenderer = wrapper.instance() as ContainerRenderer;
            instance.setRef(el);
            instance.element.should.equal(el);
        });
        it("Should set the amount of elements to show to 0", () => {
            const wrapper: ShallowWrapper<ContainerRendererProps, ContainerRendererState> = shallow(<ContainerRenderer {...props}><div></div></ContainerRenderer>);
            const instance: ContainerRenderer = wrapper.instance() as ContainerRenderer;
            wrapper.setState({ take: 100 });
            instance.renderNone();
            wrapper.state("take").should.equal(0);
        });
        it("Should set the amount of elements to render to the number of presentations", () => {
            const wrapper: ShallowWrapper<ContainerRendererProps, ContainerRendererState> = shallow(<ContainerRenderer {...props}><div></div></ContainerRenderer>);
            const instance: ContainerRenderer = wrapper.instance() as ContainerRenderer;
            instance.renderAll();
            wrapper.state("take").should.equal(props.presentations.length);
        });
        it("Should set an interval that increases progressively the amount of presentations to show", (done: MochaDone) => {
            const wrapper: ShallowWrapper<ContainerRendererProps, ContainerRendererState> = shallow(<ContainerRenderer {...props}><div></div></ContainerRenderer>);
            const instance: ContainerRenderer = wrapper.instance() as ContainerRenderer;
            wrapper.setState({ take: 0 });
            instance.renderAll(100);
            setTimeout(() => {
                wrapper.state("take").should.equal(1);
                done();
            }, 150);
        });
        it("Should get the smallest dimensions of all presentations", async () => {
            const dimensions: mediaDimensionsModule.Dimensions = {
                width: 100,
                height: 100
            };
            const getMediaDimensionsStub: sinon.SinonStub = stub(mediaDimensionsModule, "getMediaDimensions")
                .callsFake(() => Promise.resolve<mediaDimensionsModule.Dimensions>(dimensions));
            const wrapper: ShallowWrapper<ContainerRendererProps, ContainerRendererState> = shallow(<ContainerRenderer {...props}><div></div></ContainerRenderer>);
            const instance: ContainerRenderer = wrapper.instance() as ContainerRenderer;
            await instance.setPresentationDimensions();
            getMediaDimensionsStub.callCount.should.equal(props.presentations.length);
            getMediaDimensionsStub.restore();
            for (const p of props.presentations) {
                instance.presentationDimensions[p._id].should.deep.equal(dimensions);
            }
        });
    });
    describe("Lifecycle", () => {
        it("Should render all presentations when mounting", () => {
            const wrapper: ShallowWrapper<ContainerRendererProps, ContainerRendererState> = shallow(<ContainerRenderer {...props}><div></div></ContainerRenderer>);
            wrapper.state("take").should.equal(props.presentations.length);
        });
        it("Should clear interval when unmounting", () => {
            const wrapper: ShallowWrapper<ContainerRendererProps, ContainerRendererState> = shallow(<ContainerRenderer {...props}><div></div></ContainerRenderer>);
            const instance: ContainerRenderer = wrapper.instance() as ContainerRenderer;
            instance.renderAll(100);
            instance.componentWillUnmount();
            should().not.exist(instance.interval);
        });
        it("Should clear timeout when unmounting", () => {
            const wrapper: ShallowWrapper<ContainerRendererProps, ContainerRendererState> = shallow(<ContainerRenderer {...props}><div></div></ContainerRenderer>);
            const instance: ContainerRenderer = wrapper.instance() as ContainerRenderer;
            instance.timeout = setTimeout(() => ({}), 100) as any;
            instance.componentWillUnmount();
            should().not.exist(instance.timeout);
        });
        describe("Display with render props", () => {
            it("Should not display anything and wait until all medias are ready to display", (done: MochaDone) => {
                const dimensions: mediaDimensionsModule.Dimensions = {
                    width: 100,
                    height: 100
                };
                const getMediaDimensionsStub: sinon.SinonStub = stub(mediaDimensionsModule, "getMediaDimensions")
                    .callsFake(() => Promise.resolve<mediaDimensionsModule.Dimensions>(dimensions));
                const wrapper: ShallowWrapper<ContainerRendererProps, ContainerRendererState> = shallow(<ContainerRenderer {...props}><div></div></ContainerRenderer>);
                const instance: ContainerRenderer = wrapper.instance() as ContainerRenderer;
                const renderNoneSpy: sinon.SinonSpy = spy(instance, "renderNone");
                const renderAllSpy: sinon.SinonSpy = stub(instance, "renderAll")
                    .callsFake(() => {
                        getMediaDimensionsStub.callCount.should.equal(props.presentations.length);
                        getMediaDimensionsStub.restore();
                        renderAllSpy.should.have.been.calledOnce;
                        renderNoneSpy.should.have.been.calledOnce;
                        done();
                    });
                instance.componentDidMount();
            });
            it("Should hide everything if render is false", () => {
                const dimensions: mediaDimensionsModule.Dimensions = {
                    width: 100,
                    height: 100
                };
                const getMediaDimensionsStub: sinon.SinonStub = stub(mediaDimensionsModule, "getMediaDimensions")
                    .callsFake(() => Promise.resolve<mediaDimensionsModule.Dimensions>(dimensions));
                const wrapper: ShallowWrapper<ContainerRendererProps, ContainerRendererState> = shallow(<ContainerRenderer {...props} render={false}><div></div></ContainerRenderer>);
                const instance: ContainerRenderer = wrapper.instance() as ContainerRenderer;
                const renderNoneSpy: sinon.SinonSpy = spy(instance, "renderNone");
                const renderAllSpy: sinon.SinonSpy = spy(instance, "renderAll");
                instance.componentDidMount();
                getMediaDimensionsStub.should.have.been.calledOnce;
                getMediaDimensionsStub.restore();
                renderNoneSpy.should.have.been.calledOnce;
                renderAllSpy.should.not.have.been.called;
            });
            it("Should not do anything if it must display everything right away", () => {
                const dimensions: mediaDimensionsModule.Dimensions = {
                    width: 100,
                    height: 100
                };
                const getMediaDimensionsStub: sinon.SinonStub = stub(mediaDimensionsModule, "getMediaDimensions")
                    .callsFake(() => Promise.resolve<mediaDimensionsModule.Dimensions>(dimensions));
                const wrapper: ShallowWrapper<ContainerRendererProps, ContainerRendererState> = shallow(<ContainerRenderer {...props} render={true}><div></div></ContainerRenderer>);
                const instance: ContainerRenderer = wrapper.instance() as ContainerRenderer;
                const renderNoneSpy: sinon.SinonSpy = spy(instance, "renderNone");
                const renderAllSpy: sinon.SinonSpy = spy(instance, "renderAll");
                instance.componentDidMount();
                getMediaDimensionsStub.should.have.been.calledOnce;
                getMediaDimensionsStub.restore();
                renderNoneSpy.should.not.have.been.called;
                renderAllSpy.should.not.have.been.called;
            });
            it("Should render right away with an interval if there's any and render is true", () => {
                const dimensions: mediaDimensionsModule.Dimensions = {
                    width: 100,
                    height: 100
                };
                const getMediaDimensionsStub: sinon.SinonStub = stub(mediaDimensionsModule, "getMediaDimensions")
                    .callsFake(() => Promise.resolve<mediaDimensionsModule.Dimensions>(dimensions));
                const interval: number = 100;
                const wrapper: ShallowWrapper<ContainerRendererProps, ContainerRendererState> = shallow(<ContainerRenderer {...props} render={true} interval={interval}><div></div></ContainerRenderer>);
                const instance: ContainerRenderer = wrapper.instance() as ContainerRenderer;
                const renderNoneSpy: sinon.SinonSpy = spy(instance, "renderNone");
                const renderAllSpy: sinon.SinonSpy = spy(instance, "renderAll");
                instance.componentDidMount();
                getMediaDimensionsStub.should.have.been.calledOnce;
                getMediaDimensionsStub.restore();
                renderNoneSpy.should.have.been.calledOnce;
                renderAllSpy.should.have.been.calledOnce;
                renderAllSpy.should.have.been.calledWith(interval);
            });
            it("Should set a timeout if render is a number", (done: MochaDone) => {
                const dimensions: mediaDimensionsModule.Dimensions = {
                    width: 100,
                    height: 100
                };
                const getMediaDimensionsStub: sinon.SinonStub = stub(mediaDimensionsModule, "getMediaDimensions")
                    .callsFake(() => Promise.resolve<mediaDimensionsModule.Dimensions>(dimensions));
                const timeout: number = 100;
                const wrapper: ShallowWrapper<ContainerRendererProps, ContainerRendererState> = shallow(<ContainerRenderer {...props} render={timeout}><div></div></ContainerRenderer>);
                const instance: ContainerRenderer = wrapper.instance() as ContainerRenderer;
                const renderNoneSpy: sinon.SinonSpy = spy(instance, "renderNone");
                const renderAllSpy: sinon.SinonSpy = spy(instance, "renderAll");
                instance.componentDidMount();
                instance.timeout.should.be.ok;
                renderNoneSpy.should.have.been.calledOnce;
                getMediaDimensionsStub.should.have.been.calledOnce;
                getMediaDimensionsStub.restore();
                setTimeout(() => {
                    renderAllSpy.should.have.been.calledOnce;
                    done();
                }, timeout);
            });
            describe("Updating", () => {
                it("Should render right away if render is true", () => {
                    const wrapper: ShallowWrapper<ContainerRendererProps, ContainerRendererState> = shallow(<ContainerRenderer {...props}><div></div></ContainerRenderer>);
                    const instance: ContainerRenderer = wrapper.instance() as ContainerRenderer;
                    const renderNoneSpy: sinon.SinonSpy = spy(instance, "renderNone");
                    const renderAllSpy: sinon.SinonSpy = spy(instance, "renderAll");
                    instance.componentWillReceiveProps({ render: true, presentations: [] });
                    renderNoneSpy.should.not.have.been.called;
                    renderAllSpy.should.have.been.calledOnce;
                });
                it("Should render hide everything if render is false", () => {
                    const wrapper: ShallowWrapper<ContainerRendererProps, ContainerRendererState> = shallow(<ContainerRenderer {...props}><div></div></ContainerRenderer>);
                    const instance: ContainerRenderer = wrapper.instance() as ContainerRenderer;
                    const renderNoneSpy: sinon.SinonSpy = spy(instance, "renderNone");
                    const renderAllSpy: sinon.SinonSpy = spy(instance, "renderAll");
                    instance.componentWillReceiveProps({ render: false, presentations: [] });
                    renderNoneSpy.should.have.been.calledOnce;
                    renderAllSpy.should.not.have.been.calledOnce;
                });
                it("Should set a timeout if render is a number and there was no timeout previously set", () => {
                    const wrapper: ShallowWrapper<ContainerRendererProps, ContainerRendererState> = shallow(<ContainerRenderer {...props} render={false}><div></div></ContainerRenderer>);
                    const instance: ContainerRenderer = wrapper.instance() as ContainerRenderer;
                    instance.componentWillReceiveProps({ render: 100, presentations: [] });
                    instance.timeout.should.be.ok;
                });
            });
        });
    });
});
