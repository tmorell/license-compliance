import fs from "fs";
import util from "util";

import { NpmPackage } from "./interfaces";

export function fileExists(filePath: string): Promise<boolean> {
    return new Promise<boolean>((resolve): void => {
        fs.access(filePath, fs.constants.F_OK, (error): void => error ? resolve(false) : resolve(true));
    });
}

export function readdir(path: string): Promise<Array<string>> {
    return util.promisify(fs.readdir)(path, "utf8");
}

/**
 * Asynchronously reads the package.json contents.
 *
 * @param {string} packagePath Path for the package.json file.
 * @returns {Promise<NpmPackage>} Promise with an instance of the package.json
 */
export async function readPackageJson(packagePath: string): Promise<NpmPackage | undefined> {
    if (!await fileExists(packagePath)) {
        return undefined;
    }
    const data = await util.promisify(fs.readFile)(packagePath, "utf8");
    if (data) {
        return JSON.parse(data);
    }
    return undefined;
}

export function toPascal(value: string | undefined): string | undefined {
    if (!value || value.length < 2) {
        return value;
    }
    return value[0].toUpperCase() + value.substring(1);
}
