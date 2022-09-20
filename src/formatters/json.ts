import { Formatter } from "./index";
import { Package } from "../interfaces";

export class Json implements Formatter {
    detail(packages: Array<Package>): void {
        console.info(JSON.stringify(packages, null, 2));
    }

    summary(licenses: Array<{ name: string; count: number }>): void {
        console.info(JSON.stringify(licenses, null, 2));
    }
}
