import * as fs from "fs";

// tslint:disable-next-line: no-any
export function readJson(path: string): any {
    return JSON.parse(fs.readFileSync(path, "utf8"));
}
