import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

const round = process.argv[2] ?? "round-1";
const baseURL = process.env.PROTOTYPE_BASE_URL ?? "http://127.0.0.1:4174/";
const outDir = path.resolve("audit/profile-simple-list-2026-08-31", round);
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;

await fs.mkdir(outDir, { recursive: true });

const deviceExpectations = {
  iphone: { width: 393, height: 852 },
  "pixel-10": { width: 427, height: 952 },
};

const consoleErrors = [];
const captureLog = [];

for (const [device, expected] of Object.entries(deviceExpectations)) {
  const browser = await chromium.launch({ headless: true, executablePath });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1200 }, locale: "zh-CN" });
  const page = await context.newPage();
  page.on("console", message => {
    if (message.type() === "error") consoleErrors.push(`${device}: ${message.text()}`);
  });
  page.on("pageerror", error => consoleErrors.push(`${device}: ${error.message}`));

  await page.goto(baseURL);
  await page.getByTestId("device-picker").click();
  await page.getByTestId(`device-option-${device}`).click();
  await page.addStyleTag({ content: ".mobile-cursor { display: none !important; }" });
  await page.getByRole("navigation", { name: "小程序导航" }).getByRole("button", { name: "我的" }).click();
  await page.locator(".profile-account-banner").waitFor({ state: "visible" });
  await page.waitForTimeout(350);

  const screen = page.getByTestId("device-screen");
  const box = await screen.boundingBox();
  if (!box || Math.abs(box.width - expected.width) > 1 || Math.abs(box.height - expected.height) > 1) {
    throw new Error(`${device}: expected ${expected.width}x${expected.height}, got ${box?.width}x${box?.height}`);
  }

  const layout = await page.getByTestId("flow-current").last().evaluate(current => {
    const rect = selector => {
      const node = current.querySelector(selector);
      if (!(node instanceof HTMLElement)) return null;
      const box = node.getBoundingClientRect();
      return { left: box.left, right: box.right, top: box.top, bottom: box.bottom, width: box.width, height: box.height };
    };
    const rows = [...current.querySelectorAll(".profile-action-row")].map(node => {
      const box = node.getBoundingClientRect();
      return { label: node.getAttribute("aria-label"), left: box.left, right: box.right, top: box.top, bottom: box.bottom, width: box.width, height: box.height };
    });
    return {
      account: rect(".profile-account-banner"),
      list: rect(".profile-action-list"),
      tabs: rect(".mini-tabs"),
      rows,
    };
  });

  const signedOutPath = path.join(outDir, `${device}-profile-signed-out.png`);
  await screen.screenshot({ path: signedOutPath });
  captureLog.push({ device, state: "signed-out", path: signedOutPath, box, layout });

  for (const [label, heading] of [["本串证书", "证书与溯源"], ["芯片识别说明", "芯片识别说明"]]) {
    await page.getByRole("button", { name: label, exact: true }).click();
    await page.getByRole("heading", { name: heading, exact: true }).waitFor({ state: "visible" });
    await page.getByRole("button", { name: "返回" }).click();
    await page.locator(".profile-account-banner").waitFor({ state: "visible" });
  }

  await page.getByRole("button", { name: "微信授权登录" }).click();
  await page.getByRole("heading", { name: "微信授权登录", exact: true }).waitFor({ state: "visible" });
  await page.waitForTimeout(450);
  const authSheetPath = path.join(outDir, `${device}-profile-authorization-sheet.png`);
  await screen.screenshot({ path: authSheetPath });
  captureLog.push({ device, state: "authorization-sheet", path: authSheetPath, box });
  await page.getByRole("button", { name: "确认微信授权" }).click();
  await page.getByText("已完成微信授权", { exact: true }).waitFor({ state: "visible" });
  await page.getByRole("heading", { name: "微信授权登录", exact: true }).waitFor({ state: "hidden" });
  await page.waitForTimeout(350);
  const signedInPath = path.join(outDir, `${device}-profile-signed-in.png`);
  await screen.screenshot({ path: signedInPath });
  captureLog.push({ device, state: "signed-in", path: signedInPath, box });

  await browser.close();
}

await fs.writeFile(
  path.join(outDir, "capture-log.json"),
  `${JSON.stringify({ baseURL, captureLog, consoleErrors, interactions: ["authorization", "certificate", "chip help"] }, null, 2)}\n`,
  "utf8",
);

if (consoleErrors.length) throw new Error(`Console errors: ${consoleErrors.join(" | ")}`);
console.log(`Captured ${captureLog.length} Profile screenshots in ${outDir}`);
