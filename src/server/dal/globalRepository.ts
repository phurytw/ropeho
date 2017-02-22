/**
 * @file Generic repository that queries all entities in a Redis database
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../typings.d.ts" />
import { map, isArray, keys, filter, head, pickBy, mapValues, last, isEmpty, isString, flattenDeep } from "lodash";
import * as _ from "lodash";
import { RedisClient } from "redis";
import * as redis from "redis";
import RedisGenericRepository from "./genericRepository";
import config from "../../config";

import RedisConfiguration = Ropeho.Configuration.RedisConfiguration;
import DatabaseConfiguration = Ropeho.Configuration.DatabaseConfiguration;
import CollectionConfiguration = Ropeho.Configuration.DatabaseCollectionConfiguration;
import IRedisRepositoryOptions = Ropeho.IRedisGenericRepositoryOptions;

type ICombinedRedisOptions = RedisConfiguration & IRedisRepositoryOptions;
type IDictionary = { [key: string]: string };
type Entity = { [key: string]: any, _id?: string };

const uuidv4Regex: RegExp = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/;
const uuidv4WithNamespaceRegex: RegExp = /^([^:]+:){1}([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})$/;

/**
 * Generic repository that uses Redis
 */
export default class RedisGlobalRepository extends RedisGenericRepository<Entity> implements Ropeho.IGenericRepository<Entity> {
    private repositories: any;
    /**
     * Generic repository that uses Redis
     * @param {ICombinedRedisOptions} options redis repository options
     */
    constructor(options: ICombinedRedisOptions);
    /**
     * Generic repository that uses Redis
     * @param {RedisConfiguration&IRedisRepositoryOptions} options Redis repository options
     */
    constructor(client: RedisClient, options?: IRedisRepositoryOptions);
    constructor(clientOrOptions: any, options?: any) {
        try {
            super(clientOrOptions, options);
            this.namespace = "";
            this.indexes = undefined;
        } catch (error) {
            if (!(this.redis instanceof (redis as any).RedisClient)) {
                throw new Error("Failed to create Redis client instance");
            }
        }
        this.repositories = _(config.database)
            .pickBy<DatabaseConfiguration>((val: CollectionConfiguration, key: string) => val.idProperty !== undefined)
            .mapKeys<CollectionConfiguration, string>((c: CollectionConfiguration, key: string) => c.namespace)
            .mapValues<CollectionConfiguration, RedisGenericRepository<any>>((c: CollectionConfiguration, key: string) => new RedisGenericRepository<any>({ ...config.redis, ...c }))
            .value();
    }
    /**
     * Gets all entities
     * @param {Entity|Entity[]} entity Query
     * @returns {Promise<Entity|Entity[]>} A promise that fulfills with the found entities
     */
    get(entity?: Entity | Entity[]): Promise<Entity> | Promise<Entity[]> {
        if (isArray<Entity>(entity)) {
            return this.getById(map<Entity, string>(entity, (e: Entity) => e._id));
        } else if (entity && entity._id) {
            return this.getById(entity._id);
        } else {
            return new Promise<Entity | Entity[]>(async (resolve: (value?: Entity | Entity[] | PromiseLike<Entity | Entity[]>) => void, reject: (reason?: any) => void) => {
                try {
                    const ids: string[] = filter<string>(await this.scanAll("*-*-*-*-*"), (id: string) => uuidv4WithNamespaceRegex.test(id)),
                        entities: Entity[] = await this.getById(ids.length === 1 ? head(ids) : ids) as Entity[];
                    resolve(entities);
                } catch (error) {
                    reject(error);
                }
            });
        }
    }
    /**
     * Gets all entities from theirs IDs
     * @param {string|string[]} _id A string containing the ID or an array of strings containing IDs
     * @returns {Promise<Entity>|Promise<Entity[]>} A promise that fulfills with the found entities
     */
    getById(_id: string | string[]): Promise<Entity> | Promise<Entity[]> {
        return new Promise<Entity | Entity[]>(async (resolve: (value?: Entity | Entity[] | PromiseLike<Entity | Entity[]>) => void, reject: (reason?: any) => void) => {
            try {
                let ids: string[] = [];
                if (isArray<string>(_id)) {
                    for (const id of _id) {
                        if (uuidv4Regex.test(id)) {
                            ids = [...ids, ...filter<string>(await this.scanAll(`*${id}`), (id: string) => uuidv4WithNamespaceRegex.test(id))];
                        } else {
                            ids = [...ids, id];
                        }
                    }
                } else if (uuidv4Regex.test(_id)) {
                    ids = [_(await this.scanAll(`*${_id}`)).filter((id: string) => uuidv4WithNamespaceRegex.test(id)).head()];
                } else {
                    ids = [_id];
                }
                const entities: Entity[] = await super.getById(ids.length === 1 ? head(ids) : ids) as Entity[];
                resolve(entities);
            } catch (error) {
                reject(error);
            }
        });
    }
    /**
     * Creates an entity
     * If _id is empty a new ID will be assigned
     * @param {Entity|Entity[]} entity The entity to create or an array of entity to create
     * @param {string} namespace namespace to use
     * @returns {Promise<Entity>|Promise<Entity[]>} A promise that fulfills with the newly created elements
     */
    create(entity: Entity | Entity[], namespace?: string): Promise<Entity> | Promise<Entity[]> {
        if (!namespace || isEmpty(namespace) || !isString(namespace)) {
            throw new TypeError("A namespace must be used for this operation");
        }
        namespace = last(namespace) === ":" ? namespace : `${namespace}:`;
        const repo: RedisGenericRepository<any> = this.repositories[namespace];
        if (!repo) {
            throw new Error(`Namespace ${namespace} is not used by the current application`);
        }
        if (entity && !isArray<Entity>(entity) && entity._id) {
            return this.create([entity], namespace);
        } else if (entity && isArray<Entity>(entity)) {
            return new Promise<Entity | Entity[]>((resolve: (value?: Entity | Entity[] | PromiseLike<Entity | Entity[]>) => void, reject: (reason?: any) => void) => {
                (repo.create(entity) as Promise<Entity | Entity[]>).then((entities: Entity | Entity[]) => resolve(entities), (err: Error) => reject(err));
            });
        } else {
            throw new TypeError("Invalid parameters");
        }
    }
    /**
     * Updates an entity
     * @param {Entity|Entity[]} entity The entity to update or an array of entity to update
     * @returns {Promise<number>} A promise that fulfills the amount of entity successfully updated
     */
    update(entity: Entity | Entity[]): Promise<number> {
        return new Promise<number>(async (resolve: (value?: number | PromiseLike<number>) => void, reject: (reason?: any) => void) => {
            const { database }: Ropeho.Configuration.Configuration = config;
            const sorted: { [key: string]: Entity[] } = {};
            if (!isArray<Entity>(entity)) {
                entity = [entity];
            }
            for (const e of entity as Entity[]) {
                // Retrieve full key
                if (!e) {
                    reject(new Error(`Cannot find entity to update if ID is not provided`));
                }
                try {
                    const id: string = await this.getFullKey(e._id);
                    if (!id || !uuidv4WithNamespaceRegex.test(id)) {
                        reject(new Error(`Cannot find entity with ID ${e ? e._id : "undefined"}`));
                    }
                    const namespace: string = uuidv4WithNamespaceRegex.exec(id)[1];
                    sorted[namespace] = sorted[namespace] ? [...sorted[namespace], e] : [e];
                } catch (error) {
                    reject(error);
                }
            }
            let nUpdated: number = 0;
            for (const ns of keys(sorted)) {
                try {
                    nUpdated += await this.repositories[ns].update(sorted[ns]);
                } catch (error) {
                    reject(error);
                }
            }
            resolve(nUpdated);
        });
    }
    /**
     * Deletes an entity
     * @param {Entity|Entity[]|string|string[]} entity The entity to delete or its ID or an array of entity to delete or theirs IDs
     * @returns {Promise<number>} A promise that gives the amount of entity successfully deleted
     */
    delete(entity: any | any[] | string | string[]): Promise<number> {
        return new Promise<number>(async (resolve: (value?: number | PromiseLike<number>) => void, reject: (reason?: any) => void) => {
            const { database }: Ropeho.Configuration.Configuration = config;
            const sorted: { [key: string]: string[] } = {};
            if (!isArray<Entity>(entity)) {
                entity = [entity];
            }
            for (const e of entity as Entity[] | string[]) {
                // Retrieve full key
                if (!e) {
                    reject(new Error(`Cannot find entity to update if ID is not provided`));
                }
                let id: string = e && (e as Entity)._id ? (e as Entity)._id : e as string;
                if (!uuidv4WithNamespaceRegex.test(id)) {
                    try {
                        id = await this.getFullKey(id);
                        if (!id || !uuidv4WithNamespaceRegex.test(id)) {
                            reject(new Error(`Cannot find entity with ID ${id}`));
                        }
                    } catch (error) {
                        reject(error);
                    }
                }
                const matches: RegExpExecArray = uuidv4WithNamespaceRegex.exec(id),
                    namespace: string = matches[1];
                id = matches[2];
                sorted[namespace] = sorted[namespace] ? [...sorted[namespace], id] : [id];
            }
            let nDeleted: number = 0;
            for (const ns of keys(sorted)) {
                try {
                    nDeleted += await this.repositories[ns].delete(sorted[ns]);
                } catch (error) {
                    reject(error);
                }
            }
            resolve(nDeleted);
        });
    }
    /**
     * Get or set order of entities within the collection
     * Entities not targetted by the new order will be appended at the end of the array
     * @param {string[]} order array of IDs, items will be ordered according to the array indexes. If not provided the promise will fulfill with the current order
     * @param {string} namespace namespace to use
     * @returns {Promise<string[]>} A promise
     */
    order(order?: string[], namespace?: string): Promise<string[]> {
        if (!namespace || isEmpty(namespace) || !isString(namespace)) {
            throw new Error("Must be used with a namespace");
        }
        namespace = last(namespace) === ":" ? namespace : `${namespace}:`;
        const repository: RedisGenericRepository<any> = this.repositories[namespace];
        if (!repository) {
            throw new Error(`Namespace ${namespace} is not used by the current application`);
        }
        return repository.order(order);
    }
    /**
     * Search entities
     * @param {IDictionary} filters search criterias
     * @param {number} range amount of items to look up (defaults to 10)
     * @param {Promise<any[]>} A promise that fulfills with the found entities
     */
    search(filters: IDictionary): Promise<any[]> {
        let promises: Promise<any>[] = [];
        for (const ns of keys(this.repositories)) {
            const repo: RedisGenericRepository<any> = this.repositories[ns];
            promises = [...promises, repo.search(filters)];
        }
        return Promise.all(promises).then((results: any[]) => flattenDeep<any>(results));
    }
    /**
     * Rebuild indexes
     * @returns {Promise<void>} A nice promise
     */
    rebuildIndexes(order?: string[]): Promise<void> {
        throw new Error("Not implemented");
    }
    private getFullKey(_id: string): Promise<string> {
        return this.scanAll(_id).then((keys: string[]) => {
            keys = filter<string>(keys, (id: string) => uuidv4WithNamespaceRegex.test(id));
            if (keys.length > 1) {
                throw new Error(`ID collision detected with ${_id}`);
            } else {
                return head(keys);
            }
        });
    }
}
