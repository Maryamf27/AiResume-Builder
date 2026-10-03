import mammoth from "mammoth";
import { convert } from "html-to-text";
import { PDFParse } from "pdf-parse";
import { MAX_RESUME_UPLOAD_BYTES, validateResumeFile } from "@/lib/resume/extraction/validation";
import type {
  ResumeExtractionErrorCode,
  ResumeExtractionResult,
  ResumeFileType,
} from "@/lib/resume/extraction/types";

export const runtime = "nodejs";

const MAX_MULTIPART_OVERHEAD_BYTES = 256 * 1024;
const MAX_REQUEST_BYTES = MAX_RESUME_UPLOAD_BYTES + MAX_MULTIPART_OVERHEAD_BYTES;
const MAX_EXTRACTED_TEXT_CHARS = 300_000;

function failure(
  code: ResumeExtractionErrorCode,
  message: string,
  status: number
): Response {
  const result: ResumeExtractionResult = { success: false, code, message };
  return Response.json(result, { status });
}

function safeFileName(name: string): string {
  const baseName = name.split(/[\\/]/).pop() ?? "resume";
  return baseName.replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 180) || "resume";
}

function cleanText(text: string): string {
  return text
    .replace(/\u0000/g, "")
    .replace(/\r\n?/g, "\n")
    .replace(/[\t ]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function hasPdfSignature(bytes: Uint8Array): boolean {
  const header = Buffer.from(bytes.subarray(0, Math.min(bytes.length, 1024))).toString("latin1");
  return header.includes("%PDF-");
}

function hasZipSignature(bytes: Uint8Array): boolean {
  return bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04;
}

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const parser = new PDFParse({ data: bytes, isEvalSupported: false, useWorkerFetch: false });
  try {
    const result = await parser.getText();
    return cleanText(result.text);
  } finally {
    await parser.destroy();
  }
}

async function extractDocxText(bytes: Uint8Array): Promise<string> {
  const result = await mammoth.convertToHtml(
    { buffer: Buffer.from(bytes) },
    { externalFileAccess: false }
  );
  const text = convert(result.value, {
    wordwrap: false,
    selectors: [
      {
        selector: "h1, h2, h3, h4, h5, h6",
        options: { leadingLineBreaks: 2, trailingLineBreaks: 1, uppercase: false },
      },
      { selector: "p", options: { leadingLineBreaks: 1, trailingLineBreaks: 1 } },
      { selector: "ul", options: { itemPrefix: "- " } },
      { selector: "ol", options: { itemPrefix: "1. " } },
    ],
  });
  return cleanText(text);
}

function noTextMessage(fileType: ResumeFileType): string {
  return fileType === "pdf"
    ? "No readable text was found in this PDF. It may be scanned or image-based."
    : "No readable text was found in this DOCX file.";
}

async function readBoundedBody(request: Request): Promise<Buffer | null> {
  const reader = request.body?.getReader();
  if (!reader) return Buffer.alloc(0);

  const chunks: Buffer[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > MAX_REQUEST_BYTES) {
        await reader.cancel();
        return null;
      }
      chunks.push(Buffer.from(value));
    }
  } finally {
    reader.releaseLock();
  }

  return Buffer.concat(chunks, totalBytes);
}

export async function POST(request: Request): Promise<Response> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("multipart/form-data")) {
    return failure("INVALID_REQUEST", "Choose a resume file to continue.", 400);
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (
    Number.isFinite(contentLength) &&
    contentLength > MAX_REQUEST_BYTES
  ) {
    return failure("FILE_TOO_LARGE", "File size must be 10 MB or less.", 413);
  }

  let requestBody: Buffer | null;
  try {
    requestBody = await readBoundedBody(request);
  } catch {
    return failure("INVALID_REQUEST", "The uploaded file could not be read. Please try again.", 400);
  }
  if (!requestBody) {
    return failure("FILE_TOO_LARGE", "File size must be 10 MB or less.", 413);
  }

  let formData: FormData;
  try {
    const formBody = new ArrayBuffer(requestBody.byteLength);
    new Uint8Array(formBody).set(requestBody);
    formData = await new Request(request.url, {
      method: "POST",
      headers: request.headers,
      body: formBody,
    }).formData();
  } catch {
    return failure("INVALID_REQUEST", "The uploaded file could not be read. Please try again.", 400);
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return failure("INVALID_REQUEST", "Choose a resume file to continue.", 400);
  }

  const validation = validateResumeFile(file);
  if (!validation.valid) {
    const status = validation.code === "FILE_TOO_LARGE" ? 413 : 400;
    return failure(validation.code, validation.message, status);
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const fileName = safeFileName(file.name);
  const { fileType } = validation;
  const hasExpectedSignature =
    fileType === "pdf" ? hasPdfSignature(bytes) : hasZipSignature(bytes);

  if (!hasExpectedSignature) {
    return failure(
      "INVALID_FILE",
      `This ${fileType === "pdf" ? "PDF" : "DOCX"} file appears to be invalid or corrupted.`,
      422
    );
  }

  try {
    const text = fileType === "pdf"
      ? await extractPdfText(bytes)
      : await extractDocxText(bytes);

    if (!text) {
      return failure("NO_EXTRACTABLE_TEXT", noTextMessage(fileType), 422);
    }
    if (text.length > MAX_EXTRACTED_TEXT_CHARS) {
      return failure(
        "TEXT_TOO_LARGE",
        "This document contains too much text to preview. Please choose a shorter resume.",
        413
      );
    }

    const result: ResumeExtractionResult = {
      success: true,
      fileName,
      fileType,
      text,
    };
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Resume text extraction failed.", {
      fileType,
      errorName: error instanceof Error ? error.name : "UnknownError",
    });
    return failure(
      "EXTRACTION_FAILED",
      `Unable to extract text from this ${fileType === "pdf" ? "PDF" : "DOCX"}. The file may be damaged.`,
      422
    );
  }
}