import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

const round = process.argv[2] ?? "round-1";
const baseURL = process.env.PROTOTYPE_BASE_URL ?? "http://127.0.0.1:4174/";
const outDir = path.resolve("audit/chatgpt-question-flow-2026-08-31", round);
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
  await page.getByRole("button", { name: "开始问帖" }).click();
  await page.getByRole("button", { name: "微信授权并继续" }).click();
  await page.getByTestId("reading-empty-state").waitFor({ state: "visible" });
  await page.getByRole("heading", { name: "登录后开始问帖", exact: true }).waitFor({ state: "hidden" });
  await page.waitForTimeout(350);

  const screen = page.getByTestId("device-screen");
  const box = await screen.boundingBox();
  if (!box || Math.abs(box.width - expected.width) > 1 || Math.abs(box.height - expected.height) > 1) {
    throw new Error(`${device}: expected ${expected.width}x${expected.height}, got ${box?.width}x${box?.height}`);
  }

  const readComposerLayout = () => page.evaluate(() => {
    const rect = (selector) => {
      const node = document.querySelector(selector);
      if (!(node instanceof HTMLElement)) return null;
      const box = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      return {
        left: box.left,
        right: box.right,
        top: box.top,
        bottom: box.bottom,
        width: box.width,
        height: box.height,
        display: style.display,
        position: style.position,
        transform: style.transform,
      };
    };
    return {
      composer: rect(".reading-composer"),
      inputShell: rect(".reading-input-shell"),
      textarea: rect(".reading-composer textarea"),
      send: rect(".reading-send"),
    };
  });

  const initialPath = path.join(outDir, `${device}-initial.png`);
  await screen.screenshot({ path: initialPath });
  captureLog.push({ device, state: "initial", path: initialPath, box, composerLayout: await readComposerLayout() });

  await page.getByRole("button", { name: "事业" }).click();
  await page.getByText(/我想再确认/).waitFor({ state: "visible", timeout: 3000 });
  const followUpPath = path.join(outDir, `${device}-follow-up.png`);
  await screen.screenshot({ path: followUpPath });
  captureLog.push({ device, state: "follow-up", path: followUpPath, box });

  const input = page.getByRole("textbox", { name: "向 AI 问事助手提问" });
  await input.fill("我更担心合作对象是否可靠。");
  await page.getByRole("button", { name: "发送" }).click();
  await page.locator(".fortune-answer-label").first().waitFor({ state: "visible", timeout: 3000 });
  const answerPath = path.join(outDir, `${device}-answer.png`);
  await screen.screenshot({ path: answerPath });
  captureLog.push({ device, state: "answer", path: answerPath, box, composerLayout: await readComposerLayout() });

  await page.getByRole("button", { name: "返回" }).click();
  await page.getByRole("navigation", { name: "小程序导航" })
    .getByRole("button", { name: "问帖" })
    .click();
  await page.getByTestId("reading-empty-state").waitFor({ state: "visible" });
  const freshMessageCount = await page.locator(".fortune-message").count();
  if (freshMessageCount !== 0) throw new Error(`${device}: re-entry kept ${freshMessageCount} messages`);

  await browser.close();
}

await fs.writeFile(
  path.join(outDir, "capture-log.json"),
  `${JSON.stringify({ baseURL, captureLog, consoleErrors }, null, 2)}\n`,
  "utf8",
);

if (consoleErrors.length) throw new Error(`Console errors: ${consoleErrors.join(" | ")}`);
console.log(`Captured ${captureLog.length} screenshots in ${outDir}`);
