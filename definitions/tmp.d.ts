declare module "tmp" {
    export function file(options?: TmpFileOptions, callback?: TmpFileCallback): void;
    export function file(callback?: TmpFileCallback): void;
    export function fileSync(options?: TmpFileOptions): TmpFile;

    type TmpFileCallback = (err: Error, path: string, fd: number, cleanupCallback: () => void) => void;

    interface TmpFile {
        name: string;
        fd: number;
        removeCallback: () => void;
    }

    interface TmpFileOptions {
        mode?: number;
        prefix?: string;
        postfix?: string;
        discardDescriptor?: boolean;
        detachDescriptor?: boolean;
    }

    export function dir(options?: TmpDirOptions, callback?: TmpDirCallback): void;
    export function dir(callback?: TmpDirCallback): void;
    export function dirSync(options?: TmpDirOptions): TmpDir;

    type TmpDirCallback = (err: Error, path: string, cleanupCallback: () => void) => void;

    interface TmpDir {
        name: string;
        removeCallback: () => void;
    }

    interface TmpDirOptions {
        mode?: number;
        prefix?: string;
        template?: string;
    }

    export function tmpName(callback?: (err: Error, path: string) => void): void;
    export function tmpNameSync(): string;

    interface TmpNameOptions {
        template?: string;
    }

    export function setGracefulCleanup(): void;

    export var mode: number;
    export var prefix: string;
    export var postfix: string;
    export var template: string;
    // export var dir: string;
    export var tries: number;
    export var keep: boolean;
    export var unsafeCleanup: boolean;
}
