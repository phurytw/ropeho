/**
 * @file Tests for the MediaEdit component
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../typings.d.ts" />
import { should, use } from "chai";
import { spy } from "sinon";
import * as sinonChai from "sinon-chai";
import * as React from "react";
import { shallow, ShallowWrapper } from "enzyme";
import hook from "../../../common/helpers/cssModulesHook";
hook();
import { Dropdown, Input, Dialog } from "react-toolbox";
import { MediaEdit, MediaEditProps, MediaEditState } from "./MediaEdit";
import { MediaTypes } from "../../../enum";
import SourceSelector from "../SourceSelector";
should();
use(sinonChai);

describe("MediaEdit component", () => {
    let setMediaSpy: sinon.SinonSpy,
        props: MediaEditProps;
    const media: Ropeho.Models.Media = {
        _id: "mediaId",
        delay: 0,
        description: "desc",
        sources: [],
        state: 0,
        type: MediaTypes.Image
    };
    before(() => {
        setMediaSpy = spy();
        props = {
            media,
            setMedia: setMediaSpy,
            sources: []
        };
    });
    afterEach(() => setMediaSpy.reset());
    describe("Element", () => {
        it("Should have a dropdown to choose between media types", () => {
            const dropdown: ShallowWrapper<any, {}> = shallow(<MediaEdit {...props} />).find(Dropdown).find({ label: "Type de media" });
            dropdown.should.have.lengthOf(1);
            dropdown.prop("source").should.have.lengthOf(4);
        });
        it("Should have a dropdown to choose between media permissions", () => {
            const dropdown: ShallowWrapper<any, {}> = shallow(<MediaEdit {...props} />).find(Dropdown).find({ label: "Accès" });
            dropdown.should.have.lengthOf(1);
            dropdown.prop("source").should.have.lengthOf(3);
        });
        it("Should have an input for delay when the media is of type slideshow", () => {
            const wrapper: ShallowWrapper<MediaEditProps, {}> = shallow(<MediaEdit {...props} />);
            wrapper.find({ label: "Durée entre les slides" }).should.have.lengthOf(0);
            wrapper.setProps({
                media: {
                    type: MediaTypes.Slideshow
                }
            });
            wrapper.find({ label: "Durée entre les slides (en secondes)" }).should.have.lengthOf(1);
        });
        it("Should have an input for the description", () => {
            shallow(<MediaEdit {...props} />).find(Input).find({ label: "Description" }).should.have.lengthOf(1);
        });
        it("Should show a popup when trying to change a type of a media with sources", () => {
            const wrapper: ShallowWrapper<MediaEditProps, {}> = shallow(<MediaEdit {...props} media={{
                ...media,
                sources: [{
                    _id: "source"
                }]
            }} />);
            wrapper.setState({
                promptTypeChange: true
            }).find(Dialog).find({ active: true }).should.have.lengthOf(1);
        });
        it("Should not show the description input and the media permissions input if it's a public media only", () => {
            const wrapper: ShallowWrapper<MediaEditProps, {}> = shallow(<MediaEdit {...props} publicOnly />);
            wrapper.find(Input).find({ label: "Description" }).should.have.lengthOf(0);
            wrapper.find(Dropdown).find({ label: "Accès" }).should.have.lengthOf(0);
        });
        it("Should have the source selector", () => {
            const wrapper: ShallowWrapper<MediaEditProps, {}> = shallow(<MediaEdit {...props} />);
            wrapper.find(SourceSelector).should.have.lengthOf(1);
        });
    });
    describe("Methods", () => {
        it("Should call setMedia with the updated delay", () => {
            const mediaEdit: MediaEdit = shallow(<MediaEdit {...props} />).instance() as MediaEdit;
            mediaEdit.setDelay("10");
            setMediaSpy.should.have.been.calledOnce;
            setMediaSpy.should.have.been.calledWith({
                ...media,
                delay: 10
            });
        });
        it("Should call setMedia with the updated media type", () => {
            const mediaEdit: MediaEdit = shallow(<MediaEdit {...props} />).instance() as MediaEdit;
            mediaEdit.setMediaType(10);
            setMediaSpy.should.have.been.calledOnce;
            setMediaSpy.should.have.been.calledWith({
                ...media,
                type: 10
            });
        });
        it("Should call setMedia with the updated media permissions", () => {
            const mediaEdit: MediaEdit = shallow(<MediaEdit {...props} />).instance() as MediaEdit;
            mediaEdit.setMediaPermissions(10);
            setMediaSpy.should.have.been.calledOnce;
            setMediaSpy.should.have.been.calledWith({
                ...media,
                state: 10
            });
        });
        it("Should call setMedia with the updated media description", () => {
            const mediaEdit: MediaEdit = shallow(<MediaEdit {...props} />).instance() as MediaEdit;
            mediaEdit.setDescription("new description");
            setMediaSpy.should.have.been.calledOnce;
            setMediaSpy.should.have.been.calledWith({
                ...media,
                description: "new description"
            });
        });
        it("Should show a warning when changing media type if there are sources", () => {
            const wrapper: ShallowWrapper<MediaEditProps, MediaEditState> = shallow(<MediaEdit {...props} sources={[{
                _id: "source"
            }]} />);
            const mediaEdit: MediaEdit = wrapper.instance() as MediaEdit;
            mediaEdit.setMediaType(10);
            setMediaSpy.should.have.not.been.called;
            wrapper.state("promptTypeChange").should.equal(10);
        });
        it("Should change the media type and delete all sources previously associated with the media", () => {
            const deleteSourcesSpy: sinon.SinonSpy = spy();
            const wrapper: ShallowWrapper<MediaEditProps, MediaEditState> = shallow(<MediaEdit {...props} sources={[{
                _id: "source"
            }]} deleteSources={deleteSourcesSpy} />);
            wrapper.setState({
                promptTypeChange: true
            });
            const mediaEdit: MediaEdit = wrapper.instance() as MediaEdit;
            mediaEdit.setMediaType(10);
            setMediaSpy.should.have.been.calledOnce;
            deleteSourcesSpy.should.have.been.calledOnce;
        });
        it("Should set the position of a source", () => {
            const setSourcePositionSpy: sinon.SinonSpy = spy();
            const wrapper: ShallowWrapper<MediaEditProps, MediaEditState> = shallow(<MediaEdit {...props}
                setSourcePosition={setSourcePositionSpy} />);
            wrapper.setState({
                promptTypeChange: true
            });
            const mediaEdit: MediaEdit = wrapper.instance() as MediaEdit;
            mediaEdit.setSourcePosition("sourceId", 10);
            setSourcePositionSpy.should.have.been.calledOnce;
            setSourcePositionSpy.should.have.been.calledWith(media._id, "sourceId", 10);
        });
        it("Should delete a single source", () => {
            const deleteSourcesSpy: sinon.SinonSpy = spy();
            const wrapper: ShallowWrapper<MediaEditProps, MediaEditState> = shallow(<MediaEdit {...props} deleteSources={deleteSourcesSpy} />);
            const instance: MediaEdit = wrapper.instance() as MediaEdit;
            instance.removeSource("sourceId");
            deleteSourcesSpy.should.have.been.calledOnce;
            deleteSourcesSpy.should.have.been.calledWith(["sourceId"]);
        });
    });
});
