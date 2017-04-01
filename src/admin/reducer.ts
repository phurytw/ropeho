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
import { MediaEditState, default as mediaEdit } from "./modules/mediaEdit";
import { SourceEditState, default as sourceEdit } from "./modules/sourceEdit";

export interface RopehoAdminState {
    rendering?: RenderingState;
    session?: SessionState;
    error?: ErrorState;
    productionIndex?: ProductionIndexState;
    productionEdit?: ProductionEditState;
    mediaEdit?: MediaEditState;
    sourceEdit?: SourceEditState;
}

export default combineReducers<RopehoAdminState>({
    rendering,
    session,
    error,
    productionIndex,
    productionEdit,
    mediaEdit,
    sourceEdit
});
