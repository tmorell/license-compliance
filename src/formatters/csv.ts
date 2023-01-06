import { EOL } from "os";

import { Literals } from "../enumerations";
import { Package } from "../interfaces";
import { Formatter } from "./formatter";

export class Csv implements Formatter {
    detail(packages: Array<Package>): void {
        let buffer = `"package name","version","license","license file","repository"${EOL}`;
        for (const pack of packages) {
            buffer += `"${pack.name}","${pack.version}","${pack.license}","${pack.licenseFile ? pack.licenseFile : Literals.UNKNOWN}","${pack.repository}"${EOL}`;
        }
        console.info(buffer);
    }

    summary(licenses: Array<{ name: string; count: number }>): void {
        let buffer = `"license","count"${EOL}`;
        for (const license of licenses) {
            buffer += `"${license.name}","${license.count}"${EOL}`;
        }
        console.info(buffer);
    }
}
