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
    let configExtended: Partial<Configuration> = {};

    // Get inline configuration
    const explorer = cosmiconfigPkg.cosmiconfig(packageName, { searchStrategy: "global" });
    const configResult = await explorer.search();
    const configInline = <ExtendableConfiguration>configResult?.config;

    // Get extended configuration
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
            console.log("c", c);
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
    let configArgs: Configuration;
    try {
        configArgs = processArgs();
    } catch {
        return null;
    }

    // Merge configurations: CLI > inline > extended
    const mergedConfiguration = { ...configExtended, ...(<Partial<Configuration>>configInline), ...configArgs };
    const configuration = {
        allow: mergedConfiguration.allow || [],
        development: mergedConfiguration.development,
        direct: mergedConfiguration.direct,
        exclude: mergedConfiguration.exclude || [],
        format: <Format>mergedConfiguration.format || Format.text,
        production: mergedConfiguration.production,
        query: mergedConfiguration.query || [],
        report: <Report>mergedConfiguration.report || Report.summary,
    };

    // Allow and query overrides
    console.log("allow", configArgs?.allow, configInline?.allow, configExtended?.allow);
    console.log("query", configArgs?.query, configInline?.query, configExtended?.query);
    if (configArgs.allow && (configInline.query || configExtended.query)) {
        configuration.query = [];
    }
    if (configArgs.query && (configInline.allow || configExtended.allow)) {
        configuration.allow = [];
    }

    // Validate configuration
    const result = joi
        .object({
            allow: joiLicense("allow"),
            development: joi.boolean().strict(),
            direct: joi.boolean().strict(),
            exclude: joi.array(),
            format: joi.string().valid(Format.csv, Format.json, Format.text, Format.xunit),
            production: joi.boolean().strict(),
            query: joiLicense("query"),
            report: joi.string().valid(Report.detailed, Report.summary),
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

    console.log(configuration);

    return configuration;
}

export function isComplianceModeEnabled(configuration: Pick<Configuration, "allow">): boolean {
    return Array.isArray(configuration.allow) && configuration.allow.length > 0;
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
