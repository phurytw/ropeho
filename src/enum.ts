/**
 * @file Enumerables for Ropeho
 * @author François Nguyen <https://github.com/lith-light-g>
 */

export enum Roles {
    Anonymous = 0,
    User = 1,
    Administrator = 2
}

export enum MediaTypes {
    Image = 0,
    Slideshow = 1,
    Video = 2,
    Text = 3
}

export enum PresentationTypes {
    Horizontal = 0,
    Spiral = 1
}

export enum SocketState {
    Idle = 0,
    Downloading = 1,
    Uploading = 2
}

export enum EntityType {
    Category = 0,
    Production = 1,
    Presentation = 2,
    User = 3
}
