import { Package } from "../interfaces";

export abstract class Reporter {

    protected hasInvalidPackages = false;

    abstract process(packages: Array<Package>): void;

    withInvalidPackages(): Reporter {
        this.hasInvalidPackages = true;
        return this;
    }

}
