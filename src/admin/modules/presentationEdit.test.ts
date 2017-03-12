/**
 * @file Tests for the presentation edit module
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../../test.d.ts" />
import { should } from "chai";
import { default as mockStore, IStore } from "redux-mock-store";
import { PresentationEditState, setPresentation, ActionTypes, default as reducer } from "./presentationEdit";
import { middlewares } from "../store";
import { productions } from "../../sampleData/testDb";
import { head } from "lodash";
import "isomorphic-fetch";
import { is } from "immutable";
should();

import Models = Ropeho.Models;

describe("Presentation edit module", () => {
    let store: IStore<PresentationEditState>;
    const presentation: Models.Media = productions[0].banner;
    before(() => store = mockStore<PresentationEditState>(middlewares)(new PresentationEditState()));
    afterEach(() => store.clearActions());
    describe("Actions", () => {
        it("Should dispatch a presentation", () => {
            store.dispatch(setPresentation(presentation));
            head(store.getActions()).should.deep.equal({
                type: ActionTypes.SET_PRESENTATION,
                presentation
            });
        });
    });
    describe("Reducer", () => {
        it("Should set the state with an immutable presentation", () => {
            is(reducer(new PresentationEditState(), {
                type: ActionTypes.SET_PRESENTATION,
                presentation
            }), new PresentationEditState({
                presentation
            })).should.be.true;
        });
    });
});
