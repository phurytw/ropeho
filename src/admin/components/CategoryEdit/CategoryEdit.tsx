/**
 * @file Category index component
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../typings.d.ts" />
import * as React from "react";
import { connect } from "react-redux";
import { RopehoAdminState } from "../../reducer";
import { Dispatch } from "redux";

const mapStateToProps: (state: RopehoAdminState, ownProps: CategoriesProps) => CategoriesProps
    = (state: RopehoAdminState, ownProps: CategoriesProps): CategoriesProps => ({
    });
const mapDispatchToProps: (dispatch: Dispatch<RopehoAdminState>, ownProps: CategoriesProps) => CategoriesProps
    = (dispatch: Dispatch<RopehoAdminState>, ownProps: CategoriesProps): CategoriesProps => ({
    });

export interface CategoriesProps {
}

export class CategoryEdit extends React.Component<CategoriesProps, {}> {
    constructor(props: CategoriesProps) {
        super(props);
    }
    render(): JSX.Element {
        return <div>CategoryEdit</div>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CategoryEdit);
