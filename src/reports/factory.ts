import { Formatter as FormatterName, Report } from "../enumerations";
import { Factory as FormatFactory } from "../formatters";
import { Detailed } from "./detailed";
import { Reporter } from "./reporter";
import { Summary } from "./summary";

export class Factory {
    static getInstance(type: Report, format: FormatterName): Reporter {
        const classes = { Detailed, Summary };
        return new classes[type](FormatFactory.getInstance(format));
    }
}
