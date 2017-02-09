/**
 * @file Exposes MongoDB/NeDB collections to be used
 * @author François Nguyen <https://github.com/lith-light-g>
 */

import * as nedb from "nedb";
import { env, config } from "../../config";

export let categoryCollection: nedb;
export let productionCollection: nedb;
export let userCollection: nedb;
export let presentationCollection: nedb;

if (env !== "production") {
    categoryCollection = new nedb(config.database.categories);
    productionCollection = new nedb(config.database.productions);
    userCollection = new nedb(config.database.users);
    presentationCollection = new nedb(config.database.presentations);
}
