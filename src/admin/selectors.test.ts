/**
 * @file Tests for the Redux selectors
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../test.d.ts" />
import { should } from "chai";
import {
    getCurrentUser,
    getError,
    getHasRendered,
    getProductions,
    getProduction
} from "./selectors";
import { users, productions } from "../sampleData/testDb";
import { SessionState } from "./modules/session";
import { RenderingState } from "./modules/rendering";
import { ErrorState } from "./modules/error";
import { ProductionIndexState } from "./modules/productionIndex";
import { ProductionEditState } from "./modules/productionEdit";
should();

import Models = Ropeho.Models;
import IErrorResponse = Ropeho.IErrorResponse;

describe("Redux selectors", () => {
    it("Should get the current user", () => {
        const [user]: Models.User[] = users;
        getCurrentUser({
            session: new SessionState({
                user
            })
        }).should.deep.equal(user);
    });
    it("Should get the rendering state", () => {
        getHasRendered({
            rendering: new RenderingState({
                hasRendered: true
            })
        }).should.deep.equal(true);
        getHasRendered({
            rendering: new RenderingState({
                hasRendered: false
            })
        }).should.deep.equal(false);
    });
    it("Should get the current error", () => {
        const error: IErrorResponse = {
            developerMessage: "A nice error",
            errorCode: 0,
            status: 400,
            userMessage: "A nice error"
        };
        getError({
            error: new ErrorState({
                error
            })
        }).should.deep.equal(error);
    });
    it("Should get all productions", () => {
        getProductions({
            productionIndex: new ProductionIndexState({ productions })
        }).should.deep.equal(productions);
    });
    it("Should get the production being edited", () => {
        getProduction({
            productionEdit: new ProductionEditState({ production: productions[0] })
        }).should.deep.equal(productions[0]);
    });
});
