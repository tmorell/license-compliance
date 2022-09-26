import Debug from "debug";

import { getConfiguration, isComplianceModeEnabled } from "./configuration";
import { excludePackages, queryPackages } from "./filters";
import { onlyAllow } from "./license";
import { getInstalledPackages } from "./npm";
import { Factory as FactoryReport } from "./reports";

const debug = Debug("license-compliance:main");

export async function main(): Promise<boolean> {
    // Get configuration
    const configuration = await getConfiguration();
    debug("Configuration", configuration);
    if (!configuration) {
        return false;
    }

    // Get all installed packages
    let packages = await getInstalledPackages(configuration);
    if (packages.length === 0) {
        return true;
    }

    // Filter out excluded packages
    packages = excludePackages(packages, configuration);

    const report = FactoryReport.getInstance(configuration.report, configuration.format);

    // Verify allowed licenses: command behavior will be different whether "allow" is set or not
    if (isComplianceModeEnabled(configuration)) {
        // Running compliance checkup: identify non compliant packages
        const invalidPackages = onlyAllow(packages, configuration);
        if (invalidPackages.length > 0) {
            // If any non-compliant package is found, process the list and return with error code
            report.process(invalidPackages);
            return false;
        }

        // All packages are compliant: return with success code
        return true;
    }

    // Filter querying packages
    packages = queryPackages(packages, configuration);

    // Running license inspection: process the list & return with success code
    report.process(packages);
    return true;
}
