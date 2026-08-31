import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
});
const outputDir = path.resolve("audit/customer-feedback-expansion-2026-08-28/round-3");
await fs.mkdir(outputDir, { recursive: true });

const page = await browser.newPage({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 1 });
const consoleErrors = [];
page.on("console", message => {
  if (message.type() === "error") consoleErrors.push(message.text());
});

await page.goto(process.env.PROTOTYPE_BASE_URL ?? "http://127.0.0.1:4174/");
await page.addStyleTag({ content: ".mobile-cursor { display: none !important; }" });

for (const device of ["iphone", "pixel-10"]) {
  await page.getByTestId("device-picker").click();
  await page.getByTestId(`device-option-${device}`).click();
  await page.getByTestId("mobile-scroll").evaluate(node => { node.scrollTop = 0; });
  await page.waitForTimeout(120);
  await page.locator(".mini-home-body").screenshot({ path: path.join(outputDir, `home-content-alignment-${device}.png`) });
  const selection = page.locator('[data-home-section="home-selection"]');
  await selection.waitFor({ state: "visible" });
  await page.getByTestId("mobile-scroll").evaluate(node => {
    const section = node.querySelector('[data-home-section="home-selection"]');
    node.scrollTop = Math.max(0, section.offsetTop - 110);
  });
  await page.waitForTimeout(120);
  await selection.screenshot({ path: path.join(outputDir, `selection-implementation-${device}.png`) });
  const services = page.locator('[data-home-section="home-services"]');
  await page.getByTestId("mobile-scroll").evaluate(node => {
    const section = node.querySelector('[data-home-section="home-services"]');
    node.scrollTop = Math.max(0, section.offsetTop - 120);
  });
  await page.waitForTimeout(120);
  await services.screenshot({ path: path.join(outputDir, `services-one-row-${device}.png`) });
  const park = page.locator('[data-home-section="home-park"]');
  await page.getByTestId("mobile-scroll").evaluate(node => {
    const section = node.querySelector('[data-home-section="home-park"]');
    node.scrollTop = Math.max(0, section.offsetTop - 140);
  });
  await page.waitForTimeout(120);
  await park.screenshot({ path: path.join(outputDir, `park-banner-${device}.png`) });
  const knowledge = page.locator('[data-home-section="home-knowledge"]');
  await page.getByTestId("mobile-scroll").evaluate(node => {
    const section = node.querySelector('[data-home-section="home-knowledge"]');
    node.scrollTop = Math.max(0, section.offsetTop - 140);
  });
  await page.waitForTimeout(120);
  await knowledge.screenshot({ path: path.join(outputDir, `knowledge-list-${device}.png`) });
}

const reference = await browser.newPage({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 1 });
await reference.goto(process.env.SELECTION_REFERENCE_URL ?? "http://localhost:62702/");
const selectedMock = reference.locator('[data-choice="b"] .phone-slice');
await selectedMock.waitFor({ state: "visible" });
await selectedMock.screenshot({ path: path.join(outputDir, "selection-reference-b.png") });

const imageDataUrl = async filePath => `data:image/png;base64,${(await fs.readFile(filePath)).toString("base64")}`;
const captureComparison = async ({ title, referenceLabel, referencePath, implementationLabel, implementationPath, outputPath }) => {
  const [referenceData, implementationData] = await Promise.all([imageDataUrl(referencePath), imageDataUrl(implementationPath)]);
  await reference.setContent(`<style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 24px; background: #ece9e2; color: #26342d; font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif; }
    h1 { margin: 0 0 18px; font-size: 20px; }
    main { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; align-items: start; }
    figure { margin: 0; padding: 14px; border-radius: 14px; background: white; box-shadow: 0 6px 18px rgba(45, 38, 29, .08); }
    figcaption { margin-bottom: 10px; font-size: 13px; font-weight: 650; }
    img { display: block; width: 100%; height: auto; }
  </style><h1>${title}</h1><main><figure><figcaption>${referenceLabel}</figcaption><img src="${referenceData}"></figure><figure><figcaption>${implementationLabel}</figcaption><img src="${implementationData}"></figure></main>`);
  await reference.screenshot({ path: outputPath, fullPage: true });
};

await captureComparison({
  title: "广垦沉香甄选 · 参考与实现",
  referenceLabel: "客户效果图",
  referencePath: path.join(outputDir, "selection-reference-b.png"),
  implementationLabel: "iPhone 实现",
  implementationPath: path.join(outputDir, "selection-implementation-iphone.png"),
  outputPath: path.join(outputDir, "selection-side-by-side.png"),
});
await captureComparison({
  title: "源头产业园 · 参考与实现",
  referenceLabel: "客户版式参考",
  referencePath: "/Users/xinwei/Library/Containers/com.tencent.xinWeChat/Data/Documents/xwechat_files/wpfk1253s5_6b99/temp/RWTemp/2026-08/9e20f478899dc29eb19741386f9343c8/4f39c5649a89695757dc8114e4303765.png",
  implementationLabel: "iPhone 实现（正式园区背景）",
  implementationPath: path.join(outputDir, "park-banner-iphone.png"),
  outputPath: path.join(outputDir, "park-side-by-side.png"),
});
await captureComparison({
  title: "首页服务入口 · 参考与实现",
  referenceLabel: "客户版式参考",
  referencePath: "/Users/xinwei/Library/Containers/com.tencent.xinWeChat/Data/Documents/xwechat_files/wpfk1253s5_6b99/temp/RWTemp/2026-08/9e20f478899dc29eb19741386f9343c8/0a75ec5db2135e883052704498506071.png",
  implementationLabel: "iPhone 实现（四项同排）",
  implementationPath: path.join(outputDir, "services-one-row-iphone.png"),
  outputPath: path.join(outputDir, "services-side-by-side.png"),
});
await captureComparison({
  title: "沉香小知识 · 参考与实现",
  referenceLabel: "客户版式参考",
  referencePath: "/Users/xinwei/Library/Containers/com.tencent.xinWeChat/Data/Documents/xwechat_files/wpfk1253s5_6b99/temp/RWTemp/2026-08/9e20f478899dc29eb19741386f9343c8/f0bf37a715d777ada7788fa14ed8ef58.png",
  implementationLabel: "iPhone 实现（无行尾箭头）",
  implementationPath: path.join(outputDir, "knowledge-list-iphone.png"),
  outputPath: path.join(outputDir, "knowledge-side-by-side.png"),
});

if (consoleErrors.length) throw new Error(`Console errors: ${consoleErrors.join(" | ")}`);
console.log(JSON.stringify({ outputDir, consoleErrors: consoleErrors.length }));
await browser.close();
