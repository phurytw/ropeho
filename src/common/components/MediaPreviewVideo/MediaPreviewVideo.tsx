/**
 * @file Element that displays an image. Zooms and moves the image accordingly to show only the relevant part
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import * as React from "react";
import { MediaPreviewProps, mediaPreview } from "../MediaPreviewCore";
import { isEqual } from "lodash";
import { videoPreview } from "./styles.css";

export class MediaPreviewVideo extends React.Component<MediaPreviewProps, {}> {
    videoElement: HTMLVideoElement;
    constructor(props?: MediaPreviewProps) {
        super(props);
    }
    componentWillMount(): void {
        const { noFit, shouldFit, scale, setScale }: MediaPreviewProps = this.props;
        if (noFit) {
            shouldFit(false);
        }
        if (typeof scale === "number" && isFinite(scale) && !isNaN(scale)) {
            setScale(scale);
        }
    }
    componentDidMount(): void {
        this.loadSource();
    }
    componentWillReceiveProps(nextProps: MediaPreviewProps): void {
        const { noFit, source, shouldFit, scale, setScale }: MediaPreviewProps = this.props;
        if (source.preview !== nextProps.source.preview || source.src !== nextProps.source.src) {
            this.loadSource();
        }
        if (noFit !== nextProps.noFit) {
            shouldFit(!nextProps.noFit);
        }
        if (scale !== nextProps.scale && typeof nextProps.scale === "number" && isFinite(nextProps.scale) && !isNaN(nextProps.scale)) {
            setScale(nextProps.scale);
        }
    }
    shouldComponentUpdate(nextProps: MediaPreviewProps): boolean {
        return !isEqual(nextProps, this.props);
    }
    loadSource: () => void = (): void => {
        const { source, setDimensions }: MediaPreviewProps = this.props;
        if (source && setDimensions) {
            const videoElement: HTMLVideoElement = this.videoElement;
            videoElement.addEventListener("loadedmetadata", () => {
                setDimensions(videoElement.videoWidth, videoElement.videoHeight);
            });
            videoElement.onerror = () => {
                setDimensions(0, 0);
            };
        }
    }
    setVideoRef: (video: HTMLVideoElement) => void = (video: HTMLVideoElement): void => {
        this.videoElement = video;
    }
    render(): JSX.Element {
        const { source, computedHeight, computedWidth, offsetX, offsetY }: MediaPreviewProps = this.props;
        if (source) {
            return <div className={videoPreview}>
                <video ref={this.setVideoRef}
                    style={{
                        top: `${offsetY * -1}px`,
                        left: `${offsetX * -1}px`,
                        width: `${computedWidth}px`,
                        height: `${computedHeight}px`
                    }}
                    muted={true}
                    autoPlay={true}
                    loop={true}
                    poster={source.fallback}
                >
                    <source src={source.preview} type="video/webm" />
                    <source src={source.src} type="video/mp4" />
                    <img src={source.fallback} title="Sorry, your browser doesn't support HTML5 video." alt="HTML5 video not supported" />
                </video>
            </div>;
        } else {
            return null;
        }
    }
}

export default mediaPreview<MediaPreviewProps, {}>(MediaPreviewVideo);
