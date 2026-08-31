# 琼南沉香参考首页复刻 Implementation Plan

> **For Codex execution:** This plan may be executed inline in the current session or step-by-step with explicit checkpoints. Keep checkbox (`- [ ]`) syntax for tracking.

**Goal:** 以 `/Users/xinwei/Downloads/琼南沉香首页_切片包/00_fullscreen.png` 为唯一视觉真源，将现有微信小程序首页复刻为同构图、同层级、同素材语言的一屏可交互页面。

**Architecture:** 保留现有 `PhoneFrame → FlowStack → Home` 移动运行时、共享微信授权状态和详情页路由，只重构首页 app-owned 内容。参考包中的真实切片复制到项目资产目录；主图、云纹、来源/历史/服务/底部导航图标使用图片资产，文字、卡片、核验标签和布局用 React/CSS 实现。

**Tech Stack:** React 19、TypeScript、Vite、Radix Icons、Playwright、现有 mobile-app runtime。

---

## 文件责任图

- Create: `public/assets/home-reference/` — 保存从参考切片包复制的项目内本地素材，禁止热链。
- Modify: `src/Prototype.tsx` — 首页语义结构、图片资产引用、现有交互绑定。
- Modify: `src/prototype.css` — 参考页比例、卡片、纹理、字体、颜色、圆角、阴影和响应式一屏布局。
- Modify: `tests/prototype-h5.spec.ts` — 固化参考首页结构、资产、唯一主按钮、双机型一屏和登录门槛。
- Modify: `AGENTS.md` — 记录本次参考图成为首页最新视觉真源。
- Create/Update: `design-qa.md` — 保存参考图与实现截图的逐轮对照结果。
- Create: `audit/home-reference-replica-2026-08-24/` — 保存 iPhone、Pixel、授权弹层和并排对照截图。

### Task 1: 固化视觉真源与失败测试

**Files:**
- Modify: `tests/prototype-h5.spec.ts`
- Source: `/Users/xinwei/Downloads/琼南沉香首页_切片包/manifest.json`

- [ ] **Step 1: 写首页参考结构失败测试**

新增断言：

```ts
await expect(current.locator(".home-reference-hero")).toBeVisible();
await expect(current.locator(".home-reading-card")).toBeVisible();
await expect(current.locator(".home-origin-card")).toBeVisible();
await expect(current.locator(".home-recent-card")).toBeVisible();
await expect(current.locator(".home-feature-card .home-feature-item")).toHaveCount(3);
```

- [ ] **Step 2: 写项目内资产与双机型一屏断言**

```ts
const homeImages = await current.locator('img[src^="/assets/home-reference/"]').count();
expect(homeImages).toBeGreaterThanOrEqual(8);
expect(layout.scrollHeight).toBeLessThanOrEqual(layout.clientHeight + 1);
expect(layout.featuresBottom).toBeLessThanOrEqual(layout.tabsTop);
```

- [ ] **Step 3: 运行聚焦测试并确认失败**

Run: `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/Users/xinwei/.cache/puppeteer/chrome-headless-shell/mac_arm-148.0.7778.97/chrome-headless-shell-mac-arm64/chrome-headless-shell npx playwright test tests/prototype-h5.spec.ts -g "reference homepage"`

Expected: FAIL，原因是参考结构 class 与本地切片资产尚未接入。

### Task 2: 导入切片并重建首页结构

**Files:**
- Create: `public/assets/home-reference/hero-banner.png`
- Create: `public/assets/home-reference/cloud-deco.png`
- Create: `public/assets/home-reference/primary-button.png`
- Create: `public/assets/home-reference/origin-pin.png`
- Create: `public/assets/home-reference/recent-chat.png`
- Create: `public/assets/home-reference/feature-certificate.png`
- Create: `public/assets/home-reference/feature-bracelet.png`
- Create: `public/assets/home-reference/feature-book.png`
- Create: `public/assets/home-reference/nav-home.png`
- Create: `public/assets/home-reference/nav-chat.png`
- Create: `public/assets/home-reference/nav-profile.png`
- Modify: `src/Prototype.tsx`

- [ ] **Step 1: 将参考切片非破坏性复制进项目**

复制时使用上面的稳定英文文件名；不复制 `00_fullscreen.png` 到运行时，不热链 Downloads 路径。

- [ ] **Step 2: 重构产品主视觉与身份带**

`BraceletHero` 改为：

```tsx
<button className="home-reference-hero" aria-label="查看海南琼南沉香手串来处">
  <img src="/assets/home-reference/hero-banner.png" alt="海南琼南沉香手串" />
  <span className="home-identity-band">
    <span><strong>海南琼南沉香手串</strong><small>CX-2018-072 · 2018 · 海南琼南 · 清甜木香</small></span>
    <span className="home-verified"><CheckCircledIcon />身份已核验</span>
  </span>
</button>
```

- [ ] **Step 3: 重建问帖、来源、最近问帖和三项服务卡**

保留现有点击回调：主按钮和最近问帖走共享授权门槛；主视觉、来源、证书入口进入溯源页；养护与知识进入现有详情页。

- [ ] **Step 4: 将底部导航图标切换为参考资产**

导航标签与交互不变，三个图标使用 `nav-home.png`、`nav-chat.png`、`nav-profile.png`，首页选中状态继续由文字色和当前参考图标表达。

### Task 3: 按源图比例完成 CSS 落版

**Files:**
- Modify: `src/prototype.css`

- [ ] **Step 1: 建立参考页视觉 token**

```css
:root {
  --ref-forest: #07533f;
  --ref-forest-deep: #043f31;
  --ref-paper: #fffdf8;
  --ref-gold: #c9a365;
  --ref-line: #e8dccb;
  --ref-shadow: 0 8px 22px rgba(73, 54, 31, .12);
}
```

- [ ] **Step 2: 还原顶部、身份带和问帖卡叠层**

主图从设备屏幕顶边开始，身份带使用深绿实色和细金边；问帖卡向上叠压身份带，保持 10–12px 圆角、暖白宣纸底、云纹切片和唯一主按钮切片。

- [ ] **Step 3: 还原来源、历史和服务卡**

使用 9–10px 圆角、暖灰细边和极轻阴影；服务卡为三等分，每项结构是 `插画 + 标题 + 副标题`，不得退回纯文字栏。

- [ ] **Step 4: 保持 iPhone/Pixel 一屏**

首页 body 使用纵向 grid/flex 与 `clamp()` 控制高度；固定 Tab 上方保留 8px 间隙，`MobileScroll` 的 `scrollHeight <= clientHeight + 1`。

### Task 4: 真实渲染对照与修正

**Files:**
- Create: `audit/home-reference-replica-2026-08-24/reference-vs-iphone.png`
- Create: `audit/home-reference-replica-2026-08-24/iphone-home.png`
- Create: `audit/home-reference-replica-2026-08-24/pixel-home.png`
- Create: `audit/home-reference-replica-2026-08-24/iphone-auth-gate.png`
- Create/Update: `design-qa.md`

- [ ] **Step 1: 运行 runtime 校验并捕获 1:1 app viewport**

Run: `npm run check:runtime`

Expected: `Mobile runtime integrity check passed (28 protected files).`

- [ ] **Step 2: 在 393 × 852 与 Pixel 视口捕获首页**

使用已获用户授权的 Playwright Chromium；iPhone 必须验证 `[data-phone-screen]` 为 `393 × 852` 后截图。

- [ ] **Step 3: 生成同画布并排对照**

把源图按相同内容宽度归一化，与实现截图放入同一张比较图，检查五个必检面：字体、间距、颜色、图片质量、文案。

- [ ] **Step 4: 修复 P0/P1/P2 并重复对照**

每轮在 `design-qa.md` 记录发现、修复和新截图；只有无可执行 P0/P1/P2 时写 `final result: passed`。

### Task 5: 完整回归与交付

**Files:**
- Modify: `AGENTS.md`

- [ ] **Step 1: 记录最新视觉真源**

写明 `00_fullscreen.png` 与切片包取代此前首页 B 方向的具体视觉构图，但不改变微信授权、问帖 Agent、证书/养护/知识页面职责。

- [ ] **Step 2: 运行完整验证**

Run:

```bash
npx playwright test
npm run check:runtime
npx tsc --noEmit
npm run test:sites
npm run build
```

Expected: Playwright 0 failures、28 个受保护运行时文件完整、TypeScript 0 errors、Sites tests 0 failures、Vite build exit 0。

- [ ] **Step 3: 打开最终预览**

确认 `http://127.0.0.1:4173` 返回 HTTP 200，并在 Codex Desktop 浏览器中打开。

## 自检

- Spec coverage：参考页全部可见区块、真实切片、本地化资产、交互、一屏、双机型、Design QA 和完整回归均映射到任务。
- Placeholder scan：计划不含 TBD/TODO/“稍后实现”等占位语句。
- Type consistency：沿用现有 `Home`、`MiniTabs`、`AuthorizationSheet`、`openReading`、`openProvenance` 和 `FlowScreen` 命名。
- Scope：只重构首页和首页 Tab 图标，不改变受保护运行时、详情页、登录状态模型或 Agent 对话逻辑。
- Repository note：当前目录不是 Git 仓库，因此用测试与 QA 截图作为 checkpoint，不执行 commit。
