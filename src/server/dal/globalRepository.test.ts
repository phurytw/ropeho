/**
 * @file Unit test for the Redis based generic repository
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../../test.d.ts" />
import { should, use } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as sinonChai from "sinon-chai";
import { spy } from "sinon";
import { v4 } from "uuid";
import RedisGenericRepository from "../dal/genericRepository";
import RedisGlobalRepository from "../dal/globalRepository";
import config from "../../config";
import { createClient, RedisClient } from "redis";
import { categories, users } from "../../sampleData/testDb";
import { map } from "lodash";
should();
use(chaiAsPromised);
use(sinonChai);

import IGenericRepository = Ropeho.Models.IGenericRepository;
import Category = Ropeho.Models.Category;
import User = Ropeho.Models.User;

describe("Redis global repository", () => {
    const [itemA, itemB]: Category[] = categories,
        [userA, userB]: User[] = users;
    let repository: RedisGlobalRepository,
        catRepo: IGenericRepository<Category>,
        userRepo: IGenericRepository<User>,
        redis: RedisClient,
        getByIdSpy: sinon.SinonSpy,
        createSpy: sinon.SinonSpy,
        updateSpy: sinon.SinonSpy,
        deleteSpy: sinon.SinonSpy;
    before((done: MochaDone) => {
        redis = createClient(config.redis);
        redis.on("ready", () => {
            repository = new RedisGlobalRepository(redis, { idProperty: config.database.defaultIdProperty });
            let isDone: boolean = false;
            const catRedis: RedisClient = createClient({ ...config.redis, prefix: config.database.categories.namespace });
            const userRedis: RedisClient = createClient({ ...config.redis, prefix: config.database.users.namespace });
            catRedis.on("ready", () => {
                catRepo = new RedisGenericRepository<Category>(catRedis, config.database.categories);
                isDone = isDone ? done() : true;
            });
            userRedis.on("ready", () => {
                userRepo = new RedisGenericRepository<User>(userRedis, config.database.users);
                isDone = isDone ? done() : true;
            });
        });
        createSpy = spy(RedisGenericRepository.prototype, "create");
        getByIdSpy = spy(RedisGenericRepository.prototype, "getById");
        updateSpy = spy(RedisGenericRepository.prototype, "update");
        deleteSpy = spy(RedisGenericRepository.prototype, "delete");
    });
    beforeEach(async () => {
        // Reset database
        redis.flushdb();

        // Adding data
        await catRepo.create(categories);
        await userRepo.create(users);

        // Reset spies
        createSpy.reset();
        getByIdSpy.reset();
        updateSpy.reset();
        deleteSpy.reset();
    });
    after(() => {
        createSpy.restore();
        getByIdSpy.restore();
        updateSpy.restore();
        deleteSpy.restore();
    });
    describe("Fetching data", () => {
        it("Should get all entities", async () => {
            const results: (Category | User)[] = await repository.get() as (Category | User)[];
            results.should.have.lengthOf(4);
            results.should.deep.include(itemA);
            results.should.deep.include(itemB);
            results.should.deep.include(userA);
            results.should.deep.include(userB);
            getByIdSpy.should.have.been.calledOnce;
        });
        it("Should get matching entities", async () => {
            const results: (Category | User)[] = await repository.get([itemA, userA]) as (Category | User)[];
            results.should.have.lengthOf(2);
            results.should.deep.include(itemA);
            results.should.deep.include(userA);
            getByIdSpy.should.have.been.calledOnce;
        });
        it("Should get a single entity", async () => {
            const results: Category = await repository.get(itemA) as Category;
            (typeof results).should.equal("object");
            results.should.deep.equal(itemA);
            getByIdSpy.should.have.been.calledOnce;
        });
        it("Should get a single entity by ID", async () => {
            const results: Category = await repository.getById(itemA._id) as Category;
            (typeof results).should.equal("object");
            results.should.deep.equal(itemA);
            getByIdSpy.should.have.been.calledOnce;
        });
        it("Should get entities by ID no matter theirs namespaces", async () => {
            const results: (Category | User)[] = await repository.getById(map<Category, string>([itemA, userA], (e: Category) => e._id)) as (Category | User)[];
            results.should.have.lengthOf(2);
            results.should.deep.include(itemA);
            results.should.deep.include(userA);
            getByIdSpy.should.have.been.calledOnce;
        });
    });
    describe("Creating data", () => {
        const [newItemA, newItemB]: Category[] = [
            { _id: v4(), name: "Entity Test A" },
            { _id: v4(), name: "Entity Test B" }
        ];
        it("Should reject if the namespace is not provided", () =>
            should().throw(repository.create.bind(repository, newItemA)));
        it("Should reject if the entity is not allowed by the configuration", () =>
            should().throw(repository.create.bind(repository, newItemA, "test:")));
        it("Should create a new entity", async () => {
            (await repository.create(newItemA, "category")).should.equal(newItemA);
            createSpy.should.have.been.calledOnce;
        });
        it("Should create multiple entities", async () => {
            (await repository.create([newItemA, newItemB], "category")).should.deep.equal([newItemA, newItemB]);
            createSpy.should.have.been.calledOnce;
        });
    });
    describe("Updating data", () => {
        const [newUser]: User[] = [{
            _id: v4(),
            facebookId: "facebok",
            email: "newusr@test.com",
            token: "token",
            name: "newusr"
        }];
        it("Should reject if ID collides with another", async () => {
            await userRepo.create({
                ...newUser, _id: itemA._id
            });
            return repository.update({
                ...itemA,
                name: "new name"
            }).should.eventually.be.rejectedWith(Error, `ID collision detected with ${itemA._id}`);
        });
        it("Should update an entity using the proper repository", async () => {
            const modified: Category = {
                ...itemA,
                name: "The New Category"
            };
            await repository.update(modified).should.eventually.equal(1);
            (await repository.getById(itemA._id)).should.deep.equal(modified);
            updateSpy.should.have.been.calledOnce;
        });
        it("Should reject if the entity is not found", () => {
            const modified: Category = {
                ...itemA,
                _id: v4()
            };
            return repository.update(modified).should.eventually.be.rejected;
        });
    });
    describe("Deleting data", () => {
        it("Should reject if the entity is not found", () => {
            const modified: Category = {
                ...itemA,
                _id: v4()
            };
            return repository.update(modified).should.eventually.be.rejected;
        });
        it("Should delete an entity from the database", () =>
            repository.update(itemA).should.eventually.be.fulfilled);
        it("Should be able to delete an entity from an ID", async () => {
            (await repository.delete(itemA._id)).should.equal(1);
            deleteSpy.should.have.been.calledOnce;
        });
        it("Should be able to delete an entity with the full key", async () => {
            (await repository.delete(`category:${itemA._id}`)).should.equal(1);
            deleteSpy.should.have.been.calledOnce;
        });
    });
    describe("Ordering data", () => {
        it("Should reject if namespace is not specified", () =>
            should().throw(repository.order.bind(repository)));
        it("Should return the order of an entity type", () =>
            repository.order(undefined, "category").should.eventually.deep.equal(map<Category, string>([itemA, itemB], (c: Category) => c._id)));
        it("Should set the order of an entity type", async () => {
            const order: string[] = map<Category, string>([itemB, itemA], (c: Category) => c._id);
            await repository.order(order, "category");
            return repository.order(undefined, "category").should.eventually.deep.equal(order);
        });
    });
    describe("Searching data", () => {
        it("Should return results", async () => {
            const result: any[] = await repository.search({ name: "e" });
            result.should.have.lengthOf(3);
            result.should.contain(itemA);
            result.should.contain(itemB);
            result.should.contain(userB);
        });
    });
});
