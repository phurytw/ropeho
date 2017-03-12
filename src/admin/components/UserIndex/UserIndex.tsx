/**
 * @file Production index component
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../typings.d.ts" />
import * as React from "react";
import { connect } from "react-redux";
import { RopehoAdminState } from "../../reducer";
import { Dispatch } from "redux";

const mapStateToProps: (state: RopehoAdminState, ownProps: UserIndexProps) => UserIndexProps
    = (state: RopehoAdminState, ownProps: UserIndexProps): UserIndexProps => ({
    });
const mapDispatchToProps: (dispatch: Dispatch<RopehoAdminState>, ownProps: UserIndexProps) => UserIndexProps
    = (dispatch: Dispatch<RopehoAdminState>, ownProps: UserIndexProps): UserIndexProps => ({
    });

export interface UserIndexProps {
}

export class UserIndex extends React.Component<UserIndexProps, {}> {
    constructor(props: UserIndexProps) {
        super(props);
    }
    render(): JSX.Element {
        return <div>UserIndex</div>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(UserIndex);
