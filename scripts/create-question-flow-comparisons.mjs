import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

const round = process.argv[2] ?? "round-1";
const root = process.cwd();
const outDir = path.resolve("audit/chatgpt-question-flow-2026-08-31", round);
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;

const comparisons = [
  {
    name: "iphone-initial-comparison",
    title: "默认新对话 · iPhone 393 × 852",
    source: path.resolve(root, "reference/chatgpt-question-new-logo-selected.png"),
    implementation: path.join(outDir, "iphone-initial.png"),
  },
  {
    name: "iphone-answer-comparison",
    title: "连续消息流 · iPhone 393 × 852",
    source: path.resolve(root, "reference/chatgpt-question-conversation-selected.png"),
    implementation: path.join(outDir, "iphone-answer.png"),
  },
];

await fs.mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath });

for (const comparison of comparisons) {
  const [sourceBuffer, implementationBuffer] = await Promise.all([
    fs.readFile(comparison.source),
    fs.readFile(comparison.implementation),
  ]);
  const page = await browser.newPage({ viewport: { width: 850, height: 940 }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html>
    <html lang="zh-CN">
      <head>
        <meta charset="utf-8" />
        <style>
          * { box-sizing: border-box; }
          html, body { margin: 0; width: 850px; height: 940px; background: #ececec; font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif; }
          main { padding: 18px 16px 24px; }
          h1 { margin: 0 0 14px; color: #202020; font-size: 18px; line-height: 1.3; }
          .board { display: grid; grid-template-columns: repeat(2, 393px); gap: 16px; }
          figure { margin: 0; }
          figcaption { height: 30px; display: flex; align-items: center; color: #4d4d4d; font-size: 13px; font-weight: 650; }
          img { display: block; width: 393px; height: 852px; object-fit: fill; background: #fff; box-shadow: 0 0 0 1px rgba(0,0,0,.12); }
        </style>
      </head>
      <body>
        <main>
          <h1>${comparison.title}</h1>
          <section class="board">
            <figure><figcaption>设计参考</figcaption><img alt="设计参考" src="data:image/png;base64,${sourceBuffer.toString("base64")}" /></figure>
            <figure><figcaption>真实渲染</figcaption><img alt="真实渲染" src="data:image/png;base64,${implementationBuffer.toString("base64")}" /></figure>
          </section>
        </main>
      </body>
    </html>`);
  await page.screenshot({ path: path.join(outDir, `${comparison.name}.png`) });
  await page.close();
}

const focusComparisons = [
  {
    name: "iphone-initial-brand-focus",
    title: "品牌入口聚焦 · Logo / 标题 / 快捷主题",
    source: path.resolve(root, "reference/chatgpt-question-new-logo-selected.png"),
    implementation: path.join(outDir, "iphone-initial.png"),
    cropTop: 260,
    cropHeight: 320,
  },
  {
    name: "iphone-composer-focus",
    title: "底部输入聚焦 · 免责声明 / 输入框 / 发送",
    source: path.resolve(root, "reference/chatgpt-question-new-logo-selected.png"),
    implementation: path.join(outDir, "iphone-initial.png"),
    cropTop: 730,
    cropHeight: 122,
  },
  {
    name: "iphone-answer-message-focus",
    title: "对话聚焦 · 用户消息 / 主动追问 / 结构标签",
    source: path.resolve(root, "reference/chatgpt-question-conversation-selected.png"),
    implementation: path.join(outDir, "iphone-answer.png"),
    cropTop: 130,
    cropHeight: 570,
  },
];

for (const comparison of focusComparisons) {
  const [sourceBuffer, implementationBuffer] = await Promise.all([
    fs.readFile(comparison.source),
    fs.readFile(comparison.implementation),
  ]);
  const viewportHeight = comparison.cropHeight + 90;
  const page = await browser.newPage({ viewport: { width: 850, height: viewportHeight }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html>
    <html lang="zh-CN">
      <head>
        <meta charset="utf-8" />
        <style>
          * { box-sizing: border-box; }
          html, body { margin: 0; width: 850px; height: ${viewportHeight}px; background: #ececec; font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif; }
          main { padding: 14px 16px 18px; }
          h1 { margin: 0 0 10px; color: #202020; font-size: 17px; line-height: 1.3; }
          .board { display: grid; grid-template-columns: repeat(2, 393px); gap: 16px; }
          figure { margin: 0; }
          figcaption { height: 28px; display: flex; align-items: center; color: #4d4d4d; font-size: 13px; font-weight: 650; }
          .crop { width: 393px; height: ${comparison.cropHeight}px; overflow: hidden; background: #fff; box-shadow: 0 0 0 1px rgba(0,0,0,.12); }
          img { display: block; width: 393px; height: 852px; object-fit: fill; transform: translateY(-${comparison.cropTop}px); }
        </style>
      </head>
      <body>
        <main>
          <h1>${comparison.title}</h1>
          <section class="board">
            <figure><figcaption>设计参考</figcaption><div class="crop"><img alt="设计参考" src="data:image/png;base64,${sourceBuffer.toString("base64")}" /></div></figure>
            <figure><figcaption>真实渲染</figcaption><div class="crop"><img alt="真实渲染" src="data:image/png;base64,${implementationBuffer.toString("base64")}" /></div></figure>
          </section>
        </main>
      </body>
    </html>`);
  await page.screenshot({ path: path.join(outDir, `${comparison.name}.png`) });
  await page.close();
}

await browser.close();
console.log(`Created ${comparisons.length + focusComparisons.length} comparison boards in ${outDir}`);
