import chalk from "chalk";
import fs from "fs";
import { EOL } from "node:os";
import path from "path";

/**
 * Get the relative node_modules path up the directory tree.
 *
 * @returns The node_modules relative path if found; otherwise, null.
 */
export function getNodeModulesPath(workingDir = process.cwd()): string | null {
    const NODE_MODULES = "node_modules";
    const segments = workingDir.split(path.sep);
    segments[0] = "/";
    for (let i = segments.length; i >= 1; i--) {
        const searchPath = path.join(...segments.slice(0, i), NODE_MODULES);
        if (fs.existsSync(searchPath)) {
            return searchPath;
        }
    }
    console.error(
        chalk.red(
            `'${NODE_MODULES}' could not be found up the directory tree '${workingDir}'${EOL}Please make sure that the packages are installed.`,
        ),
    );
    return null;
}
