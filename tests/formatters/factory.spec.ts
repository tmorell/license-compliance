import test from "ava";
import { Formatter } from "../../src/enumerations";

import { Csv } from "../../src/formatters/csv";
import { Factory } from "../../src/formatters/factory";
import { Json } from "../../src/formatters/json";
import { Text } from "../../src/formatters/text";
import { Xunit } from "../../src/formatters/xunit";

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
