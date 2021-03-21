import { Formatter } from "./index";
import { Package } from "../interfaces";
import { Literals } from "../enumerations";

export class Csv implements Formatter {

    detail(packages: Array<Package>): void {
        this.formatPackages(packages);
    }

    invalid(packages: Array<Package>): void {
        this.formatPackages(packages);
    }

    summary(licenses: Array<{ name: string; count: number }>): void {
        console.info(`"license","count"`);
        for (const license of licenses) {
            console.info(`"${license.name}","${license.count}"`);
        }
    }

    private formatPackages(packages: Array<Package>): void {
        console.info(`"package name","version","license","license file","repository"`);
        for (const pack of packages) {
            console.info(`"${pack.name}","${pack.version}","${pack.license}","${pack.licenseFile ? pack.licenseFile : Literals.UNKNOWN}","${pack.repository}"`);
        }
    }

}
