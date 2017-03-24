/**
 * @file Dashboard (Homepage) component
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../typings.d.ts" />
import * as React from "react";

export interface DashboardProps {
}

export class Dashboard extends React.Component<DashboardProps, {}> {
    constructor(props: DashboardProps) {
        super(props);
    }
    render(): JSX.Element {
        return <div>Dashboard</div>;
    }
}

export default Dashboard;
