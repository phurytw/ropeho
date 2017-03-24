/**
 * @file Root reducer of the admin application
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="./typings.d.ts" />
import { combineReducers } from "redux";
import { RenderingState, default as rendering } from "./modules/rendering";
import { SessionState, default as session } from "./modules/session";
import { ErrorState, default as error } from "./modules/error";
import { ProductionIndexState, default as productionIndex } from "./modules/productionIndex";
import { ProductionEditState, default as productionEdit } from "./modules/productionEdit";

export interface RopehoAdminState {
    rendering?: RenderingState;
    session?: SessionState;
    error?: ErrorState;
    productionIndex?: ProductionIndexState;
    productionEdit?: ProductionEditState;
}

export const initialState: RopehoAdminState = {
    rendering: new RenderingState(),
    session: new SessionState(),
    error: new ErrorState(),
    productionIndex: new ProductionIndexState(),
    productionEdit: new ProductionEditState()
};

export default combineReducers<RopehoAdminState>({
    rendering,
    session,
    error,
    productionIndex,
    productionEdit
});
