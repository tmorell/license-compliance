import { Package } from "../interfaces";

export interface Reporter {
    process(packages: Array<Package>): void;
}
