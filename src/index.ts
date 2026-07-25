import { main } from "./main.js";

if (!(await main())) {
    process.exitCode = 1;
}
