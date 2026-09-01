# External Adoption Mini Program Implementation Plan

> **For Codex execution:** This plan may be executed inline in the current session or step-by-step with explicit checkpoints. Keep checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the homepage adoption service a direct external-Mini-Program handoff and remove every internal adopted-tree archive experience from the Guangken prototype.

**Architecture:** Keep the existing homepage service button but route it to the shared phone-scoped transient status instead of `FlowStack`. Collapse `我的藏品` to its single bracelet record and remove tree-only branching, controls, archive code, and page-document mapping. The browser prototype states the intended native `wx.navigateToMiniProgram` boundary without pretending to execute it.

**Tech Stack:** React 19, TypeScript, existing mobile runtime and toast, Playwright, Vite, GitHub Pages.

---

## File responsibility map

**Modify**

- `src/Prototype.tsx` — adoption service behavior, single-bracelet collection, removal of internal adoption archive, page PRD mapping/content, and review-context count.
- `src/prototype.css` — remove or simplify tree/carousel-only collection controls only if they become dead; preserve current single-card visual quality.
- `tests/prototype-h5.spec.ts` — external-jump acceptance, single-bracelet collection acceptance, removal of tree/archive assertions, and page PRD regression.
- `AGENTS.md` — durable rule that adoption belongs to an external Mini Program and no internal adoption archive may be restored.

**Verify only**

- `public/assets/customer-feedback/collection-tree.svg`
- `public/assets/certificates/tree-adoption-certificate-demo.pdf`

These now-unused assets are not deleted in this task because the user requested product-flow removal, not destructive asset cleanup.

---

### Task 1: Replace the internal adoption route with an external jump simulation

**Files:**

- Modify: `tests/prototype-h5.spec.ts`
- Modify: `src/Prototype.tsx`

- [ ] **Step 1: Write a failing browser test**

Add `adoption service hands off to an external mini program without an internal archive`:

```ts
const service = page.getByRole("button", { name: "认种沉香树" });
await service.click();
await expect(page.getByRole("status")).toHaveText("正在打开认种沉香小程序…");
await expect(page.getByTestId("flow-current")).toHaveAttribute("data-flow-screen", "home");
await expect(page.getByRole("heading", { name: "认种档案" })).toHaveCount(0);
await expect(page.getByText("成长时间线", { exact: true })).toHaveCount(0);
```

Also assert that the service exists exactly once on the homepage.

- [ ] **Step 2: Run the focused test and confirm it fails**

```bash
MOBILE_RUNTIME_TEST_PORT=4175 PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/Users/xinwei/.cache/puppeteer/chrome-headless-shell/mac_arm-148.0.7778.97/chrome-headless-shell-mac-arm64/chrome-headless-shell npm run test:runtime -- --grep "adoption service hands off"
```

Expected: FAIL because the service currently pushes `adoptionArchiveScreen`.

- [ ] **Step 3: Implement the prototype handoff**

In `Home`, add a local action that uses the existing `useTransientMessage` result:

```ts
const openAdoptionMiniProgram = () => {
  prepareH5Transition(keyboard);
  toast.show("正在打开认种沉香小程序…");
};
```

Bind the homepage `认种沉香树` service to this action. Do not call `flow.push`, open a bridge page, or change the current route.

- [ ] **Step 4: Run the focused test and confirm it passes**

Run the Step 2 command again.

Expected: PASS; the phone remains on `home` and announces the external handoff.

- [ ] **Step 5: Commit**

```bash
git add src/Prototype.tsx tests/prototype-h5.spec.ts
git commit -m "feat: hand off adoption to external mini program"
```

---

### Task 2: Collapse `我的藏品` to the bracelet only

**Files:**

- Modify: `tests/prototype-h5.spec.ts`
- Modify: `src/Prototype.tsx`
- Modify: `src/prototype.css` only if selectors become unused

- [ ] **Step 1: Replace tree-carousel tests with a failing single-bracelet acceptance test**

Add or rewrite a test named `my collection contains only the bracelet archive` that asserts:

```ts
const collection = page.getByRole("region", { name: "我的藏品" });
await expect(collection.locator(".collection-card")).toHaveCount(1);
await expect(collection.getByText("海南琼南沉香手串", { exact: true })).toBeVisible();
await expect(collection.getByText("琼南一号认种沉香树", { exact: true })).toHaveCount(0);
await expect(collection.getByRole("button", { name: "上一件藏品" })).toHaveCount(0);
await expect(collection.getByRole("button", { name: "下一件藏品" })).toHaveCount(0);
await expect(collection.locator(".collection-pagination")).toHaveCount(0);
await expect(collection.getByRole("link", { name: /认种证书/ })).toHaveCount(0);
```

Open the remaining bracelet archive and confirm its existing record and electronic certificate still work.

- [ ] **Step 2: Run the focused collection test and confirm it fails**

```bash
MOBILE_RUNTIME_TEST_PORT=4175 PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/Users/xinwei/.cache/puppeteer/chrome-headless-shell/mac_arm-148.0.7778.97/chrome-headless-shell-mac-arm64/chrome-headless-shell npm run test:runtime -- --grep "my collection contains only"
```

Expected: FAIL because there are two records and tree switching controls.

- [ ] **Step 3: Simplify the collection data and component contract**

Change `Collectible.id` to the bracelet-only value, remove the tree record, and simplify `CollectionCard` so it no longer accepts `index`, `activeIndex`, or `onStep`. Remove tree-only status/number/seal branches, previous/next buttons, and pagination.

Simplify `CollectionShowcase` to render the one bracelet card without scroll-position state or tree branching. Its archive action always pushes `collectionArchiveScreen`.

- [ ] **Step 4: Remove the internal adoption implementation**

Delete `adoptionArchiveScreen`, the `mall` branch from `ArchiveCertificate`, the tree-only certificate download flow, and any remaining production references to `collectibles[1]`, `TR-2026-018`, `最近巡检`, `前往认种`, or `认种档案`.

Do not delete the unused binary/image assets in this task.

- [ ] **Step 5: Update existing collection tests without weakening bracelet coverage**

Remove tests for two-card cycling, interrupted tree drag, tree PDF mapping, and tree download retry. Keep or adapt tests for:

- bracelet card geometry on iPhone and Pixel
- bracelet archive navigation
- bracelet electronic-certificate href/download and success/failure behavior
- no horizontal overflow

- [ ] **Step 6: Run collection-focused regression**

```bash
MOBILE_RUNTIME_TEST_PORT=4175 PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/Users/xinwei/.cache/puppeteer/chrome-headless-shell/mac_arm-148.0.7778.97/chrome-headless-shell-mac-arm64/chrome-headless-shell npm run test:runtime -- --grep "collection|certificate links|certificate download"
```

Expected: all retained collection and bracelet-certificate tests pass; no test navigates to an adoption archive.

- [ ] **Step 7: Commit**

```bash
git add src/Prototype.tsx src/prototype.css tests/prototype-h5.spec.ts
git commit -m "refactor: remove internal adoption archive"
```

---

### Task 3: Align page PRD and project rules

**Files:**

- Modify: `tests/prototype-h5.spec.ts`
- Modify: `src/Prototype.tsx`
- Modify: `AGENTS.md`

- [ ] **Step 1: Write a failing page-PRD test**

Extend the homepage page-PRD test to assert:

```ts
await expect(drawer.getByText(/跳转外部认种小程序/).first()).toBeVisible();
await expect(drawer.getByText("认种档案", { exact: true })).toHaveCount(0);
await expect(drawer.getByText("成长时间线", { exact: true })).toHaveCount(0);
await expect(drawer.getByText(/15 个产品上下文/)).toBeVisible();
```

- [ ] **Step 2: Run the focused PRD test and confirm it fails**

```bash
MOBILE_RUNTIME_TEST_PORT=4175 PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/Users/xinwei/.cache/puppeteer/chrome-headless-shell/mac_arm-148.0.7778.97/chrome-headless-shell-mac-arm64/chrome-headless-shell npm run test:runtime -- --grep "page PRD entry|current-page PRD"
```

Expected: FAIL because P-14 and the 16-context footer remain.

- [ ] **Step 3: Remove P-14 and rewrite affected PRD content**

Delete the `adoption-archive` entries from `productDocPages` and `pagePrdDefaults`. Update the homepage PRD rules, action table, boundary, states, logging, acceptance, and technical assessment to describe an external Mini Program handoff. Update `collection-archive` to bracelet-only language. Change the review footer from 16 to 15 contexts.

- [ ] **Step 4: Record the durable decision**

Add a dated `AGENTS.md` fidelity note: `认种沉香树` is an external Mini Program entry, there is no internal adoption archive or adopted-tree collection item, and the H5 prototype only announces the handoff.

- [ ] **Step 5: Run focused PRD tests and source scan**

Run the Step 2 command, then:

```bash
rg -n "adoptionArchiveScreen|data-product-doc-page=\"adoption-archive\"|P-14 认种档案|TR-2026-018|最近巡检|前往认种" src/Prototype.tsx tests/prototype-h5.spec.ts
```

Expected: focused tests PASS and the source scan returns no internal-adoption implementation references.

- [ ] **Step 6: Commit**

```bash
git add AGENTS.md src/Prototype.tsx tests/prototype-h5.spec.ts
git commit -m "docs: align adoption external-jump PRD"
```

---

### Task 4: Full verification, visual QA, and public deployment

**Files:**

- Verify: changed source, tests, production build, Pages artifact, and public preview

- [ ] **Step 1: Run protected-runtime and full browser gates**

```bash
npm run check:runtime
MOBILE_RUNTIME_TEST_PORT=4175 PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/Users/xinwei/.cache/puppeteer/chrome-headless-shell/mac_arm-148.0.7778.97/chrome-headless-shell-mac-arm64/chrome-headless-shell npm run test:runtime
```

Expected: protected hashes pass and every Playwright test passes.

- [ ] **Step 2: Run builds and hosting tests**

```bash
npm run build
node --test tests/github-pages-build.test.mjs
npm run test:sites
npm run build:pages
git diff --check
```

Expected: all commands exit 0; Sites and Pages artifacts contain the certificate image and latest UI.

- [ ] **Step 3: Inspect real renders**

On iPhone and Pixel, capture and inspect the homepage collection and the post-click external-handoff status. Confirm one bracelet card, no tree controls, no layout gap, no internal route push, and no console error. Recheck the already-approved material certificate detail and viewer after the collection simplification.

- [ ] **Step 4: Push and wait for terminal deployment success**

Push `main`, monitor the GitHub Pages workflow to completion, and confirm the public asset and page return HTTP 200. Do not report completion while the workflow is queued or running.

- [ ] **Step 5: Verify the public preview**

At `https://xinwei5282-sys.github.io/chenxiang-ai-prototype/`, bypass stale cache and verify:

- `认种沉香树` remains on `home` and shows the external handoff status
- `我的藏品` contains only the bracelet
- no `认种档案` page or tree certificate is reachable
- the material appraisal certificate and P-07 drawer remain correct

---

## Plan self-check

- Spec coverage: direct external handoff, removal of the tree item/archive, native boundary, PRD removal, and failure boundary all map to Tasks 1–3.
- Placeholder scan: no TODO/TBD or unresolved product choices remain.
- Type consistency: `Collectible` becomes bracelet-only and no task reintroduces an adoption record.
- Safety: unused assets remain untouched; protected runtime files are verification-only.
- Execution mode: Inline Execution with focused tests before each implementation step and full verification before push.
