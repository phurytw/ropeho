/**
 * @file Renders child in a masonry layout
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import * as React from "react";
import PresentationWithHref from "../PresentationWithHref";
import { container, hidden } from "./styles.css";

import Presentation = Ropeho.Models.Presentation;
import AutoMasonryContainerOptions = Ropeho.Models.AutoMasonryContainerOptions;
import AutoMasonryPresentationOptions = Ropeho.Models.AutoMasonryPresentationOptions;

export const blockSize: number = 320;

export interface PresentationReadyState {
    width?: number;
    height?: number;
}

export interface VerticalMasonryContainerProps extends AutoMasonryContainerOptions {
    presentations?: Presentation[];
}

export class VerticalMasonryContainer extends React.Component<VerticalMasonryContainerProps, {}> {
    element: HTMLDivElement;
    constructor(props?: VerticalMasonryContainerProps) {
        super(props);
        this.state = {
            readyStates: {}
        };
    }
    render(): JSX.Element {
        const presentations: Presentation[] = this.props.presentations || [];
        return <div className={container}>
            {
                presentations.map<JSX.Element>(({ _id, href, mainMedia, mainText, alternateMedia, alternateText, options }: Presentation, i: number) => {
                    return <PresentationWithHref key={_id}
                        href={href}
                        mainMedia={mainMedia}
                        alternateMedia={alternateMedia}
                        mainText={mainText}
                        alternateText={alternateText}
                        className={options.hidden ? hidden : ""}
                        style={{
                            height: options && options.height ? `${Math.max(((options as AutoMasonryPresentationOptions).percentVisible || 0.4) * options.height, 320)}px` : "320px"
                        }}
                    />;
                })
            }
        </div>;
    }
}

export default VerticalMasonryContainer;
