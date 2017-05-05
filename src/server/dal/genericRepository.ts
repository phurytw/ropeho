/**
 * @file Generic repository that manages a Redis database
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../typings.d.ts" />
import { v4 } from "uuid";
import { map, isArray, forEach, includes, pickBy, filter, join, startsWith } from "lodash";
import * as _ from "lodash";
import { createClient, RedisClient, Multi } from "redis";
import * as redis from "redis";
import uriFriendlyFormat from "../../common/helpers/uriFriendlyFormat";
import config from "../../config";
import { plural, singular } from "pluralize";

import RedisConfiguration = Ropeho.Configuration.RedisConfiguration;
import IRedisRepositoryOptions = Ropeho.Models.IRedisGenericRepositoryOptions;
import IIndexOptions = Ropeho.Models.IIndexOptions;

type ICombinedRedisOptions = RedisConfiguration & IRedisRepositoryOptions;
type IDictionary = { [key: string]: string };
type IIndexes = { [key: string]: IIndexOptions };

/**
 * Generic repository that uses Redis
 */
export default class RedisGenericRepository<T extends any> implements Ropeho.Models.IGenericRepository<T> {
    protected _redis: RedisClient;
    protected _indexes: IIndexes;
    protected _idProperty: string;
    protected _pluralizedIdProperty: string;
    protected _namespace: string;
    get redis(): RedisClient {
        return this._redis;
    }
    get namespace(): string {
        return this._namespace;
    }
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
        // Client provided
        // any here is necessary because RedisClient is not a class in the definitions
        if (clientOrOptions instanceof (redis as any).RedisClient) {
            this._redis = clientOrOptions;
            this._indexes = options.indexes || {};
            this._idProperty = options.idProperty || config.database.defaultIdProperty;
            this._namespace = options.namespace || "";
        } else {
            const { port, host, db, indexes, idProperty, namespace }: RedisConfiguration & IRedisRepositoryOptions = clientOrOptions;
            this._redis = createClient(port, host, { prefix: namespace || "", db });
            this._indexes = pickBy<IIndexes, IIndexes>(indexes, (isUnique: boolean, index: string) => index !== idProperty);
            this._idProperty = idProperty || config.database.defaultIdProperty;
            this._namespace = namespace || "";
        }
        this._pluralizedIdProperty = plural(this._idProperty);
        if (!(this._redis instanceof (redis as any).RedisClient)) {
            throw new Error("Failed to create Redis client instance");
        }
        if (!this._namespace) {
            throw new Error("A namespace must be used with this repository class");
        }
    }
    /**
     * Gets all entities
     * @param {T|T[]} entity Query
     * @returns {Promise<T[]>} A promise that fulfills with the found entities
     */
    get(entity?: T | T[]): Promise<T | T[]> {
        const { _idProperty, _pluralizedIdProperty }: RedisGenericRepository<T> = this;
        if (isArray<T>(entity)) {
            return this.getById(map<T, string>(entity, (e: T) => e[_idProperty]));
        } else if (entity) {
            return this.getById(entity[_idProperty]);
        } else {
            // Get all entities
            return new Promise<T[]>(async (resolve: (value?: T[] | PromiseLike<T[]>) => void, reject: (reason?: any) => void) => {
                const { _redis }: RedisGenericRepository<T> = this;
                _redis.lrange(_pluralizedIdProperty, 0, -1, (err: Error, ids: string[]) => {
                    if (err) {
                        reject(err);
                    } else {
                        const batch: Multi = (_redis as any).batch();
                        forEach<string>(ids, (id: string) => batch.get(id));
                        batch.exec((err: Error, results: string[]) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(map<string, T>(results, (result: string) => JSON.parse(result)));
                            }
                        });
                    }
                });
            });
        }
    }
    /**
     * Gets all entities from theirs IDs
     * @param {string|string[]} _id A string containing the ID or an array of strings containing IDs
     * @returns {Promise<T>|Promise<T[]>} A promise that fulfills with the found entities
     */
    getById(_id: string | string[]): Promise<T | T[]> {
        const { _idProperty }: RedisGenericRepository<T> = this;
        if (isArray<string>(_id)) {
            return new Promise<T[]>((resolve: (value?: T[] | PromiseLike<T[]>) => void, reject: (reason?: any) => void) => {
                const batch: Multi = (this._redis as any).batch();
                forEach<string>(_id, (id: string) => batch.get(id));
                batch.exec((err: Error, results: string[]) => {
                    if (err) {
                        reject(err);
                    } else if (includes<string>(results, null)) {
                        reject(new Error(`The elements with IDs ${_(_id).without(..._(results).filter((r: string) => r !== null).map<string>((r: string) => (JSON.parse(r) as T)[_idProperty]).value()).join(", ").valueOf()} could not be found`));
                    } else {
                        resolve(map<string, T>(results, (json: string) => JSON.parse(json)));
                    }
                });
            });
        } else if (_id) {
            return new Promise<T>((resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) =>
                this._redis.get(_id, (err: Error, result: string) => {
                    if (err) {
                        reject(err);
                    } else if (result === null) {
                        reject(new Error(`The element with ID ${_id} could not be found`));
                    } else {
                        resolve(JSON.parse(result));
                    }
                }));
        } else {
            return new Promise<T>((resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => reject(new Error("No ID to retrieve")));
        }
    }
    /**
     * Creates an entity
     * If _id is empty a new ID will be assigned
     * @param {T|T[]} entity The entity to create or an array of entity to create
     * @returns {Promise<T>|Promise<T[]>} A promise that fulfills with the newly created elements
     */
    create(entity: T | T[]): Promise<T | T[]> {
        const { _idProperty, _pluralizedIdProperty, _redis, _indexes }: RedisGenericRepository<T> = this;
        // Different implementations for array and non array because of the return type
        if (isArray<T>(entity)) {
            return new Promise<T | T[]>((resolve: (value?: T | T[] | PromiseLike<T | T[]>) => void, reject: (reason?: any) => void) => {
                const multi: Multi = _redis.multi();
                const alreadyExistsBatch: Multi = (_redis as any).batch();
                const existingUniqueKeys: { [key: string]: { id: string, value: any }[] } = {};
                let existingIds: string[] = [];
                for (let i: number = 0; i < entity.length; i++) {
                    const element: T = entity[i];
                    // Generate ID if ID doesn't have to be generated we must check that it doesn't exist
                    if (element[_idProperty]) {
                        alreadyExistsBatch.exists(element[_idProperty], (err: Error, exists: number) => {
                            if (err) {
                                reject(err);
                            }
                            if (exists === 1) {
                                existingIds = [...existingIds, element[_idProperty]];
                            }
                        });
                    } else {
                        element[_idProperty] = element[_idProperty] || v4();
                    }
                    // Secondary indexes
                    forEach<IIndexes>(_indexes, (indexConfig: IIndexOptions, property: string) => {
                        const { nullable, unique }: IIndexOptions = indexConfig,
                            value: string = element[property],
                            id: string = element[_idProperty];
                        if (!nullable && !value) {
                            reject(new Error(`Element at index ${i} can not have the property ${property} null or empty`));
                        } else if (value) {
                            if (unique) {
                                multi.hset(plural(property), uriFriendlyFormat(value), id);
                                // Check that the unique constraint is respected
                                alreadyExistsBatch.hexists(plural(property), uriFriendlyFormat(value), (err: Error, exists: number) => {
                                    if (err) {
                                        reject(err);
                                    }
                                    if (exists === 1) {
                                        existingUniqueKeys[property] = isArray<string>(existingUniqueKeys[property]) ?
                                            [...existingUniqueKeys[property], { id: id, value }] :
                                            [{ id: id, value }];
                                    }
                                });
                            } else {
                                multi.set(`${plural(property)}:${id}`, uriFriendlyFormat(value));
                            }
                        }
                    });
                    multi.set(element[_idProperty], JSON.stringify(element))
                        .rpush(_pluralizedIdProperty, element[_idProperty]);
                }
                alreadyExistsBatch.exec((err: Error, results: string[]) => {
                    if (err) {
                        reject(err);
                    }
                    // If one of the items or unique keys already exists we cancel the transaction
                    if (existingIds.length > 0) {
                        reject(new Error(`There are already entities with IDs ${join(existingIds, ", ")} in the database`));
                    } else if (_(existingUniqueKeys).values().flatten().value().length > 0) {
                        reject(new Error(_(existingUniqueKeys).keys().map<string>((property: string) =>
                            `There's already a '${property}' with value(s) ${_(existingUniqueKeys[property]).map<string>((data: { id: string, value: any }) => data.value).join(" or ")}`)
                            .join(". ")));
                    } else {
                        // Everything is valid we can go on !!
                        multi.exec((err: Error) => err ? reject(err) : resolve(entity.length === 1 ? entity[0] : entity));
                    }
                });
            });
        } else {
            return this.create([entity]);
        }
    }
    /**
     * Updates an entity
     * @param {T|T[]} entity The entity to update or an array of entity to update
     * @returns {Promise<number>} A promise that fulfills the amount of entity successfully updated
     */
    update(entity: T | T[]): Promise<number> {
        const { _redis, _idProperty, _pluralizedIdProperty, _indexes }: RedisGenericRepository<T> = this;
        if (isArray<T>(entity)) {
            return new Promise<number>((resolve: (value?: number | PromiseLike<number>) => void, reject: (reason?: any) => void) => {
                const batch: Multi = (_redis as any).batch();
                const indexResults: { [key: string]: any } = {};
                // We get all ids to see if the desired entity to update exists in the database
                // If we don't do that it will create a new entity and this is not what we want (or I ??)
                batch.lrange(_pluralizedIdProperty, 0, -1);
                // We only get unique properties because theirs keys are named after the values
                // So if the value is updated we need to get the entire Hashset and compared IDs
                // Non unique properties can be found from theirs IDs so it's not necessary to find them
                forEach<IIndexes>(_indexes, (indexConfig: IIndexOptions, property: string) => {
                    if (indexConfig.unique) {
                        batch.hgetall(plural(property), (err: Error, results: IDictionary) => err ? reject(err) : indexResults[property] = results);
                    }
                });
                batch.exec((err: Error, [ids]: string[][]) => {
                    if (err) {
                        reject(err);
                    }
                    const multi: Multi = _redis.multi();
                    for (let i: number = 0; i < entity.length; i++) {
                        const element: T = entity[i];
                        // If exists check
                        if (!includes<string>(ids, element[_idProperty])) {
                            reject(`ID ${element[_idProperty]} could not be found`);
                        }
                        // Secondary indexes operations
                        forEach<IIndexes>(_indexes, (indexConfig: IIndexOptions, property: string) => {
                            const { nullable, unique }: IIndexOptions = indexConfig,
                                value: string = element[property],
                                id: string = element[_idProperty];
                            if (!nullable && !value) {
                                reject(new Error(`Element at index ${i} can not have the property ${property} null or empty`));
                            } else {
                                if (unique) {
                                    multi.hdel(plural(property), _(indexResults[property]).pickBy((value: string) => value === id).keys().head());
                                    if (value) {
                                        multi.hset(plural(property), uriFriendlyFormat(value), id);
                                    }
                                } else {
                                    if (value) {
                                        multi.set(`${plural(property)}:${id}`, uriFriendlyFormat(value));
                                    } else {
                                        multi.del(`${plural(property)}:${id}`, uriFriendlyFormat(value));
                                    }
                                }
                            }
                        });
                        multi.set(element[_idProperty], JSON.stringify(element));
                    }
                    multi.exec((err: Error) => err ? reject(err) : resolve(entity.length));
                });
            });
        } else if (!isArray<T>(entity)) {
            return this.update([entity]);
        } else {
            return new Promise<number>((resolve: (value?: number | PromiseLike<number>) => void, reject: (reason?: any) => void) => reject(new Error("Entity and position must both be arrays or both not be arrays")));
        }
    }
    /**
     * Deletes an entity
     * @param {T|T[]|string|string[]} entity The entity to delete or its ID or an array of entity to delete or theirs IDs
     * @returns {Promise<number>} A promise that gives the amount of entity successfully deleted
     */
    delete(entity: T | T[] | string | string[]): Promise<number> {
        const { _redis, _idProperty, _pluralizedIdProperty, _indexes }: RedisGenericRepository<T> = this;
        if (isArray(entity)) {
            if (entity.length > 0) {
                if (typeof entity[0] === "string") {
                    return new Promise<number>((resolve: (value?: number | PromiseLike<number>) => void, reject: (reason?: any) => void) => {
                        const batch: Multi = (_redis as any).batch();
                        const indexResults: { [key: string]: any } = {};
                        // We only need unique secondary indexes as non unique indexes can be found from the ID
                        forEach<IIndexes>(_indexes, (isUnique: boolean, property: string) => {
                            if (isUnique) {
                                batch.hgetall(plural(property), (err: Error, results: IDictionary) => err ? reject(err) : indexResults[property] = results);
                            }
                        });
                        batch.exec((err: Error) => {
                            if (err) {
                                reject(err);
                            }
                            const multi: Multi = _redis.multi();
                            let deletedElements: number = 0;
                            forEach<string>(entity as string[], (e: string) => {
                                // Delete the entity and its ID
                                multi.del(e, (err: Error, isDeleted: number) => err ? reject(err) : deletedElements += isDeleted)
                                    .lrem(_pluralizedIdProperty, 0, e);
                                forEach<IIndexes>(_indexes, (indexConfig: IIndexOptions, property: string) => {
                                    if (indexConfig.unique) {
                                        multi.hdel(plural(property), _(indexResults[property]).pickBy((value: string) => value === e).keys().head());
                                    } else {
                                        multi.del(`:${plural(property)}:${e}`);
                                    }
                                });
                            });
                            multi.exec((err: Error) => err ? reject(err) : resolve(deletedElements));
                        });
                    });
                } else {
                    return this.delete(map<T, string>(entity as T[], (e: T) => e[_idProperty]));
                }
            } else {
                return new Promise<number>((resolve: (value?: number | PromiseLike<number>) => void, reject: (reason?: any) => void) => resolve(0));
            }
        } else if (typeof entity === "string") {
            return this.delete([entity as T]);
        } else {
            return this.delete([entity[_idProperty]]);
        }
    }
    /**
     * Get or set order of entities within the collection
     * Entities not targetted by the new order will be appended at the end of the array
     * @param {string[]} order array of IDs, items will be ordered according to the array indexes. If not provided the promise will fulfill with the current order
     * @returns {Promise<string[]>} A promise
     */
    order(order?: string[]): Promise<string[]> {
        const { _pluralizedIdProperty, _redis }: RedisGenericRepository<T> = this;
        return new Promise<string[]>((resolve: (value?: string[] | PromiseLike<string[]>) => void, reject: (reason?: any) => void) => {
            this._redis.lrange(_pluralizedIdProperty, 0, -1, (err: Error, ids: string[]) => {
                if (err) {
                    reject(err);
                } else {
                    if (isArray<string>(order)) {
                        let multi: Multi = _redis.multi().del(_pluralizedIdProperty),
                            existingId: string[] = [];
                        forEach<string>(order, (id: string) => multi.exists(id));
                        multi.exec((err: Error, [hasDeleted, ...results]: number[]) => {
                            if (err) {
                                reject(err);
                            }
                            multi = _redis.multi();
                            for (let i: number = 0; i < results.length; i++) {
                                const id: string = order[i];
                                if (results[i] === 1) {
                                    multi.rpush(_pluralizedIdProperty, id);
                                    existingId = [...existingId, id];
                                }
                            }
                            const newOrder: string[] = [...existingId, ..._(ids).without(...existingId).tap((ids: string[]) => forEach<string>(ids, (id: string) => multi.rpush(_pluralizedIdProperty, id))).value()];
                            multi.exec((err: Error) => err ? reject(err) : resolve(newOrder));
                        });
                    } else {
                        resolve(ids);
                    }
                }
            });
        });
    }
    /**
     * Search entities
     * @param {IDictionary} filters search criterias
     * @param {Promise<T[]>} A promise that fulfills with the found entities
     */
    search(filters: IDictionary): Promise<T[]> {
        return new Promise<T[]>(async (resolve: (value?: T[] | PromiseLike<T[]>) => void, reject: (reason?: any) => void) => {
            const { _redis, _indexes, _namespace }: RedisGenericRepository<T> = this;
            const filterKeys: string[] = _(filters).pickBy<IIndexes>((value: string, key: string) => _(_indexes).keys().includes(key)).keys().value();
            if (filterKeys.length === 0) {
                resolve([]);
            } else {
                let ids: string[] = [];
                // Promise hscan
                const hscan: (key: string, searchString: string, limit?: number) => Promise<string[]> =
                    (key: string, searchString: string, limit: number = 10): Promise<string[]> =>
                        new Promise<string[]>((resolve: (value?: string[] | PromiseLike<string[]>) => void, reject: (reason?: any) => void) => {
                            this.hscanAll(plural(key), `*${uriFriendlyFormat(searchString)}*`).then((ids: string[]) =>
                                resolve(filter<string>(ids, (id: string, i: number) => i % 2 === 1)),
                                (err: Error) => reject(err));
                        });
                // Promise scan
                const scan: (key: string, searchString: string, limit?: number) => Promise<string[]> =
                    (key: string, searchString: string, limit: number = 10): Promise<string[]> =>
                        new Promise<string[]>(async (resolve: (value?: string[] | PromiseLike<string[]>) => void, reject: (reason?: any) => void) => {
                            let ids: string[] = [];
                            const batch: Multi = (_redis as any).batch(),
                                keys: string[] = await this.scanAll(`${!_namespace ? "" : _namespace}${plural(key)}:*`);
                            forEach<string>(keys, (id: string) =>
                                batch.get(id.substring(_namespace.length), (err: Error, value: string) => {
                                    if (err) {
                                        reject(err);
                                    }
                                    if (value && includes(value, searchString)) {
                                        ids = [...ids, id.split(":")[!_namespace ? 1 : 2]];
                                    }
                                }));
                            batch.exec((err: Error) => err ? reject(err) : resolve(ids));
                        });
                for (const key of filterKeys) {
                    const searchString: string = filters[key];
                    switch (_indexes[key].unique) {
                        case true:
                            ids = [...ids, ...(await hscan(key, searchString))];
                            break;
                        case false:
                            ids = [...ids, ...(await scan(key, searchString))];
                            break;
                    }
                }
                (this.getById(
                    _(ids)
                        .uniq()
                        .filter((id: string) =>
                            filter<string>(ids, (id2: string) => id2 === id).length === filterKeys.length).value()) as Promise<T[]>)
                    .then((entities: T[]) => resolve(entities), (error: Error) => reject(error));
            }
        });
    }
    /**
     * Rebuild indexes
     * WARNING: This blocks the database for the keys operation !!
     * @param {string[]} order optional new order
     * @returns {Promise<void>} A nice promise
     */
    rebuildIndexes(order?: string[]): Promise<void> {
        return new Promise<void>((resolve: () => void, reject: (reason?: any) => void) => {
            const { _redis, _indexes, _idProperty, _pluralizedIdProperty, _namespace }: RedisGenericRepository<T> = this;
            const smartGet: (key: string) => Promise<any> =
                (key: string): Promise<any> => new Promise<any>((resolve: (value?: any | PromiseLike<any>) => void, reject: (reason?: any) => void) => {
                    _redis.type(key, (err: Error, type: string) => {
                        if (err) {
                            reject(err);
                        }
                        switch (type) {
                            case "string":
                                _redis.get(key, (err: Error, data: string) => err ? reject(err) : resolve(data));
                                break;
                            case "list":
                                _redis.lrange(key, 0, -1, (err: Error, data: string[]) => err ? reject(err) : resolve(data));
                                break;
                            case "set":
                                _redis.smembers(key, (err: Error, data: string[]) => err ? reject(err) : resolve(data));
                                break;
                            case "zset":
                                _redis.zrange(key, 0, -1, (err: Error, data: string[]) => err ? reject(err) : resolve(data));
                                break;
                            case "hash":
                                _redis.hgetall(key, (err: Error, data: { [key: string]: string }) => err ? reject(err) : resolve(data));
                                break;
                            default:
                                reject(new TypeError(`Invalid type ${type} for key ${key} (but how ??)`));
                                break;
                        }
                    });
                });
            _redis.keys("*", async (err: Error, items: string[]) => {
                if (err) {
                    reject(err);
                } else {
                    let entityIds: string[] = [];
                    const allKeys: string[] = [..._(_indexes).keys().map(plural).value()];
                    // Since we can't overwrite values without searching its index it's easier to rewrite the whole list
                    const multi: Multi = _redis.multi().del(_pluralizedIdProperty);
                    forEach<string>(items, (id: string) => {
                        id = id.substring(_namespace.length);
                        for (const index of allKeys) {
                            if (startsWith(id, index)) {
                                return true;
                            }
                        }
                        multi.rpush(_pluralizedIdProperty, id);
                        entityIds = [...entityIds, id];
                    });
                    for (const id of entityIds) {
                        const entity: T = JSON.parse(await smartGet(id));
                        forEach<string>(allKeys, (key: string) => {
                            const property: string = singular(key);
                            if (_indexes[property].unique) {
                                multi.hset(key, uriFriendlyFormat(entity[property]), entity[_idProperty]);
                            } else {
                                multi.set(`${key}:${entity[_idProperty]}`, uriFriendlyFormat(entity[property]));
                            }
                        });
                    }
                    multi.exec((err: Error) => {
                        if (err) {
                            reject(err);
                        } else {
                            this.order(order).then(() => resolve(), (err: Error) => reject(err));
                        }
                    });
                }
            });
        });
    }
    /**
     * Scans recursively until the entire database has been scanned
     * @param {string} match match pattern
     * @returns {Promise<string[]>} a promise that fulfills with the retrieved keys
     */
    protected scanAll(match?: string): Promise<string[]> {
        return new Promise<string[]>((resolve: (value?: string[] | PromiseLike<string[]>) => void, reject: (reason?: any) => void) => {
            let ids: string[] = [];
            const { _redis }: RedisGenericRepository<T> = this;
            const recursiveScan: (cursor: string, match?: string) => void =
                (cursor: string, match?: string): void => {
                    _redis.scan(cursor, ...match ? ["MATCH", `*${match}`] : [],
                        (err: Error, [cursor, array]: (string | string[])[]) => {
                            if (err) {
                                reject(err);
                            }
                            ids = [...ids, ...array as string[]];
                            if (cursor === "0") {
                                resolve(ids);
                            } else {
                                recursiveScan(cursor as string, match);
                            }
                        });
                };
            recursiveScan("0", match);
        });
    }
    /**
     * Scans recursively until the entire sorted set has been scanned
     * @param {string} key sorted set key
     * @param {string} match match pattern
     * @returns {Promise<string[]>} a promise that fulfills with the retrieved keys
     */
    protected hscanAll(key: string, match?: string): Promise<string[]> {
        return new Promise<string[]>((resolve: (value?: string[] | PromiseLike<string[]>) => void, reject: (reason?: any) => void) => {
            let ids: string[] = [];
            const { _redis }: RedisGenericRepository<T> = this;
            const recursiveHscan: (cursor: string, key: string, match?: string) => void =
                (cursor: string, key: string, match?: string): void => {
                    _redis.hscan(key, cursor, ...match ? ["MATCH", match] : [],
                        (err: Error, [cursor, array]: (string | string[])[]) => {
                            if (err) {
                                reject(err);
                            }
                            ids = [...ids, ...array as string[]];
                            if (cursor === "0") {
                                resolve(ids);
                            } else {
                                recursiveHscan(cursor as string, key, match);
                            }
                        });
                };
            recursiveHscan("0", key, match);
        });
    }
}

// Redis is secretly hurting my feelings and my butthole
