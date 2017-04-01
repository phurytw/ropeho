/**
 * @file A set of buttons to edit a source
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../typings.d.ts" />
import * as React from "react";
import { Button, Navigation } from "react-toolbox";
import { editBar } from "./styles.css";

export interface SourceInterfaceButtonsProps extends React.HTMLProps<HTMLDivElement> {
    onMoveUp?: () => void;
    onMoveDown?: () => void;
    onSelect?: () => void;
}

export const SourceInterfaceButtons: (props?: SourceInterfaceButtonsProps) => JSX.Element =
    ({ onMoveDown, onMoveUp, onSelect, className }: SourceInterfaceButtonsProps) => <div>
        <Navigation type="horizontal" className={editBar}>
            <Button onClick={onMoveUp} icon="keyboard_arrow_left" />
            <Button onClick={onSelect} icon="mode_edit" />
            <Button onClick={onMoveDown} icon="keyboard_arrow_right" />
        </Navigation>
    </div>;

export default SourceInterfaceButtons;
