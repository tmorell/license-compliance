import { getConfiguration } from "./configuration";
import { Report } from "./enumerations";
import { excludePackages } from "./filters";
import { onlyAllow } from "./license";
import { getInstalledPackages } from "./npm";
import { Factory as FactoryReport } from "./reports";

export async function main(): Promise<boolean> {
    // Get configuration
    const configuration = await getConfiguration();
    console.log("configuration", configuration);

    // Get all installed packages
    let packages = await getInstalledPackages("", configuration);
    if (packages.length === 0) {
        return false;
    }

    // Filter packages
    packages = excludePackages(packages, configuration);

    // Verify allowed licenses
    const invalidPackages = onlyAllow(packages, configuration);
    if (invalidPackages.length > 0) {
        FactoryReport.getInstance(Report.invalid, configuration.format).process(invalidPackages);
        return false;
    }

    // Requested report
    FactoryReport.getInstance(configuration.report, configuration.format).process(packages);
    return true;
}
