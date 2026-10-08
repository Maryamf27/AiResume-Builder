import { existsSync } from "node:fs";
import { join } from "node:path";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_BODY_BYTES = 1_000_000;
const MAX_DOCUMENT_CHARS = 900_000;
const REQUIRED_POLICY =
  `content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:; form-action 'none'; base-uri 'none'"`;
const PDF_UNAVAILABLE_MESSAGE = "PDF generation is temporarily unavailable. Please try again or contact support.";

class PdfBrowserUnavailableError extends Error {}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

function getFilename(value: unknown): string {
  if (typeof value === "string" && /^[a-z0-9][a-z0-9-]{0,99}\.pdf$/i.test(value)) {
    return value;
  }
  return "resume.pdf";
}

async function launchBrowser() {
  const configuredPath = process.env.PDF_CHROME_EXECUTABLE_PATH?.trim();
  if (configuredPath) {
    if (!existsSync(configuredPath)) {
      throw new PdfBrowserUnavailableError("Configured PDF browser executable is unavailable.");
    }
    return puppeteer.launch({
      executablePath: configuredPath,
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }

  if (process.platform === "win32" || process.platform === "darwin") {
    const localBrowser = findDesktopBrowser();
    if (!localBrowser) {
      throw new PdfBrowserUnavailableError("No local Chrome or Edge installation was found.");
    }
    return puppeteer.launch({
      executablePath: localBrowser,
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }

  try {
    return await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: "shell",
    });
  } catch {
    throw new PdfBrowserUnavailableError("Bundled server Chromium could not be started.");
  }
}

function findDesktopBrowser(): string | undefined {
  const candidates = process.platform === "win32"
    ? [
        process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, "Google", "Chrome", "Application", "chrome.exe"),
        process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, "Google", "Chrome Beta", "Application", "chrome.exe"),
        process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, "Google", "Chrome Dev", "Application", "chrome.exe"),
        process.env.PROGRAMFILES && join(process.env.PROGRAMFILES, "Google", "Chrome", "Application", "chrome.exe"),
        process.env.PROGRAMFILES && join(process.env.PROGRAMFILES, "Google", "Chrome Beta", "Application", "chrome.exe"),
        process.env.PROGRAMFILES && join(process.env.PROGRAMFILES, "Google", "Chrome Dev", "Application", "chrome.exe"),
        process.env.ProgramW6432 && join(process.env.ProgramW6432, "Google", "Chrome", "Application", "chrome.exe"),
        process.env.ProgramW6432 && join(process.env.ProgramW6432, "Google", "Chrome Beta", "Application", "chrome.exe"),
        process.env.ProgramW6432 && join(process.env.ProgramW6432, "Google", "Chrome Dev", "Application", "chrome.exe"),
        process.env["PROGRAMFILES(X86)"] && join(process.env["PROGRAMFILES(X86)"], "Google", "Chrome", "Application", "chrome.exe"),
        process.env["PROGRAMFILES(X86)"] && join(process.env["PROGRAMFILES(X86)"], "Google", "Chrome Beta", "Application", "chrome.exe"),
        process.env["PROGRAMFILES(X86)"] && join(process.env["PROGRAMFILES(X86)"], "Google", "Chrome Dev", "Application", "chrome.exe"),
        process.env.PROGRAMFILES && join(process.env.PROGRAMFILES, "Microsoft", "Edge", "Application", "msedge.exe"),
        process.env.ProgramW6432 && join(process.env.ProgramW6432, "Microsoft", "Edge", "Application", "msedge.exe"),
        process.env["PROGRAMFILES(X86)"] && join(process.env["PROGRAMFILES(X86)"], "Microsoft", "Edge", "Application", "msedge.exe"),
      ]
    : [
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
      ];
  return candidates.find((candidate): candidate is string => Boolean(candidate && existsSync(candidate)));
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return Response.json({ error: "Expected a JSON PDF request." }, { status: 415 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return Response.json({ error: "The resume is too large to export." }, { status: 413 });
  }

  let payload: unknown;
  try {
    const body = await request.text();
    if (Buffer.byteLength(body, "utf8") > MAX_BODY_BYTES) {
      return Response.json({ error: "The resume is too large to export." }, { status: 413 });
    }
    payload = JSON.parse(body);
  } catch {
    return Response.json({ error: "The PDF request could not be read." }, { status: 400 });
  }

  const document = isRecord(payload) ? payload.document : null;
  if (
    typeof document !== "string" ||
    document.length > MAX_DOCUMENT_CHARS ||
    !document.startsWith("<!doctype html>") ||
    !document.includes(REQUIRED_POLICY)
  ) {
    return Response.json({ error: "The resume document is invalid or too large." }, { status: 400 });
  }

  const filename = getFilename(isRecord(payload) ? payload.filename : null);
  let browser: Awaited<ReturnType<typeof launchBrowser>> | null = null;

  try {
    try {
      browser = await launchBrowser();
    } catch {
      throw new PdfBrowserUnavailableError("PDF browser could not be started.");
    }
    const page = await browser.newPage();
    await page.setJavaScriptEnabled(false);
    await page.setRequestInterception(true);
    page.on("request", (pageRequest) => {
      const operation = pageRequest.url().startsWith("data:")
        ? pageRequest.continue()
        : pageRequest.abort("blockedbyclient");
      void operation.catch(() => undefined);
    });

    await page.setContent(document, { waitUntil: "load", timeout: 15_000 });
    await page.emulateMediaType("print");
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });

    if (!pdf || pdf.byteLength < 5 || Buffer.from(pdf.subarray(0, 5)).toString("ascii") !== "%PDF-") {
      throw new Error("PDF renderer returned invalid output.");
    }

    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(pdf.byteLength),
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof PdfBrowserUnavailableError) {
      console.error("Resume PDF browser is unavailable. Install Chrome/Edge locally or configure a valid PDF_CHROME_EXECUTABLE_PATH.");
      return Response.json({ error: PDF_UNAVAILABLE_MESSAGE }, { status: 503 });
    }
    console.error("Resume PDF generation failed.");
    return Response.json(
      { error: "Couldn't generate the PDF. Please try again." },
      { status: 500 }
    );
  } finally {
    await browser?.close().catch((error) => {
      console.error("PDF browser shutdown failed:", error);
    });
  }
}
