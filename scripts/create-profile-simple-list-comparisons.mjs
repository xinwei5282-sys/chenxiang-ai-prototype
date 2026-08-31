import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

const round = process.argv[2] ?? "round-1";
const root = process.cwd();
const outDir = path.resolve("audit/profile-simple-list-2026-08-31", round);
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
const source = path.resolve(root, "reference/profile-simple-list-selected.png");
const implementation = path.join(outDir, "iphone-profile-signed-out.png");

const [sourceBuffer, implementationBuffer] = await Promise.all([
  fs.readFile(source),
  fs.readFile(implementation),
]);

const browser = await chromium.launch({ headless: true, executablePath });

const fullPage = await browser.newPage({ viewport: { width: 850, height: 930 }, deviceScaleFactor: 1 });
await fullPage.setContent(`<!doctype html>
  <html lang="zh-CN">
    <head>
      <meta charset="utf-8" />
      <style>
        * { box-sizing: border-box; }
        html, body { margin: 0; width: 850px; height: 930px; background: #ecebe7; font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif; }
        main { padding: 16px; }
        h1 { margin: 0 0 10px; color: #242724; font-size: 18px; line-height: 1.3; }
        .board { display: grid; grid-template-columns: repeat(2, 393px); gap: 16px; }
        figure { margin: 0; }
        figcaption { height: 28px; display: flex; align-items: center; color: #555b55; font-size: 13px; font-weight: 650; }
        img { display: block; width: 393px; height: 852px; object-fit: fill; background: #fff; box-shadow: 0 0 0 1px rgba(0,0,0,.12); }
      </style>
    </head>
    <body>
      <main>
        <h1>我的 · 单列账户清单 · iPhone 393 × 852</h1>
        <section class="board">
          <figure><figcaption>设计参考</figcaption><img alt="设计参考" src="data:image/png;base64,${sourceBuffer.toString("base64")}" /></figure>
          <figure><figcaption>真实渲染</figcaption><img alt="真实渲染" src="data:image/png;base64,${implementationBuffer.toString("base64")}" /></figure>
        </section>
      </main>
    </body>
  </html>`);
await fullPage.screenshot({ path: path.join(outDir, "iphone-profile-full-comparison.png") });
await fullPage.close();

const focusHeight = 560;
const focusPage = await browser.newPage({ viewport: { width: 850, height: focusHeight + 78 }, deviceScaleFactor: 1 });
await focusPage.setContent(`<!doctype html>
  <html lang="zh-CN">
    <head>
      <meta charset="utf-8" />
      <style>
        * { box-sizing: border-box; }
        html, body { margin: 0; width: 850px; height: ${focusHeight + 78}px; background: #ecebe7; font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif; }
        main { padding: 14px 16px; }
        h1 { margin: 0 0 8px; color: #242724; font-size: 17px; line-height: 1.3; }
        .board { display: grid; grid-template-columns: repeat(2, 393px); gap: 16px; }
        figure { margin: 0; }
        figcaption { height: 26px; display: flex; align-items: center; color: #555b55; font-size: 13px; font-weight: 650; }
        .crop { width: 393px; height: ${focusHeight}px; overflow: hidden; background: #fff; box-shadow: 0 0 0 1px rgba(0,0,0,.12); }
        img { display: block; width: 393px; height: 852px; object-fit: fill; }
        .source { transform: translateY(-32px); }
        .implementation { transform: translateY(-112px); }
      </style>
    </head>
    <body>
      <main>
        <h1>账号与四行入口聚焦</h1>
        <section class="board">
          <figure><figcaption>设计参考</figcaption><div class="crop"><img class="source" alt="设计参考" src="data:image/png;base64,${sourceBuffer.toString("base64")}" /></div></figure>
          <figure><figcaption>真实渲染</figcaption><div class="crop"><img class="implementation" alt="真实渲染" src="data:image/png;base64,${implementationBuffer.toString("base64")}" /></div></figure>
        </section>
      </main>
    </body>
  </html>`);
await focusPage.screenshot({ path: path.join(outDir, "iphone-profile-content-focus-comparison.png") });
await focusPage.close();

await browser.close();
console.log(`Created Profile comparison boards in ${outDir}`);

