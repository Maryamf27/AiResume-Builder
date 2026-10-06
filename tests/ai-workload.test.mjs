import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { buildATSResumeContext } from "../lib/ai/ats-context.ts";
import { generateAIResponse } from "../lib/ai/client.ts";
import { withScopedAIResultCache } from "../lib/ai/result-cache.ts";
import { normalizeATSSeverity } from "../lib/ai/ats-normalization.ts";
import { normalizeJobMatchPayload } from "../lib/ai/job-match-normalization.ts";

const originalFetch = globalThis.fetch;
const originalApiKey = process.env.OPENROUTER_API_KEY;
const originalModel = process.env.OPENROUTER_MODEL;
const originalTimeout = process.env.OPENROUTER_TIMEOUT_MS;
const originalConsole = { error: console.error, info: console.info, warn: console.warn };

function sampleResume(description) {
  return {
    personal: {
      firstName: "Ada", lastName: "Lovelace", title: "Engineer", email: "ada@example.test",
      phone: "123", location: "London", website: "https://example.test", linkedin: "", github: "",
    },
    summary: "Engineer with experience.",
    experience: [{ id: "internal-id", jobTitle: "Engineer", company: "Analytical Engines", location: "London", startDate: "1842", endDate: "1843", current: false, description }],
    education: [], skills: [{ id: "skill-id", name: "Mathematics" }], projects: [], certifications: [], languages: [], templateId: "private-template",
  };
}

function request() {
  return generateAIResponse({
    systemPrompt: "Return JSON.",
    userPrompt: "Analyze this resume.",
    maxTokens: 1_300,
    jsonMode: true,
    operationName: "ATS Analysis",
    timeoutMs: 1_000,
  });
}

beforeEach(() => {
  process.env.OPENROUTER_API_KEY = "test-key";
  process.env.OPENROUTER_MODEL = "nvidia/nemotron-3.5-lightning:free";
  delete process.env.OPENROUTER_TIMEOUT_MS;
  console.error = () => undefined;
  console.info = () => undefined;
  console.warn = () => undefined;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalApiKey === undefined) delete process.env.OPENROUTER_API_KEY;
  else process.env.OPENROUTER_API_KEY = originalApiKey;
  if (originalModel === undefined) delete process.env.OPENROUTER_MODEL;
  else process.env.OPENROUTER_MODEL = originalModel;
  if (originalTimeout === undefined) delete process.env.OPENROUTER_TIMEOUT_MS;
  else process.env.OPENROUTER_TIMEOUT_MS = originalTimeout;
  console.error = originalConsole.error;
  console.info = originalConsole.info;
  console.warn = originalConsole.warn;
});

test("ATS context stays compact for short and long resumes and excludes unrelated data", () => {
  const short = buildATSResumeContext(sampleResume("Built an engine."));
  const long = buildATSResumeContext(sampleResume("Built an engine. ".repeat(800)));
  const shortJson = JSON.stringify(short);
  const longJson = JSON.stringify(long);

  assert.ok(shortJson.length < JSON.stringify(sampleResume("Built an engine.")).length);
  assert.ok(longJson.length < JSON.stringify(sampleResume("Built an engine. ".repeat(800))).length);
  assert.ok(longJson.length < 2_000);
  assert.ok(longJson.includes("…"));
  assert.ok(!shortJson.includes("ada@example.test"));
  assert.ok(!shortJson.includes("internal-id"));
  assert.ok(!shortJson.includes("private-template"));
  assert.equal(JSON.stringify(buildATSResumeContext(sampleResume("Built an engine."))), shortJson);
  assert.notEqual(JSON.stringify(buildATSResumeContext(sampleResume("Built a different engine."))), shortJson);
});

test("the same ATS input reuses its result and relevant resume changes invalidate it", async () => {
  let calls = 0;
  const run = async () => ({ result: ++calls });
  const firstInput = buildATSResumeContext(sampleResume("Built an engine."));
  const sameInput = buildATSResumeContext(sampleResume("Built an engine."));
  const changedInput = buildATSResumeContext(sampleResume("Built a different engine."));
  const cached = (input) => withScopedAIResultCache(
    "test-user:ats-cache", "ats-analysis-test", input, "test-model", run,
  );

  assert.deepEqual(await cached(firstInput), { result: 1 });
  assert.deepEqual(await cached(sameInput), { result: 1 });
  assert.deepEqual(await cached(changedInput), { result: 2 });
  assert.equal(calls, 2);
});

test("HTTP 429 remains a rate-limit error", async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({ error: { message: "rate limited" } }), { status: 429 });
  const result = await request();
  assert.equal(result.success, false);
  if (!result.success) assert.equal(result.code, "RATE_LIMIT");
});

test("requests disable hidden reasoning so output tokens remain for structured content", async () => {
  let sentBody;
  globalThis.fetch = async (_input, init) => {
    sentBody = JSON.parse(init.body);
    return new Response(JSON.stringify({
      choices: [{ finish_reason: "stop", message: { content: "{}" } }],
    }), { status: 200 });
  };

  const result = await request();
  assert.equal(result.success, true);
  assert.equal(sentBody.reasoning.effort, "none");
  assert.equal(sentBody.max_tokens, 1_300);
});

test("ATS severity aliases map to the three values used by the UI", () => {
  assert.equal(normalizeATSSeverity("HIGH"), "critical");
  assert.equal(normalizeATSSeverity("Medium"), "warning");
  assert.equal(normalizeATSSeverity("low"), "suggestion");
  assert.equal(normalizeATSSeverity(" Needs-Improvement "), " Needs-Improvement ");
});

test("job-match output caps long lists, derives missing summary, and ignores model statuses", () => {
  const response = normalizeJobMatchPayload({
    status: "success",
    job: {
      jobTitle: "Developer",
      responsibilities: Array.from({ length: 9 }, (_, index) => `Task ${index}`),
      requiredQualifications: Array.from({ length: 7 }, (_, index) => `Qualification ${index}`),
    },
    match: {
      overallScore: 82,
      status: "strong",
      responsibilityMatches: [
        { responsibility: "Build", matched: "true" },
        { responsibility: "Deploy", matched: "false" },
        { responsibility: "Support", matched: false },
      ],
    },
  });

  assert.equal(response.status, undefined);
  assert.equal(response.job.summary, "Requirements extracted for Developer.");
  assert.equal(response.job.responsibilities.length, 4);
  assert.equal(response.job.requiredQualifications.length, 3);
  assert.equal(response.match.status, undefined);
  assert.deepEqual(response.match.responsibilityMatches.map((item) => item.matched), [true, false, false]);
});

test("job-match normalizes only exact boolean strings and logs counts without payload data", () => {
  const logs = [];
  const originalWarn = console.warn;
  console.warn = (...args) => logs.push(args);
  let normalized;
  try {
    normalized = normalizeJobMatchPayload({
      match: {
        responsibilityMatches: [
          { matched: true },
          { matched: false },
          { matched: "true" },
          { matched: "false" },
        ],
      },
    });
  } finally {
    console.warn = originalWarn;
  }

  assert.deepEqual(normalized.match.responsibilityMatches.map((item) => item.matched), [true, false, true, false]);
  assert.equal(logs.length, 1);
  assert.deepEqual(logs[0], ["AI_OUTPUT_NORMALIZED", {
    operation: "Job Analysis and Match",
    field: "match.responsibilityMatches[].matched",
    normalizedTrueCount: 1,
    normalizedFalseCount: 1,
  }]);

  const invalid = normalizeJobMatchPayload({
    match: { responsibilityMatches: [{ matched: "TRUE" }, { matched: "Yes" }, { matched: 1 }] },
  });
  assert.deepEqual(invalid.match.responsibilityMatches.map((item) => item.matched), ["TRUE", "Yes", 1]);
});

test("authentication, credit, bad request, timeout, and provider errors stay distinct", async (t) => {
  const cases = [
    { status: 401, body: { error: { message: "unauthorized" } }, code: "INVALID_CONFIG" },
    { status: 402, body: { error: { message: "payment required" } }, code: "INSUFFICIENT_CREDITS" },
    { status: 400, body: { error: { message: "bad request" } }, code: "INVALID_REQUEST" },
    { status: 408, body: { error: { message: "upstream timeout" } }, code: "TIMEOUT" },
    { status: 500, body: { error: { message: "provider failure" } }, code: "PROVIDER_ERROR" },
  ];

  for (const item of cases) {
    await t.test(`status ${item.status}`, async () => {
      globalThis.fetch = async () => new Response(JSON.stringify(item.body), { status: item.status });
      const result = await request();
      assert.equal(result.success, false);
      if (!result.success) assert.equal(result.code, item.code);
    });
  }
});

test("HTTP 200 that stalls while generating is a timeout and is not retried", async () => {
  let calls = 0;
  globalThis.fetch = async (_input, init) => {
    calls += 1;
    const signal = init?.signal;
    return {
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "text/event-stream" }),
      text: () => new Promise((_resolve, reject) => {
        signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")), { once: true });
      }),
    };
  };

  const result = await request();
  assert.equal(calls, 1);
  assert.equal(result.success, false);
  if (!result.success) assert.equal(result.code, "TIMEOUT");
});

test("invalid generated JSON remains visible to caller validation", async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({
    choices: [{ finish_reason: "stop", message: { content: "not-json" } }],
  }), { status: 200 });
  const result = await request();
  assert.equal(result.success, true);
  if (result.success) assert.equal(result.content, "not-json");
});
