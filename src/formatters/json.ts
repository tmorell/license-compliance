import { Formatter } from "./index";
import { Package } from "../interfaces";

export class Json implements Formatter {

    // TODO: Direct console log truncates output

    public summary(licenses: Array<{ name: string, count: number }>): void {
        console.log(licenses);
    }

    public detail(packages: Array<Package>): void {
        console.log(packages);
    }

    public invalid(packages: Array<Package>): void {
        console.log(packages);
    }
}
