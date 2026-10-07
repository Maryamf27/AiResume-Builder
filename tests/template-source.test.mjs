import test from "node:test";
import assert from "node:assert/strict";
import { resolveTemplateSource } from "../lib/templates/source.ts";

test("prefers valid JSONB code over legacy template columns", () => {
  assert.deepEqual(resolveTemplateSource({
    html: "<div>legacy</div>",
    css: ".legacy {}",
    code: { html: "<div>{{fullName}}</div>", css: ".new {}" },
  }), { html: "<div>{{fullName}}</div>", css: ".new {}" });
});

test("falls back to legacy columns for null or invalid JSONB code", () => {
  const legacy = { html: "<div>{{fullName}}</div>", css: ".legacy {}" };
  assert.deepEqual(resolveTemplateSource({ ...legacy, code: null }), legacy);
  assert.deepEqual(resolveTemplateSource({ ...legacy, code: { html: "", css: ".new {}" } }), legacy);
  assert.deepEqual(resolveTemplateSource({ ...legacy, code: { html: "<div>new</div>" } }), legacy);
});

test("safely handles malformed legacy values when code is invalid", () => {
  assert.deepEqual(resolveTemplateSource({ html: null, css: 5, code: "invalid" }), { html: "", css: "" });
});
