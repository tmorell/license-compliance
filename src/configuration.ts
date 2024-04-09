import chalk from "chalk";
import { cosmiconfig } from "cosmiconfig";
import joi from "joi";
import path from "path";

import { Formatter, Report } from "./enumerations";
import { Configuration, ExtendableConfiguration } from "./interfaces";
import { processArgs } from "./program";
import { toPascal } from "./util";

const packageName = "license-compliance";

export async function getConfiguration(nodeModulesPath: string): Promise<Configuration | null> {
    let configExtended: Partial<Configuration> = {};
    let configInline: ExtendableConfiguration = {};

    // Get inline configuration
    const explorer = cosmiconfig(packageName, { searchStrategy: "global" });
    const configResult = await explorer.search();
    configInline = <ExtendableConfiguration>configResult?.config;

    // Get extended configuration
    const extendsPath = configInline?.extends;
    if (extendsPath) {
        try {
            const c = await explorer.load(path.join(nodeModulesPath, extendsPath, "index.js"));
            configExtended = <Partial<Configuration>>c?.config || {};
            delete configInline.extends;
        } catch (error: unknown) {
            console.error(chalk.red("Extended configuration error:"), error);
            return null;
        }
    }

    // Merge configurations: CLI > inline > extended
    const mergedConfiguration = Object.assign(configExtended, <Partial<Configuration>>configInline, processArgs());
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
