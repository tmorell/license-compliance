import commander from "commander";

import { version } from "../package.json";
import { Formatter, Literals, Report } from "./enumerations";
import { Configuration } from "./interfaces";
import { isLicenseValid } from "./license";

let program: commander.Command;

export function processArgs(): Configuration {
    program = new commander.Command();
    // Force exit on `--help` and `--version` avoiding bubble up
    program
        .exitOverride((err: commander.CommanderError): void => {
            if (err.code === "commander.helpDisplayed" || err.code === "commander.version") {
                process.exit(0);
            }
            throw err;
        })
        .name("license-compliance")
        .description("Analyzes licenses of installed NPM packages, assisting with compliance.")
        .version(version, "-v, --version", "Display license-compliance version")
        .option("-p, --production", "Analyzes only production dependencies.")
        .addOption(
            new commander.Option("-d, --development", "Analyzes only development dependencies.").conflicts(
                "production",
            ),
        )
        .option("-t, --direct", "Analyzes only direct dependencies (depth = 1).")
        .addOption(
            new commander.Option(
                "-f, --format <format>",
                "Report format, csv, text, or json (default = text).",
            ).choices(Object.keys(Formatter)),
        )
        .addOption(
            new commander.Option(
                "-r, --report <report>",
                "Report type, summary or detailed (default = summary).",
            ).choices(Object.keys(Report)),
        )
        .addOption(
            new commander.Option(
                "-a, --allow <licenses>",
                "Semicolon separated list of allowed licenses. Must conform to SPDX specifications.",
            )
                .conflicts("query")
                .argParser(verifyLicense),
        )
        .addOption(
            new commander.Option(
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
        .parse();

    return program.opts();
}

function verifyLicense(value: string): Array<string> {
    return value
        .split(";")
        .map((license): string => license.trim())
        .filter((license): boolean => !!license)
        .map((license): string => {
            if (!isLicenseValid(license) && license !== Literals.UNKNOWN) {
                throw new commander.InvalidArgumentError("Licenses must adhere to the SPDX specification.");
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
                    throw new commander.InvalidArgumentError("Invalid regular expression pattern.");
                }
            }
            return exclude;
        });
}
