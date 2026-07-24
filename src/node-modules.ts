import chalk from "chalk";
import fs from "node:fs";
import { access } from "node:fs/promises";
import { EOL } from "node:os";
import path from "node:path";

/**
 * Get the relative node_modules path up the directory tree.
 *
 * @returns The node_modules relative path if found; otherwise, null.
 */
export async function getNodeModulesPath(workingDir = process.cwd()): Promise<string | null> {
    const NODE_MODULES = "node_modules";
    const segments = workingDir.split(path.sep);
    segments[0] = "/";
    for (let i = segments.length; i >= 1; i--) {
        const searchPath = path.join(...segments.slice(0, i), NODE_MODULES);
        try {
            // Accepted since it will bubble up to find the NODE_MODULES directory
            // eslint-disable-next-line no-await-in-loop
            await access(searchPath, fs.constants.R_OK);
            return searchPath;
        } catch {
            // Path does not exist, continue searching up directory tree
        }
    }
    console.error(
        chalk.red("Error:"),
        `'${NODE_MODULES}' could not be found up the directory tree '${workingDir}'${EOL}Please make sure that the packages are installed.`,
    );
    return null;
}
