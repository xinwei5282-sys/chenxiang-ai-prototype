import { chromium } from "@playwright/test";
import path from "node:path";

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 1 });
const consoleErrors = [];
page.on("console", message => {
  if (message.type() === "error") consoleErrors.push(message.text());
});
await page.goto(process.env.PROTOTYPE_BASE_URL ?? "http://127.0.0.1:4174/");
await page.getByTestId("device-picker").click();
await page.getByTestId("device-option-iphone").click();
await page.addStyleTag({ content: ".mobile-cursor { display: none !important; }" });
const screen = page.getByTestId("device-screen");
await screen.waitFor({ state: "visible" });
const box = await screen.boundingBox();
if (!box || Math.abs(box.width - 393) > 1 || Math.abs(box.height - 852) > 1) {
  throw new Error(`Expected 393 x 852 phone screen, got ${box?.width} x ${box?.height}`);
}
const output = path.resolve("audit/customer-feedback-expansion-2026-08-28/round-2/iphone-home-banner-screen.png");
await screen.screenshot({ path: output });
if (consoleErrors.length) throw new Error(`Console errors: ${consoleErrors.join(" | ")}`);
console.log(JSON.stringify({ output, width: box.width, height: box.height, consoleErrors: consoleErrors.length }));
await browser.close();
