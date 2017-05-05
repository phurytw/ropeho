/**
 * @file Fills the database and local media directory with the demo
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import { init } from "../src/sampleData/demoDb";

init().then(() => console.info("Database successfully initialized with the demo data"));
