import chalk from "chalk";

import { Literals } from "../enumerations";
import { Formatter } from "./index";
import { Package } from "../interfaces";

export class Text implements Formatter {

    public detail(packages: Array<Package>): void {
        console.log("Packages");
        this.formatPackages(packages);
        console.log("\nTotal packages:", packages.length);
    }

    public invalid(packages: Array<Package>): void {
        console.log(`${chalk.red("Error:")} The following ${packages.length === 1 ? "package does" : "packages do"} not meet the allowed license criteria`);
        this.formatPackages(packages);
    }

    public summary(licenses: Array<{ name: string, count: number }>): void {
        let count = 0;
        console.log("Licenses");
        for (let i = 0; i < licenses.length; i++) {
            const license = licenses[i];
            count += license.count;
            console.log(`${i === licenses.length - 1 ?
                "└─" : "├─"} ${license.name === Literals.UNKNOWN ? chalk.red(license.name) : license.name}:`, license.count);
        }
        console.log("\nTotal packages:", count);
    }

    private formatPackages(packages: Array<Package>): void {
        for (let i = 0; i < packages.length; i++) {
            const pack = packages[i];
            console.log(`${i === packages.length - 1 ? "└─" : "├─"} ${chalk.blue(pack.name)}@${chalk.green(pack.version)}
${i === packages.length - 1 ? "   ├─" : "│  ├─"} Licenses: ${pack.license}
${i === packages.length - 1 ? "   ├─" : "│  ├─"} Path: ${pack.path}
${i === packages.length - 1 ? "   └─" : "│  └─"} Repository: ${pack.repository}`);
        }
    }
}
