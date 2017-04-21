/**
 * @file Global type definitions for the project
 * @author François Nguyen <https://github.com/lith-light-g>
 */

declare namespace Ropeho {
    namespace Models {
        /**
         * A user can view and download hidden production is they are allowed to
         */
        interface User {
            /**
             *  Unique ID
             */
            _id?: string;
            /**
             * Display name
             */
            name?: string;
            /**
             * Unique email
             */
            email?: string;
            /**
             * Role
             */
            role?: number;
            /**
             * IDs of the productions that can be downloaded by this user
             */
            productionIds?: string[];
            /**
             * Invitation token that the user can access to register the account
             */
            token?: string;
            /**
             * Hashed password
             */
            password?: string;
            /**
             * User's Facebook ID
             */
            facebookId?: string;

            /**
             * Productions owned by this user
             */
            productions?: Production[];
        }

        /**
         * A Production is the entity that regroups many medias (usually photos)
         */
        interface Production {
            /**
             * Unique ID
             */
            _id?: string;
            /**
             * Production's title
             */
            name?: string;
            /**
             * Description that appear when viewing this production
             */
            description?: string;
            /**
             * Models of the photo shooting
             */
            models?: string;
            /**
             * Location of the photo shooting
             */
            location?: string;
            /**
             * Date of the photo shooting
             */
            date?: string;
            /**
             * If this production can be browsed on the website
             */
            state?: number;
            /**
             * Media shown up in the menus
             */
            banner?: Media;
            /**
             * Media shown up in the presentation behind the description
             */
            background?: Media;
            /**
             * Medias related to this production
             */
            medias?: Media[];
        }

        /**
         * A media is an entity that regroups one or many sources
         * It dictates how a content must be displayed
         */
        interface Media {
            /**
             * Unique ID
             */
            _id?: string;
            /**
             * Description (primary content for text media)
             */
            description?: string;
            /**
             * Delay between slides
             */
            delay?: number;
            /**
             * 0=Image 1=Video 2=Text
             */
            type?: number;
            /**
             * Visible in website, only to the client or locked
             */
            state?: number;
            /**
             * Source medias
             */
            sources?: Source[];
        }

        /**
         * Contains information about the source of a media and its positionning
         */
        interface Source {
            /**
             * Unique ID
             */
            _id?: string;
            /**
             * Path to the source media
             */
            src?: string;
            /**
             * Path to the downsized media
             */
            preview?: string;
            /**
             * Fallback image for videos
             */
            fallback?: string;
            /**
             * Size of the source content
             */
            fileSize?: number;
            /**
             * Zoom 1 = 100%
             */
            zoom?: number;
            /**
             * X-Axis Placement
             */
            posX?: number;
            /**
             * Y-Axis Placement
             */
            posY?: number;
        }

        /**
         * Every production must belong to a category
         */
        interface Category {
            /**
             * Unique ID
             */
            _id?: string;
            /**
             * Category's name
             */
            name?: string;
            /**
             * Productions IDs affected to this category
             */
            productionIds?: string[];
            /**
             * Media shown up in the list
             */
            banner?: Media;

            /**
             * Productions affected to this category
             */
            productions?: Production[];
        }

        /**
         * A presentation container is a block of content on the main page
         * The main page will show every presentation container available
         */
        interface PresentationContainer {
            /**
             * Unique ID
             */
            _id?: string;
            /**
             * Type of container
             */
            type?: number;
            /**
             * Presentations
             */
            presentations?: Presentation[];
            /**
             * Container specific options
             */
            options?: any;
        }

        /**
         * A presentation is a media container that changes when the user hover over it
         */
        interface Presentation {
            /**
             * Unique ID
             */
            _id?: string;
            /**
             * Text to display over the presentation
             */
            mainText?: string;
            /**
             * Alternate text to display when hovering
             */
            alternateText?: string;
            /**
             * Link to content
             */
            href?: string;
            /**
             * Media shown by default
             */
            mainMedia?: Media;
            /**
             * Media shown when hovering
             */
            alternateMedia?: Media;
            /**
             * Presentation specific options
             */
            options?: any;
        }

        /**
         * Interface for the DAL
         */
        interface IGenericRepository<T> {
            /**
             * Gets provided entities or all of them
             */
            get(...options: any[]): Promise<T | T[]>;
            /**
             * Gets entities by ID
             */
            getById(id: string | string[], ...options: any[]): Promise<T | T[]>;
            /**
             * Gets entities using filters
             */
            search(filters: { [key: string]: string }, ...options: any[]): Promise<T[]>;
            /**
             * Creates entities
             */
            create(entity: T | T[], ...options: any[]): Promise<T | T[]>;
            /**
             * Update entities
             */
            update(entity: T | T[], ...options: any[]): Promise<number>;
            /**
             * Deletes entities
             */
            delete(entity: T | T[] | string | string[], ...options: any[]): Promise<number>;
            /**
             * Get/Set the order of the entities
             */
            order(order?: string[], ...options: any[]): Promise<string[]>;
        }

        interface IRedisGenericRepositoryOptions {
            indexes?: { [key: string]: IIndexOptions };
            namespace?: string;
            idProperty?: string;
        }

        interface IIndexOptions {
            unique: boolean;
            nullable: boolean;
        }

        interface AutoMasonryContainerOptions {
            /**
             * Percentage of child's images and videos visible
             */
            percentVisible?: number;
        }

        interface AutoMasonryPresentationOptions {
            /**
             * Percentage of the image/video visible (overwrites container's setting)
             */
            percentVisible?: number;
        }

        interface StrictMasonryPresentationOptions {
            /**
             * Width is equal to width * base size
             */
            columnSpan?: number;
            /**
             * Height is equal to height * base size
             */
            rowSpan?: number;
        }
    }

    namespace Configuration {
        /**
         * Configuration object that has for each environment a different Configuration
         */
        interface ConfigurationFile {
            /**
             * Configuration to use in development
             */
            development: ConfigurationObject;
            /**
             * Configuration to use for tests
             */
            test: ConfigurationObject;
            /**
             * Configuration to use in production
             */
            production: ConfigurationObject;
        }

        /**
         * Configuration object with all the necessary configuration for the application
         */
        interface ConfigurationObject {
            /**
             * Database related configuration
             */
            database?: DatabaseConfiguration;
            /**
             * Configuration related to user accounts
             */
            users?: UserConfiguration;
            /**
             * Configuration related to session
             */
            session?: SessionConfiguration;
            /**
             * Redis connection
             */
            redis?: RedisConfiguration;
            /**
             * Hosts URLs
             */
            endPoints?: EndPointsConfiguration;
            /**
             * Mailer configuration
             */
            mailer?: MailerConfiguration;
            /**
             * Media configuration
             */
            media?: MediaConfiguration;
            /**
             * Task queue configuration
             */
            taskQueue?: TaskQueueConfiguration;
        }

        /**
         * Configuration related to the database
         */
        interface DatabaseConfiguration {
            /**
             * Configuration for the category collection
             */
            categories: DatabaseCollectionConfiguration;
            /**
             * Configuration for the production collection
             */
            productions: DatabaseCollectionConfiguration;
            /**
             * Configuration for the user collection
             */
            users: DatabaseCollectionConfiguration;
            /**
             * Configuration for the presentation collection
             */
            presentations: DatabaseCollectionConfiguration;
            /**
             * Default key name to use for IDs
             */
            defaultIdProperty: string;
        }

        /**
         * Configuration of a database collection
         */
        interface DatabaseCollectionConfiguration {
            /**
             * Redis namespace
             */
            namespace: string;
            /**
             * Secondary indexes set to 1 if it must be unique or 2 if it must be unique but nullable
             */
            indexes: { [key: string]: Models.IIndexOptions };
            /**
             * Name of the ID property
             */
            idProperty: string;
        }

        /**
         * Configuration related to user accounts
         */
        interface UserConfiguration {
            /**
             * Length of the generated string (not the total length)
             */
            tokenLength: number;
            /**
             * Days until a newly created token expires
             */
            daysTokenValid: number;
            /**
             * Size of the password hash
             */
            passwordHashBytes: number;
            /**
             * Size of the password salt
             */
            passwordSaltBytes: number;
            /**
             * Number of iterations when generating a hash
             */
            passwordIteration: number;
            /**
             * Base algorithm used to generate hashes
             */
            passwordAlgorithm: string;
            /**
             * Facebook app credentials
             */
            facebook: FacebookConfiguration;
            /**
             * Administrator account to be created
             */
            administrator: {
                email: string;
                name: string;
                password: string;
                facebookId: string;
            };
        }

        /**
         * Session options interface copied from express-session
         */
        interface SessionConfiguration {
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

        /**
         * Facebook app credentials
         */
        interface FacebookConfiguration {
            appId: string;
            appSecret: string;
        }

        /**
         * Hosts URLs
         */
        interface EndPointsConfiguration {
            /**
             * Web API server
             */
            api: EndPointConfiguration;
            /**
             * Media storage
             */
            media: EndPointConfiguration;
            /**
             * Client server
             */
            client: EndPointConfiguration;
            /**
             * Client webpack dev server
             */
            clientDevServer: EndPointConfiguration;
            /**
             * Admin server
             */
            admin: EndPointConfiguration;
            /**
             * Admin webpack dev server
             */
            adminDevServer: EndPointConfiguration;
            /**
             * Customer server
             */
            customer: EndPointConfiguration;
            /**
             * Customer webpack dev server
             */
            customerDevServer: EndPointConfiguration;
        }

        /**
         * Config for a single end point
         */
        interface EndPointConfiguration {
            /**
             * host base URL
             */
            host: string;
            /**
             * port
             */
            port: number;
        }

        /**
         * Nodemailer configuration
         */
        interface MailerConfiguration {
            /**
             * nodemailer options
             */
            transporterOptions: any;
            /**
             * Default mail options to use with sendMail
             */
            mailOptions: nodemailer.SendMailOptions;
        }

        /**
         * Assets settings
         */
        interface MediaConfiguration {
            /**
             * The directory to use when used with the local media manager
             */
            localDirectory: string;
            /**
             * The directory to use for temporary files
             */
            tempDirectory: string;
            /**
             * The path to the S3 bucket (appended to media host)
             */
            s3Bucket: string;
            /**
             * Image encoding configuration
             */
            imageEncoding: {
                /**
                 * WebP quality
                 */
                quality: number;
            };
            /**
             * Video encoding configuration
             */
            videoEncoding: {
                /**
                 * WebM FPS
                 */
                fps: number;
                /**
                 * WebM Quality
                 */
                bitrate: number;
                /**
                 * WebM Screensho timestamp
                 */
                timestamp: string;
            };
            /**
             * Chunk size when transferring files
             */
            chunkSize: number;
            /**
             * If true when uploading a media the previous media is overwritten
             */
            overwrite: boolean;
        }

        /**
         * Task Queue configuration
         */
        interface TaskQueueConfiguration {
            /**
             * Number of retries if a job fails
             */
            retriesOnFailure: number;
            /**
             * Maximum number of concurrent image processing tasks
             */
            imageProcessingConcurrency: number;
            /**
             * Maximum number of concurrent video processing tasks
             */
            videoProcessingConcurrency: number;
            /**
             * Maximum number of concurrent file uploading tasks
             */
            fileUploadConcurrency: number;
        }

        /**
         * Redis configuration
         */
        interface RedisConfiguration {
            /**
             * Server host
             */
            host?: string;
            /**
             * Server port
             */
            port?: number;
            url?: string;
            /**
             * Database to select
             */
            db?: string;
            /**
             * Password to authenticate
             */
            password?: string;
        }
    }

    namespace Tasks {
        /**
         * Job data from kue
         */
        interface JobData<T> {
            data: T;
            /**
             * Job's ID
             */
            id: number;
        }
        /**
         * Options when creating a task to process an incoming video
         */
        interface ProcessImageOptions {
            /**
             * Path to image
             */
            source: string;
            /**
             * Destination in the media directory
             */
            dest: string;
        }
        /**
         * Options when creating a task to process an incoming image
         */
        interface ProcessVideoOptions {
            /**
             * Path to video
             */
            source: string;
            /**
             * Destination in the media directory
             */
            dest: string;
            /**
             * Destination of the fallback screenshot
             */
            fallbackDest: string;
            /**
             * Cut off the beginning of the video until this point
             */
            offset?: number;
            /**
             * Duration for the preview video
             */
            duration?: number;
        }
        /**
         * Options when creating a task to process a file upload
         */
        interface FileUploadOptions {
            /**
             * Path to file
             */
            source: string;
            /**
             * Destination in the media directory
             */
            dest: string;
        }
    }

    namespace Media {
        interface IMediaManager {
            upload(pathToMedia: string, media: Buffer): Promise<void>;
            download(media: string): Promise<Buffer>;
            delete(source: Ropeho.Models.Source | string): Promise<void>;
            updatePermissions(media: string, permissions: boolean): Promise<void>;
            exists(path: string): Promise<boolean>;
            startDownload(media: string): NodeJS.ReadableStream;
            startUpload(media: string): NodeJS.WritableStream;
            rename(source: string, dest: string): Promise<void>;
            newName(path: string): Promise<string>;
            filesize(media: string): Promise<number>;
        }

        interface CreateWebMOptions {
            dest?: string;
            offset?: number;
            duration?: number;
            setProgress?: (progress: number) => any;
        }
    }

    namespace Socket {
        interface DownloadOptions {
            targets: SourceTargetOptions[];
        }
        interface UploadOptions {
            target: SourceTargetOptions;
            filename?: string;
        }
        interface DownloadData {
            file: string;
            fileSize: number;
            totalSize: number;
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
            Exception: string;
        }
        /**
         * Data structure to retrieve a specific media in the database
         */
        interface MediaTargetOptions {
            /**
             * Optional namespace or entity type to narrow search
             */
            entityType?: number | string;
            /**
             * ID of the Production/Category/Presentation
             */
            mainId: string;
            /**
             * ID of the media containing the source
             */
            mediaId: string;
        }
        /**
         * Data structure to retrieve a specific source in the database
         */
        interface SourceTargetOptions extends MediaTargetOptions {
            /**
             * ID of the source
             */
            sourceId?: string;
        }
        /**
         * Data structure relative to a connected client
         */
        interface SocketClient {
            /**
             * Socket.IO Socket of the client
             */
            socket: SocketIO.Socket;
            /**
             * If the client is downloading, uploading or idle
             */
            state: number;
            /**
             * Stream to write on when uploading
             */
            uploadStream?: NodeJS.WritableStream;
            /**
             * Requested resource for upload
             */
            target?: SourceTargetOptions;
            /**
             * Requested entity for upload
             */
            entityTarget?: Models.Production | Models.Category | Models.PresentationContainer;
            /**
             * Requested media for upload
             */
            mediaTarget?: Models.Media;
            /**
             * Requested source for upload
             */
            sourceTarget?: Models.Source;
            /**
             * Hash to update while uploading
             */
            hash?: any;
            /**
             * Files requested for download
             */
            downloading?: string[];
            /**
             * Authentication cookie
             */
            cookie?: string;
        }
        interface UploadEntry {
            id?: string;
            max: number;
            bytesSent: number;
            target: SourceTargetOptions;
            active: boolean;
            objectURL: string;
        }
        interface DownloadHashes {
            [key: string]: string;
        }
    }

    interface IErrorResponse {
        status?: number;
        developerMessage?: Error | string;
        userMessage?: Error | string;
        errorCode?: number;
    }

    interface SearchResults {
        categories?: Models.Category[];
        productions?: Models.Production[];
        users?: Models.User[];
    }

    interface TaskList {
        tasks?: any[];
        clients?: Socket.SocketClient[];
        downloading?: string[];
        uploading?: string[];
    }

    interface FetchThunkExtras {
        host?: string;
        init?: RequestInit;
        error?: { type: string; error?: IErrorResponse; };
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

declare namespace NodeJS {
    interface Global {
        window: Window;
    }
}
