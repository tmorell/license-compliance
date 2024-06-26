// References:
// SPDX: https://spdx.org/sites/cpstandard/files/pages/files/using_spdx_license_list_short_identifiers.pdf
// NPM: https://docs.npmjs.com/files/package.json#license

import chalk from "chalk";
import Debug from "debug";
import path from "path";
import parse from "spdx-expression-parse";
import spdxSatisfies from "spdx-satisfies";

import { LicenseStatus, Literals } from "./enumerations";
import { Configuration, License, NpmPackage, OldLicenseFormat, Package } from "./interfaces";
import * as util from "./util";

const satisfies = (allowedLicenses: string, license: string): boolean => {
    try {
        return spdxSatisfies(allowedLicenses, license);
    } catch (error) {
        debug(`Failed to parse license identifier "${license}"`, error);
        return false;
    }
};

const debug = Debug("license-compliance:license");
const SEE_LICENSE_IN = "SEE LICENSE IN";
const LICENSE_FILE = "license";

/**
 * Gets the package's license based on the information provided in package.json.
 *
 * @export
 * @param {NpmPackage} pack
 * @returns {string}
 */
export async function getLicense(pack: NpmPackage, packPath: string): Promise<License> {
    const license = await extractLicense(pack, packPath);
    if (!isLicenseValid(license.name)) {
        license.name = Literals.UNKNOWN;
        license.status = LicenseStatus.unknown;
    }
    return license;
}

/**
 * Verifies if it is a valid SPDX license.
 *
 * @export
 * @param {string} license
 * @returns {boolean} true if valid; otherwise, false.
 */
export function isLicenseValid(license: string): boolean {
    if (license === Literals.CUSTOM) {
        // Not really a valid license, but no need to run it by SPDX
        return true;
    }
    if (license === Literals.UNKNOWN) {
        return false;
    }

    try {
        parse(license);
        return true;
    } catch {
        return false;
    }
}

/**
 * Verifies if all installed packages have allowed licenses.
 * It terminates process if not allowed licenses are installed.
 * Enforced if arg --allowed was provided.
 *
 * @export
 * @param {Array<Package>} packages
 * @returns {void}
 */
export function onlyAllow(packages: Array<Package>, configuration: Pick<Configuration, "allow">): Array<Package> {
    if (configuration.allow.length === 0) {
        return [];
    }

    const invalidPackages = new Array<Package>();
    const spdxLicense = argsToSpdxLicense(configuration.allow);
    const allowUnknown = configuration.allow.findIndex((value): boolean => value === Literals.UNKNOWN) >= 0;
    for (const pack of packages) {
        const matches =
            pack.license !== Literals.CUSTOM &&
            (satisfies(spdxLicense, pack.license) || (pack.license === Literals.UNKNOWN && allowUnknown));

        debug(
            chalk.blue(pack.name),
            "/",
            pack.license,
            "=>",
            matches ? chalk.green(spdxLicense) : chalk.red(spdxLicense),
        );
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
    return buffer.substring(0, buffer.length - 4) + ")";
}

async function extractLicense(pack: NpmPackage, packPath: string): Promise<License> {
    // Find possible location of license file
    const licensePath = await getLicensePath(packPath);

    // License as a single string entry
    if (typeof pack.license === "string") {
        if (pack.license.startsWith(SEE_LICENSE_IN)) {
            return {
                name: Literals.CUSTOM,
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

    if (pack.license?.type) {
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
            path: null,
            status: LicenseStatus.valid,
        };
    }

    // Could not determinate the license
    return {
        name: Literals.UNKNOWN,
        path: null,
        status: LicenseStatus.unknown,
    };
}

async function getCustomLicensePath(packPath: string, license: string): Promise<string | null> {
    const licPath = path.join(packPath, license.substring(SEE_LICENSE_IN.length).trim());
    if (await util.fileExists(licPath)) {
        return licPath;
    }
    return null;
}

function getLicenseFromArray(licenses: Array<OldLicenseFormat>): string {
    if (licenses.length === 0) {
        return Literals.UNKNOWN;
    }
    if (licenses.length === 1) {
        return licenses[0].type;
    }
    return argsToSpdxLicense(licenses.map((value): string => value.type.trim()));
}

async function getLicensePath(packPath: string): Promise<string | null> {
    const data = await util.readdir(packPath);
    for (const fileName of data) {
        if (fileName.toLowerCase().startsWith(LICENSE_FILE)) {
            return path.join(packPath, fileName);
        }
    }
    return null;
}
