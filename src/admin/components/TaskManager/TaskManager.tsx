/**
 * @file Task manager component
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../typings.d.ts" />
import * as React from "react";
import { connect } from "react-redux";
import { RopehoAdminState } from "../../reducer";
import { Dispatch } from "redux";

const mapStateToProps: (state: RopehoAdminState, ownProps: TaskManagerProps) => TaskManagerProps
    = (state: RopehoAdminState, ownProps: TaskManagerProps): TaskManagerProps => ({
    });
const mapDispatchToProps: (dispatch: Dispatch<RopehoAdminState>, ownProps: TaskManagerProps) => TaskManagerProps
    = (dispatch: Dispatch<RopehoAdminState>, ownProps: TaskManagerProps): TaskManagerProps => ({
    });

export interface TaskManagerProps {
}

export class TaskManager extends React.Component<TaskManagerProps, {}> {
    constructor(props: TaskManagerProps) {
        super(props);
    }
    render(): JSX.Element {
        return <div>TaskManager</div>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TaskManager);
