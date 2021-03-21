import test from "ava";
import { Formatter } from "../../src/enumerations";

import { Csv } from "../../src/formatters/csv";
import { Factory } from "../../src/formatters/factory";
import { Json } from "../../src/formatters/json";
import { Text } from "../../src/formatters/text";

test("Csv", (t) => {
    const formatter = Factory.getInstance(Formatter.csv);

    t.true(formatter instanceof Csv);
});

test("Json", (t) => {
    const formatter = Factory.getInstance(Formatter.json);

    t.true(formatter instanceof Json);
});

test("Text", (t) => {
    const formatter = Factory.getInstance(Formatter.text);

    t.true(formatter instanceof Text);
});
