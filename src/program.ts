import chalk from "chalk";
import { Command, CommanderError, InvalidArgumentError, Option } from "commander";
import { EOL } from "node:os";

import packInfo from "../package.json" with { type: "json" };
import { Format, Literals, Report } from "./enumerations.js";
import { Configuration } from "./interfaces.js";
import { isLicenseValid } from "./license.js";

let command: Command;

export function processArgs(): Configuration {
    command = new Command();
    // Force exit on `--help` and `--version` avoiding bubble up
    command
        .exitOverride((err: CommanderError): void => {
            if (err.code === "commander.helpDisplayed" || err.code === "commander.version") {
                process.exit(0);
            }
            throw err;
        })
        .name("license-compliance")
        .description("Analyzes licenses of installed NPM packages, assisting with compliance.")
        .version(packInfo.version, "-v, --version", "Display license-compliance version")
        .option("-p, --production", "Analyzes only production dependencies.")
        .addOption(new Option("-d, --development", "Analyzes only development dependencies.").conflicts("production"))
        .option("-t, --direct", "Analyzes only direct dependencies (depth = 1).")
        .option("-s, --show-config", "Shows the configuration being used.")
        .addOption(
            new Option("-f, --format <format>", "Report format, csv, text, or json (default = text).").choices(
                Object.keys(Format),
            ),
        )
        .addOption(
            new Option("-r, --report <report>", "Report type, summary or detailed (default = summary).").choices(
                Object.keys(Report),
            ),
        )
        .addOption(
            new Option(
                "-a, --allow <licenses>",
                "Semicolon separated list of allowed licenses. Must conform to SPDX specifications.",
            )
                .conflicts("query")
                .argParser(verifyLicense),
        )
        .addOption(
            new Option(
                "-q, --query <licenses>",
                "Semicolon separated list of licenses to query. Must conform to SPDX specifications.",
            )
                .conflicts("allow")
                .argParser(verifyLicense),
        )
        .option<Array<string | RegExp>>(
            "-e, --exclude <packages>",
            "Semicolon separated list of packages to be excluded from analysis. Regex expressions are supported.",
            verifyExclude,
        )
        .configureOutput({
            writeErr: (str: string): void => {
                process.stdout.write(`${chalk.red("Error:")} ${str.substring(7)}`);
            },
        })
        .parse();

    return command.opts();
}

function verifyLicense(value: string): Array<string> {
    return value
        .split(";")
        .map((license): string => license.trim())
        .filter((license): boolean => !!license)
        .map((license): string => {
            if (!isLicenseValid(license) && license !== Literals.UNKNOWN) {
                throw new InvalidArgumentError(`${EOL}Licenses must adhere to the SPDX specification.`);
            }
            return license;
        });
}

function verifyExclude(value: string): Array<string | RegExp> {
    return value
        .split(";")
        .map((exclude): string => exclude.trim())
        .filter((exclude): boolean => !!exclude)
        .map((exclude): string | RegExp => {
            if (exclude.startsWith("/") && exclude.endsWith("/")) {
                const pattern = exclude.substring(1, exclude.length - 1);
                try {
                    return new RegExp(pattern);
                } catch {
                    throw new InvalidArgumentError("Invalid regular expression pattern.");
                }
            }
            return exclude;
        });
}
