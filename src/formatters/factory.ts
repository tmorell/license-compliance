import { Formatter as FormatterName } from "../enumerations";
import { Csv } from "./csv";
import { Formatter } from "./formatter";
import { Json } from "./json";
import { Text } from "./text";
import { Xunit } from "./xunit";

export class Factory {
    static getInstance(format: FormatterName): Formatter {
        const classes = { Csv, Json, Text, Xunit };
        return new classes[format]();
    }
}
