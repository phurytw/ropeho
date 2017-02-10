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

import Category = Ropeho.Models.Category;
import Production = Ropeho.Models.Production;
import User = Ropeho.Models.User;
import Container = Ropeho.Models.PresentationContainer;

// Defining data
const [categoryA, categoryB]: Category[] = [
    {
        _id: v4(),
        name: "Category A",
        banner: {
            _id: v4(),
            type: MediaTypes.Image,
            sources: [{
                _id: v4(),
                src: "cata_src"
            }]
        }
    },
    {
        _id: v4(),
        name: "Category B",
        banner: {
            _id: v4(),
            type: MediaTypes.Image,
            sources: [{
                _id: v4(),
                src: "catb_src"
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
            _id: v4(),
            type: MediaTypes.Image,
            sources: [{
                _id: v4(),
                src: "prodaban_src"
            }]
        },
        background: {
            _id: v4(),
            type: MediaTypes.Image,
            sources: [{
                _id: v4(),
                src: "prodabg_src"
            }]
        },
        medias: [
            {
                _id: v4(),
                type: MediaTypes.Image,
                sources: [{
                    _id: v4(),
                    src: "proda0_0_src"
                }],
                visibility: true
            },
            {
                _id: v4(),
                type: MediaTypes.Video,
                sources: [{
                    _id: v4(),
                    src: "proda1_0_src"
                }, {
                    _id: v4(),
                    src: "proda1_1_src"
                }, {
                    _id: v4(),
                    src: "proda1_2_src"
                }],
                visibility: true
            },
            {
                _id: v4(),
                type: MediaTypes.Slideshow,
                sources: [{
                    _id: v4(),
                    src: "proda2_0_src"
                }, {
                    _id: v4(),
                    src: "proda2_1_src"
                }, {
                    _id: v4(),
                    src: "proda2_2_src"
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
            _id: v4(),
            type: MediaTypes.Image,
            sources: [{
                _id: v4(),
                src: "prodbban_src"
            }]
        },
        background: {
            _id: v4(),
            type: MediaTypes.Image,
            sources: [{
                _id: v4(),
                src: "prodbbg_src"
            }]
        },
        medias: [
            {
                _id: v4(),
                type: MediaTypes.Image,
                sources: [{
                    _id: v4(),
                    src: "prodb0_0_src"
                }],
                visibility: true
            },
            {
                _id: v4(),
                type: MediaTypes.Image,
                sources: [{
                    _id: v4(),
                    src: "prodb1_0_src"
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
            _id: v4(),
            type: MediaTypes.Image,
            sources: [{
                _id: v4(),
                src: "prodcban_src"
            }]
        },
        background: {
            _id: v4(),
            type: MediaTypes.Image,
            sources: [{
                _id: v4(),
                src: "prodcbg_src"
            }]
        },
        medias: [
            {
                _id: v4(),
                type: MediaTypes.Image,
                sources: [{
                    _id: v4(),
                    src: "prodc0_0_src"
                }],
                visibility: true
            },
            {
                _id: v4(),
                type: MediaTypes.Image,
                sources: [{
                    _id: v4(),
                    src: "prodc1_0_src"
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
                    _id: v4(),
                    type: MediaTypes.Image,
                    sources: [{
                        _id: v4(),
                        src: "pream_src"
                    }]
                },
                mainText: "Text",
                alternateMedia: {
                    _id: v4(),
                    type: MediaTypes.Image,
                    sources: [{
                        _id: v4(),
                        src: "preaa_src"
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
                    _id: v4(),
                    type: MediaTypes.Image,
                    sources: [{
                        _id: v4(),
                        src: "prebm_src"
                    }]
                },
                mainText: "Text",
                alternateMedia: {
                    _id: v4(),
                    type: MediaTypes.Image,
                    sources: [{
                        _id: v4(),
                        src: "preba_src"
                    }]
                },
                alternateText: "Text",
                href: "https://facebook.com"
            },
            {
                mainMedia: {
                    _id: v4(),
                    type: MediaTypes.Image,
                    sources: [{
                        _id: v4(),
                        src: "precm_src"
                    }]
                },
                mainText: "Text",
                alternateMedia: {
                    _id: v4(),
                    type: MediaTypes.Image,
                    sources: [{
                        _id: v4(),
                        src: "preca_src"
                    }]
                },
                alternateText: "Text",
                href: "https://github.com"
            },
            {
                mainMedia: {
                    _id: v4(),
                    type: MediaTypes.Image,
                    sources: [{
                        _id: v4(),
                        src: "predm_src"
                    }]
                },
                mainText: "Text",
                alternateMedia: {
                    _id: v4(),
                    type: MediaTypes.Image,
                    sources: [{
                        _id: v4(),
                        src: "preda_src"
                    }]
                },
                alternateText: "Text",
                href: "https://stackoverflow.com"
            },
            {
                mainMedia: {
                    _id: v4(),
                    type: MediaTypes.Image,
                    sources: [{
                        _id: v4(),
                        src: "preem_src"
                    }]
                },
                mainText: "Text",
                alternateMedia: {
                    _id: v4(),
                    type: MediaTypes.Image,
                    sources: [{
                        _id: v4(),
                        src: "preea_src"
                    }]
                },
                alternateText: "Text",
                href: "https://aws.amazon.com"
            },
            {
                mainMedia: {
                    _id: v4(),
                    type: MediaTypes.Text,
                    description: "Text",
                    sources: []
                },
                mainText: "",
            }
        ]
    }
];

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
