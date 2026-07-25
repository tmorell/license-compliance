import chalk from "chalk";
import Debug from "debug";

import { getConfiguration, isComplianceModeEnabled } from "./configuration.js";
import { excludePackages, queryPackages } from "./filters.js";
import { onlyAllow } from "./license.js";
import { getNodeModulesPath } from "./node-modules.js";
import { getInstalledPackages } from "./npm.js";
import { Factory as FactoryReport } from "./reports/index.js";

const debug = Debug("license-compliance:main");

export async function main(): Promise<boolean> {
    // Get node_modules path
    const nodeModulesPath = await getNodeModulesPath();
    if (!nodeModulesPath) {
        return false;
    }
    debug("Path", nodeModulesPath);

    // Get configuration
    const config = await getConfiguration(nodeModulesPath);
    debug("Configuration", config);
    if (!config) {
        return false;
    }

    // Get all installed packages
    let packages = await getInstalledPackages(config, nodeModulesPath);
    if (packages.length === 0) {
        return true;
    }
    debug("Packages", packages);

    // Filter out excluded packages
    packages = excludePackages(packages, config);

    const report = FactoryReport.getInstance(config.report, config.format);

    // Verify allowed licenses: command behavior will be different whether "allow" is set or not
    if (isComplianceModeEnabled(config)) {
        // Running compliance checkup: identify non compliant packages
        const invalidPackages = onlyAllow(packages, config);
        if (invalidPackages.length > 0) {
            // If any non-compliant package is found, process the list and return with error code
            console.error(chalk.red("Error:"), "Not compliant packages found");
            report.process(invalidPackages);
            return false;
        }

        // All packages are compliant: return with success code
        return true;
    }

    // Filter querying packages
    packages = queryPackages(packages, config);

    // Running license inspection: process the list & return with success code
    report.process(packages);
    return true;
}
