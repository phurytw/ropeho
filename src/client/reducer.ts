/**
 * @file Root reducer of the client application
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="./typings.d.ts" />
import { combineReducers } from "redux";
import { RenderingState, default as rendering } from "../common/modules/rendering";
import { ErrorState, default as error } from "../common/modules/error";
import { ProductionIndexState, default as productionIndex } from "./modules/productionIndex";
import { PresentationState, default as presentation } from "./modules/presentation";
import { CategoryIndexState, default as categoryIndex } from "./modules/categoryIndex";
import { ProductionState, default as production } from "./modules/production";

export interface RopehoClientState {
    rendering?: RenderingState;
    error?: ErrorState;
    productionIndex?: ProductionIndexState;
    presentation?: PresentationState;
    categoryIndex?: CategoryIndexState;
    production?: ProductionState;
}

export default combineReducers<RopehoClientState>({
    rendering,
    error,
    productionIndex,
    presentation,
    categoryIndex,
    production
});
