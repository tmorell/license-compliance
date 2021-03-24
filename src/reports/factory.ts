import { Detailed } from "./detailed";
import { Invalid } from "./invalid";
import { Reporter } from "./reporter";
import { Summary } from "./summary";
import { Report, Formatter as FormatterName } from "../enumerations";
import { Factory as FormatFactory } from "../formatters";

export class Factory {

    static getInstance(type: Report, format: FormatterName): Reporter {
        const classes = { Detailed, Invalid, Summary };
        return new classes[type](FormatFactory.getInstance(format));
    }
}
