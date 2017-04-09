/**
 * @file A set of buttons to edit a source
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../typings.d.ts" />
import * as React from "react";
import { Button, Navigation } from "react-toolbox";
import { mediaSelectorButtons } from "./styles.css";

export interface MediaSelectorButtonsProps extends React.HTMLProps<HTMLDivElement> {
    onMoveUp?: () => void;
    onMoveDown?: () => void;
    onDelete?: () => void;
}

export const MediaSelectorButtons: (props?: MediaSelectorButtonsProps) => JSX.Element =
    ({ onMoveDown, onMoveUp, onDelete, className }: MediaSelectorButtonsProps) => <div>
        <Navigation type="horizontal" className={mediaSelectorButtons}>
            <Button onClick={onMoveUp} icon="keyboard_arrow_left" />
            <Button onClick={onDelete} icon="delete" accent={true} />
            <Button onClick={onMoveDown} icon="keyboard_arrow_right" />
        </Navigation>
    </div>;

export default MediaSelectorButtons;
