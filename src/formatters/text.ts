import chalk from "chalk";

import { Literals } from "../enumerations";
import { Formatter } from "./index";
import { Package } from "../interfaces";

export class Text implements Formatter {

    detail(packages: Array<Package>): void {
        console.info("Packages");
        this.formatPackages(packages);
        console.info("\nTotal packages:", packages.length);
    }

    summary(licenses: Array<{ name: string; count: number }>): void {
        let count = 0;
        console.info("Licenses");
        for (let i = 0; i < licenses.length; i++) {
            const license = licenses[i];
            count += license.count;
            console.info(`${i === licenses.length - 1 ?
                "└─" : "├─"} ${license.name === Literals.UNKNOWN ? chalk.red(license.name) : license.name}:`, license.count);
        }
        console.info("\nTotal packages:", count);
    }

    private formatPackages(packages: Array<Package>): void {
        for (let i = 0; i < packages.length; i++) {
            const pack = packages[i];
            console.info(`${i === packages.length - 1 ? "└─" : "├─"} ${chalk.blue(pack.name)}@${chalk.green(pack.version)}
${i === packages.length - 1 ? "   ├─" : "│  ├─"} Licenses: ${pack.license}
${i === packages.length - 1 ? "   ├─" : "│  ├─"} License file: ${pack.licenseFile ? pack.licenseFile : Literals.UNKNOWN}
${i === packages.length - 1 ? "   ├─" : "│  ├─"} Path: ${pack.path}
${i === packages.length - 1 ? "   └─" : "│  └─"} Repository: ${pack.repository}`);
        }
    }

}
