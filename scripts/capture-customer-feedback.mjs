import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

const round = process.argv[2] ?? "round-1";
if (!["round-1", "round-2"].includes(round)) throw new Error("round must be round-1 or round-2");
const baseURL = process.env.PROTOTYPE_BASE_URL ?? "http://127.0.0.1:4174/";
const outDir = path.resolve("audit/customer-feedback-expansion-2026-08-28", round);
await fs.mkdir(outDir, { recursive: true });

const states = [
  ["home-top", async p => {}],
  ["home-collection", async p => { await p.locator('[data-testid="mobile-scroll"]').evaluate(e => e.scrollTop = 650); }],
  ["home-bottom", async p => { await p.locator('[data-testid="mobile-scroll"]').evaluate(e => e.scrollTop = e.scrollHeight); }],
  ["tree-archive", async p => { await p.getByRole("button", { name: "下一件藏品" }).first().click(); await p.waitForTimeout(220); await p.locator('.collection-card[data-active="true"]').getByRole("button", { name: "查看琼南一号认种沉香树档案" }).click(); }],
  ["industrial-park-paused", async p => { await p.getByRole("button", { name: "走进产业园" }).click(); await p.getByRole("button", { name: "播放产业园介绍" }).scrollIntoViewIfNeeded(); }],
  ["industrial-park-playing", async p => { await p.getByRole("button", { name: "走进产业园" }).click(); const play = p.getByRole("button", { name: "播放产业园介绍" }); await play.scrollIntoViewIfNeeded(); await play.click(); }],
  ["authenticity-article", async p => { await p.getByRole("button", { name: "如何快速辨别沉香手串的真假" }).click(); }],
  ["authorization-sheet", async p => { await p.getByRole("button", { name: "开始问帖" }).click(); }],
  ["profile", async p => { await p.getByRole("button", { name: "我的", exact: true }).click(); }],
];

for (const deviceName of ["iphone", "pixel-10"]) {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1200 }, locale: "zh-CN" });
  const page = await context.newPage();
  for (const [name, action] of states) {
    await page.goto(baseURL);
    await page.getByTestId("device-picker").click();
    await page.getByTestId(`device-option-${deviceName}`).click();
    await page.waitForTimeout(100);
    await page.addStyleTag({ content: ".mobile-cursor { display: none !important; }" });
    await action(page);
    await page.waitForTimeout(650);
    await page.mouse.move(1400, 1180);
    await page.screenshot({ path: path.join(outDir, `${deviceName}-${name}.png`), fullPage: false });
  }
  await browser.close();
}
console.log(`Captured ${states.length * 2} screenshots in ${outDir}`);
