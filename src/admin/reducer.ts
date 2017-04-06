/**
 * @file Root reducer of the admin application
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="./typings.d.ts" />
import { combineReducers } from "redux";
import { RenderingState, default as rendering } from "../common/modules/rendering";
import { SessionState, default as session } from "../common/modules/session";
import { ErrorState, default as error } from "../common/modules/error";
import { ProductionIndexState, default as productionIndex } from "../common/modules/productionIndex";
import { ProductionEditState, default as productionEdit } from "./modules/productionEdit";
import { MediaEditState, default as mediaEdit } from "./modules/mediaEdit";
import { SourceEditState, default as sourceEdit } from "./modules/sourceEdit";
import { UploadQueueState, default as uploadQueue } from "./modules/uploadQueue";
import { ObjectURLState, default as objectURL } from "./modules/objectURL";

export interface RopehoAdminState {
    rendering?: RenderingState;
    session?: SessionState;
    error?: ErrorState;
    productionIndex?: ProductionIndexState;
    productionEdit?: ProductionEditState;
    mediaEdit?: MediaEditState;
    sourceEdit?: SourceEditState;
    uploadQueue?: UploadQueueState;
    objectURL?: ObjectURLState;
}

export default combineReducers<RopehoAdminState>({
    rendering,
    session,
    error,
    productionIndex,
    productionEdit,
    mediaEdit,
    sourceEdit,
    uploadQueue,
    objectURL
});
