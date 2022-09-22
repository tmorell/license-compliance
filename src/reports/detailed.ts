import { Reporter } from "./reporter";
import { Formatter } from "../formatters";
import { Package } from "../interfaces";

export class Detailed implements Reporter {
    private sorted!: Array<Package>;

    constructor(
        private readonly formatter: Formatter,
    ) { }

    process(packages: Array<Package>): void {
        this.sorted = packages;
        this.sorted.sort((a, b): number => {
            return a.name > b.name ? 1 : -1;
        });

        this.formatter.detail(packages);
    }

    get packages(): Array<Package> {
        return this.sorted;
    }
}
