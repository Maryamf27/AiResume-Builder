import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
const browser = await puppeteer.launch({ args: chromium.args, executablePath: await chromium.executablePath(), headless: true });
for (const [name,w,h] of [["mobile",390,780],["desktop",1280,800]]) {
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 2 });
  await page.goto("http://localhost:3111/tmp-select", { waitUntil: "networkidle0" });
  await page.click("button[role=combobox]");
  await new Promise(r=>setTimeout(r,300));
  await page.screenshot({ path: `/tmp/sel-${name}-open.png` });
  await page.keyboard.press("ArrowDown"); await page.keyboard.press("Enter");
  await new Promise(r=>setTimeout(r,200));
  console.log(name, "hidden value:", await page.$eval("input[name=status]", e=>e.value));
  await page.screenshot({ path: `/tmp/sel-${name}-closed.png` });
  await page.evaluate(()=>window.scrollTo(0, document.body.scrollHeight));
  await page.click("#low"); await new Promise(r=>setTimeout(r,300));
  await page.screenshot({ path: `/tmp/sel-${name}-flip.png` });
  await page.close();
}
await browser.close();
