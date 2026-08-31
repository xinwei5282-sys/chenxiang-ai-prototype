# 农垦故事与证书拆分、首页历史移除 Implementation Plan

> **For Codex execution:** This plan may be executed inline in the current session or step-by-step with explicit checkpoints. Keep checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将首页“琼南农垦沉香”与“证书与溯源”拆成两个职责独立的详情入口，并从首页移除“最近问帖”，把历史记录统一归入“我的”。

**Architecture:** 保留现有 `PhoneFrame → FlowStack → Home/Profile` 运行时和固定底部导航。新增一个复用 `FlowScreen + TopBar + MobileScroll` 的静态农垦故事页；现有证书页、知识页、授权状态和问帖 Agent 均不改。首页只调整一个入口的回调与文案，并删除历史展示区块。

**Tech Stack:** React 19、TypeScript、现有 mobile-app runtime、Radix Icons、Playwright、Vite。

---

## 文件责任图

- Modify: `tests/prototype-h5.spec.ts` — 固化首页不展示最近问帖、农垦故事独立跳转、证书入口职责不变和“我的”保留记录入口。
- Modify: `src/Prototype.tsx` — 首页信息结构、`openFarmStory()`、`farmStoryScreen()` 和删除最近问帖区块。
- Modify: `src/prototype.css` — 农垦故事详情页排版与首页删除历史后的节奏调整。
- Modify: `AGENTS.md` — 记录最新首页职责：不展示历史，农垦故事与单品认证分离。
- Modify: `design-qa.md` — 记录更新后的首页和农垦故事页渲染验收。
- Update: `audit/home-reference-replica-2026-08-24/` — 保存最新 iPhone、Pixel 首页和农垦故事页截图。

### Task 1: 用失败测试锁定新的信息职责

**Files:**
- Modify: `tests/prototype-h5.spec.ts`

- [ ] **Step 1: 新增首页去历史与农垦故事跳转测试**

```ts
test("home separates the farm story from certificate traceability and keeps history in profile", async ({ page }) => {
  const current = page.getByTestId("flow-current");
  await expect(current.getByText("最近问帖", { exact: true })).toHaveCount(0);
  await expect(current.getByText("新的合作是否适合推进？", { exact: true })).toHaveCount(0);

  await current.getByRole("button", { name: "了解琼南农垦故事" }).click();
  await expect(page.getByRole("heading", { name: "农垦沉香", exact: true })).toBeVisible();
  await expect(page.getByText("产区环境", { exact: true })).toBeVisible();
  await expect(page.locator(".timeline")).toHaveCount(0);
});
```

- [ ] **Step 2: 扩充既有证书与“我的”断言**

```ts
await current.getByRole("button", { name: "查看证书与溯源" }).click();
await expect(page.getByRole("heading", { name: "证书与溯源", exact: true })).toBeVisible();
await expect(page.locator(".timeline")).toBeVisible();

await page.getByRole("navigation", { name: "小程序导航" }).getByRole("button", { name: "我的" }).click();
await expect(page.getByText("问帖记录", { exact: true })).toBeVisible();
```

- [ ] **Step 3: 运行聚焦测试并确认失败**

Run:

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/Users/xinwei/.cache/puppeteer/chrome-headless-shell/mac_arm-148.0.7778.97/chrome-headless-shell-mac-arm64/chrome-headless-shell npx playwright test tests/prototype-h5.spec.ts -g "home separates the farm story"
```

Expected: FAIL，因为首页仍包含最近问帖，农垦入口仍进入证书页。

### Task 2: 拆分首页入口并移除最近问帖

**Files:**
- Modify: `src/Prototype.tsx`

- [ ] **Step 1: 新增独立农垦故事回调**

在 `Home` 中保留 `openProvenance()`，并新增：

```tsx
const openFarmStory = () => {
  prepareH5Transition(keyboard);
  flow.push(farmStoryScreen(keyboard));
};
```

- [ ] **Step 2: 更新农垦入口文案与回调**

```tsx
<button className="provenance-row home-origin-card" aria-label="了解琼南农垦故事" onClick={openFarmStory}>
  <span className="home-origin-icon" aria-hidden="true"><SewingPinIcon /></span>
  <span className="home-origin-copy">
    <strong>琼南农垦沉香</strong>
    <small>从一片林场，到一串沉香</small>
  </span>
  <span className="home-origin-action">了解农垦故事<ChevronRightIcon /></span>
</button>
```

- [ ] **Step 3: 删除首页最近问帖区块**

移除 `.home-recent-card` 的整个 `<section>`；不删除问帖 Agent、授权门槛或“我的”页面的问帖记录入口。

- [ ] **Step 4: 运行聚焦测试**

Run: 与 Task 1 Step 3 相同。

Expected: 农垦入口测试仍因详情页未实现而 FAIL；首页“最近问帖”断言已通过。

### Task 3: 新增独立农垦故事页

**Files:**
- Modify: `src/Prototype.tsx`
- Modify: `src/prototype.css`

- [ ] **Step 1: 新增 `farmStoryScreen()`**

```tsx
const farmStoryScreen = (keyboard: ReturnType<typeof useKeyboard>): FlowScreen => ({
  id: "farm-story",
  header: flow => <TopBar title="农垦沉香" back={flow.pop} keyboard={keyboard} />,
  headerHeight: 54,
  render: () => <MobileScroll className="app-screen">
    <main className="screen-content article-content farm-story-content">
      <p className="page-eyebrow">海南琼南农垦</p>
      <h2>从琼南农垦出发，<br /><em>认识这串沉香。</em></h2>
      <p className="lead">琼南的山林、海风与长期种植积累，构成了这串沉香的产区背景。</p>
      <div className="farm-story-list">
        <section><small>01</small><div><strong>产区环境</strong><p>温润海风与山林气候，为沉香生长提供稳定环境。</p></div></section>
        <section><small>02</small><div><strong>农垦积淀</strong><p>从林场经营到标准化管理，保留可持续的种植与制作经验。</p></div></section>
        <section><small>03</small><div><strong>从林场到手串</strong><p>经过选材、制作和长期养护，产区故事最终落在一串可佩戴的沉香上。</p></div></section>
      </div>
      <p className="farm-story-note">本页介绍品牌与产区背景；本串批次、质检和芯片信息请在“证书与溯源”中查看。</p>
    </main>
  </MobileScroll>,
});
```

- [ ] **Step 2: 增加详情页样式**

```css
.farm-story-list { margin-top: 22px; border-top: 1px solid var(--line); }
.farm-story-list section { display: grid; grid-template-columns: 28px 1fr; gap: 12px; padding: 18px 0; border-bottom: 1px solid var(--line); }
.farm-story-list small { color: var(--warm); font-size: 11px; }
.farm-story-list strong { display: block; color: var(--green-deep); font-size: 15px; }
.farm-story-list p { margin: 6px 0 0; color: #687069; font-size: 13px; line-height: 1.7; }
.farm-story-note { margin: 22px 0 0; padding: 14px 15px; border-radius: 10px; background: var(--green-soft); color: #526158; font-size: 12px; line-height: 1.7; }
```

- [ ] **Step 3: 运行聚焦测试并确认通过**

Run: Task 1 Step 3 的命令。

Expected: PASS。

### Task 4: 修复首页节奏并完成双机型视觉验收

**Files:**
- Modify: `src/prototype.css`
- Update: `audit/home-reference-replica-2026-08-24/iphone-home.png`
- Update: `audit/home-reference-replica-2026-08-24/pixel-home.png`
- Create: `audit/home-reference-replica-2026-08-24/iphone-farm-story.png`
- Modify: `design-qa.md`

- [ ] **Step 1: 运行受保护运行时检查**

Run: `npm run check:runtime`

Expected: `Mobile runtime integrity check passed (28 protected files).`

- [ ] **Step 2: 捕获 iPhone 和 Pixel 首页**

使用已授权 Playwright Chromium，验证 iPhone `[data-phone-screen]` 为 `393 × 852`、Pixel 为 `427 × 952` 后截图。

- [ ] **Step 3: 检查删除历史后的页面节奏**

验收首页不滚动、农垦入口文案不换行、三项服务位于底部导航之上；若 Pixel 留白过大，只调整首页 flex 间距，不新增内容模块。

- [ ] **Step 4: 捕获农垦故事页并更新 QA**

验证标题、三段故事和职责说明均可见；`design-qa.md` 必须记录最新证据并以 `final result: passed` 或 `blocked` 收口。

### Task 5: 记录职责决策并运行完整回归

**Files:**
- Modify: `AGENTS.md`

- [ ] **Step 1: 记录最新首页职责**

追加规则：首页不展示最近问帖；历史统一在“我的”；农垦入口只讲品牌与产区，证书入口只讲本串核验。

- [ ] **Step 2: 运行完整验证**

Run:

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/Users/xinwei/.cache/puppeteer/chrome-headless-shell/mac_arm-148.0.7778.97/chrome-headless-shell-mac-arm64/chrome-headless-shell npx playwright test
npm run build
```

Expected: Playwright 0 failures；runtime integrity 通过；TypeScript 与 Vite 构建退出码为 0。

- [ ] **Step 3: 确认预览终态**

Run: `curl -I http://127.0.0.1:4173`

Expected: `HTTP/1.1 200 OK`，并在 Codex Desktop 中保持预览打开。

## 自检

- Spec coverage：农垦/证书职责拆分、首页移除最近问帖、“我的”保留历史、独立详情页、双机型和回归均已映射。
- Placeholder scan：不含占位标记、延后实现措辞或未定义函数。
- Type consistency：统一使用 `farmStoryScreen`、`openFarmStory`、`openProvenance`、`home-origin-card` 和既有 `FlowScreen`。
- Scope：不修改受保护 runtime，不修改 Agent、授权、证书数据结构或后端边界。
- Repository note：当前目录不是 Git 仓库，因此不执行 commit；以测试、构建和 QA 截图作为 checkpoint。
