/**
 * @file HOC that wraps an element and exposes props for the media preview
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import * as React from "react";
import { isEqual } from "lodash";

import Source = Ropeho.Models.Source;

export interface MediaPreviewCoreState {
    /**
     * media's width in pixels
     */
    width?: number;
    /**
     * media's height in pixels
     */
    height?: number;
    /**
     * computed X axis offset value
     */
    offsetX?: number;
    /**
     * computed Y axis offset value
     */
    offsetY?: number;
    /**
     * media's final width
     */
    computedWidth?: number;
    /**
     * media's final height
     */
    computedHeight?: number;
}

export interface MediaPreviewCoreProps {
    /**
     * the source will be passed to the connected component
     */
    source?: Source;
}

export interface MediaPreviewCore<P> {
    new (): React.Component<P & MediaPreviewCoreProps, MediaPreviewCoreState>;
}

export interface MediaPreview<P, S> {
    new (): React.Component<P & MediaPreviewCoreProps & MediaPreviewCoreState, S>;
}

export interface MediaPreviewProps extends MediaPreviewCoreState, MediaPreviewCoreProps {
    /**
     * prop that will be passed down
     */
    setDimensions?: (width: number, height: number) => void;
}

export const mediaPreview: <P, S>(Comp: MediaPreview<P & MediaPreviewProps, S>) => MediaPreviewCore<P> =
    <P, S>(Comp: MediaPreview<P & MediaPreviewProps, S>): MediaPreviewCore<P> => {
        return class extends React.Component<P & MediaPreviewCoreProps, MediaPreviewCoreState> {
            element: HTMLDivElement;
            constructor(props?: P & MediaPreviewCoreProps) {
                super(props);
                this.state = {};
            }
            componentDidMount(): void {
                this.handleSource();
            }
            componentWillReceiveProps(nextProps: MediaPreviewCoreProps): void {
                if (this.props.source !== nextProps.source) {
                    this.handleSource();
                }
            }
            shouldComponentUpdate(nextProps: MediaPreviewCoreProps, nextState: MediaPreviewCoreProps): boolean {
                return !isEqual(nextProps.source, this.props.source) || !isEqual(nextState, this.state);
            }
            componentWillUnmount(): void {
                this.element.removeEventListener("resize", this.handleSource);
                window.removeEventListener("resize", this.handleSource);
            }
            handleSource: () => void = (): void => {
                const { source }: MediaPreviewCoreProps = this.props;
                const { height, width }: MediaPreviewCoreState = this.state;
                if (source && this.element) {
                    const { posX, posY, zoom }: Source = source;
                    const { clientHeight, clientWidth }: HTMLDivElement = this.element;
                    let offsetX: number,
                        offsetY: number,
                        computedHeight: number = height * zoom,
                        computedWidth: number = width * zoom;
                    const halfWidth: number = clientWidth / 2,
                        halfHeight: number = clientHeight / 2;

                    // must not have empty space
                    if (computedHeight < clientHeight || computedWidth < clientWidth) {
                        const newZoom: number = Math.max(clientWidth / width, clientHeight / height);
                        computedHeight = height * newZoom;
                        computedWidth = width * newZoom;
                    }

                    // POI must be at the center
                    // but must not leave any blank space
                    offsetX = posX < halfWidth ? 0 : (computedWidth - posX < halfWidth ? computedWidth - clientWidth : posX - halfWidth);
                    offsetY = posY < halfHeight ? 0 : (computedHeight - posY < halfHeight ? computedHeight - clientHeight : posY - halfHeight);
                    this.setState({
                        offsetX,
                        offsetY,
                        computedHeight,
                        computedWidth
                    });
                }
            }
            setDimensions: (width: number, height: number) => void = (width: number, height: number): void => {
                this.setState({
                    width,
                    height
                });
                this.handleSource();
            }
            setElement: (element: HTMLDivElement) => any = (element: HTMLDivElement): any => {
                if (element) {
                    this.element = element;
                    this.element.addEventListener("resize", this.handleSource);
                    window.addEventListener("resize", this.handleSource);
                }
            }
            render(): JSX.Element {
                return <div ref={this.setElement} style={{ width: "100%", height: "100%", overflow: "hidden" }}>
                    <Comp {...this.props } {...this.state} setDimensions={this.setDimensions} />
                </div>;
            }
        };
    };

export default mediaPreview;
