import { Formatter } from "./index";
import { Package } from "../interfaces";

export class Json implements Formatter {
    public detail(packages: Array<Package>): void {
        console.log(JSON.stringify(packages, null, 2));
    }

    public invalid(packages: Array<Package>): void {
        console.log(JSON.stringify(packages, null, 2));
    }

    public summary(licenses: Array<{ name: string, count: number }>): void {
        console.log(JSON.stringify(licenses, null, 2));
    }
}
