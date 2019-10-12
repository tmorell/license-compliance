import { excludePackages } from "./filters";
import { onlyAllow } from "./license";
import { getInstalledPackages } from "./npm";
import { processArgs } from "./program";
import { Factory as FactoryReport } from "./reports";

// Process arguments
processArgs();

// Main process
(async () => {
    // Get all installed packages
    let packages = await getInstalledPackages();

    // Filter packages to be removed
    packages = excludePackages(packages);

    // Verify allowed licenses
    onlyAllow(packages);

    // Requested report
    FactoryReport.getInstance().process(packages);
})();
