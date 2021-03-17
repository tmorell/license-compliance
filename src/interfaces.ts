import { Formatter, Report, LicenseStatus } from "./enumerations";

export interface Configuration {
    allow: Array<string>;
    development: boolean;
    direct: boolean;
    exclude: Array<string | RegExp>;
    format: Formatter;
    production: boolean;
    report: Report;
}

export interface ExtendableConfiguration extends Partial<Configuration> {
  extends?: string;
}

export interface License {
    name: string;
    path?: string;
    status: LicenseStatus;
}

export interface NpmPackage {
    dependencies?: Array<[string, string]>;
    devDependencies?: Array<[string, string]>;
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
    licenseFile?: string;
    name: string;
    path: string;
    repository: string;
    version: string;
}

export interface Repository {
    type: string;
    url: string;
}
