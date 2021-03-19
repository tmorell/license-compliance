import * as fs from "fs";
import * as util from "util";

import { NpmPackage } from "./interfaces";

export async function fileExists(filePath: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
        fs.access(filePath, fs.constants.F_OK, (error) => {
            error ? resolve(false) : resolve(true);
        });
    });
}

export async function readdir(path: string): Promise<Array<string>> {
    return await util.promisify(fs.readdir)(path, "utf8");
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
        return JSON.parse(data) as NpmPackage;
    }
    return undefined;
}

export function toPascal(value: string | undefined): string | undefined {
    if (!value || value.length < 2) {
        return value;
    }
    return value[0].toUpperCase() + value.substr(1);
}
