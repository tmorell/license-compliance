import test from "ava";
import * as sinon from "sinon";

import { Csv } from "../../src/formatters/csv";
import { Factory } from "../../src/formatters/factory";
import { Json } from "../../src/formatters/json";
import { Text } from "../../src/formatters/text";

test("Csv", (t) => {
    sinon.stub(require("../../src/main"), "configuration").value({ format: "Csv" });

    const formatter = Factory.getInstance();

    t.true(formatter instanceof Csv);
});

test("Json", (t) => {
    sinon.stub(require("../../src/main"), "configuration").value({ format: "Json" });

    const formatter = Factory.getInstance();

    t.true(formatter instanceof Json);
});

test("Text", (t) => {
    sinon.stub(require("../../src/main"), "configuration").value({ format: "Text" });

    const formatter = Factory.getInstance();

    t.true(formatter instanceof Text);
});
