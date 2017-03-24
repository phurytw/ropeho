/**
 * @file Preview item to use in a card layout
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../typings.d.ts" />
import * as React from "react";
import { Card, CardTitle, CardMedia } from "react-toolbox";

export interface PreviewCardProps {
    src?: string;
    name?: string;
    href?: string;
}

export class PreviewCard extends React.Component<PreviewCardProps, {}> {
    constructor(props: PreviewCardProps) {
        super(props);
    }
    goToHref: () => void = (): void => {
        const { href }: PreviewCardProps = this.props;
        if (href) {
            window.location.assign(href);
        }
    }
    render(): JSX.Element {
        const { href, name, src }: PreviewCardProps = this.props;
        return <Card style={{ cursor: href ? "pointer" : "initial" }} onClick={this.goToHref}>
            <CardTitle
                title={name}
            />
            <CardMedia
                image={src}
            />
        </Card>;
    }
}

export default PreviewCard;
