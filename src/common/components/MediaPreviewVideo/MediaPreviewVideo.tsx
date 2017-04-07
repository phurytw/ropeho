/**
 * @file Element that displays an image. Zooms and moves the image accordingly to show only the relevant part
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import * as React from "react";
import { MediaPreviewProps, mediaPreview } from "../MediaPreviewCore";
import { isEqual } from "lodash";

export class MediaPreviewVideo extends React.Component<MediaPreviewProps, {}> {
    constructor(props?: MediaPreviewProps) {
        super(props);
    }
    componentWillMount(): void {
        const { noFit, shouldFit }: MediaPreviewProps = this.props;
        if (noFit) {
            shouldFit(false);
        }
        this.loadSource();
    }
    componentWillReceiveProps(nextProps: MediaPreviewProps): void {
        const { noFit, source, shouldFit }: MediaPreviewProps = this.props;
        if (source !== nextProps.source) {
            this.loadSource();
        }
        if (noFit !== nextProps.noFit) {
            shouldFit(!nextProps.noFit);
        }
    }
    shouldComponentUpdate(nextProps: MediaPreviewProps): boolean {
        return !isEqual(nextProps, this.props);
    }
    loadSource: () => void = (): void => {
        const { source, setDimensions }: MediaPreviewProps = this.props;
        if (source && setDimensions) {
            const videoElement: HTMLVideoElement = document.createElement("video");
            videoElement.src = source.preview;
            videoElement.addEventListener("loadedmetadata", () => {
                setDimensions(videoElement.videoWidth, videoElement.videoHeight);
            });
        }
    }
    render(): JSX.Element {
        const { source, computedHeight, computedWidth, offsetX, offsetY }: MediaPreviewProps = this.props;
        if (source) {
            return <div style={{
                width: "100%",
                height: "100%",
                position: "relative"
            }}>
                <video src={source.preview}
                    style={{
                        position: "absolute",
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
                    <source src={source.src} />
                    <source src={source.preview} />
                    <img src={source.fallback} title="Sorry, your browser doesn't support HTML5 video." alt="HTML5 video not supported" />
                </video>
            </div>;
        } else {
            return null;
        }
    }
}

export default mediaPreview<MediaPreviewProps, {}>(MediaPreviewVideo);
