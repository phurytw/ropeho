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
    href?: string;
}

export class PreviewListItem extends React.Component<PreviewListItemProps, {}> {
    constructor(props: PreviewListItemProps) {
        super(props);
    }
    goToHref: () => void = (): void => {
        const { href }: PreviewListItemProps = this.props;
        if (href) {
            window.location.assign(href);
        }
    }
    render(): JSX.Element {
        const { href, name, src }: PreviewListItemProps = this.props;
        return <ListItem style={{ cursor: href ? "pointer" : "initial" }} onClick={this.goToHref}>
            <img src={src} alt={name} />
            {name}
        </ListItem>;
    }
}

export default PreviewListItem;
