import { main } from "./main";

(async (): Promise<void> => {
    if (!await main()) {
        process.exitCode = 1;
    }
})();
