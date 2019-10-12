// References:
// SPDX: https://spdx.org/sites/cpstandard/files/pages/files/using_spdx_license_list_short_identifiers.pdf
// NPM: https://docs.npmjs.com/files/package.json#license

import chalk from "chalk";
import * as Debug from "debug";
import * as path from "path";

import { Report, LicenseStatus } from "./enumerations";
import { NpmPackage, OldLicenseFormat, Package, License } from "./interfaces";
import { args } from "./program";
import { Factory as FactoryReport } from "./reports";
import * as util from "./util";

const debug = Debug("license-compliance:license");
const parse = require("spdx-expression-parse");
const satisfies = require("spdx-satisfies");
const SEE_LICENSE_IN = "SEE LICENSE IN";

export const UNKNOWN = "UNKNOWN";
export const CUSTOM = "CUSTOM";

/**
 * Verifies if all installed packages have allowed licenses.
 * It terminates process if not allowed licenses are installed.
 * Enforced if arg --allowed was provided.
 *
 * @export
 * @param {Array<Package>} packages
 * @returns {void}
 */
export function onlyAllow(packages: Array<Package>): void {
    if (!args.allow) {
        return;
    }

    const invalid = areLicensesAllowed(packages, args.allow);
    if (invalid.length === 0) {
        return;
    }

    FactoryReport.getInstance(Report.invalid).process(invalid);
    process.exit(1);
}

/**
 * Verifies if it is a valid SPDX license.
 *
 * @export
 * @param {string} license
 * @returns {boolean} true if valid; otherwise, false.
 */
export function isLicenseValid(license: string): boolean {
    if (license === UNKNOWN || license === CUSTOM) {
        // Not really a valid license, but no need to run it by SPDX
        return true;
    }
    try {
        // tslint:disable-next-line: no-unsafe-any
        parse(license);
        return true;
    } catch {
        return false;
    }
}

/**
 * Gets the package's license based on the information provided in package.json.
 *
 * @export
 * @param {NpmPackage} pack
 * @returns {string}
 */
export async function getLicense(pack: NpmPackage, packPath: string): Promise<License> {
    // TODO: Implement license properties
    const license = await extractLicense(pack, packPath);
    if (!isLicenseValid(license.name)) {
        license.name = UNKNOWN;
        license.status = LicenseStatus.unknown;
    }
    return license;
}

// TODO: Must not be exported once unit testing gets fixed.
export function areLicensesAllowed(packages: Array<Package>, licenses: Array<string>): Array<Package> {
    const invalidPackages = new Array<Package>();
    const spdxLicense = argsToSpdxLicense(licenses);
    for (const pack of packages) {
        // tslint:disable-next-line: no-unsafe-any
        const matches = pack.license !== UNKNOWN && satisfies(spdxLicense, pack.license);
        debug(chalk.blue(pack.name), "/", pack.license, "=>", matches ? chalk.green(spdxLicense) : chalk.red(spdxLicense));
        if (!matches) {
            invalidPackages.push(pack);
        }
    }
    return invalidPackages;
}

function argsToSpdxLicense(licenses: Array<string>): string {
    if (licenses.length === 1) {
        return licenses[0];
    }
    let buffer = "(";
    for (const license of licenses) {
        buffer += license + " OR ";
    }
    buffer = buffer.substr(0, buffer.length - 4) + ")";
    return buffer;
}

async function extractLicense(pack: NpmPackage, packPath: string): Promise<License> {
    // Find possible location of license file
    const licensePath = await getLicencePath(packPath);

    // License as a single string entry
    if (typeof pack.license === "string") {
        if (pack.license.startsWith(SEE_LICENSE_IN)) {
            return {
                name: CUSTOM,
                path: await getCustomLicensePath(packPath, pack.license),
                status: LicenseStatus.custom,
            };
        }
        return {
            name: pack.license,
            path: licensePath,
            status: LicenseStatus.valid,
        };
    }

    if (pack.license && pack.license.type) {
        return {
            name: pack.license.type,
            path: licensePath,
            status: LicenseStatus.valid,
        };
    }

    // licenses as an array
    if (Array.isArray(pack.licenses)) {
        return {
            name: getLicenseFromArray(pack.licenses),
            path: undefined,
            status: LicenseStatus.valid
        };
    }

    // Could not determinate the license
    return {
        name: UNKNOWN,
        path: undefined,
        status: LicenseStatus.unknown
    };
}

async function getCustomLicensePath(packPath: string, license: string): Promise<string | undefined> {
    const licPath = path.join(packPath, license.substring(SEE_LICENSE_IN.length).trim());
    if (util.fileExists(licPath)) {
        return licPath;
    }
    return undefined;
}

function getLicenseFromArray(licenses: Array<OldLicenseFormat>): string {
    if (licenses.length === 0) {
        return UNKNOWN;
    }
    if (licenses.length === 1) {
        return licenses[0].type;
    }
    return argsToSpdxLicense(licenses.map((value) => value.type.trim()));
}

async function getLicencePath(packPath: string): Promise<string | undefined> {
    const data = await util.readdir(packPath);
    for (const fileName of data) {
        if (fileName.toLowerCase().startsWith("license")) {
            return path.join(packPath, fileName);
        }
    }
    return undefined;
}
