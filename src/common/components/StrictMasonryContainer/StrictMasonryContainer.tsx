/**
 * @file Renders child in a masonry layout
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import * as React from "react";
import { container, row, hidden } from "./styles.css";
import PresentationWithHref from "../PresentationWithHref";

import Presentation = Ropeho.Models.Presentation;

type Sizing = {
    width: number;
    height: number;
};

type Block = { item: Presentation } & Sizing;

const defaultSizing: Sizing = {
    width: 1,
    height: 1
};

export const defaultBlockSize: number = 320;

export interface StrictMasonryContainerState {
    blockSize?: number;
    blocksPerRow?: number;
    rows?: Block[][];
}

export interface StrictMasonryContainerProps {
    presentations?: Presentation[];
    blockSize?: number;
    blocksPerRow?: number;
    containerClassName?: string;
    presentationClassName?: string;
}

export class StrictMasonryContainer extends React.Component<StrictMasonryContainerProps, StrictMasonryContainerState> {
    element: HTMLDivElement;
    constructor(props?: StrictMasonryContainerProps) {
        super(props);
        this.state = {
            blockSize: defaultBlockSize,
            blocksPerRow: 2,
            rows: []
        };
    }
    componentDidMount(): void {
        this.setBlockSize();
        window.addEventListener("resize", this.setBlockSize);
    }
    componentWillUnmount(): void {
        window.removeEventListener("resize", this.setBlockSize);
    }
    setBlockSize: () => void = (): void => {
        let { blocksPerRow, blockSize }: StrictMasonryContainerProps = this.props;
        blockSize = blockSize || defaultBlockSize;
        // calculate the amount of blocks per row based on the blocksize
        blocksPerRow = blocksPerRow || Math.trunc(this.element.clientWidth / blockSize);
        // readjust the blocksize to fill the whole row
        blockSize = this.element.clientWidth / blocksPerRow;
        this.setState({
            blockSize,
            blocksPerRow
        });
    }
    setRef: (element: HTMLDivElement) => void = (element: HTMLDivElement): void => {
        this.element = element;
    }
    render(): JSX.Element {
        const { containerClassName, presentationClassName }: StrictMasonryContainerProps = this.props;
        const { blockSize, blocksPerRow }: StrictMasonryContainerState = this.state;

        // laying down
        const presentations: Presentation[] = this.props.presentations || [];
        let rows: Block[][] = [];
        let currentRow: Block[] = [];
        let currentSize: number = 0;
        const pushCurrentRow: () => void = (): void => {
            const maxHeight: number = Math.max(...currentRow.map<number>((b: Block) => b.height));
            rows = [...rows, currentRow.map<Block>((b: Block) => ({
                ...b,
                height: maxHeight
            }))];
            currentRow = [];
            currentSize = 0;
        };
        for (const presentation of presentations) {
            let width: number = defaultSizing.width;
            let height: number = defaultSizing.height;
            if (presentation.options) {
                const options: Ropeho.Models.StrictMasonryPresentationOptions = presentation.options;
                const parsedW: number = options.columnSpan;
                const parsedH: number = options.rowSpan;
                width = !isNaN(parsedW) && isFinite(parsedW) ? parsedW : defaultSizing.width;
                height = !isNaN(parsedH) && isFinite(parsedH) ? parsedH : defaultSizing.height;
            }
            currentRow = [...currentRow, {
                width,
                height,
                item: presentation
            }];
            currentSize += width;
            if (currentSize >= blocksPerRow) {
                pushCurrentRow();
            }
        }
        if (currentRow.length > 0) {
            pushCurrentRow();
        }
        return <div className={`${container} ${containerClassName || ""}`} ref={this.setRef}>
            {
                rows.map<JSX.Element>((presentations: Block[], i: number) => {
                    return <div className={row} key={i}>
                        {
                            presentations.map((b: Block) => {
                                const { mainMedia, alternateMedia, mainText, alternateText, href, _id, options }: Ropeho.Models.Presentation = b.item;
                                return <PresentationWithHref
                                    key={_id}
                                    className={`${options.hidden ? hidden : ""} ${presentationClassName || ""}`}
                                    mainMedia={mainMedia}
                                    alternateMedia={alternateMedia}
                                    mainText={mainText}
                                    alternateText={alternateText}
                                    href={href}
                                    style={{
                                        flexGrow: b.width,
                                        flexShrink: b.width,
                                        height: `${b.height * blockSize}px`
                                    }} />;
                            })
                        }
                    </div>;
                })
            }
        </div>;
    }
}

export default StrictMasonryContainer;
