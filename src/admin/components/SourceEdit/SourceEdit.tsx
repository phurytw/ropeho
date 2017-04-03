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

import Source = Ropeho.Models.Source;

export interface SourceEditProps {
    source?: Source;
    setSource?: (source: Source) => any;
    type?: MediaTypes;
}

export class SourceEdit extends React.Component<SourceEditProps, {}> {
    constructor(props: SourceEditProps) {
        super(props);
    }
    render(): JSX.Element {
        const { source, setSource, type }: SourceEditProps = this.props;
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
                    <SourceEditMetaData source={source} setSource={setSource} />
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
