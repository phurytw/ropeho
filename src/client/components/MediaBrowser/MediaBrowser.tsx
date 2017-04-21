/**
 * @file Media browser for the Viewer
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import * as React from "react";
import { browser, selectedStyle } from "./styles.css";
import MediaPreview from "../../../common/components/MediaPreview";
import { Link } from "react-router-dom";

import Presentation = Ropeho.Models.Presentation;

export interface MediaBrowserProps {
    presentations?: Presentation[];
    selected?: number;
}

export class MediaBrowser extends React.Component<MediaBrowserProps, {}> {
    constructor(props?: MediaBrowserProps) {
        super(props);
    }
    render(): JSX.Element {
        const { presentations, selected }: MediaBrowserProps = this.props;
        return <div className={browser}>
            {
                presentations.map<JSX.Element>((p: Presentation, i: number) => <Link key={p._id} to={p.href} className={selected === i ? selectedStyle : ""}>
                    <MediaPreview media={p.mainMedia} scale={0.5} />
                </Link>)
            }
        </div>;
    }
}

export default MediaBrowser;
