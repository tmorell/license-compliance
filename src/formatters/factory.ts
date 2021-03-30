import { Formatter } from "./index";
import { Csv } from "./csv";
import { Json } from "./json";
import { Text } from "./text";
import { Xunit } from "./xunit";
import { Formatter as FormatterName } from "../enumerations";

export class Factory {
    static getInstance(format: FormatterName): Formatter {
        const classes = { Csv, Json, Text, Xunit };
        return new classes[format]();
    }
}
