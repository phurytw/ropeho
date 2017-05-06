/**
 * @file Component that displays a media and changes it when hovering
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import * as React from "react";
import MediaPreview from "../MediaPreview";
import { isMediaEmpty } from "../../helpers/entityUtilities";
import { alternateMediaStyles, mainMediaStyles, presentationStyles, caption, singleMediaStyles } from "./styles.css";

import Media = Ropeho.Models.Media;

export interface PresentationState {
    active?: boolean;
    mainReady?: {
        width: number;
        height: number;
    };
    alternateReady?: {
        width: number;
        height: number;
    };
}

export interface PresentationProps extends React.HTMLProps<HTMLDivElement> {
    mainMedia?: Media;
    alternateMedia?: Media;
    mainText?: string;
    alternateText?: string;
}

export class Presentation extends React.Component<PresentationProps, PresentationState> {
    constructor(props?: PresentationProps) {
        super(props);
        this.state = { active: false };
    }
    setActive: () => void = (): void => {
        this.setState({ active: true });
    }
    setInactive: () => void = (): void => {
        this.setState({ active: false });
    }
    switchActive: () => void = (): void => {
        this.setState({ active: !this.state.active });
    }
    render(): JSX.Element {
        const { mainMedia, alternateMedia, mainText, alternateText }: PresentationProps = this.props;
        const main: Media = isMediaEmpty(mainMedia) ? (isMediaEmpty(alternateMedia) ? undefined : alternateMedia) : mainMedia;
        const alternate: Media = isMediaEmpty(alternateMedia) ? undefined : alternateMedia;
        return <div
            style={this.props.style}
            onMouseEnter={this.setActive}
            onMouseLeave={this.setInactive}
            onClick={this.switchActive}
            role="link"
            className={`${this.props.className || ""} ${presentationStyles}`}
        >
            {
                main ? <div className={alternate ? mainMediaStyles : singleMediaStyles}>
                    <MediaPreview media={mainMedia || alternateMedia} />
                </div> : null
            }
            {
                alternate ? <div className={alternateMediaStyles}>
                    <MediaPreview media={alternateMedia || mainMedia} />
                </div> : null
            }
            {
                mainText ? <div className={caption}>
                    <span>{mainText}</span>
                    {
                        alternateText ? <div>
                            <hr />
                            <p>{alternateText}</p>
                        </div> : null
                    }
                </div> : null
            }
        </div>;
    }
}

export default Presentation;
