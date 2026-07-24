import chalk from "chalk";
import { cosmiconfig } from "cosmiconfig";
import joi from "joi";
import path from "node:path";

import { EOL } from "os";
import { Formatter, Report } from "./enumerations";
import { Configuration, ExtendableConfiguration } from "./interfaces";
import { processArgs } from "./program";
import { toPascal } from "./util";

const packageName = "license-compliance";

export async function getConfiguration(nodeModulesPath: string): Promise<Configuration | null> {
    let configExtended: Partial<Configuration> = {};

    // Get inline configuration
    const explorer = cosmiconfig(packageName, { searchStrategy: "global" });
    const configResult = await explorer.search();
    const configInline = <ExtendableConfiguration>configResult?.config;

    // Get extended configuration
    const extendsPath = configInline?.extends;
    if (extendsPath) {
        try {
            // Resolve absolute paths to eliminate relative segment tricks (e.g., /../)
            const absoluteNodeModules = path.resolve(nodeModulesPath);
            const absoluteTargetPath = path.resolve(absoluteNodeModules, extendsPath, "index.js");

            // Determine the path of the target relative to node_modules
            const relativePath = path.relative(absoluteNodeModules, absoluteTargetPath);

            // Block traversal if the relative path steps back ('..') or attempts to resolve to an absolute root
            if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
                console.error(
                    chalk.red("Error:"),
                    `Extended configuration path "${extendsPath}" resolves outside of node_modules.`,
                );
                return null;
            }

            const c = await explorer.load(absoluteTargetPath);
            configExtended = <Partial<Configuration>>c?.config || {};
            delete configInline.extends;
        } catch (error: unknown) {
            if (error instanceof Error && "code" in error && error.code === "ENOENT") {
                console.error(
                    chalk.red("Error:"),
                    `The extended configuration module '${extendsPath}' was not found.${EOL}Please make sure that the configuration package is installed.`,
                );
            } else {
                console.error(
                    chalk.red("Error:"),
                    `Could not load the extended configuration module '${extendsPath}'.`,
                );
            }
            return null;
        }
    }

    // Get args configuration
    let config: Configuration;
    try {
        config = processArgs();
    } catch {
        return null;
    }

    // Merge configurations: CLI > inline > extended
    const mergedConfiguration = Object.assign(configExtended, <Partial<Configuration>>configInline, config);
    const configuration = {
        allow: mergedConfiguration.allow || [],
        development: !!mergedConfiguration.development || false,
        direct: mergedConfiguration.direct || false,
        exclude: mergedConfiguration.exclude || [],
        format: <Formatter>toPascal(mergedConfiguration.format) || Formatter.text,
        production: !!mergedConfiguration.production || false,
        query: mergedConfiguration.query || [],
        report: <Report>toPascal(mergedConfiguration.report) || Report.summary,
    };

    // Validate configuration
    const result = joi
        .object({
            allow: joi.array().items(joi.string()),
            development: joi.boolean(),
            direct: joi.boolean(),
            exclude: joi.array(),
            format: joi.string().valid(Formatter.csv, Formatter.json, Formatter.text, Formatter.xunit),
            production: joi.boolean(),
            query: joi.array().items(joi.string()),
            report: joi.string().valid(Report.detailed, Report.summary),
        })
        .validate(configuration);
    if (result.error) {
        console.error(chalk.red("Configuration error:"), result.error.message);
        return null;
    }

    return configuration;
}

export function isComplianceModeEnabled(configuration: Pick<Configuration, "allow">): boolean {
    return Array.isArray(configuration.allow) && configuration.allow.length > 0;
}
