import { Package } from "../interfaces";

export interface Formatter {
    detail(packages: Array<Package>): void;
    invalid(packages: Array<Package>): void;
    summary(licenses: Array<{ name: string, count: number }>): void;
}
