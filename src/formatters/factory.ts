import { Formatter } from "./index";
import { Csv } from "./csv";
import { Json } from "./json";
import { Text } from "./text";
import { args } from "../program";

export class Factory {
    public static getInstance(): Formatter {
        const classes = { Csv, Json, Text };
        return new classes[args.format]();
    }
}
