import { Format, Report } from "../enumerations.js";
import { Factory as FormatFactory } from "../formatters/index.js";
import { toPascal } from "../util.js";
import { Detailed } from "./detailed.js";
import { Reporter } from "./reporter.js";
import { Summary } from "./summary.js";

export class Factory {
    static getInstance(className: string, format: Format): Reporter {
        if (className in Report) {
            const classes = { Detailed, Summary };
            type type = keyof typeof classes;
            return new classes[<type>toPascal(className)](FormatFactory.getInstance(format));
        }
        throw new Error(`Invalid report type: '${className}'`);
    }
}
