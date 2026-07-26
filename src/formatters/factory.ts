import { Format } from "../enumerations.js";
import { toPascal } from "../util.js";
import { Csv } from "./csv.js";
import { Formatter } from "./formatter.js";
import { Json } from "./json.js";
import { Text } from "./text.js";
import { Xunit } from "./xunit.js";

export class Factory {
    static getInstance(className: string): Formatter {
        if (className in Format) {
            const classes = { Csv, Json, Text, Xunit };
            type type = keyof typeof classes;
            return new classes[<type>toPascal(className)]();
        }
        throw new Error(`Invalid format type: '${className}'`);
    }
}
