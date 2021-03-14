import { Formatter } from "./index";
import { Csv } from "./csv";
import { Json } from "./json";
import { Text } from "./text";
import { configuration } from "../main";

export class Factory {
    public static getInstance(): Formatter {
        const classes = { Csv, Json, Text };
        return new classes[configuration.format]();
    }
}
