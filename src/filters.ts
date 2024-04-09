import { Configuration, Package } from "./interfaces";

export function excludePackages(
    packages: Array<Package>,
    configuration: Pick<Configuration, "exclude">,
): Array<Package> {
    const { exclude: excludeFilters } = configuration;
    if (excludeFilters.length === 0) {
        return packages;
    }

    return packages.filter((pack): boolean => {
        for (const filter of excludeFilters) {
            if (typeof filter === "string") {
                if (pack.name === filter) {
                    return false;
                }
            } else if (filter.test(pack.name)) {
                return false;
            }
        }
        return true;
    });
}

export function queryPackages(packages: Array<Package>, configuration: Pick<Configuration, "query">): Array<Package> {
    const { query: queryFilter } = configuration;
    if (queryFilter.length === 0) {
        return packages;
    }

    return packages.filter((value): boolean => queryFilter.includes(value.license));
}
