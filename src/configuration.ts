import { cosmiconfig } from "cosmiconfig";
import { Formatter, Report } from "./enumerations";

import { Configuration, ExtendableConfiguration } from "./interfaces";
import { processArgs } from "./program";

const packageName = "license-compliance";

export async function getConfiguration(): Promise<Configuration> {

    let configExtended: Partial<Configuration> = {};
    let configInline: ExtendableConfiguration = {};
    let configCommand: Partial<Configuration> = {};

    // Get inline configuration
    const explorer = cosmiconfig(packageName);
    const configResult = await explorer.search();
    configInline = configResult?.config as ExtendableConfiguration;

    // Get extended configuration
    const extendsPath = configInline?.extends;
    if (extendsPath) {
        const c = await explorer.load(`node_modules/${extendsPath}/index.js`);
        configExtended = c?.config as Partial<Configuration>;
    }
    delete configInline.extends;

    // Get command configuration
    const configArgs = processArgs();
    if (configArgs) {
        configCommand = configArgs;
    }

    // Merge configurations: command overrides extended and extended overrides inline.
    const configuration = Object.assign(configExtended, configInline as Partial<Configuration>, configCommand);
    console.log("configuration", configuration);

    // Return default values for undefined keys
    return {
        allow: configuration.allow || [],
        development: !!configuration.development || false,
        direct: configuration.direct || false,
        exclude: configuration.exclude || [],
        production: !!configuration.production || false,
        format: configuration.format || Formatter.text,
        report: configuration.report || Report.summary
    };
}
