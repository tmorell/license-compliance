import { Formatter } from "../formatters";
import { Package } from "../interfaces";
import { Reporter } from "./reporter";

export class Summary implements Reporter {
    private readonly licenses = new Array<{ name: string; count: number }>();

    constructor(private readonly formatter: Formatter) {}

    process(packages: Array<Package>): void {
        for (const pack of packages) {
            this.increase(pack.license);
        }
        this.licenses.sort((a, b): number => {
            return b.count - a.count;
        });

        this.formatter.summary(this.licenses);
    }

    get summary(): Array<{ name: string; count: number }> {
        return this.licenses;
    }

    private increase(name: string): void {
        for (const license of this.licenses) {
            if (license.name === name) {
                license.count += 1;
                return;
            }
        }
        this.licenses.push({
            name,
            count: 1,
        });
    }
}
