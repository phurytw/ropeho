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
    onClick?: () => any;
}

export class PreviewCard extends React.Component<PreviewCardProps, {}> {
    constructor(props: PreviewCardProps) {
        super(props);
    }
    render(): JSX.Element {
        const { onClick, name, src }: PreviewCardProps = this.props;
        return <Card style={{ cursor: onClick ? "pointer" : "initial" }} onClick={onClick}>
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
