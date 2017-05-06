/**
 * @file Full screen image viewer
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
import { viewerStyles, viewingStyles, closeButtonStyles } from "./styles.css";
import { MediaTypes } from "../../../enum";
import MediaPreview from "../../../common/components/MediaPreview";
import ContainerRenderer from "../../../common/components/ContainerRenderer";
import MediaBrowser from "../MediaBrowser";

import Media = Ropeho.Models.Media;
import Source = Ropeho.Models.Source;
import Presentation = Ropeho.Models.Presentation;

export interface ViewerParams {
    productionName?: string;
    mediaNumber?: string;
}

export interface ViewerProps extends Partial<RouteComponentProps<ViewerParams>> {
    medias?: Media[];
}

export class Viewer extends React.Component<ViewerProps, {}> {
    constructor(props?: ViewerProps) {
        super(props);
    }
    close: () => void = (): void => {
        const { history: { push }, match: { params: { productionName } } }: ViewerProps = this.props;
        push(`/${productionName}`);
    }
    render(): JSX.Element {
        const { medias, match: { params: { mediaNumber, productionName } } }: ViewerProps = this.props;
        let viewing: JSX.Element;
        let source: Source;
        const media: Media = medias[parseInt(mediaNumber)];
        switch (media && media.type) {
            case MediaTypes.Image:
                source = media.sources[0];
                viewing = <img src={source.preview} alt="image" />;
                break;
            case MediaTypes.Video:
                source = media.sources[0];
                viewing = <video controls muted autoPlay loop poster={source.fallback}>
                    <source src={source.preview} type="video/webm" />
                    <source src={source.src} type="video/mp4" />
                    <img src={source.fallback} title="Sorry, your browser doesn't support HTML5 video." alt="HTML5 video not supported" />
                </video>;
                break;
            case MediaTypes.Slideshow:
            case MediaTypes.Text:
                viewing = <MediaPreview media={media} />;
                break;
        }
        return <div className={viewerStyles}>
            <i className={`fa fa-3x fa-times ${closeButtonStyles}`} aria-hidden="true" onClick={this.close} role="natigation"></i>
            <div className={viewingStyles}>
                {viewing}
            </div>
            <ContainerRenderer presentations={medias.map<Presentation>((m: Media, i: number) => ({
                _id: m._id,
                mainMedia: m,
                href: `/${productionName}/${i}`
            }))}>
                <MediaBrowser selected={parseInt(mediaNumber)} />
            </ContainerRenderer>
        </div>;
    }
}

export default Viewer;
