/**
 * @file User editor component
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../typings.d.ts" />
import * as React from "react";
import { connect } from "react-redux";
import { RopehoAdminState } from "../../reducer";
import { Dispatch } from "redux";

const mapStateToProps: (state: RopehoAdminState, ownProps: UserEditProps) => UserEditProps
    = (state: RopehoAdminState, ownProps: UserEditProps): UserEditProps => ({
    });
const mapDispatchToProps: (dispatch: Dispatch<RopehoAdminState>, ownProps: UserEditProps) => UserEditProps
    = (dispatch: Dispatch<RopehoAdminState>, ownProps: UserEditProps): UserEditProps => ({
    });

export interface UserEditParams {
    productionId: string;
}

export interface UserEditProps {
}

export class UserEdit extends React.Component<UserEditProps, {}> {
    constructor(props: UserEditProps) {
        super(props);
    }
    render(): JSX.Element {
        return <div>UserEdit</div>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(UserEdit);
