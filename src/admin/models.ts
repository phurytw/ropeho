/**
 * @file Immutable records for Repeho models
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import { Record } from "immutable";
import { v4 } from "uuid";
import { MediaTypes, MediaPermissions, PresentationTypes, Roles } from "../enum";

import Models = Ropeho.Models;

const defaultProduction: Models.Production = {
    _id: v4(),
    background: {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [],
        state: MediaTypes.Image
    },
    banner: {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [],
        state: MediaTypes.Image
    },
    description: "",
    medias: [],
    name: "",
    state: MediaPermissions.Locked
};
export class Production extends Record(defaultProduction, "Production") implements Models.Production {
    public _id?: string;
    public name?: string;
    public description?: string;
    public background?: Media;
    public banner?: Media;
    public medias?: Media[];
    public state?: MediaPermissions;
    constructor(init?: Models.Production) {
        super(init);
    }
}

const defaultMedia: Models.Media = {
    _id: v4(),
    delay: 0,
    description: "",
    sources: [],
    state: MediaPermissions.Public,
    type: MediaTypes.Image
};
export class Media extends Record(defaultMedia, "Media") implements Models.Media {
    public _id?: string;
    public delay?: number;
    public description?: string;
    public sources?: Source[];
    public state?: MediaPermissions;
    public type?: MediaTypes;
    constructor(init?: Models.Media) {
        super(init);
    }
}

const defaultSource: Models.Source = {
    _id: v4(),
    fallback: "",
    posX: 0,
    posY: 0,
    preview: "",
    fileSize: 0,
    src: "",
    zoom: 1
};
export class Source extends Record(defaultSource, "Source") implements Models.Source {
    public _id?: string;
    public src?: string;
    public fallback?: string;
    public preview?: string;
    public posX?: number;
    public posY?: number;
    public fileSize?: number;
    public zoom?: number;
    constructor(init?: Models.Source) {
        super(init);
    }
}

const defaultPresentation: Models.Presentation = {
    _id: v4(),
    mainMedia: {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    },
    mainText: "",
    alternateMedia: {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    },
    alternateText: "",
    href: ""
};
export class Presentation extends Record(defaultPresentation, "Presentation") implements Models.Presentation {
    public _id?: string;
    public mainMedia?: Media;
    public mainText?: string;
    public alternateMedia?: Media;
    public alternateText?: string;
    public href?: string;
    constructor(init?: Models.Presentation) {
        super(init);
    }
}

const defaultContainer: Models.PresentationContainer = {
    _id: v4(),
    presentations: [],
    type: PresentationTypes.Horizontal
};
export class PresentationContainer extends Record(defaultContainer, "PresentationContainer") implements Models.PresentationContainer {
    public _id?: string;
    public presentations?: Presentation[];
    public type?: PresentationTypes;
    constructor(init?: Models.PresentationContainer) {
        super(init);
    }
}

const defaultCategory: Models.Category = {
    _id: v4(),
    banner: {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    },
    name: "",
    productionIds: [],
    productions: []
};
export class Category extends Record(defaultCategory, "Category") implements Models.Category {
    public _id?: string;
    public banner?: Media;
    public name?: string;
    public productionIds?: string[];
    public productions?: Production[];
    constructor(init?: Models.Category) {
        super(init);
    }
}

const defaultUser: Models.User = {
    _id: v4(),
    email: "",
    facebookId: "",
    name: "",
    password: "",
    productionIds: [],
    productions: [],
    role: Roles.Anonymous,
    token: ""
};
export class User extends Record(defaultUser, "User") implements Models.User {
    public _id?: string;
    public email?: string;
    public password?: string;
    public name?: string;
    public facebookId?: string;
    public token?: string;
    public productionIds?: string[];
    public productions?: Production[];
    public role?: Roles;
    constructor(init?: Models.User) {
        super(init);
    }
}
