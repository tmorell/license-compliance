import chalk from "chalk";
import { cosmiconfig } from "cosmiconfig";
import path from "path";
import joi from "joi";

import { Formatter, Report } from "./enumerations";
import { Configuration, ExtendableConfiguration } from "./interfaces";
import { processArgs } from "./program";
import { toPascal } from "./util";

const packageName = "license-compliance";

export async function getConfiguration(): Promise<Configuration | null> {

    let configExtended: Partial<Configuration> = {};
    let configInline: ExtendableConfiguration = {};

    // Get inline configuration
    const explorer = cosmiconfig(packageName);
    const configResult = await explorer.search();
    configInline = configResult?.config as ExtendableConfiguration;

    // Get extended configuration
    const extendsPath = configInline?.extends;
    if (extendsPath) {
        try {
            const c = await explorer.load(path.join("node_modules", extendsPath, "index.js"));
            configExtended = c?.config as Partial<Configuration> || {};
            delete configInline.extends;
        } catch (error: unknown) {
            console.info(chalk.red("Extended configuration error:"), error);
            return null;
        }
    }

    // Merge configurations: CLI > inline > extended
    const mergedConfiguration = Object.assign(configExtended, configInline as Partial<Configuration>, processArgs());
    const configuration = {
        allow: mergedConfiguration.allow || [],
        development: !!mergedConfiguration.development || false,
        direct: mergedConfiguration.direct || false,
        exclude: mergedConfiguration.exclude || [],
        format: toPascal(mergedConfiguration.format) as Formatter || Formatter.text,
        production: !!mergedConfiguration.production || false,
        report: toPascal(mergedConfiguration.report) as Report || Report.summary,
    };

    // Validate configuration
    const result = joi.object({
        allow: joi.array().items(joi.string()),
        development: joi.boolean(),
        direct: joi.boolean(),
        exclude: joi.array(),
        format: joi.string().valid(Formatter.csv, Formatter.json, Formatter.text, Formatter.xunit),
        production: joi.boolean(),
        report: joi.string().valid(Report.detailed, Report.summary),
    }).validate(configuration);
    if (result.error) {
        console.info(chalk.red("Configuration error:"), result.error.message);
        return null;
    }

    return configuration;
}
