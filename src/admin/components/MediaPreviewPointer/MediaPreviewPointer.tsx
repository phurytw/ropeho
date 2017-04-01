/**
 * @file Element that displays an image. Zooms and moves the image accordingly to show only the relevant part
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../typings.d.ts" />
import * as React from "react";
import { MediaPreviewProps, mediaPreview } from "../MediaPreviewCore";
import { MediaTypes } from "../../../enum";
import Pointer from "../Pointer";

import Source = Ropeho.Models.Source;

export interface MediaPreviewPointerProps extends MediaPreviewProps {
    type?: MediaTypes;
    setSource?: (source: Source) => any;
}

export class MediaPreviewPointer extends React.Component<MediaPreviewPointerProps, {}> {
    element: HTMLDivElement;
    constructor(props?: MediaPreviewPointerProps) {
        super(props);
    }
    componentWillMount(): void {
        this.loadSource();
    }
    componentWillReceiveProps(nextProps: MediaPreviewPointerProps): void {
        if (this.props.source !== nextProps.source) {
            this.loadSource();
        }
    }
    componentDidMount(): void {
        this.element.parentElement.style.position = "absolute";
        this.element.parentElement.style.top = "0";
        this.element.parentElement.style.right = "0";
        this.element.parentElement.style.cursor = "pointer";
    }
    setRef: (ref: HTMLDivElement) => void = (ref: HTMLDivElement): void => {
        if (ref) {
            this.element = ref;
        }
    }
    loadSource: () => void = (): void => {
        const { source, setDimensions, type }: MediaPreviewPointerProps = this.props;
        if (source && setDimensions) {
            switch (type) {
                case MediaTypes.Image:
                    const imgElement: HTMLImageElement = new Image();
                    imgElement.onload = () => {
                        setDimensions(imgElement.width, imgElement.height);
                    };
                    imgElement.src = source.preview;
                    break;
                case MediaTypes.Video:
                    const videoElement: HTMLVideoElement = document.createElement("video");
                    videoElement.src = source.preview;
                    setDimensions(videoElement.videoWidth, videoElement.videoHeight);
                    break;

                default:
                    break;
            }
        }
    }
    setPOI: (event: React.MouseEvent<HTMLDivElement>) => void = ({ clientX, clientY }: React.MouseEvent<HTMLDivElement>): void => {
        const { setSource, source, offsetX, offsetY }: MediaPreviewPointerProps = this.props;
        const { top, left }: ClientRect = this.element.getBoundingClientRect();
        setSource({
            ...source,
            posX: clientX + offsetX - left,
            posY: clientY + offsetY - top
        });
    }
    setZoom: (event: React.WheelEvent<HTMLDivElement>) => void = (event: React.WheelEvent<HTMLDivElement>): void => {
        event.preventDefault();
        const { setSource, source }: MediaPreviewPointerProps = this.props;
        setSource({
            ...source,
            zoom: source.zoom += event.deltaY < 0 ? .10 : (event.deltaY > 0 ? -.10 : 0)
        });
    }
    render(): JSX.Element {
        const { source, offsetX, offsetY }: MediaPreviewPointerProps = this.props;
        if (source) {
            return <div ref={this.setRef}
                style={{
                    width: "100%",
                    height: "100%",
                    position: "relative"
                }}
                onClick={this.setPOI}
                onWheel={this.setZoom}
                role="main">
                <Pointer style={{
                    position: "absolute",
                    top: `${source.posY - offsetY}px`,
                    left: `${source.posX - offsetX}px`
                }} />
            </div>;
        } else {
            return null;
        }
    }
}

export default mediaPreview<MediaPreviewPointerProps, {}>(MediaPreviewPointer);
