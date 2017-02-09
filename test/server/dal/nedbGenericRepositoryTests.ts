/**
 * @file Unit test for the NeDB based generic repository
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../../typings.d.ts" />
import { should, use } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as nedb from "nedb";
import { v4 } from "node-uuid";
import GenericRepository from "../../../src/server/dal/nedbGenericRepository";
import { MediaTypes } from "../../../src/enum";
import { categories as entities, initialize } from "./testDb";
import { map, assign } from "lodash";
should();
use(chaiAsPromised);

import Entity = Ropeho.Models.Category;
import IGenericRepository = Ropeho.IGenericRepository;

describe("NeDB generic repository", () => {
    let db: nedb,
        repository: IGenericRepository<Entity>;
    beforeEach(() => {
        db = new nedb();
        repository = new GenericRepository(db);
        return new Promise<void>((resolve: () => void, reject: (reason?: any) => void) => {
            db.loadDatabase((err: Error) => err ? reject(err) : resolve());
        }).then(async () => await initialize(db));
    });
    describe("Fetching data", () => {
        it("Should get all entities", () =>
            repository.get().should.eventually.include(entities[0]).include(entities[1]));
        it("Should get all entities with only the wanted properties", async () => {
            const [e1, e2]: Entity[] = map<Entity, any>(entities, (e: Entity) => ({ name: e.name })),
                results: Entity[] = await repository.get(null, { name: 1, _id: 0 }) as Entity[];
            results.should.have.lengthOf(2).and.include(e1).and.include(e2);
        });
        it("Should get an entity from an ID", () =>
            repository.getById(entities[0]._id).should.eventually.deep.equal(entities[0]));
        it("Should get multiple entities from an array of IDs", () =>
            repository.getById(map<Entity, string>(entities, (c: Entity) => c._id)).should.eventually.include(entities[0]).include(entities[1]));
    });
    describe("Creating data", () => {
        it("Should create a new entity", async () => {
            const newItem: Entity = {
                _id: v4(),
                name: "Entity Test"
            };
            await repository.create(newItem);
            const result: Entity = await repository.getById(newItem._id);
            result.should.deep.equal(newItem);
        });
        it("Should create multiple entities", async () => {
            const [newItemA, newItemB]: Entity[] = [
                { _id: v4(), name: "Entity Test A" },
                { _id: v4(), name: "Entity Test B" }
            ];
            await repository.create([newItemA, newItemB]);
            const results: Entity[] = await repository.get() as Entity[];
            results.should.include(newItemA).and.include(newItemB);
        });
    });
    describe("Updating data", () => {
        it("Should update a document and its sub documents", async () => {
            const item: Entity = await repository.getById(entities[0]._id);
            item.should.be.ok;
            assign<Entity, Entity>(item, {
                name: "Entity Test",
                banner: {
                    type: MediaTypes.Video,
                    sources: [{ src: "videoSrc" }, { src: "videoSrc" }, { src: "videoSrc" }]
                }
            });
            const nUpdated: number = await repository.update(item);
            nUpdated.should.equal(1);
            const result: Entity = await repository.getById(item._id);
            result.should.deep.equal(item);
        });
        it("Should update multiple documents and theirs sub documents", async () => {
            const [itemA, itemB]: Entity[] = await repository.get() as Entity[];
            itemA.should.be.ok;
            itemB.should.be.ok;
            assign<Entity, Entity>(itemA, {
                name: "Entity Test",
                banner: {
                    type: MediaTypes.Video,
                    sources: [{ src: "videoSrc" }, { src: "videoSrc" }, { src: "videoSrc" }]
                }
            });
            assign<Entity, Entity>(itemB, {
                name: "Entity Test",
                banner: {
                    type: MediaTypes.Slideshow,
                    delay: 5,
                    sources: [{ src: "slideSrc" }, { src: "slideSrc" }, { src: "slideSrc" }, { src: "slideSrc" }, { src: "slideSrc" }]
                }
            });
            const nUpdated: number = await repository.update([itemA, itemB]);
            nUpdated.should.equal(2);
            const results: Entity[] = await repository.getById([itemA._id, itemB._id]) as Entity[];
            results.should.be.an("array").with.lengthOf(2);
            results.should.include(itemA);
            results.should.include(itemB);
        });
    });
    describe("Deleting data", () => {
        it("Should delete an entity", async () => {
            let [item]: Entity[] = await repository.get() as Entity[];
            item.should.be.ok;
            const nDeleted: number = await repository.delete(item);
            nDeleted.should.equal(1);
            item = await repository.getById(item._id);
            should().not.exist(item);
        });
        it("Should delete an entity from its ID", async () => {
            let [item]: Entity[] = entities;
            item.should.be.ok;
            const nDeleted: number = await repository.delete(item);
            nDeleted.should.equal(1);
            item = await repository.getById(item._id);
            should().not.exist(item);
        });
        it("Should delete multiple entities", async () => {
            let items: Entity[] = entities;
            const nDeleted: number = await repository.delete(items);
            nDeleted.should.equal(items.length);
            items = await repository.get() as Entity[];
            items.should.be.an("array").with.lengthOf(0);
        });
    });
});
