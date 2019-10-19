import { Formatter } from "./index";
import { Package } from "../interfaces";
import { Literals } from "../enumerations";

export class Csv implements Formatter {

    public detail(packages: Array<Package>): void {
        this.formatPackages(packages);
    }

    public invalid(packages: Array<Package>): void {
        this.formatPackages(packages);
    }

    public summary(licenses: Array<{ name: string, count: number }>): void {
        console.log(`"license","count"`);
        for (const license of licenses) {
            console.log(`"${license.name}","${license.count}"`);
        }
    }

    private formatPackages(packages: Array<Package>): void {
        console.log(`"package name","version","license","license file","repository"`);
        for (const pack of packages) {
            console.log(`"${pack.name}","${pack.version}","${pack.license}","${pack.licenseFile ? pack.licenseFile : Literals.UNKNOWN }","${pack.repository}"`);
        }
    }

}
