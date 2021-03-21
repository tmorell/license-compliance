import chalk from "chalk";
import commander from "commander";

import { Formatter, Report } from "./enumerations";
import { Configuration } from "./interfaces";
import { isLicenseValid } from "./license";

let program: commander.Command;

export function processArgs(): Configuration {
    program = new commander.Command();
    program
        .exitOverride(() => process.exit(1))
        .name("license-compliance")
        .description("Analyzes licenses of installed NPM packages, assisting with compliance.")
        .option("-p, --production", "Analyzes only production dependencies.")
        .option("-d, --development", "Analyzes only development dependencies.")
        .option("-t, --direct", "Analyzes only direct dependencies.")
        .option("-f, --format <format>", "Report format, csv, text, or json.", verifyFormat)
        .option("-r, --report <report>", "Report type, summary or detailed.", verifyReport)
        .option<Array<string>>("-a, --allow <licenses>", "Semicolon separated list of allowed licenses. Must conform to SPDX identifiers.", verifyAllow)
        .option<Array<string | RegExp>>("-e, --exclude <packages>", "Semicolon separated list of packages to be excluded from analysis. Supports Regex.", verifyExclude)
        .parse(process.argv);

    verifyProductionDevelopment();

    return program.opts() as Configuration;
}

function help(errorMessage: string): void {
    console.log(chalk.red("Error:"), errorMessage);
    console.log(program.help());
}

function verifyAllow(value: string, previous: Array<string>): Array<string> {
    return value
        .split(";")
        .map((license) => license.trim())
        .filter((license) => !!license)
        .map((license) => {
            if (!isLicenseValid(license)) {
                help(`Invalid --allow option "${license}"`);
            }
            return license;
        });
}

function verifyExclude(value: string, previous: Array<string | RegExp>): Array<string | RegExp> {
    return value
        .split(";")
        .map((exclude) => exclude.trim())
        .filter((exclude) => !!exclude)
        .map((exclude) => {
            if (exclude.startsWith("/") && exclude.endsWith("/")) {
                return RegExp(exclude.substr(1, exclude.length - 2));
            }
            return exclude;
        });
}

function verifyFormat(value: string, previous: string): string {
    if (!Object.keys(Formatter).includes(value)) {
        help(`Invalid --format option "${value}"`);
    }
    return value;
}

function verifyProductionDevelopment(): void {
    const options = program.opts();
    if (options.production && options.development) {
        help("Options \"--production\" and \"--development\" cannot be used together");
    }
}

function verifyReport(value: string, previous: string): string {
    if (!Object.keys(Report).includes(value)) {
        help(`Invalid --report option "${value}"`);
    }
    return value;
}
