/**
 * @file Test for the MediaPreviewCore HOC
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../../test.d.ts" />
import { should, use } from "chai";
import { stub, spy } from "sinon";
import * as sinonChai from "sinon-chai";
import * as React from "react";
import { shallow, ShallowWrapper, mount, ReactWrapper } from "enzyme";
import { MediaPreviewCoreProps, default as mediaPreview, MediaPreviewCore } from "./MediaPreviewCore";
should();
use(sinonChai);

import Source = Ropeho.Models.Source;

class Component extends React.Component<{}, {}> {
    render(): JSX.Element {
        return <div></div>;
    }
}

describe("MediaPreviewCore HOC", () => {
    const MediaPreview: MediaPreviewCore<{}> = mediaPreview(Component);
    const source: Source = {
        _id: "sourceId",
        posX: 0,
        posY: 0,
        preview: "prev",
        zoom: 1
    };
    describe("POI placement", () => {
        describe("Default behavior", () => {
            it("Should place the POI at the center", () => {
                const wrapper: ReactWrapper<MediaPreviewCoreProps, {}> = mount(<MediaPreview source={{
                    ...source,
                    posX: 210,
                    posY: 210
                }} />);
                const instance: Component = wrapper.instance() as Component;
                (instance as any).element = {
                    clientHeight: 100,
                    clientWidth: 100
                };
                wrapper.setState({
                    width: 800,
                    height: 600
                });
                (instance as any).handleSource();
                wrapper.state("offsetX").should.equal(160);
                wrapper.state("offsetY").should.equal(160);
            });
            it("Should place the POI on the top left area if posX and posY are too short", () => {
                const wrapper: ReactWrapper<MediaPreviewCoreProps, {}> = mount(<MediaPreview source={{
                    ...source,
                    posX: 10,
                    posY: 10
                }} />);
                const instance: Component = wrapper.instance() as Component;
                (instance as any).element = {
                    clientHeight: 100,
                    clientWidth: 100
                };
                wrapper.setState({
                    width: 800,
                    height: 600
                });
                (instance as any).handleSource();
                wrapper.state("offsetX").should.equal(0);
                wrapper.state("offsetY").should.equal(0);
            });
            it("Should place the POI on the bottom right area if posX and posY are too big", () => {
                const wrapper: ReactWrapper<MediaPreviewCoreProps, {}> = mount(<MediaPreview source={{
                    ...source,
                    posX: 770,
                    posY: 590
                }} />);
                const instance: Component = wrapper.instance() as Component;
                (instance as any).element = {
                    clientHeight: 100,
                    clientWidth: 100
                };
                wrapper.setState({
                    width: 800,
                    height: 600
                });
                (instance as any).handleSource();
                wrapper.state("offsetX").should.equal(700);
                wrapper.state("offsetY").should.equal(500);
            });
        });
        describe("Source zooming", () => {
            it("Should place the POI at the center", () => {
                const wrapper: ReactWrapper<MediaPreviewCoreProps, {}> = mount(<MediaPreview source={{
                    ...source,
                    posX: 210,
                    posY: 210,
                    zoom: 2
                }} />);
                const instance: Component = wrapper.instance() as Component;
                (instance as any).element = {
                    clientHeight: 100,
                    clientWidth: 100
                };
                wrapper.setState({
                    width: 800,
                    height: 600
                });
                (instance as any).handleSource();
                wrapper.state("offsetX").should.equal(370);
                wrapper.state("offsetY").should.equal(370);
            });
            it("Should place the POI on the top left area if posX and posY are too short", () => {
                const wrapper: ReactWrapper<MediaPreviewCoreProps, {}> = mount(<MediaPreview source={{
                    ...source,
                    posX: 10,
                    posY: 10,
                    zoom: 2
                }} />);
                const instance: Component = wrapper.instance() as Component;
                (instance as any).element = {
                    clientHeight: 100,
                    clientWidth: 100
                };
                wrapper.setState({
                    width: 800,
                    height: 600,
                    zoom: 2
                });
                (instance as any).handleSource();
                wrapper.state("offsetX").should.equal(0);
                wrapper.state("offsetY").should.equal(0);
            });
            it("Should place the POI on the bottom right area if posX and posY are too big", () => {
                const wrapper: ReactWrapper<MediaPreviewCoreProps, {}> = mount(<MediaPreview source={{
                    ...source,
                    posX: 770,
                    posY: 590,
                    zoom: 2
                }} />);
                const instance: Component = wrapper.instance() as Component;
                (instance as any).element = {
                    clientHeight: 100,
                    clientWidth: 100
                };
                wrapper.setState({
                    width: 800,
                    height: 600
                });
                (instance as any).handleSource();
                wrapper.state("offsetX").should.equal(1490);
                wrapper.state("offsetY").should.equal(1100);
            });
        });
        describe("Element zooming", () => {
            it("Should place the POI at the center", () => {
                const wrapper: ReactWrapper<MediaPreviewCoreProps, {}> = mount(<MediaPreview source={{
                    ...source,
                    posX: 210,
                    posY: 210
                }} />);
                const instance: Component = wrapper.instance() as Component;
                (instance as any).element = {
                    clientHeight: 100,
                    clientWidth: 100
                };
                wrapper.setState({
                    width: 800,
                    height: 600,
                    scale: 2
                });
                (instance as any).handleSource();
                wrapper.state("offsetX").should.equal(370);
                wrapper.state("offsetY").should.equal(370);
            });
            it("Should place the POI on the top left area if posX and posY are too short", () => {
                const wrapper: ReactWrapper<MediaPreviewCoreProps, {}> = mount(<MediaPreview source={{
                    ...source,
                    posX: 10,
                    posY: 10
                }} />);
                const instance: Component = wrapper.instance() as Component;
                (instance as any).element = {
                    clientHeight: 100,
                    clientWidth: 100
                };
                wrapper.setState({
                    width: 800,
                    height: 600,
                    scale: 2
                });
                (instance as any).handleSource();
                wrapper.state("offsetX").should.equal(0);
                wrapper.state("offsetY").should.equal(0);
            });
            it("Should place the POI on the bottom right area if posX and posY are too big", () => {
                const wrapper: ReactWrapper<MediaPreviewCoreProps, {}> = mount(<MediaPreview source={{
                    ...source,
                    posX: 770,
                    posY: 590
                }} />);
                const instance: Component = wrapper.instance() as Component;
                (instance as any).element = {
                    clientHeight: 100,
                    clientWidth: 100
                };
                wrapper.setState({
                    width: 800,
                    height: 600,
                    scale: 2
                });
                (instance as any).handleSource();
                wrapper.state("offsetX").should.equal(1490);
                wrapper.state("offsetY").should.equal(1100);
            });
        });
    });
    describe("Auto zooming", () => {
        it("Should set the source zoom to fit horizontally if the content is too small", () => {
            const wrapper: ReactWrapper<MediaPreviewCoreProps, {}> = mount(<MediaPreview source={source} />);
            const instance: Component = wrapper.instance() as Component;
            (instance as any).element = {
                clientHeight: 100,
                clientWidth: 300
            };
            wrapper.setState({
                width: 200,
                height: 100
            });
            (instance as any).handleSource();
            wrapper.state("computedWidth").should.equal(300);
            wrapper.state("computedHeight").should.equal(150);
        });
        it("Should set the source zoom to fit vertically if the content is too small", () => {
            const wrapper: ReactWrapper<MediaPreviewCoreProps, {}> = mount(<MediaPreview source={source} />);
            const instance: Component = wrapper.instance() as Component;
            (instance as any).element = {
                clientHeight: 300,
                clientWidth: 100
            };
            wrapper.setState({
                width: 200,
                height: 100
            });
            (instance as any).handleSource();
            wrapper.state("computedWidth").should.equal(600);
            wrapper.state("computedHeight").should.equal(300);
        });
        it("Should set the source zoom to fit horizontally and vertically if the content is too small", () => {
            const wrapper: ReactWrapper<MediaPreviewCoreProps, {}> = mount(<MediaPreview source={source} />);
            const instance: Component = wrapper.instance() as Component;
            (instance as any).element = {
                clientHeight: 300,
                clientWidth: 300
            };
            wrapper.setState({
                width: 200,
                height: 100
            });
            (instance as any).handleSource();
            wrapper.state("computedWidth").should.equal(600);
            wrapper.state("computedHeight").should.equal(300);
        });
        it("Should not fit in the container", () => {
            const wrapper: ReactWrapper<MediaPreviewCoreProps, {}> = mount(<MediaPreview source={source} />);
            const instance: Component = wrapper.instance() as Component;
            (instance as any).element = {
                clientHeight: 300,
                clientWidth: 300
            };
            wrapper.setState({
                width: 200,
                height: 100,
                fit: false
            });
            (instance as any).handleSource();
            wrapper.state("computedWidth").should.equal(200);
            wrapper.state("computedHeight").should.equal(100);
        });
    });
    describe("Element specific zooming", () => {
        it("Should be able multiply the source's zoom only for this element", () => {
            const wrapper: ReactWrapper<MediaPreviewCoreProps, {}> = mount(<MediaPreview source={source} />);
            const instance: Component = wrapper.instance() as Component;
            (instance as any).element = {
                clientHeight: 100,
                clientWidth: 300
            };
            wrapper.setState({
                width: 200,
                height: 100,
                scale: 4
            });
            (instance as any).handleSource();
            wrapper.state("computedWidth").should.equal(800);
            wrapper.state("computedHeight").should.equal(400);
        });
        it("Should let auto zooming do the job if it's still too small", () => {
            const wrapper: ReactWrapper<MediaPreviewCoreProps, {}> = mount(<MediaPreview source={source} />);
            const instance: Component = wrapper.instance() as Component;
            (instance as any).element = {
                clientHeight: 100,
                clientWidth: 300
            };
            wrapper.setState({
                width: 200,
                height: 100,
                scale: 1.1
            });
            (instance as any).handleSource();
            wrapper.state("computedWidth").should.equal(300);
            wrapper.state("computedHeight").should.equal(150);
        });
    });
    describe("POI check", () => {
        it("Should set the offsetX accordingly if the posX is too small", () => {
            const wrapper: ReactWrapper<MediaPreviewCoreProps, {}> = mount(<MediaPreview source={{
                ...source,
                posX: -10
            }} />);
            const instance: Component = wrapper.instance() as Component;
            (instance as any).element = {
                clientHeight: 100,
                clientWidth: 100
            };
            wrapper.setState({
                width: 800,
                height: 600
            });
            (instance as any).handleSource();
            wrapper.state("offsetX").should.equal(0);
        });
        it("Should set the offsetX accordingly if the posX is too big", () => {
            const wrapper: ReactWrapper<MediaPreviewCoreProps, {}> = mount(<MediaPreview source={{
                ...source,
                posX: 900
            }} />);
            const instance: Component = wrapper.instance() as Component;
            (instance as any).element = {
                clientHeight: 100,
                clientWidth: 100
            };
            wrapper.setState({
                width: 800,
                height: 600
            });
            (instance as any).handleSource();
            wrapper.state("offsetX").should.equal(700);
        });
        it("Should set the offsetY accordingly if the posY is too small", () => {
            const wrapper: ReactWrapper<MediaPreviewCoreProps, {}> = mount(<MediaPreview source={{
                ...source,
                posY: -10
            }} />);
            const instance: Component = wrapper.instance() as Component;
            (instance as any).element = {
                clientHeight: 100,
                clientWidth: 100
            };
            wrapper.setState({
                width: 800,
                height: 600
            });
            (instance as any).handleSource();
            wrapper.state("offsetY").should.equal(0);
        });
        it("Should set the offsetY accordingly if the posY is too big", () => {
            const wrapper: ReactWrapper<MediaPreviewCoreProps, {}> = mount(<MediaPreview source={{
                ...source,
                posY: 900
            }} />);
            const instance: Component = wrapper.instance() as Component;
            (instance as any).element = {
                clientHeight: 100,
                clientWidth: 100
            };
            wrapper.setState({
                width: 800,
                height: 600
            });
            (instance as any).handleSource();
            wrapper.state("offsetY").should.equal(500);
        });
    });
    describe("Events", () => {
        it("Should call the source handler after mounting", () => {
            const wrapper: ShallowWrapper<MediaPreviewCoreProps, {}> = shallow(<MediaPreview />);
            const instance: Component = wrapper.instance() as Component;
            const handleSourceStub: sinon.SinonStub = stub(instance, "handleSource");
            (instance as any).componentDidMount();
            handleSourceStub.should.have.been.calledOnce;
        });
        it("Should call the source handler when the source changes", () => {
            const wrapper: ShallowWrapper<MediaPreviewCoreProps, {}> = shallow(<MediaPreview />);
            const instance: Component = wrapper.instance() as Component;
            const handleSourceStub: sinon.SinonStub = stub(instance, "handleSource");
            (instance as any).componentWillReceiveProps({ source });
            handleSourceStub.should.have.been.calledOnce;
        });
    });
    describe("Methods", () => {
        it("Should update the media's dimensions", () => {
            const wrapper: ShallowWrapper<MediaPreviewCoreProps, {}> = shallow(<MediaPreview />);
            const instance: Component = wrapper.instance() as Component;
            (instance as any).setDimensions(50, 100);
            wrapper.state("width").should.equal(50);
            wrapper.state("height").should.equal(100);
        });
        it("Should not update the media's dimensions if the component has been unmounted", () => {
            const wrapper: ShallowWrapper<MediaPreviewCoreProps, {}> = shallow(<MediaPreview />);
            const instance: Component = wrapper.instance() as Component;
            const setStateSpy: sinon.SinonSpy = spy(instance, "setState");
            wrapper.unmount();
            (instance as any).setDimensions(50, 100);
            setStateSpy.should.not.have.been.called;
        });
        it("Should set element specific zoom", () => {
            const wrapper: ShallowWrapper<MediaPreviewCoreProps, {}> = shallow(<MediaPreview />);
            const instance: Component = wrapper.instance() as Component;
            (instance as any).setScale(2);
            wrapper.state("scale").should.equal(2);
        });
        it("Should set the auto zoom", () => {
            const wrapper: ShallowWrapper<MediaPreviewCoreProps, {}> = shallow(<MediaPreview />);
            const instance: Component = wrapper.instance() as Component;
            (instance as any).shouldFit(false);
            wrapper.state("fit").should.equal(false);
        });
    });
    describe("Lifecycle", () => {
        it("Should handle source after mounting", () => {
            const wrapper: ShallowWrapper<MediaPreviewCoreProps, {}> = shallow(<MediaPreview />);
            const instance: Component = wrapper.instance() as Component;
            const handleSourceStub: sinon.SinonStub = stub(instance, "handleSource");
            (instance as any).componentDidMount();
            handleSourceStub.should.have.been.calledOnce;
        });
        it("Should handle the new source when receiving new props", () => {
            const wrapper: ShallowWrapper<MediaPreviewCoreProps, {}> = shallow(<MediaPreview source={source} />);
            const instance: Component = wrapper.instance() as Component;
            const handleSourceStub: sinon.SinonSpy = spy(instance, "handleSource");
            const newSource: Source = {
                ...source,
                posX: 210,
                posY: 210
            };
            (instance as any).element = {
                clientHeight: 100,
                clientWidth: 100
            };
            wrapper.setState({
                width: 800,
                height: 600
            });
            (instance as any).componentWillReceiveProps({ source: newSource });
            handleSourceStub.should.have.been.calledOnce;
            handleSourceStub.should.have.been.calledWith(newSource);
            wrapper.state("offsetX").should.equal(160);
            wrapper.state("offsetY").should.equal(160);
        });
    });
});
