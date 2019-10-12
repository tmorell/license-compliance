import { Formatter, Report, LicenseStatus } from "./enumerations";

export interface Arguments {
    allow: Array<string>;
    development: boolean;
    direct: number;
    exclude: Array<string | RegExp>;
    format: Formatter;
    production: boolean;
    report: Report;
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
    version?: string;
}

export interface OldLicenseFormat {
    type: string;
    url: string;
}

export interface Package {
    license: string;
    name: string;
    path?: string;
    version?: string;
}
