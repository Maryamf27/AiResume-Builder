import { existsSync } from "node:fs";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_BODY_BYTES = 1_000_000;
const MAX_DOCUMENT_CHARS = 900_000;
const REQUIRED_POLICY =
  `content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:; form-action 'none'; base-uri 'none'"`;

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
  const configuredPath = process.env.PDF_CHROME_EXECUTABLE_PATH;
  const windowsChromePaths = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  ];
  const localPath = configuredPath ??
    (process.platform === "win32" ? windowsChromePaths.find(existsSync) : undefined);

  if (localPath && !existsSync(localPath)) {
    throw new Error("The configured PDF browser executable was not found.");
  }

  if (localPath) {
    return puppeteer.launch({
      executablePath: localPath,
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }

  return puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: "shell",
  });
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
    browser = await launchBrowser();
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
    console.error("Resume PDF generation failed:", error);
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