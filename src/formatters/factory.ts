import { Formatter } from "./index";
import { Json } from "./json";
import { Text } from "./text";
import { args } from "../program";

export class Factory {
    public static getInstance(): Formatter {
        const classes = { Json, Text };
        return new classes[args.format]();
    }
}
