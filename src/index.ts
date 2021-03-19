import { main } from "./main";

(async () => {
    if (!await main()) {
        process.exitCode = 1;
    }
})();
