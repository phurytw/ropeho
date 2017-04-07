/**
 * @file Source edit component
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../typings.d.ts" />
import * as React from "react";
import { SourceEditMetaData } from "../SourceEditMetaData";
import MediaPreviewImage from "../../../common/components/MediaPreviewImage";
import MediaPreviewVideo from "../../../common/components/MediaPreviewVideo";
import MediaPreviewPointer from "../MediaPreviewPointer";
import { MediaTypes } from "../../../enum";
import { sourcePreview } from "./styles.css";
import { isEqual } from "lodash";

import Source = Ropeho.Models.Source;

export interface SourceEditProps {
    source?: Source;
    setSource?: (source: Source) => any;
    type?: MediaTypes;
    removeSource?: (sourceId: string) => any;
}

export class SourceEdit extends React.Component<SourceEditProps, {}> {
    constructor(props: SourceEditProps) {
        super(props);
    }
    shouldComponentUpdate(nextProps: SourceEditProps): boolean {
        return !isEqual(nextProps.source, this.props.source) || nextProps.type !== this.props.type;
    }
    render(): JSX.Element {
        const { source, setSource, type, removeSource }: SourceEditProps = this.props;
        if (source && source._id) {
            let mediaPreview: JSX.Element;
            switch (type) {
                case MediaTypes.Image:
                    mediaPreview = <MediaPreviewImage source={source} />;
                    break;
                case MediaTypes.Video:
                    mediaPreview = <MediaPreviewVideo source={source} />;
                    break;
                case MediaTypes.Slideshow:
                    mediaPreview = <MediaPreviewImage source={source} />;
                    break;
            }
            if (mediaPreview) {
                return <div className={sourcePreview}>
                    {mediaPreview}
                    <MediaPreviewPointer source={source} type={type} setSource={setSource} />
                    <SourceEditMetaData source={source} setSource={setSource} removeSource={removeSource} />
                </div>;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }
}

export default SourceEdit;
