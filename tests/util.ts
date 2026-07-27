import * as fs from "fs";

import { Format, Report } from "../src/enumerations.js";
import { Configuration } from "../src/interfaces.js";

export function readJson(path: string): unknown {
    return JSON.parse(fs.readFileSync(path, "utf8"));
}

export function getDefaultConfiguration(): Configuration {
    return {
        allow: [],
        development: false,
        direct: false,
        exclude: [],
        production: false,
        format: Format.text,
        query: [],
        report: Report.summary,
    };
}
