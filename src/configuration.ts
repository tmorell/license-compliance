import * as chalk from "chalk";
import { cosmiconfig } from "cosmiconfig";
import * as path from "path";

import { Formatter, Report } from "./enumerations";
import { Configuration, ExtendableConfiguration } from "./interfaces";
import { processArgs } from "./program";
import { toPascal } from "./util";

const packageName = "license-compliance";

export async function getConfiguration(): Promise<Configuration> {

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
        } catch (error) {
            console.log(chalk.red("Error:"), error);
            process.exit(1);
        }
    }

    // Merge configurations: CLI overrides extended, extended overrides inline
    const configuration = Object.assign(configExtended, configInline as Partial<Configuration>, processArgs());

    // Return default values for undefined keys
    return {
        allow: configuration.allow || [],
        development: !!configuration.development || false,
        direct: configuration.direct || false,
        exclude: configuration.exclude || [],
        production: !!configuration.production || false,
        format: toPascal(configuration.format) as Formatter || Formatter.text,
        report: toPascal(configuration.report) as Report || Report.summary
    };
}
