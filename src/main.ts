import { Report } from "./enumerations";
import { excludePackages } from "./filters";
import { onlyAllow } from "./license";
import { getInstalledPackages } from "./npm";
import { processArgs } from "./program";
import { Factory as FactoryReport } from "./reports";

export async function main(): Promise<boolean> {
    // Process arguments
    if (!processArgs()) {
        return false;
    }

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
