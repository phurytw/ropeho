/**
 * @file Configures the main express instance
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/// <reference path="typings.d.ts" />
import * as express from "express";
import * as cors from "cors";
import { Express } from "express-serve-static-core";
import * as bodyParser from "body-parser";
import * as expressSession from "express-session";
import * as passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as FacebookStrategy } from "passport-facebook";
import config from "../config";
import GenericRepository from "./dal/genericRepository";
import { verifyPassword } from "./accounts/password";
import { normalizeEmail, isEmail } from "validator";
import { isString } from "lodash";
import { renderFile } from "ejs";
import * as connectRedis from "connect-redis";

// Routes
import homeRoutes from "./controllers/home";
import apiRoutes from "./controllers/index";

// User
import IGenericRepository = Ropeho.IGenericRepository;
import User = Ropeho.Models.User;

// Passport
const userRepository: IGenericRepository<User> = new GenericRepository<User>({
    ...config.redis,
    ...config.database.users
});
passport.use(new LocalStrategy({
    usernameField: "email"
}, async (email: string, password: string, done: (error: any, user?: any, options?: { message: string; }) => void): Promise<void> => {
    if (!isString(email) || !isEmail(email)) {
        done(null, false, { message: `Email (${email}) is not valid` });
    } else {
        try {
            const [user]: User[] = await userRepository.search({ email: normalizeEmail(email) as string });
            if (!user) {
                done(null, false, { message: `No user found for ${email}` });
            } else if (!user.password) {
                done(null, false, { message: `User ${email} is not registered or is a facebook user` });
            } else {
                const passwordValid: boolean = await verifyPassword(password, user.password);
                if (!passwordValid) {
                    done(null, false, { message: `Incorrect password for ${email}` });
                } else {
                    done(null, user);
                }
            }
        } catch (error) {
            done(error);
        }
    }
}));
passport.use("facebook", new FacebookStrategy({
    clientID: config.users.facebook.appId,
    clientSecret: config.users.facebook.appSecret,
    callbackURL: ""
}, async (acessToken: string, refreshToken: string, profile: passport.Profile, done: (error: any, user?: any) => void) => {
    try {
        let [user]: User[] = await userRepository.search({ facebookId: profile.id });
        const name: string = `${profile.name.givenName} ${profile.name.middleName} ${profile.name.familyName}`;
        if (!user) {
            user = await userRepository.create({
                facebookId: profile.id,
                name
            });
        } else if (user.name !== name) {
            user = {
                ...user,
                name
            };
            await userRepository.update(user);
        }
        done(null, user);
    } catch (error) {
        done(error);
    }
}));
passport.serializeUser((user: User, done: (err: any, id: string) => void) => {
    done(null, user._id);
});
passport.deserializeUser(async (id: string, done: (err: any, user?: User) => void) => {
    try {
        done(null, await userRepository.getById(id));
    } catch (error) {
        done(error);
    }
});

// Configure
export const app: Express = express();
const RedisStore: connectRedis.RedisStore = connectRedis(expressSession);

// Views (for emails)
app.set("views", "src/server/views");
app.set("view engine", "ejs");
app.engine("html", renderFile);
// Middlewares
app.use(cors());
app.use(expressSession({
    ...config.session,
    store: new RedisStore({
        db: parseInt(config.redis.db),
        host: config.redis.host,
        port: config.redis.port,
        pass: config.redis.password
    }),
    secret: config.session.secret
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());
// Routes
app.use("/", homeRoutes);
app.use("/api", apiRoutes);

/**
 * Render view as string
 * @param view string name of the view
 * @param data Object data passed to the view
 * @returns Promise<string> A promise that gives the rendered HTML
 */
export const renderAsString: (view: string, data: Object) => Promise<string> =
    (view: string, data: Object) => new Promise<string>((resolve: (value?: string | PromiseLike<string>) => void, reject: (reason?: any) => void) => {
        app.render(view, data, (err: Error, html: string) => {
            if (err) {
                reject(err);
            } else {
                resolve(html);
            }
        });
    });

export default app;
