/**
 * @file Preview item to use in a card layout
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../typings.d.ts" />
import * as React from "react";
import { Card, CardTitle, CardMedia, Button, CardActions } from "react-toolbox";
import MediaPreview from "../../../common/components/MediaPreview";
import * as cardMediaStyles from "./cardMedia.css";
import { buttons } from "./styles.css";

import Media = Ropeho.Models.Media;

export interface PreviewCardProps {
    media?: Media;
    name?: string;
    onClick?: () => any;
    onLeft?: () => any;
    onRight?: () => any;
}

export const PreviewCard: (props?: PreviewCardProps) => JSX.Element =
    ({ onClick, name, media, onLeft, onRight }: PreviewCardProps): JSX.Element =>
        <Card raised={true}>
            <div role="navigation" style={{ cursor: onClick ? "pointer" : "initial" }} onClick={onClick}>
                <CardTitle
                    title={name}
                />
                <CardMedia theme={cardMediaStyles}>
                    <MediaPreview media={media} scale={0.5} />
                </CardMedia>
            </div>
            {
                onLeft || onRight ?
                    <CardActions className={buttons}>
                        <Button onClick={onLeft} icon="keyboard_arrow_left" disabled={typeof onLeft === undefined} />
                        <Button onClick={onRight} icon="keyboard_arrow_right" disabled={typeof onRight === undefined} />
                    </CardActions>
                    : null
            }
        </Card>;

export default PreviewCard;
