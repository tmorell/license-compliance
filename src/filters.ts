import { args } from "./program";
import { Package } from "./interfaces";

export function excludePackages(packages: Array<Package>): Array<Package> {
    if (!args.exclude) {
        return packages;
    }

    const col = new Array<Package>();
    packages.forEach((pack) => {
        let exclude = false;
        for (const filter of args.exclude) {
            if (typeof filter === "string") {
                if (pack.name === filter) {
                    exclude = true;
                    break;
                }
            } else if (filter.test(pack.name)) {
                exclude = true;
                break;
            }
        }

        if (!exclude) {
            col.push(pack);
        }
    });

    return col;
}
