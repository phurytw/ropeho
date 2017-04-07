/**
 * @file Media edit component
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../typings.d.ts" />
import * as React from "react";
import { Dropdown, Input, Dialog } from "react-toolbox";
import { MediaTypes, MediaPermissions } from "../../../enum";
import { Route } from "react-router-dom";
import SourceEdit from "../SourceEdit";
import SourceSelector from "../SourceSelector";
import { isEqual } from "lodash";

import Media = Ropeho.Models.Media;
import Source = Ropeho.Models.Source;

export interface MediaEditState {
    promptTypeChange?: number | boolean;
}

export interface MediaEditProps {
    media?: Media;
    source?: Source;
    sources?: Source[];
    setMedia?: (media: Media) => any;
    publicOnly?: boolean;
    setError?: (error: Ropeho.IErrorResponse) => any;
    setSource?: (source: Source) => any;
    selectSource?: (source: Source) => any;
    deleteSources?: (sourceIds: string[]) => any;
    setSourcePosition?: (mediaId: string, sourceId: string, posiiton: number) => any;
    setFile?: (objectURL: string, file: File) => any;
}

export class MediaEdit extends React.Component<MediaEditProps, MediaEditState> {
    constructor(props: MediaEditProps) {
        super(props);
        this.state = {
            promptTypeChange: false
        };
    }
    shouldComponentUpdate(nextProps: MediaEditProps, nextState: MediaEditState): boolean {
        return !isEqual(nextProps.media, this.props.media) ||
            !isEqual(nextProps.source, this.props.source) ||
            !isEqual(nextProps.sources, this.props.sources) ||
            nextState.promptTypeChange !== this.state.promptTypeChange;
    }
    setDelay: (delay: number) => void = (delay: number): void => {
        const { media, setMedia }: MediaEditProps = this.props;
        setMedia({
            ...media,
            delay
        });
    }
    setDescription: (description: string) => void = (description: string): void => {
        const { media, setMedia }: MediaEditProps = this.props;
        setMedia({
            ...media,
            description
        });
    }
    setMediaType: (type: number) => void = (type: number): void => {
        const { media, setMedia, sources, deleteSources }: MediaEditProps = this.props;
        if (sources && sources.length > 0 && this.state.promptTypeChange === false) {
            this.setState({
                promptTypeChange: type
            });
            return;
        } else if (sources && sources.length > 0) {
            deleteSources(sources.map((s: Source) => s._id));
        }
        setMedia({
            ...media,
            type: this.state.promptTypeChange === false ? type : this.state.promptTypeChange as number
        });
        this.setState({
            promptTypeChange: false
        });
    }
    setMediaPermissions: (state: number) => void = (state: number): void => {
        const { media, setMedia }: MediaEditProps = this.props;
        setMedia({
            ...media,
            state
        });
    }
    setSourcePosition: (sourceId: string, position: number) => void = (sourceId: string, position: number): void => {
        const { setSourcePosition, media }: MediaEditProps = this.props;
        if (media) {
            setSourcePosition(media._id, sourceId, position);
        }
    }
    removeSource: (sourceId: string) => void = (sourceId: string): void => {
        this.props.deleteSources([sourceId]);
    }
    render(): JSX.Element {
        const { media, publicOnly, sources, setError, setSource, selectSource, source, setFile }: MediaEditProps = this.props;
        const renderSourceEdit: () => JSX.Element = () => {
            if (source) {
                return <SourceEdit setSource={setSource} source={source} type={media.type} removeSource={this.removeSource} />;
            } else {
                return null;
            }
        };
        // tslint:disable:react-this-binding-issue
        if (!media) {
            return <div></div>;
        }
        return <div>
            <Dropdown
                required
                label="Type de media"
                value={media.type}
                onChange={this.setMediaType}
                source={[{
                    value: MediaTypes.Image.valueOf(),
                    label: "Image"
                }, {
                    value: MediaTypes.Video.valueOf(),
                    label: "Video"
                }, {
                    value: MediaTypes.Slideshow.valueOf(),
                    label: "Slides"
                }, {
                    value: MediaTypes.Text.valueOf(),
                    label: "Texte"
                }]}
            />
            {publicOnly ? "" :
                <Dropdown
                    required
                    label="Accès"
                    value={media.state}
                    onChange={this.setMediaPermissions}
                    source={[{
                        label: "Publique (visible sur le site)",
                        value: MediaPermissions.Public.valueOf()
                    }, {
                        label: "Privé (visible que par les clients concernés)",
                        value: MediaPermissions.OwnerOnly.valueOf()
                    }, {
                        label: "Vérouillé (visible que par les administrateurs)",
                        value: MediaPermissions.Locked.valueOf()
                    }]}
                />}
            {media.type === MediaTypes.Slideshow ?
                <Input label="Durée entre les slides (en secondes)" type="number" onChange={this.setDelay} value={media.delay} /> : ""}
            {publicOnly ? "" : <Input label="Description" rows={5} multiline={true} onChange={this.setDescription} value={media.description} />}
            <Dialog
                active={this.state.promptTypeChange !== false}
                title="Changement de type"
                actions={[{
                    label: "OK",
                    icon: "done",
                    onClick: this.setMediaType
                }]}
            >
                <p>Il y a actuellement {sources && sources.length} images/vidéo sur ce media. Ils ne seront plus utilisés si le type de media change.</p>
            </Dialog>
            <SourceSelector media={media} sources={sources} setError={setError} setSource={setSource} setSourcePosition={this.setSourcePosition} selectSource={selectSource} setFile={setFile} />
            <Route
                path="/*/*/:mediaId/:sourceId"
                render={renderSourceEdit}
            />
            <Route
                path="/*/*/*/:mediaId/:sourceId"
                render={renderSourceEdit}
            />
        </div>;
    }
}

export default MediaEdit;
