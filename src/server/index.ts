/**
 * @file Main entry for the server application
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/* tslint:disable:no-console */
import app from "./app";
import * as detect from "detect-port";
import config from "../config";
import GenericRepository from "./dal/genericRepository";
import { computeHashSync } from "./accounts/password";
import { computeToken } from "./accounts/token";
import { Roles } from "../enum";
import { init } from "./socket";
import { Server, createServer } from "http";

/**
 * Starts the application
 */
const startApp: () => void =
    (): void => {
        detect(config.endPoints.api.port, (err: Error, port: number) => {
            if (err) {
                throw err;
            }
            const server: Server = createServer(app);
            init(server);
            server.listen(port, (err: Error) => {
                if (err) {
                    console.error(err);
                }
                console.info(`API Server listening on ${port}`);
            });
        });
    };

// create admin account
import User = Ropeho.Models.User;
const userRepository: Ropeho.Models.IGenericRepository<User> = new GenericRepository<User>({
    ...config.redis,
    ...config.database.users
});
const admin: User = {
    productionIds: [],
    role: Roles.Administrator,
    token: computeToken(),
    email: config.users.administrator.email,
    name: config.users.administrator.name,
    password: computeHashSync(config.users.administrator.password).toString("hex"),
    facebookId: config.users.administrator.facebookId
};

if (process.env.NODE_ENV !== "production") {
    require("../sampleData/demoDb").init().then(() =>
        userRepository.create(admin).then(startApp, startApp), (err: Error) => {
            throw err;
        });
} else {
    userRepository.create(admin).then(startApp, startApp);
}
