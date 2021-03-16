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
        delete configInline.extends;
    }

    // Get command configuration
    const configArgs = processArgs();
    if (configArgs) {
        configCommand = configArgs;
    }

    // Merge configurations: command overrides extended and extended overrides inline.
    const configuration = Object.assign(configExtended, configInline as Partial<Configuration>, configCommand);

    // Return default values for undefined keys
    return {
        ...configuration.allow && { allow: configuration.allow },
        ...configuration.development && { development: configuration.development },
        ...configuration.direct && { direct: configuration.direct },
        ...configuration.exclude && { exclude: configuration.exclude },
        ...configuration.production && { production: configuration.production },
        format: toPascal(configuration.format) as Formatter || Formatter.text,
        report: toPascal(configuration.report) as Report || Report.summary
    };
}

function toPascal(value: string | undefined): string | undefined {
    if (!value || value.length < 2) {
        return value;
    }
    return value[0].toUpperCase() + value.substr(1);
}
