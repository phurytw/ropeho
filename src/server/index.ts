/**
 * @file Main entry for the server application
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/* tslint:disable:no-console */
import app from "./app";
import config from "../config";
import { endPoints } from "../common/helpers/resolveEndPoint";
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
        userRepository.redis.quit();
        const port: number = process.env.PORT || endPoints.api.port || 8000;
        const server: Server = createServer(app);
        init(server);
        server.listen(port, (err: Error) => {
            if (err) {
                console.error(err);
            }
            console.info(`API Server listening on ${port}`);
        });
    };

// create admin account
import User = Ropeho.Models.User;
const userRepository: GenericRepository<User> = new GenericRepository<User>({
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
userRepository.create(admin).then(startApp, startApp);
