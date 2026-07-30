import chalk from "chalk";
import cosmiconfigPkg from "cosmiconfig";
import joi from "joi";
import path from "node:path";

import { EOL } from "node:os";
import { Format, Report } from "./enumerations.js";
import { Configuration, ExtendableConfiguration } from "./interfaces.js";
import { isLicenseValid } from "./license.js";
import { processArgs } from "./program.js";
import { isPathTraversalSafe } from "./util.js";

const packageName = "license-compliance";

export async function getConfiguration(nodeModulesPath: string): Promise<Configuration | null> {
    // Get inline configuration
    const explorer = cosmiconfigPkg.cosmiconfig(packageName, { searchStrategy: "global" });
    const configResult = await explorer.search();
    let configInline = <ExtendableConfiguration>configResult?.config;

    // Get extended configuration
    let configExtended: Partial<Configuration> = {};
    const extendsPath = configInline?.extends;
    if (extendsPath) {
        try {
            const [ok, confPath] = isPathTraversalSafe(nodeModulesPath, path.join(extendsPath, "index.js"));
            if (!ok) {
                console.error(
                    chalk.red("Error:"),
                    `Extended configuration path "${extendsPath}" resolves outside of node_modules.`,
                );
                return null;
            }

            const c = await explorer.load(confPath);
            configExtended = <Configuration>c?.config || {};
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
    let configArgs: Configuration;
    try {
        configArgs = processArgs();
    } catch {
        return null;
    }

    // Discard inline and extended configuration if `no-config` in args.
    if (!configArgs.config) {
        configInline = {};
        configExtended = {};
    }

    // Allow and query mutual overrides
    if (configArgs.allow) {
        if (configExtended) {
            configExtended.query = [];
        }
        if (configInline) {
            configInline.query = [];
        }
    }
    if (configArgs.query) {
        if (configExtended) {
            configExtended.allow = [];
        }
        if (configInline) {
            configInline.allow = [];
        }
    }

    // Merge configurations: args > inline > extended
    const mergedConfiguration = { ...configExtended, ...(<Configuration>configInline), ...configArgs };
    const configuration = {
        allow: mergedConfiguration.allow || [],
        config: mergedConfiguration.config,
        development: mergedConfiguration.development,
        direct: mergedConfiguration.direct,
        exclude: mergedConfiguration.exclude || [],
        format: <Format>mergedConfiguration.format || Format.text,
        production: mergedConfiguration.production,
        query: mergedConfiguration.query || [],
        report: <Report>mergedConfiguration.report || Report.summary,
        showConfig: mergedConfiguration.showConfig,
    };

    // Validate configuration
    const result = joi
        .object({
            allow: joiLicense("allow"),
            config: joi.boolean().strict(),
            development: joi.boolean().strict(),
            direct: joi.boolean().strict(),
            exclude: joi.array(),
            format: joi.string().valid(Format.csv, Format.json, Format.text, Format.xunit),
            production: joi.boolean().strict(),
            query: joiLicense("query"),
            report: joi.string().valid(Report.detailed, Report.summary),
            showConfig: joi.boolean().strict(),
        })
        .messages({
            "any.only": "extended option {{#label}} value '{{#value}}' is invalid. Allowed choices are {{#valids}}.",
            "boolean.base": "extended option {{#label}} value '{{#value}}' is invalid. Expected boolean true or false.",
        })
        .validate(configuration, {
            convert: false,
            errors: {
                wrap: {
                    array: "",
                    label: `'`,
                },
            },
        });
    if (result.error) {
        console.error(chalk.red("Error:"), result.error.message);
        return null;
    }

    // Default booleans
    configuration.development = !!configuration.development;
    configuration.direct = !!configuration.direct;
    configuration.production = !!configuration.production;
    configuration.showConfig = !!configuration.showConfig;

    if (configuration.showConfig) {
        showConfig(configExtended, <Configuration>configInline, configArgs, configuration);
    }

    return configuration;
}

export function isComplianceModeEnabled(configuration: Pick<Configuration, "allow">): boolean {
    return Array.isArray(configuration.allow) && configuration.allow.length > 0;
}

function showConfig(
    extended: Partial<Configuration>,
    inline: Partial<Configuration>,
    args: Configuration,
    configuration: Configuration,
): void {
    inline ??= {};
    extended ??= {};
    const keys = <
        Array<keyof Configuration> //
    >Object.keys({ ...extended, ...inline, ...args, ...configuration }).toSorted((a, b): number => a.localeCompare(b));
    const tableData: Record<string, Record<string, string>> = {};
    for (const key of keys) {
        tableData[key] = {
            configuration: formatValue(configuration[key]),
            args: formatValue(args[key]),
            inline: formatValue(inline[key]),
            extended: formatValue(extended[key]),
        };
    }
    console.table(tableData);
}

function formatValue(value: unknown): string {
    if (value === undefined || value === null) {
        return "-";
    }
    if (Array.isArray(value)) {
        if (value.length === 0) {
            return "-";
        }
        return value.map((v): string => (v instanceof RegExp ? v.toString() : v)).join(", ");
    }
    if (typeof value === "boolean") {
        return <string>(<unknown>value);
    }
    return <string>value;
}

function joiLicense(option: string): joi.ArraySchema<Array<string>> {
    return joi
        .array()
        .items(joi.string())
        .custom((licenses: Array<string>, helper): Array<string> | joi.ErrorReport => {
            for (const license of licenses) {
                if (!isLicenseValid(license)) {
                    return helper.message({
                        custom: `extended option ${option} value '${license}' is invalid.${EOL}Licenses must adhere to the SPDX specification.`,
                    });
                }
            }
            return licenses;
        });
}
