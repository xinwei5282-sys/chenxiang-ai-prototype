# Global UI P0 / P1 Remediation Implementation Plan

> **For Codex execution:** This plan may be executed inline in the current session or step-by-step with explicit checkpoints. Keep checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复问帖记录与入口语义，补齐帮助及内容页，并提高聊天、授权和 Pixel 端可用性，同时保持首页视觉不变。

**Architecture:** 继续使用单一 `AuthorizationContext`、`FlowStack` 页面工厂和现有暖纸色设计变量。所有新页面与模拟数据留在 `src/Prototype.tsx`，样式集中到 `src/prototype.css`，Playwright 测试先锁定用户可见行为再实现。

**Tech Stack:** React 19、TypeScript、FlowStack / MobileScroll、Radix Icons、Playwright、Vite。

**Repository note:** 当前目录不是 Git 仓库，因此不执行提交步骤；每个任务仍保持独立红绿验证。

---

## 文件责任图

- Modify: `tests/prototype-h5.spec.ts`
  - 负责记录流、授权恢复意图、帮助页、聊天免责声明、内容完整度和 Pixel 触控尺寸的用户行为断言。
- Modify: `src/Prototype.tsx`
  - 负责页面工厂、授权目的参数、问帖记录模拟数据、历史详情、继续追问、帮助页和内容文案。
- Modify: `src/prototype.css`
  - 负责新列表 / 详情样式、固定免责声明、结构化回答层级、内容页收尾、对比度和 Pixel 48px 触控尺寸。
- Modify: `AGENTS.md`
  - 记录本轮稳定产品方向，防止后续又把“问帖记录”接回新问帖。
- Create: `audit/ui-p0-p1-remediation-2026-08-24/*.png`
  - 保存 iPhone / Pixel 真实渲染验收截图。

---

### Task 1: 问帖记录真实流程与授权恢复意图

**Files:**
- Modify: `tests/prototype-h5.spec.ts`
- Modify: `src/Prototype.tsx`
- Modify: `src/prototype.css`

- [ ] **Step 1: Write the failing record-flow test**

新增测试：未授权点击“问帖记录”时弹层标题为“登录后查看记录”；点击“微信授权并继续”后进入“问帖记录”列表，而不是 `AI问事`。

```ts
test("reading records authorize into a real history list", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "我的", exact: true }).click();
  await page.getByRole("button", { name: "问帖记录" }).click();
  await expect(page.getByText("登录后查看记录")).toBeVisible();
  await page.getByRole("button", { name: "微信授权并继续" }).click();
  await expect(page.getByRole("heading", { name: "问帖记录" })).toBeVisible();
  await expect(page.getByRole("button", { name: /新的合作是否适合推进/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "AI问事" })).toHaveCount(0);
});
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/Users/xinwei/.cache/puppeteer/chrome-headless-shell/mac_arm-148.0.7778.97/chrome-headless-shell-mac-arm64/chrome-headless-shell npx playwright test tests/prototype-h5.spec.ts --grep "real history list"
```

Expected: FAIL because the old button opens the generic authorization sheet and continues to `AI问事`.

- [ ] **Step 3: Implement configurable authorization intent and list route**

Extend `AuthorizationSheet` with explicit `title`, `description`, and shared button label `微信授权并继续`. In `Profile`, separate `openRecords` from `openReading`; authorization completes into `readingRecordsScreen(keyboard)`.

Add one list-row button:

```tsx
<button className="reading-record-row" onClick={() => flow.push(readingRecordDetailScreen(keyboard))}>
  <span><strong>新的合作是否适合推进？</strong><small>三天前</small></span>
  <p>先用七天小目标验证合作可靠性。</p>
  <ChevronRightIcon />
</button>
```

- [ ] **Step 4: Re-run and verify GREEN**

Run the same grep command. Expected: PASS.

- [ ] **Step 5: Add history detail and continuation test (RED)**

The test clicks the record, expects heading `问帖详情`, expects the historical answer and no textbox, then clicks `继续追问` and expects `AI问事` with the context-bridging first message.

- [ ] **Step 6: Implement history detail and context continuation**

Create static historical `AgentMessage[]`, render them through a shared transcript renderer, and add a route-owned footer button `继续追问`. Extend `interpretScreen` / `FortuneAgent` with optional initial messages.

- [ ] **Step 7: Re-run both record tests and verify GREEN**

Expected: both record tests pass and no repeated authorization appears after continuation.

---

### Task 2: Profile entry semantics and help pages

**Files:**
- Modify: `tests/prototype-h5.spec.ts`
- Modify: `src/Prototype.tsx`
- Modify: `src/prototype.css`

- [ ] **Step 1: Write failing tests**

Add focused tests that assert:

- `本串证书` exists and opens `证书与溯源`.
- `我的手串` no longer appears.
- `芯片识别说明` and `关于传统文化解读` are buttons.
- Each button opens the matching full page and supports back navigation.

- [ ] **Step 2: Run focused tests and verify RED**

Expected: FAIL because the old label is `我的手串` and help rows are static divs.

- [ ] **Step 3: Implement minimal routes and button rows**

Change the right primary action label to `本串证书`. Replace `.profile-info-row` divs with semantic buttons containing `ChevronRightIcon`. Add `chipHelpScreen` and `cultureHelpScreen` using the existing editorial detail-page structure.

- [ ] **Step 4: Re-run focused tests and verify GREEN**

Expected: profile semantics and both help routes pass.

---

### Task 3: AI disclaimer and structured answer typography

**Files:**
- Modify: `tests/prototype-h5.spec.ts`
- Modify: `src/Prototype.tsx`
- Modify: `src/prototype.css`

- [ ] **Step 1: Write failing chat tests**

Assert that:

- `.reading-disclaimer` is a descendant of `.reading-composer`, not `.reading-page`.
- The final Agent bubble contains three visible structured labels with class `.fortune-answer-label`.
- No `.reading-result` or nested result card exists.

- [ ] **Step 2: Run and verify RED**

Expected: FAIL because the disclaimer is still in the scroll content and labels are plain text.

- [ ] **Step 3: Implement transcript formatting and fixed disclaimer**

Move the disclaimer into `.reading-composer` with `grid-column: 1 / -1`. Render paragraphs beginning with `判断：`, `提醒：`, and `建议：` as `<strong className="fortune-answer-label">` plus remaining text.

- [ ] **Step 4: Run and verify GREEN**

Expected: chat structure tests pass; existing follow-up tests remain green.

---

### Task 4: Content-page completion and readability

**Files:**
- Modify: `tests/prototype-h5.spec.ts`
- Modify: `src/Prototype.tsx`
- Modify: `src/prototype.css`

- [ ] **Step 1: Write failing content tests**

Assert that care contains `常见误区` and the existing bracelet asset; knowledge contains `沉香如何形成`, `怎样闻香`, and `常见产区差异`; neither topic row is a false button.

- [ ] **Step 2: Run and verify RED**

Expected: FAIL because the new content is absent.

- [ ] **Step 3: Implement care and knowledge content**

Add the existing `/assets/home-reference/feature-bracelet-3d.png` as a small care hero image, append a low-emphasis misconception note, and add three numbered knowledge sections before the farm-story button.

- [ ] **Step 4: Add failing accessibility-size test**

Switch to Pixel and verify prompt buttons, send button, and profile authorization button are at least 48px high. Verify the authorization prototype note and disclaimer are at least 12px and their computed colors differ from the previous low-contrast gray.

- [ ] **Step 5: Run and verify RED**

Expected: FAIL on current 44px / 10px values.

- [ ] **Step 6: Implement CSS variables and Pixel overrides**

Increase critical auxiliary text to 12px, darken low-contrast gray to the existing readable muted range, and add `.device-screen[data-device="pixel-10"]` overrides for 48px controls.

- [ ] **Step 7: Run content and accessibility tests and verify GREEN**

Expected: all new Task 4 tests pass.

---

### Task 5: Durable direction, regression suite, and visual QA

**Files:**
- Modify: `AGENTS.md`
- Create: `audit/ui-p0-p1-remediation-2026-08-24/*.png`

- [ ] **Step 1: Record the approved product direction**

Append a dated bullet stating that records must open a real history flow, `本串证书` is the single-bracelet label, help rows are actionable, and P0/P1 remediation does not authorize a homepage redesign.

- [ ] **Step 2: Run runtime integrity**

```bash
npm run check:runtime
```

Expected: `Mobile runtime integrity check passed (28 protected files).`

- [ ] **Step 3: Run the full Playwright suite**

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/Users/xinwei/.cache/puppeteer/chrome-headless-shell/mac_arm-148.0.7778.97/chrome-headless-shell-mac-arm64/chrome-headless-shell npx playwright test
```

Expected: all tests pass with zero failures.

- [ ] **Step 4: Run the production build**

```bash
npm run build
```

Expected: TypeScript and Vite complete successfully and Sites build artifacts are prepared.

- [ ] **Step 5: Capture the accepted flow on both devices**

Capture at minimum:

- iPhone: home, records list, record detail, continued chat, profile, care, knowledge, chip help, culture help.
- Pixel: records list, chat final, profile, care, knowledge.

- [ ] **Step 6: Inspect every screenshot and make at least one evidence-based visual iteration**

Reject transition, clipped, cursor-obscured, or wrong-state screenshots. Check vertical balance, content clipping, safe area, fixed disclaimer, 48px targets, and visual consistency with the current homepage.

- [ ] **Step 7: Re-run focused tests, runtime check, full suite, and build after the visual iteration**

Only after fresh green evidence may the work be reported complete.
