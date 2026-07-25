import { Formatter as FormatterName } from "../enumerations.js";
import { Csv } from "./csv.js";
import { Formatter } from "./formatter.js";
import { Json } from "./json.js";
import { Text } from "./text.js";
import { Xunit } from "./xunit.js";

export class Factory {
    static getInstance(format: FormatterName): Formatter {
        const classes = { Csv, Json, Text, Xunit };
        return new classes[format]();
    }
}
