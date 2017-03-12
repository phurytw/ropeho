/**
 * @file Media edit component
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../typings.d.ts" />
import * as React from "react";

export interface MediaEditProps {
}

export class MediaEdit extends React.Component<MediaEditProps, {}> {
    constructor(props: MediaEditProps) {
        super(props);
    }
    render(): JSX.Element {
        return <div>MediaEdit</div>;
    }
}

export default MediaEdit;
