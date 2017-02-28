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
    PresentationContainer = 2,
    Presentation = 3,
    User = 4,
    Media = 5,
    Source = 6
}

export enum MediaPermissions {
    Locked = 0,
    OwnerOnly = 1,
    Public = 2
}

export enum ErrorCodes {
    UnexpectedError,
    AuthenticationRequired,
    Restricted,
    InvalidRequest,
    AlreadyExists,
    AssistanceRequired,
    NotFound,
    Unavailable
}
