import { getConfiguration } from "./configuration";
import { Report } from "./enumerations";
import { excludePackages } from "./filters";
import { Configuration } from "./interfaces";
import { onlyAllow } from "./license";
import { getInstalledPackages } from "./npm";
import { Factory as FactoryReport } from "./reports";

let configuration: Configuration;
export { configuration };

export async function main(): Promise<boolean> {
    // Get configuration
    const config = await getConfiguration();
    if (!config) {
        return false;
    }
    configuration = config;

    // Get all installed packages
    let packages = await getInstalledPackages();
    if (packages.length === 0) {
        return false;
    }

    // Filter packages
    packages = excludePackages(packages);

    // Verify allowed licenses
    const invalidPackages = onlyAllow(packages);
    if (invalidPackages.length > 0) {
        FactoryReport.getInstance(Report.invalid).process(invalidPackages);
        return false;
    }

    // Requested report
    FactoryReport.getInstance().process(packages);
    return true;
}
