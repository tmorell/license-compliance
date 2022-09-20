import * as fs from "fs";

import { Configuration } from "../src/interfaces";
import { Formatter, Report } from "../src/enumerations";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function readJson(path: string): any {
    return JSON.parse(fs.readFileSync(path, "utf8"));
}

export function getDefaultConfiguration(): Configuration {
    return {
        allow: [],
        development: false,
        direct: false,
        exclude: [],
        production: false,
        format: Formatter.text,
        query: [],
        report: Report.summary,
    };
}
