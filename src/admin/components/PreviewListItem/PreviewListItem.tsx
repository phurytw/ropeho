/**
 * @file Preview item to use in a list layout
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../typings.d.ts" />
import * as React from "react";
import { ListItem } from "react-toolbox";

export interface PreviewListItemProps {
    src?: string;
    name?: string;
    onClick?: () => any;
}

export class PreviewListItem extends React.Component<PreviewListItemProps, {}> {
    constructor(props: PreviewListItemProps) {
        super(props);
    }
    render(): JSX.Element {
        const { onClick, name, src }: PreviewListItemProps = this.props;
        return <ListItem style={{ cursor: onClick ? "pointer" : "initial" }} onClick={onClick}>
            <img src={src} alt={name} />
            {name}
        </ListItem>;
    }
}

export default PreviewListItem;
