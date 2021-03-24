import chalk from "chalk";

import { Reporter } from "./reporter";
import { Formatter } from "../formatters";
import { Package } from "../interfaces";

export class Detailed extends Reporter {

    private sorted!: Array<Package>;

    constructor(
        private readonly formatter: Formatter,
    ) {
        super();
    }

    process(packages: Array<Package>): void {
        this.sorted = packages;
        this.sorted.sort((a, b) => {
            return a.name > b.name ? 1 : -1;
        });

        if (this.hasInvalidPackages) {
            console.info(`${chalk.red("Error:")} The following ${this.packages.length === 1 ? "package does" : "packages do"} not meet the allowed license criteria`);
        }
        this.formatter.detail(packages);
    }

    get packages(): Array<Package> {
        return this.sorted;
    }
}
