import chalk from "chalk";
import fs from "fs";
import { EOL } from "node:os";
import path from "path";

/**
 * Get the relative node_modules path up the directory tree.
 *
 * @returns The node_modules relative path if found; otherwise, null.
 */
export function getNodeModulesPath(): string | null {
    const NODE_MODULES = "node_modules";
    let nodeModulesPath = NODE_MODULES;
    for (let i = 0; i < process.cwd().split(path.sep).length - 1; i++) {
        if (fs.existsSync(nodeModulesPath)) {
            return nodeModulesPath;
        }
        nodeModulesPath = path.join("..", nodeModulesPath);
    }
    console.error(
        chalk.red(
            `'${NODE_MODULES}' could not be found up the directory tree '${process.cwd()}'${EOL}Please make sure that the packages are installed.`,
        ),
    );
    return null;
}
