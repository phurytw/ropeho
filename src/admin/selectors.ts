/**
 * @file Redux selectors to use throughout the application
 * @author François Nguyen
 */
/// <reference path="./typings.d.ts" />
import { RopehoAdminState } from "./reducer";

import User = Ropeho.Models.User;
import Production = Ropeho.Models.Production;

export const getHasRendered: (state: RopehoAdminState) => boolean =
    (state: RopehoAdminState): boolean => state.rendering.hasRendered;

export const getCurrentUser: (state: RopehoAdminState) => User =
    (state: RopehoAdminState): User => state.session.user;

export const getError: (state: RopehoAdminState) => Ropeho.IErrorResponse =
    (state: RopehoAdminState): Ropeho.IErrorResponse => state.error.error;

export const getProductions: (state: RopehoAdminState) => Production[] =
    (state: RopehoAdminState): Production[] => state.productionIndex.productions;
