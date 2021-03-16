import { Formatter } from "./index";
import { Csv } from "./csv";
import { Json } from "./json";
import { Text } from "./text";
import { Formatter as FormatterName } from '../enumerations';

export class Factory {
    public static getInstance(format: FormatterName): Formatter {
        const classes = { Csv, Json, Text };
        return new classes[format]();
    }
}
