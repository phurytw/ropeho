/**
 * @file Main entry for the server application
 * @author François Nguyen <https://github.com/lith-light-g>
 */

/* tslint:disable:no-console */
import app from "./app";

const host: string = "localhost";
const port: number = process.env.PORT || 8000;

app.listen(port, host, (err: Error) => {
    if (err) {
        console.error(err);
    }
    console.log(`API Server listening on ${port}`);
});
