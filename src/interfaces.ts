import { Formatter, LicenseStatus, Report } from "./enumerations";

export type PackageFilter = (pkg: Package) => boolean;

export interface RawConfiguration {
    allow: Array<string>;
    development: boolean;
    direct: boolean;
    exclude: PackageFilter | Array<string | RegExp>;
    format: Formatter;
    production: boolean;
    query: Array<string>;
    report: Report;
}

export interface Configuration {
    allow: Array<string>;
    development: boolean;
    direct: boolean;
    exclude?: PackageFilter;
    format: Formatter;
    production: boolean;
    query: Array<string>;
    report: Report;
}

export interface ExtendableConfiguration extends Partial<RawConfiguration> {
    extends?: string;
}

export interface License {
    name: string;
    path: string | null;
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
