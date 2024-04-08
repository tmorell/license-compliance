import chalk from "chalk";
import Debug from "debug";
import path from "path";

import { Configuration, Package } from "./interfaces";
import { getLicense } from "./license";
import { getRepository } from "./repository";
import * as util from "./util";

const debug = Debug("license-compliance:npm");
const PACKAGE_JSON = "package.json";
const NODE_MODULES = "node_modules";

/**
 * Gets an array of all installed packages, regardless of license being valid.
 *
 * @export
 * @returns {Promise<Array<Package>>}
 */
export async function getInstalledPackages(
    configuration: Pick<Configuration, "direct" | "development" | "production">,
    nodeModulesPath: string,
): Promise<Array<Package>> {
    const packages: Array<Package> = new Array<Package>();
    const pack = await util.readPackageJson(PACKAGE_JSON);
    if (!pack) {
        return new Array<Package>();
    }

    if (pack.dependencies && !configuration.development) {
        debug("Analyzing production dependencies at", nodeModulesPath);
        await readPackages(pack.name, pack.dependencies, 0, nodeModulesPath, configuration, nodeModulesPath, packages);
    }
    if (pack.devDependencies && !configuration.production) {
        debug("Analyzing development dependencies at", nodeModulesPath);
        await readPackages(
            pack.name,
            pack.devDependencies,
            0,
            nodeModulesPath,
            configuration,
            nodeModulesPath,
            packages,
        );
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
function alreadyAnalyzed(packages: Array<Package>, pack: Package): boolean {
    return packages.find((value): boolean => value.name === pack.name && value.version === pack.version) !== undefined;
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
async function getInstalledPath(
    parentName: string,
    packageName: string,
    parentNodeModulesPath: string,
    rootNodeModulesPath: string,
): Promise<string | undefined> {
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
async function readPackages(
    parentName: string,
    dependencies: Array<[string, string]>,
    depth: number,
    parentNodeModulesPath: string,
    configuration: Pick<Configuration, "direct">,
    rootNodeModulesPath: string,
    packages: Array<Package>,
): Promise<void> {
    if (depth > 0 && configuration.direct) {
        return;
    }

    const getPackagePromises = new Array<Promise<void>>();
    for (const dependency of Object.keys(dependencies)) {
        getPackagePromises.push(
            getPackage(
                parentName,
                dependency,
                parentNodeModulesPath,
                configuration,
                depth,
                rootNodeModulesPath,
                packages,
            ),
        );
    }
    await Promise.all(getPackagePromises);
}

async function getPackage(
    parentName: string,
    dependency: string,
    parentNodeModulesPath: string,
    configuration: Pick<Configuration, "direct">,
    depth: number,
    rootNodeModulesPath: string,
    packages: Array<Package>,
): Promise<void> {
    const packagePath = await getInstalledPath(parentName, dependency, parentNodeModulesPath, rootNodeModulesPath);
    if (packagePath === undefined) {
        console.error(chalk.red(`Package "${dependency}" was not found. Confirm that all modules are installed.`));
        return;
    }
    const file = await util.readPackageJson(path.join(packagePath, PACKAGE_JSON));
    if (!file) {
        console.error(chalk.red(`Package "${dependency}" is empty and cannot be analyzed.`));
        return;
    }
    const license = await getLicense(file, packagePath);
    const pack: Package = {
        license: license.name,
        licenseFile: license.path,
        name: dependency,
        path: packagePath,
        repository: getRepository(file.repository),
        version: file.version,
    };
    if (alreadyAnalyzed(packages, pack)) {
        return;
    }

    packages.push(pack);

    if (file.dependencies) {
        await readPackages(
            dependency,
            file.dependencies,
            depth + 1,
            path.join(packagePath, NODE_MODULES),
            configuration,
            rootNodeModulesPath,
            packages,
        );
    }
}
