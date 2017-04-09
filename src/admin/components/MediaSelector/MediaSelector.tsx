/**
 * @file List of sources
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../typings.d.ts" />
import * as React from "react";
import { isEqual } from "lodash";
import { MediaPermissions, MediaTypes } from "../../../enum";
import MediaPreview from "../../../common/components/MediaPreview";
import { v4 } from "uuid";
import { mediaSelector, selected, addNew } from "./styles.css";
import MediaSelectorButtons from "../MediaSelectorButtons";

import Media = Ropeho.Models.Media;

export interface MediaSelectorProps {
    medias?: Media[];
    removeSelected?: (error?: Ropeho.IErrorResponse) => any;
    setMedia?: (media: Media) => any;
    selectMedia?: (mediaId: string) => any;
    selectedMedia?: Media;
    setMediaPosition?: (sourceId: string, position: number) => any;
}

export class MediaSelector extends React.Component<MediaSelectorProps, {}> {
    constructor(props: MediaSelectorProps) {
        super(props);
    }
    shouldComponentUpdate(nextProps: MediaSelectorProps): boolean {
        return !isEqual(nextProps.medias, this.props.medias) || !isEqual(nextProps.selectedMedia, this.props.selectedMedia);
    }
    createMedia: () => void = (): void => {
        this.props.setMedia({
            _id: v4(),
            delay: 0,
            description: "",
            sources: [],
            state: MediaPermissions.Public,
            type: MediaTypes.Image
        });
    }
    moveMediaUp: () => void = (): void => {
        const { setMediaPosition, medias, selectedMedia }: MediaSelectorProps = this.props;
        const mediaId: string = selectedMedia._id;
        setMediaPosition(mediaId, Math.max(medias.map((m: Media) => m._id).indexOf(mediaId) - 1, 0));
    }
    moveMediaDown: () => void = (): void => {
        const { setMediaPosition, medias, selectedMedia }: MediaSelectorProps = this.props;
        const mediaId: string = selectedMedia._id;
        setMediaPosition(mediaId, medias.map((m: Media) => m._id).indexOf(mediaId) + 1);
    }
    selectMedia: (media: Media) => void = (media: Media): void => {
        const { selectMedia }: MediaSelectorProps = this.props;
        selectMedia(media._id);
    }
    render(): JSX.Element {
        const { medias, selectedMedia, removeSelected }: MediaSelectorProps = this.props;
        // tslint:disable:react-this-binding-issue
        return <div>
            <div className={mediaSelector}>
                {
                    // show the existing sources
                    medias ? medias.map<JSX.Element>((m: Media, index: number) => <div
                        role="main"
                        key={index}
                        onClick={this.selectMedia.bind(this, m)}
                        className={selectedMedia && m._id === selectedMedia._id ? selected : ""}
                    >
                        <MediaPreview media={m} scale={0.25} />
                    </div>) : null
                }
                <div role="main" onClick={this.createMedia} className={addNew}>
                    <p>+</p>
                </div>
            </div>
            {
                selectedMedia ? <MediaSelectorButtons onMoveUp={this.moveMediaUp} onMoveDown={this.moveMediaDown} onDelete={removeSelected} /> : null
            }
        </div>;
    }
}

export default MediaSelector;
