import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

const outDir = path.resolve("audit/multi-certificate-list-2026-08-31/round-1");
const baseURL = process.env.PROTOTYPE_BASE_URL ?? "http://127.0.0.1:4174/";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
const devices = {
  iphone: { width: 393, height: 852 },
  "pixel-10": { width: 427, height: 952 },
};

await fs.mkdir(outDir, { recursive: true });
const consoleErrors = [];
const captures = [];

for (const [device, expected] of Object.entries(devices)) {
  const browser = await chromium.launch({ headless: true, executablePath });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 }, locale: "zh-CN" });
  page.on("console", message => { if (message.type() === "error") consoleErrors.push(`${device}: ${message.text()}`); });
  page.on("pageerror", error => consoleErrors.push(`${device}: ${error.message}`));

  await page.goto(baseURL);
  await page.getByTestId("device-picker").click();
  await page.getByTestId(`device-option-${device}`).click();
  await page.addStyleTag({ content: ".mobile-cursor { display: none !important; }" });
  await page.getByRole("navigation", { name: "小程序导航" }).getByRole("button", { name: "我的" }).click();
  await page.getByRole("button", { name: "本串证书" }).click();
  await page.getByRole("heading", { name: "我的手串", exact: true }).waitFor();
  await page.waitForTimeout(350);

  const screen = page.getByTestId("device-screen");
  const box = await screen.boundingBox();
  if (!box || Math.abs(box.width - expected.width) > 1 || Math.abs(box.height - expected.height) > 1) {
    throw new Error(`${device}: expected ${expected.width}x${expected.height}, got ${box?.width}x${box?.height}`);
  }

  const listPath = path.join(outDir, `${device}-certificate-list.png`);
  await screen.screenshot({ path: listPath });
  captures.push({ device, state: "certificate-list", path: listPath, box });

  await page.getByRole("button", { name: /琼南蜜韵沉香手串.*CX-2024-116/ }).click();
  await page.getByText("CX-2024-116", { exact: true }).waitFor();
  await page.waitForTimeout(650);
  const detailPath = path.join(outDir, `${device}-certificate-detail-second.png`);
  await screen.screenshot({ path: detailPath });
  captures.push({ device, state: "certificate-detail-second", path: detailPath, box });

  await page.getByRole("button", { name: "返回" }).click();
  await page.getByRole("heading", { name: "我的手串", exact: true }).waitFor();
  await browser.close();
}

await fs.writeFile(path.join(outDir, "capture-log.json"), `${JSON.stringify({ baseURL, captures, consoleErrors }, null, 2)}\n`, "utf8");
if (consoleErrors.length) throw new Error(`Console errors: ${consoleErrors.join(" | ")}`);
console.log(`Captured ${captures.length} multi-certificate screenshots in ${outDir}`);
