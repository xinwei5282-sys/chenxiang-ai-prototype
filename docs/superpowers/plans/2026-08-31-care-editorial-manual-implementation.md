# 佩戴养护编辑手册 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将已确认的 2 号视觉稿落地为包含七条完整养护内容、可滚动且适配 iPhone/Pixel 的小程序二级页。

**Architecture:** 保留现有 `FlowStack → careScreen → MobileScroll` 页面结构与受保护的移动运行时，仅重组 `careScreen` 的应用内容，并新增养护页专属 CSS。Playwright 用例先锁定七条内容、连续正文结构、题图与返回行为，再以最小实现满足这些约束。

**Tech Stack:** React 19、TypeScript、Vite 8、项目移动运行时、CSS、Playwright 1.61。

**Spec:** `docs/superpowers/specs/2026-08-31-care-editorial-manual-design.md`

## Global Constraints

- 选定视觉源固定为 `reference/care-editorial-manual-selected.png`。
- 只修改 `src/Prototype.tsx`、`src/prototype.css` 与相关 Playwright 用例；不得修改受保护运行时文件。
- 七条客户内容顺序固定：化学品、避水、避高温、密封存放、表面/香气状态处理、清洁、日常盘护。
- 页面不增加卡片堆叠、折叠正文、营销 CTA、医疗功效或新的依赖。
- 当前 React 需求原型只实现静态成功阅读态，不新增内容接口、缓存或错误态模拟。
- 复用 `/assets/home-reference/feature-bracelet-3d.png`，不新增 CSS 手绘图或内联 SVG。
- 项目当前不在 Git 仓库中；执行阶段不得运行无效的 `git commit`，改为在每个任务末尾记录验证结果。

---

### Task 1: 锁定养护页内容与结构契约

**Files:**
- Modify: `tests/prototype-h5.spec.ts:617-625`
- Test: `tests/prototype-h5.spec.ts`

**Interfaces:**
- Consumes: 首页中可访问名称为 `佩戴养护` 的服务按钮，以及现有 `FlowStack` 返回按钮。
- Produces: `.care-editorial-hero`、`.care-guide-list`、七个 `.care-guide-row` 和 `.care-reminder` 的可测试页面契约。

- [ ] **Step 1: 将旧的三条内容测试改为七则编辑手册的失败测试**

```ts
test("care page presents the selected seven-part editorial guide", async ({ page }) => {
  await page.getByRole("button", { name: "佩戴养护" }).click();
  const current = page.getByTestId("flow-current");

  await expect(current.getByRole("heading", { name: "七件小事，让香气陪你更久" })).toBeVisible();
  await expect(current.getByRole("img", { name: "沉香手串日常养护" })).toHaveAttribute(
    "src",
    "/assets/home-reference/feature-bracelet-3d.png",
  );

  const guide = current.locator(".care-guide-list");
  await expect(guide.locator(".care-guide-row")).toHaveCount(7);
  for (const title of [
    "远离化学品",
    "避水与护肤品",
    "避高温与油烟",
    "密封独立存放",
    "表面与香气状态处理",
    "轻柔清洁",
    "日常盘护",
  ]) await expect(guide.getByRole("heading", { name: title })).toBeVisible();

  await expect(current.locator(".care-reminder")).toContainText("温和养护");
  await expect(current.locator(".care-guide-row").first()).toHaveText(/01/);
  await expect(current.locator(".care-guide-row").last()).toHaveText(/07/);
  await page.getByRole("button", { name: "返回" }).click();
  await expect(page.getByTestId("flow-current")).toHaveAttribute("data-flow-screen", "home");
});
```

- [ ] **Step 2: 运行聚焦用例，确认它因新结构尚不存在而失败**

Run:

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/Users/xinwei/.cache/puppeteer/chrome-headless-shell/mac_arm-148.0.7778.97/chrome-headless-shell-mac-arm64/chrome-headless-shell npx playwright test tests/prototype-h5.spec.ts --grep "selected seven-part editorial guide"
```

Expected: FAIL，首个失败点为找不到标题 `七件小事，让香气陪你更久` 或 `.care-guide-list`。

- [ ] **Step 3: 记录测试失败证据**

在执行日志中记录失败断言和命令退出码；此项目没有 Git 仓库，不执行提交。

---

### Task 2: 实现七则编辑式养护页

**Files:**
- Modify: `src/Prototype.tsx:870`
- Modify: `src/prototype.css:213-215,251-254`
- Test: `tests/prototype-h5.spec.ts`

**Interfaces:**
- Consumes: Task 1 定义的 class 与可访问名称；现有 `TopBar`、`MobileScroll`、`article-content` 和 CSS 变量 `--green`、`--warm`、`--line`、`--paper`。
- Produces: `careGuidelines: readonly { title: string; body: string }[]` 与可滚动的 `careScreen` 页面。

- [ ] **Step 1: 在 `careScreen` 前定义七条内容常量**

```tsx
const careGuidelines = [
  { title: "远离化学品", body: "避免接触洗涤剂、酒精、香水、花露水等化学品，以免影响表面状态与原有香气。" },
  { title: "避水与护肤品", body: "洗澡、洗手、喷香水或涂护肤品前先取下手串；遇水或汗液后，部分手串可能出现发白迹象。" },
  { title: "避高温与油烟", body: "远离油烟、高温、暖气与长时间阳光直射，避免油脂挥发或内部结构受损。" },
  { title: "密封独立存放", body: "不佩戴时，用密封袋或密封罐单独存放，防止串味并保持原有香气。" },
  { title: "表面与香气状态处理", body: "若表面状态或香气发生变化，可用干净毛巾蘸少量温矿泉水或纯净水轻擦，随后阴干，再放入养香瓶静置一周以上。" },
  { title: "轻柔清洁", body: "若沾染污渍，用稍湿润的软布轻轻擦拭干净，然后自然阴干。" },
  { title: "日常盘护", body: "日常可用棉手套或丝袜轻揉几分钟，之后放入养香瓶保养。" },
] as const;
```

- [ ] **Step 2: 用编辑式题图和连续编号正文替换旧 `careScreen` 内容**

```tsx
const careScreen = (keyboard: ReturnType<typeof useKeyboard>): FlowScreen => ({
  id: "care",
  header: flow => <TopBar title="佩戴养护" back={flow.pop} keyboard={keyboard} />,
  headerHeight: 54,
  render: () => <MobileScroll className="app-screen">
    <main className="screen-content article-content care-editorial-page" data-product-doc-page="care">
      <section className="care-editorial-hero">
        <div className="care-editorial-copy">
          <p className="page-eyebrow">广垦沉香 · 日常养护</p>
          <h2>七件小事，<br /><em>让香气陪你更久</em></h2>
          <p className="lead">沉香会吸收环境中的气味与水分，温和养护能让原有香气陪伴更久。</p>
        </div>
        <img src="/assets/home-reference/feature-bracelet-3d.png" alt="沉香手串日常养护" />
      </section>
      <div className="care-guide-list">
        {careGuidelines.map((item, index) => <section className="care-guide-row" key={item.title}>
          <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
          <div><h3>{item.title}</h3><p>{item.body}</p></div>
        </section>)}
      </div>
      <aside className="care-reminder"><strong>养护提醒</strong><p>沉香为天然材质，长期佩戴与温和养护，能让它逐渐呈现自然温润的状态。</p></aside>
    </main>
  </MobileScroll>,
});
```

- [ ] **Step 3: 增加专属样式并移除不再使用的旧养护样式**

```css
.care-editorial-page { padding-top: 22px; }
.care-editorial-hero { position: relative; min-height: 250px; margin: -22px -22px 0; padding: 34px 22px 22px; overflow: hidden; border-bottom: 1px solid var(--line); }
.care-editorial-copy { position: relative; z-index: 1; max-width: 74%; }
.care-editorial-hero h2 { margin-bottom: 14px; }
.care-editorial-hero .lead { margin: 0; color: #626a64; }
.care-editorial-hero > img { position: absolute; right: -42px; bottom: -22px; width: 176px; height: 150px; object-fit: contain; }
.care-guide-list { border-bottom: 1px solid var(--line); }
.care-guide-row { display: grid; grid-template-columns: 52px minmax(0, 1fr); gap: 16px; padding: 20px 0; border-top: 1px solid var(--line); }
.care-guide-row > span { color: var(--warm); font: 500 30px/1 Georgia, serif; }
.care-guide-row h3 { margin: 0; color: #232824; font-size: 16px; line-height: 1.35; }
.care-guide-row p { margin: 8px 0 0; color: #626a64; font-size: 15px; line-height: 1.75; }
.care-reminder { display: grid; grid-template-columns: auto 1fr; gap: 12px; margin-top: 20px; padding: 14px 0; color: #626a64; }
.care-reminder strong { color: var(--green); font-size: 14px; }
.care-reminder p { margin: 0; font-size: 13px; line-height: 1.7; }
@media (min-width: 400px) {
  .care-editorial-hero { min-height: 265px; }
  .care-editorial-copy { max-width: 76%; }
}
```

- [ ] **Step 4: 运行聚焦用例，确认七条内容、题图与返回行为通过**

Run:

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/Users/xinwei/.cache/puppeteer/chrome-headless-shell/mac_arm-148.0.7778.97/chrome-headless-shell-mac-arm64/chrome-headless-shell npx playwright test tests/prototype-h5.spec.ts --grep "selected seven-part editorial guide"
```

Expected: PASS。

- [ ] **Step 5: 运行运行时完整性检查**

Run:

```bash
npm run check:runtime
```

Expected: `Mobile runtime integrity check passed (28 protected files).`

- [ ] **Step 6: 记录实现验证结果**

记录修改文件、聚焦用例和运行时检查结果；此项目没有 Git 仓库，不执行提交。

---

### Task 3: 构建与双设备视觉验收

**Files:**
- Create: `scripts/capture-care-editorial-qa.mjs`
- Verify: `src/Prototype.tsx`
- Verify: `src/prototype.css`
- Verify: `tests/prototype-h5.spec.ts`
- Reference: `reference/care-editorial-manual-selected.png`

**Interfaces:**
- Consumes: Task 2 完成的养护页面，以及现有 iPhone/Pixel 10 设备切换器。
- Produces: 可复核的构建、测试和真实渲染证据。

- [ ] **Step 1: 运行构建**

Run:

```bash
npm run build
```

Expected: TypeScript、Vite 构建和 Sites 输出准备均成功退出。

- [ ] **Step 2: 运行完整浏览器测试**

Run:

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/Users/xinwei/.cache/puppeteer/chrome-headless-shell/mac_arm-148.0.7778.97/chrome-headless-shell-mac-arm64/chrome-headless-shell npx playwright test
```

Expected: 全部 Playwright 用例 PASS。

- [ ] **Step 3: 新增双设备养护页截图脚本**

```js
import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

const baseURL = process.env.PROTOTYPE_BASE_URL ?? "http://127.0.0.1:4174/";
const outDir = path.resolve("audit/care-editorial-manual-2026-08-31");
await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 }, locale: "zh-CN" });
const consoleErrors = [];
page.on("console", message => {
  if (message.type() === "error") consoleErrors.push(message.text());
});

for (const device of ["iphone", "pixel-10"]) {
  await page.goto(baseURL);
  await page.getByTestId("device-picker").click();
  await page.getByTestId(`device-option-${device}`).click();
  await page.addStyleTag({ content: ".mobile-cursor { display: none !important; }" });
  await page.getByRole("button", { name: "佩戴养护" }).click();
  await page.waitForTimeout(450);
  const screen = page.getByTestId("device-screen");
  await screen.screenshot({ path: path.join(outDir, `${device}-care-top.png`) });
  await page.getByTestId("flow-current").last().locator('[data-testid="mobile-scroll"]').evaluate(node => { node.scrollTop = node.scrollHeight; });
  await page.waitForTimeout(250);
  await screen.screenshot({ path: path.join(outDir, `${device}-care-bottom.png`) });
}

await browser.close();
if (consoleErrors.length) throw new Error(`Console errors: ${consoleErrors.join(" | ")}`);
console.log(`Captured 4 screenshots in ${outDir}`);
```

- [ ] **Step 4: 启动预览并生成截图**

在一个终端运行：

```bash
npm run dev -- --port 4174
```

在另一个终端运行：

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/Users/xinwei/.cache/puppeteer/chrome-headless-shell/mac_arm-148.0.7778.97/chrome-headless-shell-mac-arm64/chrome-headless-shell PROTOTYPE_BASE_URL=http://127.0.0.1:4174/ node scripts/capture-care-editorial-qa.mjs
```

Expected: `audit/care-editorial-manual-2026-08-31/` 生成 iPhone 与 Pixel 10 的首屏、尾部共四张截图，且控制台错误数为 0。

- [ ] **Step 5: 对照选定视觉稿检查并只修正可见偏差**

同时查看 `reference/care-editorial-manual-selected.png` 与两台设备截图，检查：标题与题图比例、七条编号节奏、正文可读性、图片裁切、顶部安全区、末条和养护提醒是否可完整滚动显示。仅修改 `care-editorial-*`、`care-guide-*` 和 `care-reminder` 专属样式，再重复 Task 3 的构建、完整测试和截图。

- [ ] **Step 6: 汇总完成证据**

交付中列出修改文件、构建结果、完整测试数量、两台设备截图路径，以及仍需品牌内容负责人复核的第 5 条养护术语；此项目没有 Git 仓库，不执行提交。
