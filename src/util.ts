import fs from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { NpmPackage } from "./interfaces.js";

export function isPathTraversalSafe(nodeModulesPath: string, filePath: string): [boolean, string] {
    const absoluteNodeModules = path.resolve(nodeModulesPath);
    const absoluteTargetPath = path.resolve(nodeModulesPath, filePath);
    const relativePath = path.relative(absoluteNodeModules, absoluteTargetPath);
    if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
        return [false, ""];
    }
    return [true, absoluteTargetPath];
}

export function fileExists(filePath: string): Promise<boolean> {
    return new Promise<boolean>((resolve): void => {
        fs.access(filePath, fs.constants.F_OK, (error): void => (error ? resolve(false) : resolve(true)));
    });
}

/**
 * Asynchronously reads the package.json contents.
 *
 * @param {string} packagePath Path for the package.json file.
 * @returns {Promise<NpmPackage>} Promise with an instance of the package.json
 */
export async function readPackageJson(packagePath: string): Promise<NpmPackage | null> {
    if (!(await fileExists(packagePath))) {
        return null;
    }
    const data = await readFile(packagePath, "utf8");
    if (data) {
        return JSON.parse(data);
    }
    return null;
}

export function toPascal(value: string): string {
    if (!value || value.length < 2) {
        return value || "";
    }
    return value[0].toUpperCase() + value.substring(1);
}
