/**
 * @file Presentation index component
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../typings.d.ts" />
import * as React from "react";
import { connect } from "react-redux";
import { RopehoAdminState } from "../../reducer";
import { Dispatch } from "redux";

const mapStateToProps: (state: RopehoAdminState, ownProps: PresentationContainerIndexProps) => PresentationContainerIndexProps
    = (state: RopehoAdminState, ownProps: PresentationContainerIndexProps): PresentationContainerIndexProps => ({
    });
const mapDispatchToProps: (dispatch: Dispatch<RopehoAdminState>, ownProps: PresentationContainerIndexProps) => PresentationContainerIndexProps
    = (dispatch: Dispatch<RopehoAdminState>, ownProps: PresentationContainerIndexProps): PresentationContainerIndexProps => ({
    });

export interface PresentationContainerIndexProps {
}

export class PresentationContainerIndex extends React.Component<PresentationContainerIndexProps, {}> {
    constructor(props: PresentationContainerIndexProps) {
        super(props);
    }
    render(): JSX.Element {
        return <div>PresentationContainerIndex</div>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PresentationContainerIndex);
