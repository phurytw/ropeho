/**
 * @file Component that uses the appropriate MediaPreview implementation according to the media
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import * as React from "react";
import * as ReactCSSTransitionGroup from "react-addons-css-transition-group";
import { MediaTypes } from "../../../enum";
import MediaPreviewImage from "../MediaPreviewImage";
import MediaPreviewVideo from "../MediaPreviewVideo";
import { mp, mpEnter, mpEnterActive, mpLeave, mpLeaveActive } from "./styles.css";
import { isEqual } from "lodash";

import Media = Ropeho.Models.Media;
import Source = Ropeho.Models.Source;

export interface MediaPreviewState {
    source?: Source;
}

export interface MediaPreviewProps {
    media?: Media;
    textStyles?: string;
}

export class MediaPreview extends React.Component<MediaPreviewProps, {}> {
    interval: number;
    constructor(props?: MediaPreviewProps) {
        super(props);
        this.state = {};
    }
    componentWillMount(): void {
        const { media }: MediaPreviewProps = this.props;
        if (media) {
            this.assignSource(media);
        }
    }
    componentWillReceiveProps(nextProps: MediaPreviewProps): void {
        const { media }: MediaPreviewProps = nextProps;
        if (!isEqual(media, this.props.media)) {
            this.assignSource(media);
        }
    }
    componentWillUnmount(): void {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = undefined;
        }
    }
    assignSource: (media: Media) => void = (media: Media): void => {
        const { sources, type, delay }: Media = media;
        switch (type) {
            case MediaTypes.Image:
            case MediaTypes.Video:
                if (sources.length > 0) {
                    this.setState({ source: sources[0] });
                }
                break;
            case MediaTypes.Slideshow:
                if (this.interval) {
                    clearInterval(this.interval);
                }
                // 1 second default in case the delay is 0
                this.interval = setInterval(this.cycleSource, (delay || 1) * 1000) as any;
                break;
            default:
                break;
        }
    }
    cycleSource: () => void = (): void => {
        const { media: { sources } }: MediaPreviewProps = this.props;
        const { source }: MediaPreviewState = this.state;
        const index: number = sources.indexOf(source);
        const next: number = sources[index + 1] ? index + 1 : 0;
        if (index !== next) {
            this.setState({
                source: sources[next]
            });
        }
    }
    render(): JSX.Element {
        const { media, textStyles }: MediaPreviewProps = this.props;
        const { source }: MediaPreviewState = this.state;
        const fadeTransition: (Component: JSX.Element) => JSX.Element = (Component: JSX.Element) => <ReactCSSTransitionGroup
            transitionName={{
                enter: mpEnter,
                enterActive: mpEnterActive,
                leave: mpLeave,
                leaveActive: mpLeaveActive
            }}
            transitionEnterTimeout={500}
            transitionLeaveTimeout={500}
            className={mp}
            component="div">
            {Component}
        </ReactCSSTransitionGroup>;
        switch (media && media.type) {
            case MediaTypes.Image:
            case MediaTypes.Slideshow:
                return fadeTransition(<MediaPreviewImage source={source} key={source && source._id} />);
            case MediaTypes.Video:
                return fadeTransition(<MediaPreviewVideo source={source} key={source && source._id} />);
            case MediaTypes.Text:
                return fadeTransition(<div className={textStyles} key={media._id}>
                    <p>{media.description}</p>
                </div>);
            default:
                return null;
        }
    }
}

export default MediaPreview;
