/**
 * @file Presentation container editor component
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../typings.d.ts" />
import * as React from "react";
import { connect } from "react-redux";
import { RopehoAdminState } from "../../reducer";
import { Dispatch } from "redux";

const mapStateToProps: (state: RopehoAdminState, ownProps: PresentationContainerEditProps) => PresentationContainerEditProps
    = (state: RopehoAdminState, ownProps: PresentationContainerEditProps): PresentationContainerEditProps => ({
    });
const mapDispatchToProps: (dispatch: Dispatch<RopehoAdminState>, ownProps: PresentationContainerEditProps) => PresentationContainerEditProps
    = (dispatch: Dispatch<RopehoAdminState>, ownProps: PresentationContainerEditProps): PresentationContainerEditProps => ({
    });

export interface PresentationContainerEditProps {
}

export class PresentationContainerEdit extends React.Component<PresentationContainerEditProps, {}> {
    constructor(props: PresentationContainerEditProps) {
        super(props);
    }
    render(): JSX.Element {
        return <div>PresentationContainerEdit</div>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PresentationContainerEdit);
