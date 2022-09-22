import test from "ava";

import { getRepository } from "../../src/repository";
import { Literals } from "../../src/enumerations";

let testIndex = 0;

[
    { type: "git", url: "git+https://github.com/user/project.git", result: "https://github.com/user/project" },
    { type: "git", url: "git+ssh://git@bitbucket.org/user/project.git", result: "https://bitbucket.org/user/project" },
    { type: "git", url: "git+https://gitlab.com/user/project.git", result: "https://gitlab.com/user/project" },
    { type: "git", url: "git://github.com/user/project.git", result: "https://github.com/user/project" },
].forEach((value): void => {
    test(`Composed repositories ${++testIndex}`, (t): void => {
        const repoName = getRepository(value);

        t.is(repoName, value.result);
    });
});

[
    { url: "github:user/project", result: "https://github.com/user/project" },
    { url: "bitbucket:user/project.git", result: "https://bitbucket.org/user/project" },
    { url: "gitlab:user/project.git", result: "https://gitlab.com/user/project" },
    { url: "user/project", result: "user/project" },
].forEach((value): void => {
    test(`Simple repositories ${++testIndex}`, (t): void => {
        const repoName = getRepository(value.url);

        t.is(repoName, value.result);
    });
});

test("Unknown", (t): void => {
    const repoName = getRepository(undefined);

    t.is(repoName, Literals.UNKNOWN);
});
