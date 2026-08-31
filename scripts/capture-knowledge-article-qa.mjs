import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

const outDir = path.resolve("audit/knowledge-wechat-article-2026-08-31/round-1");
const baseURL = process.env.PROTOTYPE_BASE_URL ?? "http://127.0.0.1:4174/";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
const devices = {
  iphone: { width: 393, height: 852 },
  "pixel-10": { width: 427, height: 952 },
};

await fs.mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath });
const consoleErrors = [];
const captures = [];

for (const [device, expected] of Object.entries(devices)) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 }, locale: "zh-CN" });
  page.on("console", message => { if (message.type() === "error") consoleErrors.push(`${device}: ${message.text()}`); });
  page.on("pageerror", error => consoleErrors.push(`${device}: ${error.message}`));

  await page.goto(baseURL);
  await page.getByTestId("device-picker").click();
  await page.getByTestId(`device-option-${device}`).click();
  await page.addStyleTag({ content: ".mobile-cursor { display: none !important; }" });

  const screen = page.getByTestId("device-screen");
  const box = await screen.boundingBox();
  if (!box || Math.abs(box.width - expected.width) > 1 || Math.abs(box.height - expected.height) > 1) {
    throw new Error(`${device}: expected ${expected.width}x${expected.height}, got ${box?.width}x${box?.height}`);
  }

  await page.getByRole("button", { name: "如何快速辨别沉香手串的真假" }).click();
  await page.getByTestId("flow-current").getByRole("heading", { name: "如何快速辨别沉香手串的真假", exact: true }).waitFor();
  await page.waitForTimeout(650);
  const authenticityTop = path.join(outDir, `${device}-authenticity-top.png`);
  await screen.screenshot({ path: authenticityTop });
  captures.push({ device, state: "authenticity-top", path: authenticityTop, box });

  const articleScroll = page.getByTestId("flow-current").locator('[data-testid="mobile-scroll"]');
  await articleScroll.evaluate(node => { node.scrollTop = node.scrollHeight; });
  await page.waitForTimeout(250);
  const authenticityBottom = path.join(outDir, `${device}-authenticity-bottom.png`);
  await screen.screenshot({ path: authenticityBottom });
  captures.push({ device, state: "authenticity-bottom", path: authenticityBottom, box });

  await page.getByRole("button", { name: "返回" }).click();
  await page.waitForTimeout(450);
  await page.getByRole("button", { name: "沉香手串如何日常保养" }).click();
  await page.getByTestId("flow-current").getByRole("heading", { name: "沉香手串如何日常保养", exact: true }).waitFor();
  await page.waitForTimeout(650);
  const careTop = path.join(outDir, `${device}-care-top.png`);
  await screen.screenshot({ path: careTop });
  captures.push({ device, state: "care-top", path: careTop, box });

  await page.close();
}

await browser.close();
await fs.writeFile(path.join(outDir, "capture-log.json"), `${JSON.stringify({ baseURL, captures, consoleErrors }, null, 2)}\n`, "utf8");
if (consoleErrors.length) throw new Error(`Console errors: ${consoleErrors.join(" | ")}`);
console.log(`Captured ${captures.length} knowledge article screenshots in ${outDir}`);
