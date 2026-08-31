# Mini Program UI Redesign Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. The repository is not a Git worktree, so execute in place and do not create commits. Preserve every protected runtime file listed in `AGENTS.md`.

**Goal:** Rework the existing React requirements prototype into the approved WeChat Mini Program direction “随身香事”, with a daily-use home, a focused conversational divination Agent, and a useful “我的” root tab.

**Architecture:** Keep `FlowStack`, device chrome, keyboard runtime, and current simulated Agent state machine unchanged. Implement app-owned Mini Program navigation, tab bars, home/profile content, and the transcript presentation only in `src/Prototype.tsx` and `src/prototype.css`. Verify behavior with Playwright against the real rendered prototype and compare iPhone/Pixel screenshots to the selected visual source.

**Tech Stack:** React 19, TypeScript, Radix Icons, custom mobile runtime, Playwright, Vite.

---

### Task 1: Lock the approved Mini Program home behavior

**Files:**
- Modify: `tests/prototype-h5.spec.ts`

**Step 1: Write the failing tests**

Replace the obsolete archive-home assertion with tests that verify:

```ts
test("mini-program home keeps the bracelet and question action above the fixed tabs", async ({ page }) => {
  const current = page.getByTestId("flow-current");
  await expect(current.getByRole("heading", { name: "今天，想问什么？" })).toBeVisible();
  await expect(current.getByRole("button", { name: "开始一次问帖" })).toBeVisible();
  await expect(current.getByRole("navigation", { name: "小程序导航" })).toBeVisible();
  await expect(current.getByText("新的合作是否适合推进？", { exact: true })).toBeVisible();
});

test("mini-program tabs switch between home and my without opening a pushed detail header", async ({ page }) => {
  await page.getByRole("navigation", { name: "小程序导航" }).getByRole("button", { name: "我的" }).click();
  await expect(page.getByRole("heading", { name: "我的" })).toBeVisible();
  await expect(page.getByText("已绑定手串", { exact: true })).toBeVisible();
  await page.getByRole("navigation", { name: "小程序导航" }).getByRole("button", { name: "首页" }).click();
  await expect(page.getByRole("heading", { name: "今天，想问什么？" })).toBeVisible();
});
```

The production change these catch is a regression to the archive home or a non-functional root tab bar.

**Step 2: Verify RED**

Run: `npx playwright test tests/prototype-h5.spec.ts -g "mini-program"`

Expected: FAIL because the new heading, navigation, and profile root do not yet exist.

**Step 3: Keep implementation untouched**

Do not modify production code until the failure is confirmed to be caused by the missing Mini Program UI.

### Task 2: Implement the Mini Program home and root tabs

**Files:**
- Modify: `src/Prototype.tsx`
- Modify: `src/prototype.css`

**Step 1: Add app-owned Mini Program chrome**

Create reusable `MiniProgramCapsule`, `MiniProgramNav`, and `MiniTabs` components using Radix icons. Keep the status bar and device frame owned by the protected runtime.

**Step 2: Replace the archive home**

Implement this sequence inside a scrollable root screen:

```text
我的沉香 + capsule
当前手串（真实产品图、编号、年份、产区、香韵、轻量核验）
今天，想问什么？
开始一次问帖
最近问帖：新的合作是否适合推进？ / 三天前 · 风山渐
证书与溯源 / 佩戴养护 / 沉香知识
首页 / 问帖 / 我的
```

The primary button and 问帖 tab both push the existing Agent route. Secondary rows keep their existing destinations. Remove the advisor bottom sheet from the home hierarchy.

**Step 3: Add the “我的” root view**

Add a root-level profile screen with:

```text
我的
已绑定手串 + 核验状态
证书与溯源
佩戴养护
关于传统文化解读
```

Switching 首页/我的 must use `flow.replace` so it behaves like a tab root and shows no back affordance.

**Step 4: Verify GREEN**

Run: `npx playwright test tests/prototype-h5.spec.ts -g "mini-program"`

Expected: PASS.

**Step 5: Refactor without changing behavior**

Remove dead imports and obsolete home/sheet markup. Keep touch targets at least 44px and reserve the bottom safe area above the protected device chrome.

### Task 3: Lock and implement the focused Agent transcript

**Files:**
- Modify: `tests/prototype-h5.spec.ts`
- Modify: `src/Prototype.tsx`
- Modify: `src/prototype.css`

**Step 1: Write the failing Agent presentation test**

Update the obsolete editorial-folio test to require a compact current-bracelet row, the opening prompt, transcript labels, composer, and Mini Program navigation bar:

```ts
test("question tab opens a focused mini-program reading transcript", async ({ page }) => {
  await page.getByRole("navigation", { name: "小程序导航" }).getByRole("button", { name: "问帖" }).click();
  await expect(page.getByRole("heading", { name: "沉香问帖" })).toBeVisible();
  await expect(page.getByText("先说最挂心的事。", { exact: false })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "向传统文化解读 Agent 提问" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "小程序导航" })).toHaveCount(0);
});
```

The production change this catches is reintroducing the decorative folio, chat bubbles, or persistent root tabs over a focused conversation.

**Step 2: Verify RED**

Run: `npx playwright test tests/prototype-h5.spec.ts -g "focused mini-program reading"`

Expected: FAIL on the missing Mini Program route presentation.

**Step 3: Replace the folio presentation**

Preserve `simulatedReply`, timers, input behavior, and automatic scroll. Replace only the visible structure:

- Mini Program fixed top bar with back, centered title, and capsule.
- Compact bracelet identity row.
- Continuous full-width transcript labelled `你`, `解读`, or `追问`.
- One flat result section for `风山渐` and one action recommendation.
- Fixed safe-area-aware composer.
- No avatars, online dots, chat bubbles, nested cards, vertical seals, gradients, or glows.

**Step 4: Verify GREEN and interaction regression**

Run: `npx playwright test tests/prototype-h5.spec.ts -g "focused mini-program reading|agent actively asks"`

Expected: PASS, including the two-turn follow-up and visible reading above the composer.

### Task 4: Bring detail screens into the same Mini Program shell

**Files:**
- Modify: `src/Prototype.tsx`
- Modify: `src/prototype.css`

**Step 1: Reuse the Mini Program flow bar**

Update `TopBar` so certificate, care, knowledge, and Agent routes use a 44px back target, centered Chinese title, and real capsule icons. Remove archive marks and info icons.

**Step 2: Simplify app-owned detail styling**

Remove English kickers from visible detail pages and align headings, list rows, borders, typography, and radii to the selected Mini Program direction without changing content or navigation behavior.

**Step 3: Run focused regression**

Run: `npx playwright test tests/prototype-h5.spec.ts -g "certificate navigation"`

Expected: PASS with the keyboard hidden, fixed header clear, and focused back button.

### Task 5: Visual verification and final validation

**Files:**
- Create: `audit/mini-program-ui-2026-08-24/reference-selected-c.png`
- Create: `audit/mini-program-ui-2026-08-24/round-1/*.png`
- Create: `audit/mini-program-ui-2026-08-24/round-2/*.png`
- Create: `audit/mini-program-ui-2026-08-24/visual-review.md`

**Step 1: Verify protected runtime before preview**

Run: `npm run check:runtime`

Expected: all protected runtime hashes pass.

**Step 2: Capture the selected source and round-one render**

Using the already approved Playwright workflow, capture selected direction C and the rendered home, Agent start/result, and profile states for iPhone and Pixel. Combine each source/render pair in one review input and inspect hierarchy, crop, padding, typography, radii, safe area, and fixed chrome.

**Step 3: Fix visible mismatches**

Only modify `src/Prototype.tsx` and `src/prototype.css`. Record concrete findings in `visual-review.md`.

**Step 4: Capture and compare round two**

Repeat the same states and viewports. Confirm the Mini Program shell, above-fold hierarchy, bottom tabs, Agent composer, and Pixel navigation clearance.

**Step 5: Run full verification**

Run:

```bash
npm run check:runtime
npx playwright test
npm run test:sites
npm run build
```

Expected: all commands pass with no new warnings.

**Step 6: Self-review**

Run:

```bash
rg -n "TBD|TODO|FIXME|placeholder|coming soon|lorem ipsum" src/Prototype.tsx src/prototype.css tests/prototype-h5.spec.ts docs/superpowers/plans/2026-08-24-mini-program-ui-redesign.md
```

Review spec coverage, TypeScript errors, mobile overflow, and keyboard-safe positioning. Do not add scope beyond the approved three surfaces.

**Step 7: Open the verified preview**

Keep the local server running, open `http://127.0.0.1:4173`, and hand off the clickable local URL first.
