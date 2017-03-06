/**
 * @file Test data
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="../../test.d.ts" />
import { v4 } from "uuid";
import { MediaTypes, Roles, PresentationTypes, MediaPermissions } from "../../enum";
import { computeHashSync } from "../accounts/password";
import { computeToken } from "../accounts/token";
import { map } from "lodash";
import * as deepFreeze from "deep-freeze";

import Category = Ropeho.Models.Category;
import Production = Ropeho.Models.Production;
import User = Ropeho.Models.User;
import Container = Ropeho.Models.PresentationContainer;

// Defining data
const [productionA, productionB, productionC]: Production[] = [
    {
        _id: v4(),
        name: "Production A",
        description: "Description A",
        state: MediaPermissions.Public,
        banner: {
            _id: v4(),
            type: MediaTypes.Image,
            sources: [{
                _id: v4(),
                src: "prodaban_src",
                fallback: "",
                posX: 0,
                posY: 0,
                preview: "",
                size: 0,
                zoom: 0
            }],
            delay: 0,
            description: "",
            state: 0
        },
        background: {
            _id: v4(),
            type: MediaTypes.Image,
            sources: [{
                _id: v4(),
                src: "prodabg_src",
                fallback: "",
                posX: 0,
                posY: 0,
                preview: "",
                size: 0,
                zoom: 0
            }],
            delay: 0,
            description: "",
            state: 0
        },
        medias: [
            {
                _id: v4(),
                type: MediaTypes.Image,
                sources: [{
                    _id: v4(),
                    src: "proda0_0_src",
                    fallback: "",
                    posX: 0,
                    posY: 0,
                    preview: "",
                    size: 0,
                    zoom: 0
                }],
                state: MediaPermissions.Public,
                delay: 0,
                description: ""
            },
            {
                _id: v4(),
                type: MediaTypes.Video,
                sources: [{
                    _id: v4(),
                    src: "proda1_0_src",
                    fallback: "",
                    posX: 0,
                    posY: 0,
                    preview: "",
                    size: 0,
                    zoom: 0
                }, {
                    _id: v4(),
                    src: "proda1_1_src",
                    fallback: "",
                    posX: 0,
                    posY: 0,
                    preview: "",
                    size: 0,
                    zoom: 0
                }, {
                    _id: v4(),
                    src: "proda1_2_src",
                    fallback: "",
                    posX: 0,
                    posY: 0,
                    preview: "",
                    size: 0,
                    zoom: 0
                }],
                state: MediaPermissions.Public,
                delay: 0,
                description: ""
            },
            {
                _id: v4(),
                type: MediaTypes.Slideshow,
                sources: [{
                    _id: v4(),
                    src: "proda2_0_src",
                    fallback: "",
                    posX: 0,
                    posY: 0,
                    preview: "",
                    size: 0,
                    zoom: 0
                }, {
                    _id: v4(),
                    src: "proda2_1_src",
                    fallback: "",
                    posX: 0,
                    posY: 0,
                    preview: "",
                    size: 0,
                    zoom: 0
                }, {
                    _id: v4(),
                    src: "proda2_2_src",
                    fallback: "",
                    posX: 0,
                    posY: 0,
                    preview: "",
                    size: 0,
                    zoom: 0
                }],
                state: MediaPermissions.Public,
                delay: 5000,
                description: ""
            }
        ]
    },
    {
        _id: v4(),
        name: "Production B",
        description: "Description B",
        state: MediaPermissions.OwnerOnly,
        banner: {
            _id: v4(),
            type: MediaTypes.Image,
            sources: [{
                _id: v4(),
                src: "prodbban_src",
                fallback: "",
                posX: 0,
                posY: 0,
                preview: "",
                size: 0,
                zoom: 0
            }],
            state: MediaPermissions.Public,
            delay: 0,
            description: ""
        },
        background: {
            _id: v4(),
            type: MediaTypes.Image,
            sources: [{
                _id: v4(),
                src: "prodbbg_src",
                fallback: "",
                posX: 0,
                posY: 0,
                preview: "",
                size: 0,
                zoom: 0
            }],
            state: MediaPermissions.Public,
            delay: 0,
            description: ""
        },
        medias: [
            {
                _id: v4(),
                type: MediaTypes.Image,
                sources: [{
                    _id: v4(),
                    src: "prodb0_0_src",
                    fallback: "",
                    posX: 0,
                    posY: 0,
                    preview: "",
                    size: 0,
                    zoom: 0
                }],
                state: MediaPermissions.Public,
                delay: 0,
                description: ""
            },
            {
                _id: v4(),
                type: MediaTypes.Image,
                sources: [{
                    _id: v4(),
                    src: "prodb1_0_src",
                    fallback: "",
                    posX: 0,
                    posY: 0,
                    preview: "",
                    size: 0,
                    zoom: 0
                }],
                state: MediaPermissions.Public,
                delay: 0,
                description: ""
            }
        ]
    },
    {
        _id: v4(),
        name: "Production C",
        description: "Description C",
        state: MediaPermissions.Locked,
        banner: {
            _id: v4(),
            type: MediaTypes.Image,
            sources: [{
                _id: v4(),
                src: "prodcban_src",
                fallback: "",
                posX: 0,
                posY: 0,
                preview: "",
                size: 0,
                zoom: 0
            }],
            state: MediaPermissions.Public,
            delay: 0,
            description: ""
        },
        background: {
            _id: v4(),
            type: MediaTypes.Image,
            sources: [{
                _id: v4(),
                src: "prodcbg_src",
                fallback: "",
                posX: 0,
                posY: 0,
                preview: "",
                size: 0,
                zoom: 0
            }],
            state: MediaPermissions.Public,
            delay: 0,
            description: ""
        },
        medias: [
            {
                _id: v4(),
                type: MediaTypes.Image,
                sources: [{
                    _id: v4(),
                    src: "prodc0_0_src",
                    fallback: "",
                    posX: 0,
                    posY: 0,
                    preview: "",
                    size: 0,
                    zoom: 0
                }],
                state: MediaPermissions.Public,
                delay: 0,
                description: ""
            },
            {
                _id: v4(),
                type: MediaTypes.Image,
                sources: [{
                    _id: v4(),
                    src: "prodc1_0_src",
                    fallback: "",
                    posX: 0,
                    posY: 0,
                    preview: "",
                    size: 0,
                    zoom: 0
                }],
                state: MediaPermissions.Public,
                delay: 0,
                description: ""
            }
        ]
    }
];
export const productions: Production[] = [productionA, productionB, productionC];

const [categoryA, categoryB]: Category[] = [
    {
        _id: v4(),
        name: "Category A",
        banner: {
            _id: v4(),
            type: MediaTypes.Image,
            sources: [{
                _id: v4(),
                src: "cata_src",
                fallback: "",
                posX: 0,
                posY: 0,
                preview: "",
                size: 0,
                zoom: 0
            }],
            state: MediaPermissions.Public,
            delay: 0,
            description: ""
        },
        productionIds: map<Production, string>(productions, (p: Production) => p._id)
    },
    {
        _id: v4(),
        name: "Category B",
        banner: {
            _id: v4(),
            type: MediaTypes.Image,
            sources: [{
                _id: v4(),
                src: "catb_src",
                fallback: "",
                posX: 0,
                posY: 0,
                preview: "",
                size: 0,
                zoom: 0
            }],
            state: MediaPermissions.Public,
            delay: 0,
            description: ""
        },
        productionIds: []
    }
];
export const categories: Category[] = [categoryA, categoryB];

export const users: User[] = [
    {
        _id: v4(),
        name: "Administrator",
        email: "admin@test.com",
        password: computeHashSync("123456").toString("hex"),
        token: computeToken(),
        productionIds: [],
        role: Roles.Administrator,
        facebookId: "0123"
    },
    {
        _id: v4(),
        name: "User",
        email: "user@test.com",
        password: computeHashSync("123456").toString("hex"),
        token: computeToken(),
        productionIds: [productionB._id, productionC._id],
        role: Roles.User,
        facebookId: "4567"
    }
];

export const presentations: Container[] = [
    {
        _id: v4(),
        type: PresentationTypes.Horizontal,
        presentations: [
            {
                _id: v4(),
                mainMedia: {
                    _id: v4(),
                    type: MediaTypes.Image,
                    sources: [{
                        _id: v4(),
                        src: "pream_src",
                        fallback: "",
                        posX: 0,
                        posY: 0,
                        preview: "",
                        size: 0,
                        zoom: 0
                    }],
                    delay: 0,
                    description: "",
                    state: 0
                },
                mainText: "Text",
                alternateMedia: {
                    _id: v4(),
                    type: MediaTypes.Image,
                    sources: [{
                        _id: v4(),
                        src: "preaa_src",
                        fallback: "",
                        posX: 0,
                        posY: 0,
                        preview: "",
                        size: 0,
                        zoom: 0
                    }],
                    delay: 0,
                    description: "",
                    state: 0
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
                _id: v4(),
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
                _id: v4(),
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
                mainText: ""
            }
        ]
    }
];

// Freeze everything
deepFreeze<Category>(categories);
deepFreeze<Production>(productions);
deepFreeze<User>(users);
deepFreeze<Container>(presentations);
