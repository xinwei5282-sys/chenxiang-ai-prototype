import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

const baseURL = process.env.PROTOTYPE_BASE_URL ?? "http://127.0.0.1:4174/";
const outDir = path.resolve("audit/care-editorial-manual-2026-08-31");
await fs.mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH });
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 }, locale: "zh-CN" });
const consoleErrors = [];
page.on("console", message => { if (message.type() === "error") consoleErrors.push(message.text()); });
for (const device of ["iphone", "pixel-10"]) {
  await page.goto(baseURL);
  await page.getByTestId("device-picker").click();
  await page.getByTestId(`device-option-${device}`).click();
  await page.addStyleTag({ content: ".mobile-cursor { display: none !important; }" });
  await page.getByRole("button", { name: "佩戴养护" }).click();
  await page.waitForTimeout(450);
  const screen = page.getByTestId("device-screen");
  await screen.screenshot({ path: path.join(outDir, `${device}-care-top.png`) });
  await page.getByTestId("flow-current").last().locator('[data-testid="mobile-scroll"]').evaluate(node => { node.scrollTop = node.scrollHeight; });
  await page.waitForTimeout(250);
  await screen.screenshot({ path: path.join(outDir, `${device}-care-bottom.png`) });
}
await browser.close();
if (consoleErrors.length) throw new Error(`Console errors: ${consoleErrors.join(" | ")}`);
console.log(`Captured 4 screenshots in ${outDir}`);
