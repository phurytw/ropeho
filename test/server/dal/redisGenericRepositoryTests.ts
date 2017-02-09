/**
 * @file Unit test for the Redis based generic repository
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../../typings.d.ts" />
import { should, use } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import RedisGenericRepository from "../../../src/server/dal/genericRepository";
import uriFriendlyFormat from "../../../src/server/helpers/uriFriendlyFormat";
import config from "../../../src/config";
import { createClient, RedisClient, Multi, ClientOpts } from "redis";
import { MediaTypes } from "../../../src/enum";
import { categories as entities, users } from "./testDb";
import { map, assign, forEach, includes } from "lodash";
import { v4 } from "node-uuid";
import { normalizeEmail } from "validator";
should();
use(chaiAsPromised);

import RedisConfiguration = Ropeho.Configuration.RedisConfiguration;
import IGenericRepository = Ropeho.IGenericRepository;
import Entity = Ropeho.Models.Category;
import User = Ropeho.Models.User;

describe("Redis generic repository", () => {
    const namespace: string = "test:";
    let repository: IGenericRepository<Entity>,
        redis: RedisClient;
    before((done: MochaDone) => {
        redis = createClient(assign<Object, RedisConfiguration, ClientOpts>({}, config.redis, { prefix: namespace }));
        redis.on("ready", () => {
            // Initializing the repository
            repository = new RedisGenericRepository(redis, {
                namespace,
                idProperty: config.database.defaultIdProperty
            });
            done();
        });
    });
    beforeEach((done: MochaDone) => {
        // Reset then Adding data
        redis.flushdb();
        const multi: Multi = redis.multi();
        forEach<Entity>(entities, (e: Entity) => {
            multi.set(e._id, JSON.stringify(e))
                .rpush("_ids", e._id);
        });
        multi.exec(() => {
            done();
        });
    });
    describe("Fetching data", () => {
        it("Should not fail if there is no entities", () => {
            redis.flushdb();
            return repository.get().should.eventually.deep.equal([]);
        });
        it("Should reject if any of the desired entity could not be found", () =>
            repository.get([{ _id: entities[0]._id }, { _id: `${entities[0]._id}testA` }, { _id: `${entities[0]._id}testB` }]).should.be.rejectedWith(Error, `The elements with IDs ${entities[0]._id}testA, ${entities[0]._id}testB could not be found`));
        it("Should reject if the desired entity could not be found", () =>
            repository.get({ _id: `${entities[0]._id}test` }).should.be.rejectedWith(Error, `The element with ID ${entities[0]._id}test could not be found`));
        it("Should get all entities", () =>
            repository.get().should.eventually.deep.equal(entities));
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
        it("Should automaticallly create an _id property", async () => {
            const [newItemA, newItemB]: Entity[] = [{}, {}];
            await repository.create([newItemA, newItemB]);
            const [resultA, resultB]: Entity[] = await repository.get() as Entity[];
            resultA.should.have.property("_id").lengthOf(36);
            resultB.should.have.property("_id").lengthOf(36);
        });
        it("Should reject if we attempt to create with an existing ID", () => {
            const newItem: Entity = {
                _id: entities[0]._id,
                name: "Entity Test"
            };
            return repository.create(newItem).should.eventually.be.rejected;
        });
    });
    describe("Updating data", () => {
        it("Should update an entity", async () => {
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
        it("Should update multiple entities", async () => {
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
        it("Should not update entities that do not exist", async () => {
            const [itemA, itemB]: Entity[] = await repository.get() as Entity[];
            itemA.should.be.ok;
            itemA._id = v4(); // Item should not be found in the database
            return repository.update([itemA, itemB]).should.eventually.be.rejected;
        });
    });
    describe("Deleting data", () => {
        it("Should delete an entity", async () => {
            const [item]: Entity[] = await repository.get() as Entity[];
            item.should.be.ok;
            const nDeleted: number = await repository.delete(item);
            nDeleted.should.equal(1);
            return repository.getById(item._id).should.eventually.be.rejected;
        });
        it("Should delete an entity from its ID", async () => {
            const [item]: Entity[] = entities;
            item.should.be.ok;
            const nDeleted: number = await repository.delete(item);
            nDeleted.should.equal(1);
            return repository.getById(item._id).should.eventually.be.rejected;
        });
        it("Should delete multiple entities", async () => {
            let items: Entity[] = entities;
            const nDeleted: number = await repository.delete(items);
            nDeleted.should.equal(items.length);
            items = await repository.get() as Entity[];
            items.should.be.an("array").with.lengthOf(0);
        });
    });
    describe("Ordering data", () => {
        it("Should return the current order", () =>
            repository.order().should.eventually.deep.equal(map<Entity, string>(entities, (e: Entity) => e._id)));
        it("Should sort by the desired order", async () => {
            const [newItemA, newItemB, entityA, entityB]: Entity[] = [
                { _id: v4(), name: "Entity Test A" },
                { _id: v4(), name: "Entity Test B" },
                ...entities
            ];
            await repository.create([newItemA, newItemB]);
            const newOrder: string[] = [newItemA._id, entityB._id, newItemB._id, entityA._id],
                order: string[] = await repository.order([newItemA._id, entityB._id, newItemB._id, entityA._id]);
            order.should.deep.equal(newOrder);
        });
        it("Should ignore items that are not in the database", async () => {
            const [newItemA, newItemB, entityA, entityB]: Entity[] = [
                { _id: v4(), name: "Entity Test A" },
                { _id: v4(), name: "Entity Test B" },
                ...entities
            ];
            const newOrder: string[] = [newItemA._id, entityB._id, newItemB._id, entityA._id],
                order: string[] = await repository.order([newItemA._id, entityB._id, newItemB._id, entityA._id]);
            order.should.deep.equal([entityB._id, entityA._id]);
        });
    });
    describe("Secondary indexes", () => {
        let userRepo: IGenericRepository<User>;
        const [userA, userB]: User[] = users;
        before(() => {
            userRepo = new RedisGenericRepository<User>(redis, {
                namespace,
                idProperty: config.database.defaultIdProperty,
                indexes: {
                    name: false,
                    email: true
                }
            });
        });
        beforeEach((done: MochaDone) => {
            redis.flushdb();
            const multi: Multi = redis.multi();
            forEach<User>(users, (u: User) => {
                multi.set(u._id, JSON.stringify(u))
                    .hset("emails", uriFriendlyFormat(normalizeEmail(u.email) as string), u._id)
                    .set(`names:${u._id}`, uriFriendlyFormat(u.name))
                    .rpush("_ids", u._id);
            });
            multi.exec(() => {
                done();
            });
        });
        describe("Unique indexes", () => {
            it("Should reject if it has no email", () =>
                userRepo.create([{}, {}]).should.be.eventually.rejected);
            it("Should reject if the email already exists", () =>
                userRepo.create({ email: userA.email }).should.eventually.be.rejected);
        });
        describe("Non unique indexes", () => {
            it("Should accept if it has no name", () =>
                userRepo.create({ email: "test@test.com" }).should.eventually.be.fulfilled);
            it("Should accept if the same name already exists", () =>
                userRepo.create({ name: entities[0].name, email: "test@test.com" }).should.eventually.be.fulfilled);
        });
        describe("Searching", () => {
            it("Should retrieve entities matching a unique index", () =>
                userRepo.search({ email: "admin" }).should.eventually.deep.equal([userA]));
            it("Should retrieve entities matching a non unique index", () =>
                userRepo.search({ name: "admin" }).should.eventually.deep.equal([userA]));
            it("Should retrieve entities if results match all search filters (no match)", () =>
                userRepo.search({ name: "admin", email: "user" }).should.eventually.deep.equal([]));
            it("Should retrieve entities if results match all search filters (one match)", () =>
                userRepo.search({ name: "user", email: "user" }).should.eventually.deep.equal([userB]));
        });
        it("Should rebuild indexes from the current repository options", (done: MochaDone) => {
            redis.flushdb();
            const multi: Multi = redis.multi();
            forEach<User>(users, (u: User) => {
                multi.set(u._id, JSON.stringify(u));
            });
            multi.exec((err: Error) => {
                should().not.exist(err);
                (userRepo as RedisGenericRepository<User>).rebuildIndexes().then(() => {
                    const batch: Multi = (redis as any).batch();
                    batch.lrange("_ids", 0, -1);
                    forEach<User>(users, (u: User) => {
                        batch.exists(`names:${u._id}`)
                            .hexists("emails", uriFriendlyFormat(normalizeEmail(u.email) as string));
                    });
                    batch.exec((err: Error, [ids, ...exists]: any[]) => {
                        should().not.exist(err);
                        ids.should.contain(userA._id).and.contain(userB._id);
                        includes<number>(exists, 0).should.be.false;
                        done();
                    });
                });
            });
        });
    });
});
