import chalk from "chalk";
import { EOL } from "os";

import { Literals } from "../enumerations";
import { Package } from "../interfaces";
import { Formatter } from "./formatter";

export class Text implements Formatter {
    detail(packages: Array<Package>): void {
        const length = packages.length - 1;
        let buffer = "Packages" + EOL;
        for (let i = 0; i <= length; i++) {
            const pack = packages[i];
            buffer += `${i === length ? "└─" : "├─"} ${chalk.blue(pack.name)}@${chalk.green(pack.version)}${EOL}`;
            buffer += `${i === length ? "   ├─" : "│  ├─"} Licenses: ${pack.license}${EOL}`;
            buffer += `${i === length ? "   ├─" : "│  ├─"} License file: ${pack.licenseFile ? pack.licenseFile : Literals.UNKNOWN}${EOL}`;
            buffer += `${i === length ? "   ├─" : "│  ├─"} Path: ${pack.path}${EOL}`;
            buffer += `${i === length ? "   └─" : "│  └─"} Repository: ${pack.repository}${EOL}`;
        }
        console.info(buffer);
    }

    summary(licenses: Array<{ name: string; count: number }>): void {
        const length = licenses.length - 1;
        let buffer = "Licenses" + EOL;
        for (let i = 0; i <= length; i++) {
            const license = licenses[i];
            buffer += `${i === length ? "└─" : "├─"} ${license.name === Literals.UNKNOWN ? chalk.red(license.name) : license.name}: ${license.count}${EOL}`;
        }
        console.info(buffer);
    }
}
