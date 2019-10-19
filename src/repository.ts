// Reference: https://docs.npmjs.com/files/package.json#repository

import { Literals } from "./enumerations";
import { Repository } from "./interfaces";

export function getRepository(value: Repository | string | undefined): string {
    if (typeof value === "object" && value.url && typeof value.url === "string") {
        return value.url
            .replace(/^git\+https/, "https")
            .replace(/^git\+ssh:\/\/git@/, "https://")
            .replace(/^git:\/\//, "https://")
            .replace(/.git$/, "");
    }

    if (typeof value === "string") {
        return value
            .replace(/^github:/, "https://github.com/")
            .replace(/^bitbucket:/, "https://bitbucket.org/")
            .replace(/^gitlab:/, "https://gitlab.com/")
            .replace(/.git$/, "");
    }

    return Literals.UNKNOWN;
}
