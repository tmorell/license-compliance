import test from "ava";

import { Formatter } from "../../src/enumerations.js";
import { Csv } from "../../src/formatters/csv.js";
import { Factory } from "../../src/formatters/factory.js";
import { Json } from "../../src/formatters/json.js";
import { Text } from "../../src/formatters/text.js";
import { Xunit } from "../../src/formatters/xunit.js";

test("Csv", (t): void => {
    const formatter = Factory.getInstance(Formatter.csv);

    t.true(formatter instanceof Csv);
});

test("Json", (t): void => {
    const formatter = Factory.getInstance(Formatter.json);

    t.true(formatter instanceof Json);
});

test("Text", (t): void => {
    const formatter = Factory.getInstance(Formatter.text);

    t.true(formatter instanceof Text);
});

test("Xunit", (t): void => {
    const formatter = Factory.getInstance(Formatter.xunit);

    t.true(formatter instanceof Xunit);
});
