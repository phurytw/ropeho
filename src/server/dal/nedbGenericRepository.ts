/**
 * @file Generic repository that manages a NeDB collection
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../typings.d.ts" />
import * as nedb from "nedb";
import { v4 } from "node-uuid";
import { map, isArray, sum } from "lodash";

/**
 * Generic repository that uses MongoDB API
 * @param {nedb} db MongoDB or NeDB collection
 */
export default class NeDBGenericRepository<T extends { _id?: string }> implements Ropeho.IGenericRepository<T> {
    constructor(private db: nedb) {
    }
    /**
     * Gets all entities matched by query
     * @param {any} query Query
     * @param {any} projection Projection
     * @returns {Promise<T[]>} A promise that gives the found entities
     */
    get(query?: any, projection?: any): Promise<T> | Promise<T[]> {
        return new Promise<T[]>((resolve: (value?: T[] | PromiseLike<T[]>) => void, reject: (reason?: any) => void) =>
            this.db.find<T>(query, projection, (err: Error, documents: T[]) =>
                err ? reject(err) : resolve(documents)));
    }
    /**
     * Gets all entities matched by ID
     * @param {string|string[]} _id A string containing the ID or an array of strings containing IDs
     * @param {any} projection Projection
     * @returns {Promise<T>|Promise<T[]>} A promise that gives the found entities
     */
    getById(_id: string | string[], projection?: any): Promise<T> | Promise<T[]> {
        if (isArray<T>(_id)) {
            return new Promise<T[]>((resolve: (value?: T[] | PromiseLike<T[]>) => void, reject: (reason?: any) => void) =>
                this.db.find<T>({ $or: map<string, { _id: string }>(_id, (i: string) => ({ _id: i })) }, projection, (err: Error, documents: T[]) =>
                    err ? reject(err) : resolve(documents)));
        } else {
            return new Promise<T>((resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) =>
                this.db.findOne<T>({ _id }, projection, (err: Error, document: T) =>
                    err ? reject(err) : resolve(document)));
        }
    }
    /**
     * Gets all entities where the property name matches the parameter name
     * @param {string} name The name to search
     * @returns {Promise<T[]>} A promise that gives the found entities
     */
    getByName(name: string, projection?: any): Promise<T[]> {
        return new Promise<T[]>((resolve: (value?: T[] | PromiseLike<T[]>) => void, reject: (reason?: any) => void) =>
            this.db.find<T>({ name }, projection, (err: Error, documents: T[]) =>
                err ? reject(err) : resolve(documents)));
    }
    /**
     * Creates an entity
     * If _id is empty a new ID will be assigned
     * @param {T|T[]} entity The entity to create or an array of entity to create
     * @returns {Promise<T>|Promise<T[]>} A promise that gives the newly created element
     */
    create(entity: T | T[]): Promise<T> | Promise<T[]> {
        if (isArray<T>(entity)) {
            return new Promise<T[]>((resolve: (value?: T[] | PromiseLike<T[]>) => void, reject: (reason?: any) => void) =>
                this.db.insert<T[]>(entity, (err: Error, documents: T[]) =>
                    err ? reject(err) : resolve(documents)));
        } else {
            entity._id = entity._id || v4();
            return new Promise<T>((resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) =>
                this.db.insert<T>(entity, (err: Error, document: T) =>
                    err ? reject(err) : resolve(document)));
        }
    }
    /**
     * Updates an entity
     * @param {T|T[]} entity The entity to update or an array of entity to update
     * @returns {Promise<number>} A promise that gives the amount of entity successfully updated
     */
    update(entity: T | T[]): Promise<number> {
        if (isArray<T>(entity)) {
            const promises: Promise<number>[] = map<T, Promise<number>>(entity, (e: T) => this.update(e));
            return Promise.all<number>(promises).then<number>((numberOfUpdated: number[]) => sum<number>(numberOfUpdated));
        } else {
            return new Promise<number>((resolve: (value?: number | PromiseLike<number>) => void, reject: (reason?: any) => void) =>
                this.db.update<T>({ _id: entity._id }, { $set: entity }, (err: Error, numberOfUpdated: number, upsert: boolean) =>
                    err ? reject(err) : resolve(numberOfUpdated)));
        }
    }
    /**
     * Deletes an entity
     * @param {T|T[]|string|string[]} entity The entity to delete or its ID or an array of entity to delete or theirs IDs
     * @returns {Promise<number>} A promise that gives the amount of entity successfully deleted
     */
    delete(entity: T | T[] | string | string[]): Promise<number> {
        if (isArray(entity)) {
            if (entity.length > 0) {
                if (typeof entity[0] === "string") {
                    return new Promise<number>((resolve: (value?: number | PromiseLike<number>) => void, reject: (reason?: any) => void) =>
                        this.db.remove({ $or: map<string, { _id: string }>(entity as string[], (i: string) => ({ _id: i })) }, { multi: true }, (err: Error, n: number) =>
                            err ? reject(err) : resolve(n)));
                } else {
                    return this.delete(map<T, string>(entity as T[], (e: T) => e._id));
                }
            } else {
                return new Promise<number>((resolve: (value?: number | PromiseLike<number>) => void, reject: (reason?: any) => void) => resolve(0));
            }
        } else if (typeof entity === "string") {
            return new Promise<number>((resolve: (value?: number | PromiseLike<number>) => void, reject: (reason?: any) => void) =>
                this.db.remove({ _id: entity }, { multi: false }, (err: Error, n: number) =>
                    err ? reject(err) : resolve(n)));
        } else {
            return this.delete(entity._id);
        }
    }
    /**
     * Order entities within the collection
     * Entities not targetted by the new order will be appended at the end of the array
     * @param {string[]} order array of IDs, items will be ordered according to the array indexes
     * @returns {Promise<string[]>} A promise that fulfills with the new order
     */
    order(order?: string[]): Promise<string[]> {
        throw new Error("Not implemented");
    }
    /**
     * Search entities
     * @param {{[key:string]:string}} filters filters
     * @param {Promise<T[]>} A promise that fulfills with the found entities
     */
    search(filter: { [key: string]: string }): Promise<T[]> {
        throw new Error("Not implemented");
    }
}
