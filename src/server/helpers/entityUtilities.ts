/**
 * @file Module that manipulates entities
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../typings.d.ts" />
import GlobalRepository from "../dal/globalRepository";
import config from "../../config";
import { EntityType } from "../../enum";
import { isObject, isString, isFinite, keys, isArray, flatMap, map } from "lodash";
import * as _ from "lodash";

import IGenericRepository = Ropeho.IGenericRepository;
import Media = Ropeho.Models.Media;
import Source = Ropeho.Models.Source;
import Production = Ropeho.Models.Production;
import Category = Ropeho.Models.Category;
import Presentation = Ropeho.Models.Presentation;
import PresentationContainer = Ropeho.Models.PresentationContainer;
import SourceTargetOptions = Ropeho.Socket.SourceTargetOptions;

interface Entity {
    [key: string]: any;
    _id?: string;
}

const repository: IGenericRepository<any> = new GlobalRepository({
    ...config.redis,
    idProperty: config.database.defaultIdProperty
});

/**
 * Retrieves a media in an entity and replaces it with a new media
 * @param {Entity} entity the entity that holds the media to replaces
 * @param {Media} media the replacement media
 * @returns {Category|Production|Presentation|PresentationContainer} a new object with the replaced media
 */
export const updateMediaInEntity: (entity: Entity, media: Media) => Category | Production | Presentation | PresentationContainer =
    (entity: Entity, media: Media): Category | Production | Presentation | PresentationContainer => {
        if (!isMedia(media)) {
            throw new TypeError("Media is invalid");
        }
        const entityType: EntityType = getEntityType(entity);
        if (!_(getMedias(entity)).map<string>((m: Media) => m._id).includes(media._id)) {
            return entity;
        }
        switch (entityType) {
            case EntityType.Production:
                const production: Production = entity;
                if (production.banner._id === media._id) {
                    return {
                        ...production,
                        banner: media
                    } as Production;
                }
                if (production.background._id === media._id) {
                    return {
                        ...production,
                        background: media
                    } as Production;
                }
                return {
                    ...production,
                    medias: map<Media, Media>(production.medias, (m: Media) => m._id === media._id ? media : m)
                } as Production;
            case EntityType.Category:
                return {
                    ...entity,
                    banner: media
                } as Category;
            case EntityType.PresentationContainer:
                return {
                    ...entity,
                    presentations: map<Presentation, Presentation>((entity as PresentationContainer).presentations, (p: Presentation) => updateMediaInEntity(p, media))
                } as PresentationContainer;
            case EntityType.Presentation:
                const presentation: Presentation = entity;
                if (presentation.mainMedia._id === media._id) {
                    return {
                        ...presentation,
                        mainMedia: media
                    } as Presentation;
                } else {
                    return {
                        ...presentation,
                        alternateMedia: media
                    } as Presentation;
                }
            default:
                throw new TypeError("Entity is invalid");
        }
    };

/**
 * Retrieves a source in a media and replaces it with a new media
 * @param {Media} media the media that holds the source to replaces
 * @param {Source} source the replacement source
 * @returns {Media} a new media with the replaced source
 */
export const updateSourceInMedia: (media: Media, source: Source) => Media =
    (media: Media, source: Source): Media => {
        if (!isMedia(media)) {
            throw new TypeError("Media is invalid");
        }
        if (!isSource(source)) {
            throw new TypeError("Source is invalid");
        }
        if (!_(media.sources).map<string>((s: Source) => s._id).includes(source._id)) {
            throw new Error(`Source cannot be found in media ${media._id}`);
        }
        return {
            ...media,
            sources: map<Source, Source>(media.sources, (s: Source) => s._id === source._id ? source : s)
        };
    };

/**
 * Finds and return a media from an entity
 * @param {Entity} entity the concerned entity
 * @param {Media} mediaId the ID of the media to look for
 * @returns {Media} the found media
 */
export const getMediaFromEntity: (entity: Entity, mediaId: string) => Media =
    (entity: Entity, mediaId: string): Media => {
        return _(getMedias(entity)).filter((m: Media) => m._id === mediaId).head();
    };

/**
 * Finds and return a source from a media
 * @param {Media} media the concerned media
 * @param {Source} sourceId the ID of the source to look for
 * @returns {Media} the found source
 */
export const getSourceFromMedia: (media: Media, sourceId: string) => Source =
    (media: Media, sourceId: string): Source => {
        return _(media.sources).filter((s: Source) => s._id === sourceId).head();
    };

/**
 * Returns all sources in an entity as a {SourceTargetOptions} format
 * @param {Entity} entity the concerned entity
 * @returns {SourceTargetOptions[]} an array of {SourceTargetOptions}
 */
export const getAllSourceTargetOptionsFromEntity: (entity: Entity) => SourceTargetOptions[] =
    (entity: Entity): SourceTargetOptions[] => {
        // Validates entity type
        const type: EntityType = getEntityType(entity);
        if (type !== EntityType.Production && type !== EntityType.Category && type !== EntityType.Presentation && type !== EntityType.PresentationContainer) {
            throw TypeError("Cannot get medias and sources from this entity");
        }
        const medias: Media[] = getMedias(entity);
        return _(medias).flatMap<SourceTargetOptions>((m: Media) => map<Source, SourceTargetOptions>(m.sources, (s: Source) => ({ mainId: entity._id, mediaId: m._id, sourceId: s._id }))).value();
    };

/**
 * Return all sources from an entity
 * @param {Entity} entity the concerned entity
 * @returns {Source[]} all sources from `entity`
 */
export const getSources: (entity: Entity) => Source[] =
    (entity: Entity): Source[] => {
        if (isMedia(entity)) {
            return (entity as Media).sources;
        } else {
            return flatMap<Media, Source>(getMedias(entity), (m: Media) => m.sources);
        }
    };

/**
 * Return all medias from an entity
 * @param {Entity} entity the concerned entity
 * @returns {Media[]} all medias from `entity`
 */
export const getMedias: (entity: Entity) => Media[] =
    (entity: Entity): Media[] => {
        let medias: Media[] = [];
        if (isProduction(entity)) {
            medias = _(entity)
                .pickBy<Production>((val: any, key: string) => key === "banner" || key === "background" || key === "medias")
                .values<Media>()
                .flatten<Media>()
                .value();
        } else if (isCategory(entity)) {
            medias = [(entity as Category).banner];
        } else if (isPresentation(entity)) {
            medias = [(entity as Presentation).mainMedia, (entity as Presentation).alternateMedia];
        } else if (isPresentationContainer(entity)) {
            medias = flatMap<Presentation, Media>((entity as PresentationContainer).presentations, (p: Presentation) => getMedias(p));
        } else {
            throw new TypeError("Can only get medias from a production, a category, a presentation or a presentation container");
        }
        return medias;
    };

/**
 * Check if entity is a Source
 * @param {Entity} entity the entity to Check
 * @returns {boolean} true if it is a Source
 */
export const isSource: (entity: Entity) => boolean =
    (entity: Entity): boolean => {
        // Param itself must be an object
        let isSource: boolean = isObject(entity);
        if (!isSource) {
            return false;
        }
        let propCount: number = 0;
        const properties: string[] = keys(entity),
            length: number = properties.length;
        for (const key of properties) {
            const val: any = entity[key];
            switch (key) {
                case "_id":
                case "src":
                case "preview":
                case "fallback":
                    if (!isString(val)) {
                        isSource = false;
                    }
                    propCount++;
                    break;
                case "size":
                case "zoom":
                case "posX":
                case "posY":
                    if (!isFinite(val)) {
                        isSource = false;
                    }
                    propCount++;
                    break;
                default:
                    isSource = false;
                    break;
            }
        }
        // It must includes all properties
        return isSource && propCount === 8;
    };

/**
 * Check if entity is a Media
 * @param {Entity} entity the entity to Check
 * @returns {boolean} true if it is a Media
 */
export const isMedia: (entity: Entity) => boolean =
    (entity: Entity): boolean => {
        // Param itself must be an object
        let isMedia: boolean = isObject(entity);
        if (!isMedia) {
            return false;
        }
        let propCount: number = 0;
        const properties: string[] = keys(entity),
            length: number = properties.length;
        for (const key of properties) {
            const val: any = entity[key];
            switch (key) {
                case "_id":
                case "description":
                    if (!isString(val)) {
                        isMedia = false;
                    }
                    propCount++;
                    break;
                case "delay":
                case "type":
                case "state":
                    if (!isFinite(val)) {
                        isMedia = false;
                    }
                    propCount++;
                    break;
                case "sources":
                    if (!isArray<Source>(val)) {
                        isMedia = false;
                    } else {
                        isMedia = !_(val).map<boolean>((src: Source) => isSource(src)).includes(false);
                    }
                    propCount++;
                    break;
                default:
                    isMedia = false;
                    break;
            }
        }
        // It must includes all properties
        return isMedia && propCount === 6;
    };

/**
 * Check if entity is a Production
 * @param {Entity} entity the entity to Check
 * @returns {boolean} true if it is a Production
 */
export const isProduction: (entity: Entity) => boolean =
    (entity: Entity): boolean => {
        // Param itself must be an object
        let isProduction: boolean = isObject(entity);
        if (!isProduction) {
            return false;
        }
        let propCount: number = 0;
        const properties: string[] = keys(entity),
            length: number = properties.length;
        for (const key of properties) {
            const val: any = entity[key];
            switch (key) {
                case "banner":
                case "background":
                    if (!isMedia(val)) {
                        isProduction = false;
                    }
                    propCount++;
                    break;
                case "medias":
                    if (!isArray<Media>(val)) {
                        isProduction = false;
                    } else {
                        isProduction = !_(val).map<boolean>((m: Media) => isMedia(m)).includes(false);
                    }
                    propCount++;
                    break;
                case "_id":
                case "name":
                case "description":
                case "categoryId":
                    if (!isString(val)) {
                        isProduction = false;
                    }
                    propCount++;
                    break;
                case "state":
                    if (!isFinite(val)) {
                        isProduction = false;
                    }
                    propCount++;
                    break;
                default:
                    isProduction = false;
                    break;
            }
        }
        // It must includes all properties
        return isProduction && propCount === 8;
    };

/**
 * Check if entity is a Category
 * @param {Entity} entity the entity to Check
 * @returns {boolean} true if it is a Category
 */
export const isCategory: (entity: Entity) => boolean =
    (entity: Entity): boolean => {
        // Param itself must be an object
        let isCategory: boolean = isObject(entity);
        if (!isCategory) {
            return false;
        }
        let propCount: number = 0;
        const properties: string[] = keys(entity),
            length: number = properties.length;
        for (const key of properties) {
            const val: any = entity[key];
            switch (key) {
                case "banner":
                    if (!isMedia(val)) {
                        isCategory = false;
                    }
                    propCount++;
                    break;
                case "_id":
                case "name":
                case "productionIds":
                    if (!isArray<string>(val)) {
                        isCategory = false;
                    } else {
                        isCategory = !_(val).map<boolean>((id: string) => isString(id)).includes(false);
                    }
                    propCount++;
                    break;
                default:
                    isCategory = false;
                    break;
            }
        }
        // It must includes all properties
        return isCategory && propCount === 4;
    };

/**
 * Check if entity is a Presentation
 * @param {Entity} entity the entity to Check
 * @returns {boolean} true if it is a Presentation
 */
export const isPresentation: (entity: Entity) => boolean =
    (entity: Entity): boolean => {
        // Param itself must be an object
        let isPresentation: boolean = isObject(entity);
        if (!isPresentation) {
            return false;
        }
        let propCount: number = 0;
        const properties: string[] = keys(entity),
            length: number = properties.length;
        for (const key of properties) {
            const val: any = entity[key];
            switch (key) {
                case "mainMedia":
                    if (!isMedia(val)) {
                        isPresentation = false;
                    }
                    propCount++;
                    break;
                case "alternateMedia":
                    if (!isMedia(val) || val === null) {
                        isPresentation = false;
                    }
                    propCount++;
                    break;
                case "_id":
                case "mainText":
                case "alternateText":
                case "href":
                    if (!isString(val)) {
                        isPresentation = false;
                    }
                    propCount++;
                    break;
                default:
                    isPresentation = false;
                    break;
            }
        }
        // It must includes all properties
        return isPresentation && propCount === 6;
    };

/**
 * Check if entity is a PresentationContainer
 * @param {Entity} entity the entity to Check
 * @returns {boolean} true if it is a PresentationContainer
 */
export const isPresentationContainer: (entity: Entity) => boolean =
    (entity: Entity): boolean => {
        // Param itself must be an object
        let isPresentationContainer: boolean = isObject(entity);
        if (!isPresentationContainer) {
            return false;
        }
        let propCount: number = 0;
        const properties: string[] = keys(entity),
            length: number = properties.length;
        for (const key of properties) {
            const val: any = entity[key];
            switch (key) {
                case "_id":
                    if (!isString(val)) {
                        isPresentationContainer = false;
                    }
                    propCount++;
                    break;
                case "type":
                    if (!isFinite(val)) {
                        isPresentationContainer = false;
                    }
                    propCount++;
                    break;
                case "presentations":
                    if (!isArray<Presentation>(val)) {
                        isPresentationContainer = false;
                    } else {
                        isPresentationContainer = !_(val).map<boolean>((pre: Presentation) => isPresentation(pre)).includes(false);
                    }
                    propCount++;
                    break;
                default:
                    isPresentationContainer = false;
                    break;
            }
        }
        // It must includes all properties
        return isPresentationContainer && propCount === 3;
    };

/**
 * Returns the entity type number of an entity
 * @param {Entity} entity the entity to Check
 * @returns {EntityType} the entity type
 */
export const getEntityType: (entity: Entity) => EntityType =
    (entity: Entity): EntityType => {
        if (isProduction(entity)) {
            return EntityType.Production;
        } else if (isCategory(entity)) {
            return EntityType.Category;
        } else if (isPresentationContainer(entity)) {
            return EntityType.PresentationContainer;
        } else if (isPresentation(entity)) {
            return EntityType.Presentation;
        } else if (isMedia(entity)) {
            return EntityType.Media;
        } else if (isSource(entity)) {
            return EntityType.Source;
        } else {
            throw new TypeError("Invalid entity");
        }
    };
