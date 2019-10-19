import chalk from "chalk";
import * as Debug from "debug";
import * as path from "path";

import { Package } from "./interfaces";
import { getLicense } from "./license";
import { args } from "./program";
import { getRepository } from "./repository";
import * as util from "./util";

const debug = Debug("license-compliance:npm");
const PACKAGE_JSON = "package.json";
const NODE_MODULES = "node_modules";

let rootNodeModulesPath: string;
let packages: Array<Package>;

/**
 * Gets an array of all installed packages, regardless of license being valid.
 *
 * @export
 * @returns {Promise<Array<Package>>}
 */
export async function getInstalledPackages(rootPath = ""): Promise<Array<Package>> {
    packages = new Array<Package>();

    // Paths
    rootNodeModulesPath = path.join(rootPath, NODE_MODULES);
    const packPath = path.join(rootPath, PACKAGE_JSON);

    const pack = await util.readPackageJson(packPath);
    if (!pack) {
        return new Array<Package>();
    }

    if (pack.dependencies && !args.development) {
        debug("Analyzing production dependencies at", rootNodeModulesPath);
        await readPackages(pack.name, pack.dependencies, 0, rootNodeModulesPath);
    }
    if (pack.devDependencies && !args.production) {
        debug("Analyzing development dependencies at", rootNodeModulesPath);
        await readPackages(pack.name, pack.devDependencies, 0, rootNodeModulesPath);
    }

    return packages;
}

/**
 * Verifies if the package was analyzed.
 * A combination of name and version is used; different versions of the same package might have different licenses.
 *
 * @param {Package} pack Package to verify.
 * @returns {boolean} true if it was analyzed; otherwise, false.
 */
function alreadyAnalyzed(pack: Package): boolean {
    return packages.find((value) => value.name === pack.name && value.version === pack.version) !== undefined;
}

/**
 * Asynchronously gets the package's location.
 * First, it verifies if there is a specific package version installed within the parent's node_module folder.
 * If not found, then it verifies if the package is installed in the root node_modules folder.
 *
 * @param {string} parentName Name of the parent package. Required to analyze packages with sub-folders.
 * @param {string} packageName Name of the package.
 * @param {(string | undefined)} parentNodeModulesPath Path of the parent package.
 * @returns {(Promise<string | undefined>)} Promise with the path where the package was found; undefined if not found.
 */
async function getInstalledPath(parentName: string, packageName: string, parentNodeModulesPath: string): Promise<string | undefined> {
    // Verify if present in parent's node_modules
    let packagePath = path.join(parentNodeModulesPath, packageName);
    if (await util.fileExists(packagePath)) {
        return packagePath;
    }

    // Verify if present in sibling node_modules
    const pathComposite = [parentNodeModulesPath, "..", ".."];
    for (let i = 0; i < parentName.split("/").length - 1; i++) {
        pathComposite.push("..");
    }
    pathComposite.push(packageName);
    packagePath = path.join(...pathComposite);
    if (await util.fileExists(packagePath)) {
        return packagePath;
    }

    // Verify if present in root node_module
    packagePath = path.join(rootNodeModulesPath, packageName);
    if (await util.fileExists(packagePath)) {
        return packagePath;
    }

    return undefined;
}

/**
 * Asynchronously reads recursively all dependencies.
 * If arg --direct was provided, it only reads direct installed packages
 *
 * @param {Array<[string, string]>} dependencies Dependencies (package names) to read.
 * @param {number} depth Depth counter; root level is zero.
 * @param {string} parentNodeModulesPath Parent package's node_module path.
 * @returns {Promise<void>}
 */
async function readPackages(parentName: string, dependencies: Array<[string, string]>, depth: number, parentNodeModulesPath: string): Promise<void> {
    if (depth > 0 && args.direct) {
        return;
    }

    for (const dependency of Object.keys(dependencies)) {
        const packagePath = await getInstalledPath(parentName, dependency, parentNodeModulesPath);
        if (packagePath === undefined) {
            console.error(chalk.red(`Package "${dependency}" was not found. Confirm that all modules are installed.`));
            continue;
        }
        const file = await util.readPackageJson(path.join(packagePath, PACKAGE_JSON));
        if (!file) {
            console.error(chalk.red(`Package "${dependency}" is empty and cannot be analyzed.`));
            continue;
        }
        const pack: Package = {
            name: dependency,
            path: packagePath,
            license: (await getLicense(file, packagePath)).name,
            version: file.version,
            repository: getRepository(file.repository)
        };
        if (alreadyAnalyzed(pack)) {
            continue;
        }

        packages.push(pack);

        if (file.dependencies) {
            await readPackages(dependency, file.dependencies, ++depth, path.join(packagePath, NODE_MODULES));
        }
    }
}
