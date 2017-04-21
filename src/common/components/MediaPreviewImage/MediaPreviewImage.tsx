/**
 * @file Element that displays an image. Zooms and moves the image accordingly to show only the relevant part
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import * as React from "react";
import { MediaPreviewProps, mediaPreview } from "../MediaPreviewCore";
import { isEqual } from "lodash";
import { imagePreview } from "./styles.css";

export class MediaPreviewImage extends React.Component<MediaPreviewProps, {}> {
    imageElement: HTMLImageElement;
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
        if (source.preview !== nextProps.source.preview) {
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
            const imgElement: HTMLImageElement = document.createElement("img");
            imgElement.onload = () => {
                setDimensions(imgElement.width, imgElement.height);
            };
            imgElement.onerror = () => {
                // retry on error
                this.loadSource();
            };
            imgElement.src = source.src;
        }
    }
    setImgRef: (img: HTMLImageElement) => void = (img: HTMLImageElement): void => {
        this.imageElement = img;
    }
    render(): JSX.Element {
        const { source, computedHeight, computedWidth, offsetX, offsetY }: MediaPreviewProps = this.props;
        if (source) {
            return <div className={imagePreview}>
                <img ref={this.setImgRef}
                    src={source.preview}
                    alt="image"
                    style={{
                        top: `${offsetY * -1}px`,
                        left: `${offsetX * -1}px`,
                        width: `${`${computedWidth}px` || "auto"}`,
                        height: `${`${computedHeight}px` || "auto"}`,
                    }}
                />
            </div>;
        } else {
            return null;
        }
    }
}

export default mediaPreview<MediaPreviewProps, {}>(MediaPreviewImage);
