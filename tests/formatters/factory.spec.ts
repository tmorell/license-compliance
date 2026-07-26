import test from "ava";

import { Format } from "../../src/enumerations.js";
import { Csv } from "../../src/formatters/csv.js";
import { Factory } from "../../src/formatters/factory.js";
import { Json } from "../../src/formatters/json.js";
import { Text } from "../../src/formatters/text.js";
import { Xunit } from "../../src/formatters/xunit.js";

test("Csv", (t): void => {
    const formatter = Factory.getInstance(Format.csv);

    t.true(formatter instanceof Csv);
});

test("Json", (t): void => {
    const formatter = Factory.getInstance(Format.json);

    t.true(formatter instanceof Json);
});

test("Text", (t): void => {
    const formatter = Factory.getInstance(Format.text);

    t.true(formatter instanceof Text);
});

test("Xunit", (t): void => {
    const formatter = Factory.getInstance(Format.xunit);

    t.true(formatter instanceof Xunit);
});

test("Invalid", (t): void => {
    const error = t.throws((): void => {
        Factory.getInstance("Invalid");
    });

    t.is(error.message, "Invalid format type: 'Invalid'");
});
