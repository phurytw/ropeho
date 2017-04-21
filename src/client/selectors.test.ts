/**
 * @file Tests for the Redux selectors
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../test.d.ts" />
import { should } from "chai";
import {
    getError,
    getHasRendered,
    getProductions,
    getPresentations,
    getCategories,
    getSelectedCategory,
    getProductionsFromSelectedCategory,
    getSelectedProduction,
    getCategoriesFromSelectedProduction
} from "./selectors";
import { productions, presentations, categories } from "../sampleData/testDb";
import uriFriendlyFormat from "../common/helpers/uriFriendlyFormat";
import renderingReducer from "../common/modules/rendering";
import errorReducer from "../common/modules/error";
import productionIndexReducer from "./modules/productionIndex";
import productionReducer from "./modules/production";
import presentationReducer from "./modules/presentation";
import categoryIndexReducer from "./modules/categoryIndex";
should();

import IErrorResponse = Ropeho.IErrorResponse;

describe("Redux selectors", () => {
    it("Should get the rendering state", () => {
        getHasRendered({
            rendering: renderingReducer({
                hasRendered: true
            } as any, { type: "" })
        }).should.deep.equal(true);
        getHasRendered({
            rendering: renderingReducer({
                hasRendered: false
            } as any, { type: "" })
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
            error: errorReducer({
                error
            } as any, { type: "" })
        }).should.deep.equal(error);
    });
    it("Should get all productions", () => {
        getProductions({
            productionIndex: productionIndexReducer({
                productions
            } as any, { type: "" })
        }).should.deep.equal(productions);
    });
    it("Should get all presentations", () => {
        getPresentations({
            presentation: presentationReducer({
                presentations: presentations
            } as any, { type: "" })
        }).should.deep.equal(presentations);
    });
    it("Should get all categories", () => {
        getCategories({
            categoryIndex: categoryIndexReducer({
                categories
            } as any, { type: "" })
        }).should.deep.equal(categories);
    });
    it("Should get the selected category", () => {
        const [category]: Ropeho.Models.Category[] = categories;
        getSelectedCategory({
            categoryIndex: categoryIndexReducer({
                categories,
                selected: uriFriendlyFormat(category.name)
            } as any, { type: "" })
        }).should.deep.equal(category);
    });
    it("Should get productions selected by the category", () => {
        const [category]: Ropeho.Models.Category[] = categories;
        getProductionsFromSelectedCategory({
            productionIndex: productionIndexReducer({
                productions
            } as any, { type: "" }),
            categoryIndex: categoryIndexReducer({
                categories,
                selected: uriFriendlyFormat(category.name)
            } as any, { type: "" })
        }).should.deep.equal(productions);
    });
    it("Should get the selected production", () => {
        const [production]: Ropeho.Models.Production[] = productions;
        getSelectedProduction({
            production: productionReducer({
                productions: {
                    [uriFriendlyFormat(production.name)]: production
                },
                selected: uriFriendlyFormat(production.name)
            } as any, { type: "" })
        }).should.deep.equal(production);
    });
    it("Should get the categories associated to the selected production", () => {
        const [production]: Ropeho.Models.Production[] = productions;
        getCategoriesFromSelectedProduction({
            production: productionReducer({
                productions: {
                    [uriFriendlyFormat(production.name)]: production
                },
                selected: uriFriendlyFormat(production.name)
            } as any, { type: "" }),
            categoryIndex: categoryIndexReducer({
                categories,
                selected: undefined
            } as any, { type: "" })
        }).should.deep.equal([categories[0]]);
    });
});
