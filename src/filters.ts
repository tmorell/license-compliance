import { Configuration, Package } from "./interfaces";

export function excludePackages(packages: Array<Package>, configuration: Pick<Configuration, "exclude">): Array<Package> {
    const { exclude: excludeFilters } = configuration;

    if (excludeFilters.length === 0) {
        return packages;
    }

    const col = new Array<Package>();
    packages.forEach((pack) => {
        let exclude = false;
        for (const filter of excludeFilters) {
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

export function queryPackages(packages: Array<Package>, configuration: Pick<Configuration, "query">): Array<Package> {
    return packages.filter(value => configuration.query.includes(value.license));
}