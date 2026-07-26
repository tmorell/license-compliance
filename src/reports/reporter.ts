import { Package } from "../interfaces.js";

export interface Reporter {
    process(packages: Array<Package>): void;
}
