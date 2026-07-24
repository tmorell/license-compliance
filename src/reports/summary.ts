import { Formatter } from "../formatters";
import { Package } from "../interfaces";
import { Reporter } from "./reporter";

export class Summary implements Reporter {
    private licenses = new Array<{ name: string; count: number }>();

    constructor(private readonly formatter: Formatter) {}

    process(packages: Array<Package>): void {
        const lic = new Map<string, number>();
        for (const pack of packages) {
            lic.set(pack.license, (lic.get(pack.license) || 0) + 1);
        }

        this.licenses = Array.from(lic, ([name, count]): { name: string; count: number } => ({
            name,
            count,
        })).sort((a, b): number => a.name.localeCompare(b.name));

        this.formatter.summary(this.licenses);
    }

    get summary(): Array<{ name: string; count: number }> {
        return this.licenses;
    }
}
