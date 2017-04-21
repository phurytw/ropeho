/**
 * @file Component that pass presentations as props when the page is done loading all necessary images and videos
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import * as React from "react";
import { Dimensions, getMediaDimensions } from "../../helpers/mediaDimensionsUtilities";
import { isMediaEmpty } from "../../helpers/entityUtilities";
import { isEqual } from "lodash";

import Presentation = Ropeho.Models.Presentation;
import Media = Ropeho.Models.Media;

export interface ContainerRendererState {
    take?: number;
}

export interface ContainerRendererProps {
    /**
     * Presentations to use
     */
    presentations?: Presentation[];
    /**
     * Renders immediately when true. Does not render when false. Renders after specified milliseconds when number (timeout). Renders when ready otherwise.
     */
    render?: boolean | undefined | null | number;
    /**
     * Delay between presentations when rendering progressively
     */
    interval?: number;
}

export class ContainerRenderer extends React.Component<ContainerRendererProps, ContainerRendererState> {
    /**
     * Loaded presentations
     */
    presentationDimensions?: { [key: string]: Dimensions } = {};
    /**
     * true if document, images and videos are loaded
     */
    loaded?: boolean;
    /**
     * ture if component is mounted
     */
    mounted?: boolean;
    /**
     * The component's root element
     */
    element: HTMLDivElement;
    /**
     * Interval used when rendering progressively
     */
    interval: number;
    /**
     * Timeout used when using the render prop with a timeout
     */
    timeout: number;
    constructor(props?: ContainerRendererProps) {
        super(props);
        this.state = {
            take: 0
        };
    }
    componentWillMount(): void {
        this.mounted = true;
        // render everything when mounting
        this.renderAll();
    }
    componentWillReceiveProps(nextProps: ContainerRendererProps): void {
        if (this.props.render !== nextProps.render) {
            const { render, interval }: ContainerRendererProps = nextProps;
            if (render === true || (render !== false && this.loaded)) {
                this.renderAll(interval);
            } else if (render === false) {
                this.renderNone();
            } else if (typeof render === "number") {
                if (!this.timeout) {
                    this.timeout = setTimeout(() => this.renderAll(interval), render) as any;
                }
            }
        }
        if (!isEqual(this.props.presentations, nextProps.presentations)) {
            this.setPresentationDimensions(nextProps);
        }
    }
    componentDidMount(): void {
        const { render }: ContainerRendererProps = this.props;
        const interval: number = this.props.interval || 250;
        if (render === true) {
            if (this.props.interval) {
                this.renderNone();
                this.renderAll(interval);
            }
        } else if (typeof render === "number") {
            this.renderNone();
            this.timeout = setTimeout(() => this.renderAll(interval), render) as any;
        } else {
            this.renderNone();
        }
        this.setPresentationDimensions();
    }
    componentWillUnmount(): void {
        this.mounted = false;
        this.loaded = false;
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = undefined;
        }
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = undefined;
        }
    }
    setPresentationDimensions: (props?: ContainerRendererProps) => Promise<void> = async (props?: ContainerRendererProps): Promise<void> => {
        let promises: Promise<Dimensions>[] = [];
        const { render, presentations, interval }: ContainerRendererProps = props || this.props;

        // get dimensions and set them in memory
        for (const presentation of presentations) {
            const { mainMedia, alternateMedia, _id }: Presentation = presentation;
            if (!this.presentationDimensions[_id]) {
                let medias: Media[] = [];
                if (!isMediaEmpty(mainMedia)) {
                    medias = [mainMedia];
                }
                if (!isMediaEmpty(alternateMedia)) {
                    medias = [...medias, alternateMedia];
                }
                const promise: Promise<Dimensions> = getMediaDimensions(medias).then((dimensions: Dimensions) => this.presentationDimensions[_id] = dimensions);
                promises = [...promises, promise];
            }
        }
        await Promise.all(promises);
        this.loaded = true;

        // remove timeout and render if needed
        const renderCallback: () => void = (): void => {
            if (this.timeout) {
                clearTimeout(this.timeout);
                this.timeout = undefined;
            }
            if (render !== false) {
                this.renderAll(interval);
            }
        };
        // call it right away unless document is not done loading
        if (document.readyState === "complete") {
            renderCallback();
        } else {
            document.onreadystatechange = () => {
                renderCallback();
            };
        }
    }
    renderNone: () => void = (): void => {
        this.setState({ take: 0 });
    }
    renderAll: (interval?: number) => void = (interval?: number): void => {
        if (!this.mounted) {
            return;
        }
        if (interval) {
            let take: number = this.state.take;
            this.interval = setInterval(() => {
                take++;
                this.setState({ take });
                if (take >= this.props.presentations.length) {
                    clearInterval(this.interval);
                    this.interval = undefined;
                }
            }, interval) as any;
        } else {
            this.setState({ take: this.props.presentations.length });
        }
    }
    setRef: (element: HTMLDivElement) => void = (element: HTMLDivElement): void => {
        this.element = element;
    }
    render(): JSX.Element {
        const take: number = this.state.take;
        return <div ref={this.setRef}>
            {React.cloneElement(
                React.Children.only(this.props.children),
                {
                    presentations: this.props.presentations.map<Presentation>((p: Presentation, i: number) => ({
                        ...p,
                        options: {
                            ...p.options,
                            hidden: i >= take,
                            width: this.presentationDimensions[p._id] && this.presentationDimensions[p._id].width,
                            height: this.presentationDimensions[p._id] && this.presentationDimensions[p._id].height
                        }
                    }))
                }
            )}
        </div>;
    }
}

export default ContainerRenderer;
