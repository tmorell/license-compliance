import test from "ava";
import * as sinon from "sinon";

import { Factory } from "../../src/formatters/factory";
import { Json } from "../../src/formatters/json";
import { Text } from "../../src/formatters/text";

test("Text", (t) => {
    sinon.stub(require("../../src/program"), "args").value({ format: "Text" });

    const formatter = Factory.getInstance();

    t.true(formatter instanceof Text);
});

test("Json", (t) => {
    sinon.stub(require("../../src/program"), "args").value({ format: "Json" });

    const formatter = Factory.getInstance();

    t.true(formatter instanceof Json);
});
