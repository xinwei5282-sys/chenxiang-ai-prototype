import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
});
const outputDir = path.resolve("audit/home-selection-background-replacement-2026-08-28");
await fs.mkdir(outputDir, { recursive: true });

const page = await browser.newPage({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 1 });
const consoleErrors = [];
page.on("console", message => {
  if (message.type() === "error") consoleErrors.push(message.text());
});

await page.goto(process.env.PROTOTYPE_BASE_URL ?? "http://127.0.0.1:4174/");
await page.addStyleTag({ content: ".mobile-cursor { display: none !important; }" });
await page.getByTestId("device-picker").click();
await page.getByTestId("device-option-iphone").click();

const screen = page.getByTestId("device-screen");
await screen.waitFor({ state: "visible" });
const screenBox = await screen.boundingBox();
if (!screenBox || Math.abs(screenBox.width - 393) > 1 || Math.abs(screenBox.height - 852) > 1) {
  throw new Error(`Expected unscaled phone screen at 393 x 852, got ${screenBox?.width} x ${screenBox?.height}`);
}

const selection = page.locator('[data-home-section="home-selection"]');
await page.getByTestId("mobile-scroll").evaluate(node => {
  const section = node.querySelector('[data-home-section="home-selection"]');
  node.scrollTop = Math.max(0, section.offsetTop - 108);
});
await page.waitForTimeout(200);

const screenPath = path.join(outputDir, "selection-phone-screen.png");
const sectionPath = path.join(outputDir, "selection-section.png");
await screen.screenshot({ path: screenPath });
await selection.screenshot({ path: sectionPath });

const cardSources = await selection.locator(".selection-item-background").evaluateAll(images => images.map(image => ({
  src: image.getAttribute("src"),
  naturalWidth: image.naturalWidth,
  naturalHeight: image.naturalHeight,
  renderedWidth: image.getBoundingClientRect().width,
  renderedHeight: image.getBoundingClientRect().height,
})));

const board = await browser.newPage({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 1 });
const imageDataUrl = async filePath => `data:image/png;base64,${(await fs.readFile(filePath)).toString("base64")}`;
const sourceDir = "/Users/xinwei/Desktop/广东农垦/方案/广垦沉香甄选_4张背景图";
const sources = [
  ["手串收藏", path.join(sourceDir, "download.png")],
  ["香道礼盒", path.join(sourceDir, "e6dd3574-44aa-4bc5-8707-ba5bd010ddb3.png")],
  ["企业定制", path.join(sourceDir, "30668b2c-ae8d-42e6-83fb-c0567795350c.png")],
  ["沉香树认种", path.join(sourceDir, "cf28c989-90bc-4150-90ad-571e997f50e8.png")],
];
const sourceCards = await Promise.all(sources.map(async ([label, filePath]) => `<figure><figcaption>${label} · 新源图</figcaption><img src="${await imageDataUrl(filePath)}"></figure>`));
const implementationData = await imageDataUrl(sectionPath);
await board.setContent(`<style>
  * { box-sizing: border-box; }
  body { margin: 0; padding: 24px; background: #ece9e2; color: #26342d; font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif; }
  h1 { margin: 0 0 18px; font-size: 22px; }
  h2 { margin: 22px 0 12px; font-size: 16px; }
  .sources { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
  figure { margin: 0; padding: 12px; border-radius: 14px; background: white; box-shadow: 0 6px 18px rgba(45, 38, 29, .08); }
  figcaption { margin-bottom: 8px; font-size: 13px; font-weight: 650; }
  img { display: block; width: 100%; height: auto; border-radius: 10px; }
  .implementation { width: 620px; }
</style><h1>广垦沉香甄选 · 新背景图替换核对</h1><div class="sources">${sourceCards.join("")}</div><h2>iPhone 393 × 852 实际渲染</h2><figure class="implementation"><img src="${implementationData}"></figure>`);
const comparisonPath = path.join(outputDir, "selection-backgrounds-comparison.png");
await board.screenshot({ path: comparisonPath, fullPage: true });

await fs.writeFile(path.join(outputDir, "capture-metadata.json"), JSON.stringify({
  viewport: { width: 1440, height: 1200 },
  deviceScaleFactor: 1,
  screenCssSize: { width: screenBox.width, height: screenBox.height },
  cardSources,
  consoleErrors,
}, null, 2));

if (consoleErrors.length) throw new Error(`Console errors: ${consoleErrors.join(" | ")}`);
console.log(JSON.stringify({ outputDir, screenPath, sectionPath, comparisonPath, cardSources }, null, 2));
await browser.close();
