/**
 * @file Component that shows the banner and the background of a production
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import * as React from "react";
import MediaPreview from "../MediaPreview";
import { bannerStyle, bannerPreview, backgroundPreview, textArea } from "./styles.css";

import Media = Ropeho.Models.Media;

export interface BannerProps {
    title?: string;
    description?: string;
    banner?: Media;
    background?: Media;
    location?: string;
    models?: string;
    date?: string;
}

export class Banner extends React.Component<BannerProps, {}> {
    constructor(props?: BannerProps) {
        super(props);
    }
    refresh: () => void = (): void => {
        setTimeout(() => {
            this.forceUpdate();
        }, 250);
    }
    render(): JSX.Element {
        const { banner, background, description, title, date, location, models }: BannerProps = this.props;
        return <div className={bannerStyle} onMouseOver={this.refresh} onMouseLeave={this.refresh} role="any">
            <div className={bannerPreview}>
                <MediaPreview media={banner} />
            </div>
            <div className={backgroundPreview}>
                <MediaPreview media={background} />
            </div>
            <div className={textArea}>
                <h1>{title}</h1>
                <hr />
                <p>{description}</p>
                <p>
                    {
                        models ? <span>Modèles: {models}<br /></span> : null
                    }
                    <em>{location} - {date}</em>
                </p>
            </div>
        </div>;
    }
}

export default Banner;
