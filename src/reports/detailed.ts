import { Reporter } from "./reporter";
import { Formatter } from "../formatters";
import { Package } from "../interfaces";

export class Detailed implements Reporter {

    constructor(
        private readonly formatter: Formatter
    ) { }

    public process(packages: Array<Package>): void {
        packages.sort((a, b) => {
            return a.name > b.name ? 1 : -1;
        });

        this.formatter.detail(packages);
    }

}
