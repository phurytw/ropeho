/**
 * @file Source edit component
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../typings.d.ts" />
import * as React from "react";

export interface SourceEditProps {
}

export class SourceEdit extends React.Component<SourceEditProps, {}> {
    constructor(props: SourceEditProps) {
        super(props);
    }
    render(): JSX.Element {
        return <div>SourceEdit</div>;
    }
}

export default SourceEdit;
