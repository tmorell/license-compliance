import * as chalk from "chalk";
import * as commander from "commander";
import * as Debug from "debug";

import { Formatter, Report } from "./enumerations";
import { Arguments } from "./interfaces";
import { isLicenseValid } from "./license";

const debug = Debug("license-compliance:processArgs");

let args: Arguments;
let argsAreValid: boolean;
let program: commander.Command;

export { args };

export function processArgs(): boolean {
    argsAreValid = true;
    program = new commander.Command();
    program
        .name("license-compliance")
        .description("Analyzes licenses of installed NPM packages, assisting with compliance.")
        .option("-p, --production", "Analyzes only production dependencies.")
        .option("-d, --development", "Analyzes only development dependencies.")
        .option("-t, --direct", "Analyzes only direct dependencies.")
        .option("-f, --format <format>", "Report format, csv, text, or json.", verifyFormat, "text")
        .option("-r, --report <report>", "Report type, summary or detailed.", verifyReport, "summary")
        .option<Array<string>>("-a, --allow <licenses>", "Semicolon separated list of allowed licenses. Must conform to SPDX identifiers.", verifyAllow)
        .option<Array<string | RegExp>>("-e, --exclude <packages>", "Semicolon separated list of packages to be excluded from analysis. Supports Regex.", verifyExclude)
        .parse(process.argv);

    // Process production by default if not specified
    verifyProductionDevelopment();

    if (!argsAreValid) {
        return false;
    }

    formatClassNameCasing();

    // tslint:disable-next-line: no-any
    args = program.opts() as any;
    debug("Program options %o", program.opts());

    return true;
}

function formatClassNameCasing(): void {
    // Report and format casing must match class name => Pascal notation
    const opts = program.opts();

    let name = opts.report + "";
    opts.report = name[0].toUpperCase() + name.substr(1);

    name = opts.format + "";
    opts.format = name[0].toUpperCase() + name.substr(1);
}

function help(errorMessage: string): void {
    console.log(chalk.red("Error:"), errorMessage);
    console.log(program.help());
    argsAreValid = false;
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
    if (Object.keys(Formatter).includes(value)) {
        return value;
    }
    help(`Invalid --format option "${value}"`);
    return "";
}

function verifyProductionDevelopment(): void {
    const opts = program.opts();
    if (opts.production && opts.development ) {
        help("Options \"--production\" and \"--development\" cannot be used together");
    }
}

function verifyReport(value: string, previous: string): string {
    if (Object.keys(Report).includes(value)) {
        return value;
    }
    help(`Invalid --report option "${value}"`);
    return "";
}
