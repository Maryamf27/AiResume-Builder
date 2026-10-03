import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_RESUME_UPLOAD_BYTES,
  validateResumeFile,
} from "../lib/resume/extraction/validation.ts";

test("accepts PDF and DOCX with matching or generic MIME types", () => {
  assert.deepEqual(
    validateResumeFile({ name: "Resume.PDF", type: "application/pdf", size: 100 }),
    { valid: true, fileType: "pdf" }
  );
  assert.deepEqual(
    validateResumeFile({ name: "Resume.docx", type: "application/octet-stream", size: 100 }),
    { valid: true, fileType: "docx" }
  );
});

test("rejects legacy DOC and mismatched MIME types", () => {
  assert.equal(
    validateResumeFile({ name: "Resume.doc", type: "application/msword", size: 100 }).valid,
    false
  );
  assert.equal(
    validateResumeFile({ name: "Resume.pdf", type: "image/png", size: 100 }).valid,
    false
  );
});

test("rejects empty and oversized files while allowing the size limit", () => {
  assert.equal(
    validateResumeFile({ name: "Resume.pdf", type: "application/pdf", size: 0 }).code,
    "EMPTY_FILE"
  );
  assert.equal(
    validateResumeFile({
      name: "Resume.pdf",
      type: "application/pdf",
      size: MAX_RESUME_UPLOAD_BYTES,
    }).valid,
    true
  );
  assert.equal(
    validateResumeFile({
      name: "Resume.pdf",
      type: "application/pdf",
      size: MAX_RESUME_UPLOAD_BYTES + 1,
    }).code,
    "FILE_TOO_LARGE"
  );
});