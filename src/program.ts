import chalk from "chalk";
import commander from "commander";

import { Formatter, Report } from "./enumerations";
import { Configuration } from "./interfaces";
import { isLicenseValid } from "./license";

let program: commander.Command;

export function processArgs(): Configuration {
    program = new commander.Command();
    program
        .exitOverride((): void => process.exit(1))
        .name("license-compliance")
        .description("Analyzes licenses of installed NPM packages, assisting with compliance.")
        .option("-p, --production", "Analyzes only production dependencies.")
        .option("-d, --development", "Analyzes only development dependencies.")
        .option("-t, --direct", "Analyzes only direct dependencies (depth = 1).")
        .option("-f, --format <format>", "Report format, csv, text, or json (default = text).", verifyFormat)
        .option("-r, --report <report>", "Report type, summary or detailed (default = summary).", verifyReport)
        .option<Array<string>>(
            "-q, --query <licenses>",
            "Semicolon separated list of licenses to query. Must conform to SPDX specifications.",
            verifyLicense("query"),
        )
        .option<Array<string>>(
            "-a, --allow <licenses>",
            "Semicolon separated list of allowed licenses. Must conform to SPDX specifications.",
            verifyLicense("allow"),
        )
        .option<Array<string | RegExp>>(
            "-e, --exclude <packages>",
            "Semicolon separated list of packages to be excluded from analysis. Regex expressions are supported.",
            verifyExclude,
        )
        .parse(process.argv);

    verifyIncompatibleArguments();

    return program.opts();
}

function help(errorMessage: string): void {
    console.error(chalk.red("Error:"), errorMessage);
    console.info(program.help());
}

function verifyLicense(arg: string): (value: string) => Array<string> {
    return (value: string): Array<string> => {
        return value
            .split(";")
            .map((license): string => license.trim())
            .filter((license): boolean => !!license)
            .map((license): string => {
                if (!isLicenseValid(license) && license !== "UNKNOWN") {
                    help(`Invalid --${arg} option "${license}"`);
                }
                return license;
            });
    };
}

function verifyExclude(value: string): Array<string | RegExp> {
    return value
        .split(";")
        .map((exclude): string => exclude.trim())
        .filter((exclude): boolean => !!exclude)
        .map((exclude): string | RegExp => {
            if (exclude.startsWith("/") && exclude.endsWith("/")) {
                return RegExp(exclude.substring(1, exclude.length - 1));
            }
            return exclude;
        });
}

function verifyFormat(value: string): string {
    if (!Object.keys(Formatter).includes(value)) {
        help(`Invalid --format option "${value}"`);
    }
    return value;
}

function verifyReport(value: string): string {
    if (!Object.keys(Report).includes(value)) {
        help(`Invalid --report option "${value}"`);
    }
    return value;
}

function verifyIncompatibleArguments(): void {
    const options = program.opts();
    if (options.production && options.development) {
        help('Options "--production" and "--development" cannot be used together');
    }
    if (options.query && options.allow) {
        help("Options '--allow' and '--query' cannot be used together");
    }
}
