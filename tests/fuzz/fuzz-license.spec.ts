import test from "ava";
import fc from "fast-check";

import { Package } from "../../src/interfaces.js";
import { isLicenseValid, onlyAllow, spdxToArray } from "../../src/license.js";

const numRuns = process.env.FUZZ_RUNS ? parseInt(process.env.FUZZ_RUNS, 10) : 100;

test("fuzz test: isLicenseValid should never throw uncaught exception on arbitrary string input", (t): void => {
    console.log(numRuns);
    t.notThrows((): void => {
        fc.assert(
            fc.property(fc.string(), (inputString: string): boolean => {
                const result = isLicenseValid(inputString);
                return typeof result === "boolean";
            }),
            { numRuns },
        );
    });
});

test("fuzz test: spdxToArray should safely handle arbitrary expressions", (t): void => {
    t.notThrows((): void => {
        fc.assert(
            fc.property(fc.string(), (expression: string): boolean => {
                const result = spdxToArray(expression);
                return Array.isArray(result);
            }),
            { numRuns },
        );
    });
});

test("fuzz test: onlyAllow should safely handle arbitrary packages and allowed lists", (t): void => {
    t.notThrows((): void => {
        fc.assert(
            fc.property(
                fc.array(
                    fc.record({
                        license: fc.string(),
                        name: fc.string(),
                        path: fc.string(),
                        repository: fc.string(),
                        version: fc.string(),
                    }),
                ),
                fc.array(fc.string()),
                (packages: Array<Package>, allowed: Array<string>): boolean => {
                    const result = onlyAllow(packages, { allow: allowed });
                    return Array.isArray(result);
                },
            ),
            { numRuns },
        );
    });
});
