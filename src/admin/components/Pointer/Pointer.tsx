/**
 * @file Cursor displayed on a source preview showing the POI
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../typings.d.ts" />
import * as React from "react";
import { pointer } from "./styles.css";

export default (props?: React.HTMLProps<HTMLDivElement>) => <div style={(this.props && this.props.style) || {}}>
    <div className={pointer}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
    </div>
</div>;
