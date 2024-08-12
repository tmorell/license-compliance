import { Configuration, Package, PackageFilter } from "./interfaces";

export function excludePackages(
    packages: Array<Package>,
    configuration: Pick<Configuration, "exclude">,
): Array<Package> {
    const { exclude: excludeFilter } = configuration;
    return excludeFilter ? packages.filter((pkg): boolean => !excludeFilter(pkg)) : packages;
}

export function parseExclude(exclude: Array<string | RegExp>): PackageFilter {
    return (pack: Package): boolean =>
        exclude.some((filter): boolean => {
            return typeof filter === "string" ? pack.name === filter : filter.test(pack.name);
        });
}

export function queryPackages(packages: Array<Package>, configuration: Pick<Configuration, "query">): Array<Package> {
    const { query: queryFilter } = configuration;
    if (queryFilter.length === 0) {
        return packages;
    }

    return packages.filter((value): boolean => queryFilter.includes(value.license));
}
