declare namespace Ropeho {
    namespace Models {
        /** A user can view and download hidden production is they are allowed to */
        interface User {
            /** Unique ID */
            _id?: string;
            /** Display name */
            name?: string;
            /** Unique email */
            email?: string;
            /** Role */
            type?: number;
            /** IDs of the productions that can be downloaded by this user */
            productionIds?: string[];
            /** Invitation token that the user can access to register the account */
            token?: string;
            /** Hashed password */
            password?: string;
            /** User's Facebook ID */
            facebookId?: string;

            // View model
            /** Productions that can be downloaded by this user */
            productions?: Production[];
        }

        /** A Production is the entity that regroups many medias (usually photos) */
        interface Production {
            /** Unique ID */
            _id?: string;
            /** Production's title */
            name?: string;
            /** Normalized name */
            normalizedName?: string;
            /** Description that appear when viewing this production */
            description?: string;
            /** If visible this production can be browsed on the website */
            visibility?: boolean;
            /** If enabled users whom this production belongs to can view and download related medias */
            enabled?: boolean;
            /** Media shown up in the list */
            banner?: Media;
            /** Media shown up in the presentation behind the description */
            background?: Media;
            /** Medias related to this production */
            medias?: Media[];
            /** ID of the category this production belongs to */
            category_id?: string;

            // View model
            /** Category this production belongs to */
            category?: Category;
        }

        /**
         * A media is an entity that regroups one or many sources
         * It dictates how a content must be displayed 
         */
        interface Media {
            /** Unique ID */
            _id?: string;
            /** Description (primary content for text media) */
            description?: string;
            /** Delay between slides */
            delay?: number;
            /** 0=Image 1=Video 2=Text */
            type?: number;
            /** Visible in website */
            visibility?: boolean;
            /** Source medias */
            sources?: Source[];
            /** Raw source ID for videos */
            rawId?: string;
        }

        /** Contains information about the source of a media and its positionning */
        interface Source {
            /** Unique ID */
            _id?: string;
            /** Path to the media */
            src?: string;
            /** Path to the thumbnail */
            thumbnail?: string;
            /** Zoom 1 = 100% */
            zoom?: number;
            /** X-Axis Placement */
            posX?: number;
            /** Y-Axis Placement */
            posY?: number;
            /** MD5 Hash of the file */
            hash?: string;
        }

        /** Every production must belong to a category */
        interface Category {
            /** Unique ID */
            _id?: string;
            /** Category's name */
            name?: string;
            /** Normalized name */
            normalizedName?: string;
            /** Position in the list */
            position?: number;
            /** Productions affected to this category */
            productions?: Production[];
            /** Media shown up in the list */
            banner?: Media;
        }

        /**
         * A presentation container is a block of content on the main page
         * The main page will show every presentation container available
         */
        interface PresentationContainer {
            /** Unique ID */
            _id?: string;
            /** Type of container */
            type?: number;
            /** Presentations */
            presentations?: Presentation[];
        }

        /**
         * A presentation is a media container that changes when the user hover over it
         */
        interface Presentation {
            /** Text to display over the presentation */
            mainText?: string;
            /** Alternate text */
            alternateText?: string;
            /** presentation type */
            type?: number;
            /** Link to content */
            href?: string;
            /** Media shown by default */
            mainMedia?: Media;
            /** Media shown when hovered */
            alternateMedia?: Media;
        }
    }

    namespace Configuration {
        /** Configuration object that has for each environment a different Configuration */
        interface ConfigurationFile {
            /** Configuration to use in development */
            development: Configuration;
            /** Configuration to use for tests */
            test: Configuration;
            /** Configuration to use in production */
            production: Configuration;
        }

        /** Configuration object with all the necessary settings */
        interface Configuration {
            /** Settings related to database */
            database?: DatabaseConfiguration;
            /** Settings related to user accounts */
            users?: UserConfiguration;
            /** Settings related to session */
            session?: SessionOptions;
            redis?: RedisConfiguration;
            /** Hosts URLs */
            hosts?: HostsOptions;
            /** Mailer settings */
            mailer?: MailerOptions;
            /** Media settings */
            media?: MediaOptions;
            /** Task Queue settings */
            taskQueue?: TaskQueueOptions;
        }

        /** Configuration related to the database */
        interface DatabaseConfiguration {
            /** Options for the category collection */
            categories: DatabaseSetting;
            /** Options for the production collection */
            productions: DatabaseSetting;
            /** Options for the user collection */
            users: DatabaseSetting;
            /** Options for the presentation collection */
            presentations: DatabaseSetting;
            defaultIdProperty: string;
        }

        interface DatabaseSetting extends NeDB.DataStoreOptions {
            namespace: string;
            indexes: { [key: string]: boolean };
            idProperty: string;
        }

        /** Configuration related to user accounts */
        interface UserConfiguration {
            /** Length of the generated string (not the total length) */
            tokenLength: number;
            /** Days until a newly created token expires */
            daysTokenValid: number;
            /** Size of the password hash */
            passwordHashBytes: number;
            /** Size of the password salt */
            passwordSaltBytes: number;
            /** Number of iterations when generating a hash */
            passwordIteration: number;
            /** Base algorithm used to generate hashes */
            passwordAlgorithm: string;
            /** Facebook app credentials */
            facebook: FacebookOptions;
        }

        /** Session options interface copied from express-session */
        interface SessionOptions {
            secret: string;
            name?: string;
            store?: any;
            cookie?: any;
            genid?: any;
            rolling?: boolean;
            resave?: boolean;
            proxy?: boolean;
            saveUninitialized?: boolean;
            unset?: string;
        }

        /** Facebook app credentials */
        interface FacebookOptions {
            appId: string;
            appSecret: string;
        }

        /** Hosts URLs */
        interface HostsOptions {
            api: string;
            client: string;
            admin: string;
            media: string;
        }

        /** Nodemailer settings */
        interface MailerOptions {
            transporterOptions: any;
            mailOptions: nodemailer.SendMailOptions;
        }

        /** Assets settings */
        interface MediaOptions {
            localDirectory: string;
            s3Bucket: string;
            imageEncoding: {
                quality: number;
            };
            videoEncoding: {
                fps: number;
                bitrate: number;
                resolution: string;
            };
            chunkSize: number;
        }

        /** Task Queue settings */
        interface TaskQueueOptions {
            retriesOnFailure: number;
            imageProcessingConcurrency: number;
            videoProcessingConcurrency: number;
            fileUploadConcurrency: number;
        }

        interface RedisConfiguration {
            host?: string;
            port?: number;
            url?: string;
            db?: string;
            password?: string;
        }
    }

    namespace Tasks {
        interface JobData<T> {
            data: T;
            id: string;
        }
        interface ProcessImageOptions {
            data: Buffer;
            dest: string;
        }
        interface ProcessVideoOptions {
            data: Buffer;
            dest: string;
        }
        interface FileUploadOptions {
            data: Buffer;
            dest: string;
            force?: boolean;
        }
    }

    interface IGenericRepository<T> {
        get(...options: any[]): Promise<T | T[]>;
        getById(id: string | string[], ...options: any[]): Promise<T | T[]>;
        search(filters: { [key: string]: string }, ...options: any[]): Promise<T[]>;
        create(entity: T | T[], ...options: any[]): Promise<T | T[]>;
        update(entity: T | T[], ...options: any[]): Promise<number>;
        delete(entity: T | T[] | string | string[], ...options: any[]): Promise<number>;
        order(order?: string[]): Promise<string[]>;
    }

    interface IRedisGenericRepositoryOptions {
        indexes?: { [key: string]: boolean };
        namespace?: string;
        idProperty?: string;
    }

    interface IMediaManager {
        upload(pathToMedia: string, media: Buffer): Promise<any>;
        download(media: string): Promise<Buffer>;
        delete(source: Ropeho.Models.Source | string): Promise<any>;
        updatePermissions(media: string, permissions: boolean): Promise<any>;
        exists(path: string): Promise<boolean>;
        startDownload(media: string): NodeJS.ReadableStream;
        startUpload(media: string): NodeJS.WritableStream;
    }

    interface CreateWebMOptions {
        dest?: string;
        offset?: number;
        duration?: number;
    }

    namespace Socket {
        interface DownloadOptions {
            cookie: string;
            entities: Models.Production[];
        }
        interface UploadOptions {
            cookie: string;
            entityType: number;
            entity: Models.Category | Models.Production | Models.PresentationContainer;
        }
        interface DownloadData {
            file: string;
            fileSize: number;
            totalSize: number;
            data: Buffer;
        }
        interface SocketEvents {
            Connection: string;
            Disconnect: string;
            DownloadInit: string;
            Download: string;
            DownloadEnd: string;
            UploadInit: string;
            Upload: string;
            UploadEnd: string;
            BadRequest: string;
            Error: string;
        }
    }
}

declare namespace NeDB {
    interface DataStoreOptions {
        filename?: string;
        inMemoryOnly?: boolean;
        nodeWebkitAppName?: boolean;
        autoload?: boolean;
        onload?: (error: Error) => any;
        afterSerialization?: (line: string) => string;
        beforeDeserialization?: (line: string) => string;
        corruptAlertThreshold?: number;
    }
}

declare namespace nodemailer {
    interface SendMailOptions {
        from?: string;
        sender?: string;
        to?: string | string[];
        cc?: string | string[];
        bcc?: string | string[];
        replyTo?: string;
        inReplyTo?: string;
        references?: string | string[];
        subject?: string;
        text?: string | Buffer | NodeJS.ReadableStream | AttachmentObject;
        html?: string | Buffer | NodeJS.ReadableStream | AttachmentObject;
        headers?: any;
        attachments?: AttachmentObject[];
        alternatives?: AttachmentObject[];
        messageId?: string;
        date?: Date;
        encoding?: string;
    }

    interface AttachmentObject {
        filename?: string;
        cid?: string;
        path?: string;
        content: string | Buffer | NodeJS.ReadableStream;
        encoding?: string;
        contentType?: string;
        contentDisposition?: string;
    }
}
