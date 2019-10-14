import { Report } from "./enumerations";
import { excludePackages } from "./filters";
import { onlyAllow } from "./license";
import { getInstalledPackages } from "./npm";
import { processArgs } from "./program";
import { Factory as FactoryReport } from "./reports";

export async function main(): Promise<void> {
    // Process arguments
    if (!processArgs()) {
        process.exit(1);
        return;
    }

    // Get all installed packages
    let packages = await getInstalledPackages();
    if (packages.length === 0) {
        process.exit(1);
        return;
    }

    // Filter packages
    packages = excludePackages(packages);

    // Verify allowed licenses
    const invalidPackages = onlyAllow(packages);
    if (invalidPackages.length > 0) {
        FactoryReport.getInstance(Report.invalid).process(invalidPackages);
        process.exit(1);
        return;
    }

    // Requested report
    FactoryReport.getInstance().process(packages);
    process.exit(0);
}
