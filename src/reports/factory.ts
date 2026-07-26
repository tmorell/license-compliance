import { Formatter as FormatterName, Report } from "../enumerations.js";
import { Factory as FormatFactory } from "../formatters/index.js";
import { Detailed } from "./detailed.js";
import { Reporter } from "./reporter.js";
import { Summary } from "./summary.js";

export class Factory {
    static getInstance(type: Report, format: FormatterName): Reporter {
        const classes = { Detailed, Summary };
        return new classes[type](FormatFactory.getInstance(format));
    }
}
