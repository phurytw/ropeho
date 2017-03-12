/**
 * @file Presentation editor component
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../typings.d.ts" />
import * as React from "react";

export interface PresentationEditProps {
}

export class PresentationEdit extends React.Component<PresentationEditProps, {}> {
    constructor(props: PresentationEditProps) {
        super(props);
    }
    render(): JSX.Element {
        return <div>PresentationEdit</div>;
    }
}

export default PresentationEdit;
