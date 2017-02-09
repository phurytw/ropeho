/**
 * @file Test data
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../../typings.d.ts" />
import * as nedb from "nedb";
import { v4 } from "node-uuid";
import { MediaTypes, Roles, PresentationTypes } from "../../../src/enum";
import { computeHashSync } from "../../../src/server/accounts/password";
import { computeToken } from "../../../src/server/accounts/token";
import { uriFriendlyFormat } from "../../../src/server/helpers/uriFriendlyFormat";
import { assign, forEach } from "lodash";

import Category = Ropeho.Models.Category;
import Production = Ropeho.Models.Production;
import User = Ropeho.Models.User;
import Container = Ropeho.Models.PresentationContainer;

// Defining data
const [categoryA, categoryB]: Category[] = [
    {
        _id: v4(),
        name: "Category A",
        position: 0,
        banner: {
            type: MediaTypes.Image,
            sources: [{
                src: "src"
            }]
        }
    },
    {
        _id: v4(),
        name: "Category B",
        position: 1,
        banner: {
            type: MediaTypes.Image,
            sources: [{
                src: "src"
            }]
        }
    }
];
export const categories: Category[] = [categoryA, categoryB];

const [productionA, productionB, productionC]: Production[] = [
    {
        _id: v4(),
        name: "Production A",
        description: "Description A",
        visibility: true,
        enabled: true,
        category_id: categoryA._id,
        banner: {
            type: MediaTypes.Image,
            sources: [{
                src: "src"
            }]
        },
        background: {
            type: MediaTypes.Image,
            sources: [{
                src: "src"
            }]
        },
        medias: [
            {
                type: MediaTypes.Image,
                sources: [{
                    src: "src"
                }],
                visibility: true
            },
            {
                type: MediaTypes.Video,
                sources: [{
                    src: "src"
                }, {
                    src: "src"
                }, {
                    src: "src"
                }],
                visibility: true
            },
            {
                type: MediaTypes.Slideshow,
                sources: [{
                    src: "src"
                }, {
                    src: "src"
                }, {
                    src: "src"
                }],
                visibility: true,
                delay: 5000
            }
        ]
    },
    {
        _id: v4(),
        name: "Production B",
        description: "Description B",
        visibility: true,
        enabled: false,
        category_id: categoryB._id,
        banner: {
            type: MediaTypes.Image,
            sources: [{
                src: "src"
            }]
        },
        background: {
            type: MediaTypes.Image,
            sources: [{
                src: "src"
            }]
        },
        medias: [
            {
                type: MediaTypes.Image,
                sources: [{
                    src: "src"
                }],
                visibility: true
            },
            {
                type: MediaTypes.Image,
                sources: [{
                    src: "src"
                }],
                visibility: true
            }
        ]
    },
    {
        _id: v4(),
        name: "Production C",
        description: "Description C",
        visibility: true,
        enabled: false,
        category_id: categoryB._id,
        banner: {
            type: MediaTypes.Image,
            sources: [{
                src: "src"
            }]
        },
        background: {
            type: MediaTypes.Image,
            sources: [{
                src: "src"
            }]
        },
        medias: [
            {
                type: MediaTypes.Image,
                sources: [{
                    src: "src"
                }],
                visibility: true
            },
            {
                type: MediaTypes.Image,
                sources: [{
                    src: "src"
                }],
                visibility: true
            }
        ]
    }
];
export const productions: Production[] = [productionA, productionB, productionC];

export const users: User[] = [
    {
        _id: v4(),
        name: "Administrator",
        email: "admin@test.com",
        password: computeHashSync("123456").toString("hex"),
        token: computeToken(),
        productionIds: [],
        type: Roles.Administrator
    },
    {
        _id: v4(),
        name: "User",
        email: "user@test.com",
        password: computeHashSync("123456").toString("hex"),
        token: computeToken(),
        productionIds: [productionB._id, productionC._id],
        type: Roles.Administrator
    }
];

export const presentations: Container[] = [
    {
        _id: v4(),
        type: PresentationTypes.Horizontal,
        presentations: [
            {
                mainMedia: {
                    type: MediaTypes.Image,
                    sources: [{
                        src: "src"
                    }]
                },
                mainText: "Text",
                alternateMedia: {
                    type: MediaTypes.Image,
                    sources: [{
                        src: "src"
                    }]
                },
                alternateText: "Text",
                href: "https://facebook.com"
            }
        ]
    },
    {
        _id: v4(),
        type: PresentationTypes.Spiral,
        presentations: [
            {
                mainMedia: {
                    type: MediaTypes.Image,
                    sources: [{
                        src: "src"
                    }]
                },
                mainText: "Text",
                alternateMedia: {
                    type: MediaTypes.Image,
                    sources: [{
                        src: "src"
                    }]
                },
                alternateText: "Text",
                href: "https://facebook.com"
            },
            {
                mainMedia: {
                    type: MediaTypes.Image,
                    sources: [{
                        src: "src"
                    }]
                },
                mainText: "Text",
                alternateMedia: {
                    type: MediaTypes.Image,
                    sources: [{
                        src: "src"
                    }]
                },
                alternateText: "Text",
                href: "https://github.com"
            },
            {
                mainMedia: {
                    type: MediaTypes.Image,
                    sources: [{
                        src: "src"
                    }]
                },
                mainText: "Text",
                alternateMedia: {
                    type: MediaTypes.Image,
                    sources: [{
                        src: "src"
                    }]
                },
                alternateText: "Text",
                href: "https://stackoverflow.com"
            },
            {
                mainMedia: {
                    type: MediaTypes.Image,
                    sources: [{
                        src: "src"
                    }]
                },
                mainText: "Text",
                alternateMedia: {
                    type: MediaTypes.Image,
                    sources: [{
                        src: "src"
                    }]
                },
                alternateText: "Text",
                href: "https://aws.amazon.com"
            },
            {
                mainMedia: {
                    type: MediaTypes.Text,
                    description: "Text",
                    sources: []
                },
                mainText: "",
            }
        ]
    }
];
// Automatically set normalized names
forEach<{ name?: string, normalizedName?: string; }>([...categories, ...productions], (item: { name?: string, normalizedName?: string }) =>
    assign<{ name?: string, normalizedName?: string; }, { name?: string, normalizedName?: string; }>(item, { normalizedName: uriFriendlyFormat(item.name) }));

/** Initializes your collections with test data
 * @param categoryCollection Collection containing categories
 * @param productionCollection Collection containing productions
 * @param userCollection Collection containing users
 * @param presentationCollection Collection containing presentations
 * @returns An awaitable promise
 */
export const initialize: (categoryCollection?: nedb, productionCollection?: nedb, userCollection?: nedb, presentationCollection?: nedb) => Promise<Category | Production | User | Container> =
    (categoryCollection?: nedb, productionCollection?: nedb, userCollection?: nedb, presentationCollection?: nedb): Promise<Category | Production | User | Container> => {
        let promises: Promise<Category | Production | User | Container>[] = [];
        if (categoryCollection) {
            promises = [...promises, new Promise<Category[]>((resolve: (value?: Category[] | PromiseLike<Category[]>) => void, reject: (reason?: any) => void) =>
                categoryCollection.insert<Category[]>(categories, (err: Error, documents: Category[]) =>
                    err ? reject(err) : resolve(documents)))];
        }

        if (productionCollection) {
            promises = [...promises, new Promise<Production[]>((resolve: (value?: Production[] | PromiseLike<Production[]>) => void, reject: (reason?: any) => void) =>
                productionCollection.insert<Production[]>(productions, (err: Error, documents: Production[]) =>
                    err ? reject(err) : resolve(documents)))];
        }
        if (userCollection) {
            promises = [...promises, new Promise<User[]>((resolve: (value?: User[] | PromiseLike<User[]>) => void, reject: (reason?: any) => void) =>
                userCollection.insert<User[]>(users, (err: Error, documents: User[]) =>
                    err ? reject(err) : resolve(documents)))];
        }
        if (presentationCollection) {
            promises = [...promises, new Promise<Container[]>((resolve: (value?: Container[] | PromiseLike<Container[]>) => void, reject: (reason?: any) => void) =>
                presentationCollection.insert<Container[]>(presentations, (err: Error, documents: Container[]) =>
                    err ? reject(err) : resolve(documents)))];
        }
        return Promise.all<Category | Production | User | Container>(promises);
    };

export default initialize;
