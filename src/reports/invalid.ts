import { Reporter } from "./reporter";
import { Formatter } from "../formatters";
import { Package } from "../interfaces";

export class Invalid implements Reporter {

    constructor(
        private readonly formatter: Formatter
    ) { }

    process(packages: Array<Package>): void {
        this.formatter.invalid(packages);
    }

}
