/**
 * @file Configuration object for the production environment
 * @author François Nguyen <https://github.com/lith-light-g>
 */
/// <reference path="../ropeho.d.ts" />
// tslint:disable:no-http-string
const config: Ropeho.Configuration.ConfigurationObject = {
    database: {
        categories: {
            indexes: {
                name: {
                    unique: true,
                    nullable: false
                }
            },
            namespace: "category:",
            idProperty: "_id"
        },
        productions: {
            indexes: {
                name: {
                    unique: true,
                    nullable: false
                }
            },
            namespace: "production:",
            idProperty: "_id"
        },
        users: {
            indexes: {
                name: {
                    unique: false,
                    nullable: true
                },
                email: {
                    unique: true,
                    nullable: false
                },
                token: {
                    unique: true,
                    nullable: false
                },
                facebookId: {
                    unique: true,
                    nullable: true
                }
            },
            namespace: "user:",
            idProperty: "_id"
        },
        presentations: {
            indexes: {},
            namespace: "presentation:",
            idProperty: "_id"
        },
        defaultIdProperty: "_id"
    },
    session: {
        name: "ropeho.sid",
        secret: "keyboard cat",
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: true,
            maxAge: 31536000000
        }
    },
    redis: {
        host: "redis",
        port: 6379,
        db: "0"
    },
    users: {
        tokenLength: 48,
        daysTokenValid: 7,
        passwordHashBytes: 32,
        passwordSaltBytes: 16,
        passwordIteration: 1000,
        passwordAlgorithm: "sha256",
        facebook: {
            appId: "appId",
            appSecret: "appSecret"
        },
        administrator: {
            email: "admin@test.com",
            facebookId: "",
            name: "Administrator",
            password: "123456"
        }
    },
    endPoints: {
        api: {
            host: "http://localhost",
            port: 8000
        },
        media: {
            host: "http://localhost",
            port: 8001
        },
        client: {
            host: "http://localhost",
            port: 3000
        },
        admin: {
            host: "http://localhost",
            port: 3010
        },
        customer: {
            host: "http://localhost",
            port: 3020
        },
        clientDevServer: {
            host: "http://localhost",
            port: 3001
        },
        adminDevServer: {
            host: "http://localhost",
            port: 3011
        },
        customerDevServer: {
            host: "http://localhost",
            port: 3021
        }
    },
    mailer: {
        transporterOptions: {
            host: "smtp-relay.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: "",
                pass: ""
            }
        },
        mailOptions: {
            from: "Ropeho Productions"
        }
    },
    media: {
        localDirectory: "/media",
        s3Bucket: "/ropeho",
        imageEncoding: {
            quality: 50
        },
        videoEncoding: {
            fps: 30,
            bitrate: 500,
            timestamp: "00:00:05"
        },
        chunkSize: 8192,
        overwrite: false
    },
    taskQueue: {
        retriesOnFailure: 3,
        imageProcessingConcurrency: 10,
        videoProcessingConcurrency: 1,
        fileUploadConcurrency: 10
    }
};
export default config;
