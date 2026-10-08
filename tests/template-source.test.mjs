import test from "node:test";
import assert from "node:assert/strict";
import { resolveTemplateSource } from "../lib/templates/source.ts";

test("uses existing html/css columns even when JSONB code is present", () => {
  assert.deepEqual(resolveTemplateSource({
    html: "<div>saved HTML</div>",
    css: ".saved {}",
    code: { html: "<div>different JSONB HTML</div>", css: ".different {}" },
  }), { html: "<div>saved HTML</div>", css: ".saved {}" });
});

test("uses existing html/css when JSONB code is null or invalid", () => {
  const legacy = { html: "<div>{{fullName}}</div>", css: ".legacy {}" };
  assert.deepEqual(resolveTemplateSource({ ...legacy, code: null }), legacy);
  assert.deepEqual(resolveTemplateSource({ ...legacy, code: { html: "", css: ".new {}" } }), legacy);
  assert.deepEqual(resolveTemplateSource({ ...legacy, code: { html: "<div>new</div>" } }), legacy);
});

test("safely handles malformed legacy values when code is invalid", () => {
  assert.deepEqual(resolveTemplateSource({ html: null, css: 5, code: "invalid" }), { html: "", css: "" });
});
