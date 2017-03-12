/**
 * @file Production editor component
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../typings.d.ts" />
import * as React from "react";
import { connect } from "react-redux";
import { RopehoAdminState } from "../../reducer";
import { Dispatch } from "redux";

const mapStateToProps: (state: RopehoAdminState, ownProps: ProductionEditProps) => ProductionEditProps
    = (state: RopehoAdminState, ownProps: ProductionEditProps): ProductionEditProps => ({
    });
const mapDispatchToProps: (dispatch: Dispatch<RopehoAdminState>, ownProps: ProductionEditProps) => ProductionEditProps
    = (dispatch: Dispatch<RopehoAdminState>, ownProps: ProductionEditProps): ProductionEditProps => ({
    });

export interface ProductionEditParams {
    productionId: string;
}

export interface ProductionEditProps {
}

export class ProductionEdit extends React.Component<ProductionEditProps, {}> {
    constructor(props: ProductionEditProps) {
        super(props);
    }
    render(): JSX.Element {
        return <div><h2>ProductionEdit</h2>{this.props.children}</div>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProductionEdit);
