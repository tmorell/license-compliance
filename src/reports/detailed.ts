import { Formatter } from "../formatters/index.js";
import { Package } from "../interfaces.js";
import { Reporter } from "./reporter.js";

export class Detailed implements Reporter {
    private sorted!: Array<Package>;

    constructor(private readonly formatter: Formatter) {}

    process(packages: Array<Package>): void {
        this.sorted = packages.toSorted((a, b): number => a.name.localeCompare(b.name));
        this.formatter.detail(this.sorted);
    }

    get packages(): Array<Package> {
        return this.sorted;
    }
}
