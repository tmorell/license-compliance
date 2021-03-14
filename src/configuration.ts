import { cosmiconfig } from "cosmiconfig";

import { Configuration } from "./interfaces";
import { processArgs } from "./program";

const packageName = "license-compliance";

export async function getConfiguration(): Promise<Configuration | null> {

    let configExtended = {};
    let configInline = {};
    let configCommand = {};

    // Get inline configuration
    const explorer = cosmiconfig(packageName);
    const configResult = await explorer.search();
    configInline = configResult?.config;

    // Get extended configuration
    const extendsPath = (configInline as any)?.extends;
    if (extendsPath) {
        const c = await explorer.load(`node_modules/${extendsPath}/index.js`);
        configExtended = c?.config;
    }

    // Get command configuration
    const configArgs = processArgs();
    if (configArgs) {
        configCommand = configArgs;
    }

    // Merge configurations: command overrides extended and extended overrides inline.
    const configuration = Object.assign(configExtended, configInline, configCommand);
    delete (configuration as any).extends;

    console.log("configuration", configuration);
    return configuration as Configuration;
}
