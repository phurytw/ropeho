/**
 * @file Component that uses the appropriate MediaPreview implementation according to the media
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import * as React from "react";
import * as ReactCSSTransitionGroup from "react-addons-css-transition-group";
import { MediaTypes } from "../../../enum";
import MediaPreviewImage from "../MediaPreviewImage";
import MediaPreviewVideo from "../MediaPreviewVideo";
import { mp, mpEnter, mpEnterActive, mpLeave, mpLeaveActive, textStyles } from "./styles.css";

import Media = Ropeho.Models.Media;
import Source = Ropeho.Models.Source;

export interface MediaPreviewState {
    source?: Source;
}

export interface MediaPreviewProps {
    media?: Media;
    textStyles?: string;
    scale?: number;
}

export class MediaPreview extends React.Component<MediaPreviewProps, {}> {
    interval: number;
    constructor(props?: MediaPreviewProps) {
        super(props);
        this.state = {};
    }
    componentWillMount(): void {
        this.cycleSource();
    }
    componentDidMount(): void {
        const { media: { type, delay } }: MediaPreviewProps = this.props;
        if (type === MediaTypes.Slideshow) {
            this.setCycle(delay);
        }
    }
    componentWillReceiveProps({ media: { type, delay, sources } }: MediaPreviewProps): void {
        if (type === MediaTypes.Slideshow && delay !== this.props.media.delay) {
            this.setCycle(delay);
        } else if (type !== MediaTypes.Slideshow) {
            this.cycleSource(sources);
        }
    }
    componentWillUnmount(): void {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = undefined;
        }
    }
    setCycle: (delay: number) => void = (delay: number): void => {
        delay = typeof delay === "number" && !isNaN(delay) && isFinite(delay) ? Math.max(delay, 1) * 1000 : 1000;
        if (this.interval) {
            clearInterval(this.interval);
        }
        this.interval = setInterval(this.cycleSource, delay) as any;
    }
    cycleSource: (sourcesToUse?: Source[]) => void = (sourcesToUse?: Source[]): void => {
        const sources: Source[] = sourcesToUse || this.props.media.sources;
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
        const { media, scale }: MediaPreviewProps = this.props;
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
                return fadeTransition(<MediaPreviewImage source={source} key={source && source._id} scale={scale} />);
            case MediaTypes.Video:
                return fadeTransition(<MediaPreviewVideo source={source} key={source && source._id} scale={scale} />);
            case MediaTypes.Text:
                return fadeTransition(<div className={this.props.textStyles || textStyles} key={media._id}>
                    <p>{media.description}</p>
                </div>);
            default:
                return null;
        }
    }
}

export default MediaPreview;
