import { Format, LicenseStatus, Report } from "./enumerations.js";

export interface Configuration {
    allow: Array<string>;
    development: boolean;
    direct: boolean;
    exclude: Array<string | RegExp>;
    format: Format;
    production: boolean;
    query: Array<string>;
    report: Report;
    showConfig: boolean;
}

export interface ExtendableConfiguration extends Partial<Configuration> {
    extends?: string;
}

export interface License {
    name: string;
    path: string | null;
    status: LicenseStatus;
}

export interface NpmPackage {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    license: string | OldLicenseFormat;
    licenses: Array<OldLicenseFormat>;
    name: string;
    repository?: Repository;
    version: string;
}

export interface OldLicenseFormat {
    type: string;
    url: string;
}

export interface Package {
    license: string;
    licenseFile?: string | null;
    name: string;
    path: string;
    repository: string;
    version: string;
}

export interface Repository {
    type: string;
    url: string;
}
