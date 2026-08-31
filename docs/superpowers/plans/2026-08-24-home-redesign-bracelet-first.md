# Bracelet-First Homepage Implementation Plan

> **For Codex execution:** This plan may be executed inline in the current session or step-by-step with explicit checkpoints. Keep checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Mini Program homepage around one product-led bracelet hero, keep `开始问帖` as the only solid primary action, and preserve the existing authorization, provenance, root-tab, and service flows.

**Architecture:** Keep the protected mobile runtime and existing `FlowStack` routes unchanged. Replace the separate `brand-story-banner` and `BraceletSummary` homepage blocks with one `BraceletHero` component, then keep question, provenance, recent reading, and services as lightweight sections on the shared paper surface. Use the existing shared authorization context and provenance route handlers rather than introducing new state or routes.

**Tech Stack:** React 19, TypeScript, CSS, Radix Icons, existing mobile runtime, Playwright.

**Repository note:** `/Users/xinwei/projects/chenxiang-ai/prototype` is not a Git worktree. Do not initialize Git. Use passing tests, runtime integrity checks, screenshots, and the saved audit artifacts as checkpoints instead of commits.

**Confirmed refinement:** the hero must be full-bleed directly below the root navigation with `border-radius: 0`, and the complete homepage must fit above the fixed tabs without vertical scrolling. Render certificate, care, and knowledge as one compact three-way action strip.

---

## File responsibility map

- Modify `tests/prototype-h5.spec.ts`: define the observable homepage hierarchy, unique product image, provenance navigation, authorization continuity, and no-gradient/continuous-surface requirements.
- Modify `src/Prototype.tsx`: add `BraceletHero`, simplify `Home`, reuse existing provenance and authorization handlers, and remove homepage-only legacy composition.
- Modify `src/prototype.css`: implement the selected product-led hero and tighter above-fold rhythm without changing profile, Agent, detail screens, or protected runtime styles.
- Update `/private/tmp/mini-program-capture.mjs`: change only local capture selectors from the old CTA label to the selected CTA label so verification screenshots can be generated.
- Create `audit/home-redesign-2026-08-24/round-1/` and later rounds: store accepted iPhone/Pixel renders and before/after comparisons.
- Modify `audit/home-redesign-2026-08-24/visual-review.md`: record visual findings and the fixes made between rounds.

## Spec coverage

| Requirement | Plan task |
|---|---|
| Merge image ad, Guangken provenance, verified identity, and bracelet metadata | Task 2 |
| Remove separate Banner/current-bracelet repetition | Tasks 1–3 |
| Keep `开始问帖` as only solid primary action | Tasks 1–3 |
| Preserve shared authorization and direct continuation | Tasks 1, 2, 5 |
| Keep provenance, recent reading, and services as divided rows | Tasks 2–3 |
| No gradient, glow, card wall, or repeated product image | Tasks 1, 3, 4 |
| Keep CTA above fixed tabs on iPhone and Pixel | Tasks 1, 4, 5 |
| Two visual review rounds with before/after comparison | Task 4 |

---

### Task 1: Lock the selected homepage behavior with failing tests

**Files:**
- Modify: `tests/prototype-h5.spec.ts`
- Test: `tests/prototype-h5.spec.ts`

- [ ] **Step 1: Replace the old home hierarchy expectation**

Update the first homepage test to assert the selected heading, button, hero order, and above-tab placement:

```ts
test("mini-program home keeps the bracelet hero and question action above the fixed tabs", async ({ page }) => {
  const current = page.getByTestId("flow-current");
  const hero = current.getByTestId("home-bracelet-hero");
  const startReading = current.getByRole("button", { name: "开始问帖" });

  await expect(hero).toBeVisible();
  await expect(current.getByRole("heading", { name: "为这串沉香，问一件挂心事" })).toBeVisible();
  await expect(startReading).toBeVisible();
  await expect(current.getByText("新的合作是否适合推进？", { exact: true })).toBeVisible();

  const layout = await page.evaluate(() => {
    const hero = document.querySelector<HTMLElement>('[data-testid="home-bracelet-hero"]')!;
    const action = document.querySelector<HTMLElement>('[data-testid="home-reading-action"]')!;
    const tabs = document.querySelector<HTMLElement>('[aria-label="小程序导航"]')!;
    return {
      heroTop: hero.getBoundingClientRect().top,
      actionTop: action.getBoundingClientRect().top,
      actionBottom: action.getBoundingClientRect().bottom,
      tabsTop: tabs.getBoundingClientRect().top,
    };
  });

  expect(layout.heroTop).toBeLessThan(layout.actionTop);
  expect(layout.actionBottom).toBeLessThan(layout.tabsTop);
});
```

- [ ] **Step 2: Replace the separate Banner test with merged-hero navigation behavior**

```ts
test("home product hero merges Guangken provenance and bracelet identity", async ({ page }) => {
  const current = page.getByTestId("flow-current");
  await expect(current.getByRole("img", { name: "广东农垦" })).toBeVisible();
  await expect(current.getByRole("img", { name: "海南琼南沉香手串" })).toHaveCount(1);
  await expect(current.getByText("CX-2018-072 · 2018 · 海南琼南 · 清甜木香", { exact: true })).toBeVisible();
  await expect(current.getByText("身份已核验", { exact: true })).toBeVisible();
  await expect(current.locator(".brand-story-banner, .bracelet-summary")).toHaveCount(0);

  await current.getByRole("button", { name: "查看海南琼南沉香手串来处" }).click();
  await expect(page.getByRole("heading", { name: "证书与溯源", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "返回" }).click();
  await page.waitForTimeout(350);
  await page.getByTestId("flow-current").getByRole("button", { name: "查看本串来处" }).click();
  await expect(page.getByRole("heading", { name: "证书与溯源", exact: true })).toBeVisible();
});
```

- [ ] **Step 3: Replace the old continuous-surface test with the selected anti-template rules**

```ts
test("home uses one solid product container and lightweight supporting rows", async ({ page }) => {
  const visual = await page.getByTestId("flow-current").evaluate((current) => {
    const home = current.querySelector<HTMLElement>(".mini-home")!;
    const caption = current.querySelector<HTMLElement>(".bracelet-hero-caption")!;
    const recent = current.querySelector<HTMLElement>(".recent-reading")!;
    const services = current.querySelector<HTMLElement>(".service-section")!;
    return {
      homeBackground: getComputedStyle(home).backgroundColor,
      captionBackgroundImage: getComputedStyle(caption).backgroundImage,
      recentBackground: getComputedStyle(recent).backgroundColor,
      servicesBackground: getComputedStyle(services).backgroundColor,
      legacyBlocks: current.querySelectorAll(".brand-story-banner, .bracelet-summary").length,
      productImages: current.querySelectorAll('img[alt="海南琼南沉香手串"]').length,
    };
  });

  expect(visual.captionBackgroundImage).toBe("none");
  expect(visual.recentBackground).toBe(visual.homeBackground);
  expect(visual.servicesBackground).toBe(visual.homeBackground);
  expect(visual.legacyBlocks).toBe(0);
  expect(visual.productImages).toBe(1);
});
```

- [ ] **Step 4: Update existing homepage CTA references**

Change only homepage CTA queries from `开始一次问帖` to `开始问帖`, and change the home-return heading expectation from `今天，想问什么？` to `为这串沉香，问一件挂心事`. Keep the authorization assertions and Agent behavior unchanged.

- [ ] **Step 5: Run the focused tests and verify RED**

Run:

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/Users/xinwei/.cache/puppeteer/chrome-headless-shell/mac_arm-148.0.7778.97/chrome-headless-shell-mac-arm64/chrome-headless-shell \
npx playwright test tests/prototype-h5.spec.ts -g "bracelet hero|product hero|solid product container|authorization|agent actively"
```

Expected: the new hero tests fail because `home-bracelet-hero` and `bracelet-hero-caption` do not exist, while the authorization and Agent tests fail only on the renamed homepage CTA.

### Task 2: Replace the repeated homepage composition with one bracelet hero

**Files:**
- Modify: `src/Prototype.tsx`
- Test: `tests/prototype-h5.spec.ts`

- [ ] **Step 1: Replace `BraceletSummary` with `BraceletHero`**

Use the real product and official logo assets already declared at the top of the file:

```tsx
function BraceletHero({ onOpen }: { onOpen: () => void }) {
  return <button
    className="bracelet-hero"
    data-testid="home-bracelet-hero"
    aria-label="查看海南琼南沉香手串来处"
    onClick={onOpen}
  >
    <span className="bracelet-hero-brand"><img src={officialLogo} alt="广东农垦" /></span>
    <img className="bracelet-hero-photo" src={product} alt="海南琼南沉香手串" />
    <span className="bracelet-hero-caption">
      <span><strong>海南琼南沉香手串</strong><small>CX-2018-072 · 2018 · 海南琼南 · 清甜木香</small></span>
      <span className="bracelet-hero-verified"><CheckCircledIcon />身份已核验</span>
    </span>
  </button>;
}
```

Remove `BraceletSummary`; it has no remaining consumer after the profile redesign.

- [ ] **Step 2: Recompose `Home` without changing shared state**

Add one provenance handler and use it for both hero and source row:

```tsx
const openProvenance = () => {
  prepareH5Transition(keyboard);
  flow.push(certificateScreen(keyboard));
};
```

Replace the old Banner and summary with:

```tsx
<BraceletHero onOpen={openProvenance} />
<section className="question-section">
  <p>AI传统文化解读</p>
  <h2>为这串沉香，问一件挂心事</h2>
  <span>说说此刻最挂心的事，我会先问清，再为你解读。</span>
  <button data-testid="home-reading-action" className="start-reading" onClick={openReading}>开始问帖</button>
</section>
<button className="provenance-row" aria-label="查看本串来处" onClick={openProvenance}>
  <span><small>来自农垦的时间</small><strong>查看本串来处</strong></span>
  <ChevronRightIcon />
</button>
```

Keep `recent-section`, `service-section`, `MiniTabs`, `AuthorizationSheet`, `openReading`, and `authorizeAndEnter` behavior intact.

- [ ] **Step 3: Run TypeScript before styling**

Run:

```bash
npx tsc --noEmit
```

Expected: PASS. If it fails, fix JSX/accessibility typing before editing CSS.

### Task 3: Implement the selected visual hierarchy

**Files:**
- Modify: `src/prototype.css`
- Test: `tests/prototype-h5.spec.ts`

- [ ] **Step 1: Remove the legacy home block styles**

Delete the `.bracelet-summary*`, `.brand-story-banner*`, `.brand-story-copy*`, and `.brand-story-product` rules. Remove those legacy selectors from the shared `:focus-visible` rule.

- [ ] **Step 2: Add the single hero container**

Use a fixed mobile-app scale and a solid caption band:

```css
.bracelet-hero {
  position: relative;
  width: 100%;
  height: 216px;
  margin-top: 10px;
  padding: 0;
  overflow: hidden;
  display: grid;
  grid-template-rows: 154px 62px;
  border: 1px solid #d7d0c1;
  border-radius: 13px;
  background: #ddd2bf;
  color: #f6f1e7;
  text-align: left;
}

.bracelet-hero-photo { width: 100%; height: 154px; display: block; object-fit: cover; object-position: 54% 54%; }
.bracelet-hero-brand { position: absolute; top: 12px; left: 12px; z-index: 1; padding: 7px 9px; border-radius: 7px; background: #f2eee4; }
.bracelet-hero-brand img { display: block; width: 76px; height: 22px; object-fit: contain; }
.bracelet-hero-caption { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 10px; padding: 10px 12px 11px 14px; background: #24493d; background-image: none; }
.bracelet-hero-caption > span:first-child { min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.bracelet-hero-caption strong { font-size: 15px; font-weight: 650; }
.bracelet-hero-caption small { overflow: hidden; color: #dce8e1; font-size: 9px; line-height: 1.35; text-overflow: ellipsis; white-space: nowrap; }
.bracelet-hero-verified { display: flex; align-items: center; gap: 3px; color: #e9f3ee; font-size: 10px; font-weight: 600; white-space: nowrap; }
.bracelet-hero-verified svg { width: 14px; height: 14px; }
.bracelet-hero:active { transform: translateY(1px); }
```

Do not add gradients, image overlays, shadows, transparent caption surfaces, or a second product image.

- [ ] **Step 3: Tighten the question and supporting rows**

Reduce the question section and button height enough to keep the CTA above the tabs:

```css
.question-section { padding: 20px 3px 18px; }
.question-section h2 { max-width: 12em; font-size: 25px; line-height: 1.3; }
.start-reading { min-height: 52px; margin-top: 15px; }
.provenance-row { width: 100%; min-height: 52px; display: grid; grid-template-columns: 1fr 18px; align-items: center; padding: 9px 3px; border: 0; border-top: 1px solid #d8d5cb; border-bottom: 1px solid #d8d5cb; background: var(--paper); text-align: left; }
.provenance-row span { display: flex; align-items: baseline; justify-content: space-between; gap: 14px; }
.provenance-row small { color: var(--warm); font-size: 11px; }
.provenance-row strong { color: var(--green-deep); font-size: 12px; }
.provenance-row svg { width: 15px; color: #9b9e96; }
```

Add `.bracelet-hero` and `.provenance-row` to the existing focus-visible rule. Preserve 44/48px targets and existing reduced-motion handling.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run the Task 1 focused command again.

Expected: PASS. The mutation check is: reintroducing `.bracelet-summary`, adding a CSS gradient to `.bracelet-hero-caption`, duplicating the product image, bypassing authorization, or pushing the CTA below the tabs must fail at least one focused test.

### Task 4: Run the two-round visual review loop

**Files:**
- Modify: `/private/tmp/mini-program-capture.mjs`
- Create: `audit/home-redesign-2026-08-24/round-1/*.png`
- Create: `audit/home-redesign-2026-08-24/round-2/*.png`
- Create: `audit/home-redesign-2026-08-24/visual-review.md`

- [ ] **Step 1: Update the temporary capture selector**

Change only:

```js
page.getByRole("button", { name: "开始一次问帖" })
```

to:

```js
page.getByRole("button", { name: "开始问帖" })
```

- [ ] **Step 2: Capture round 1**

Run:

```bash
node /private/tmp/mini-program-capture.mjs /Users/xinwei/projects/chenxiang-ai/prototype/audit/home-redesign-2026-08-24/round-1
```

Inspect at minimum `iphone-home.png`, `pixel-home.png`, and `iphone-reading-auth-gate.png` with the image viewer.

- [ ] **Step 3: Compare against the current audit**

Place `audit/home-redesign-2026-08-24/current/iphone-home.png` and `round-1/iphone-home.png` side by side. At 100%, 50%, and 25%, verify:

- the product hero is the first focus;
- the product image is not repeated;
- the caption is a solid band without a gradient;
- the CTA is fully visible and stronger than provenance/history;
- no copy is clipped;
- the hero does not look like a marketing landing page;
- iPhone and Pixel safe areas remain correct.

- [ ] **Step 4: Fix the three largest visible issues**

Limit corrections to `src/Prototype.tsx` and `src/prototype.css`. Do not add features or change profile/Agent pages. Re-run the focused test after every correction batch.

- [ ] **Step 5: Capture and inspect round 2**

Run the capture script into `round-2`, inspect the same states, and document the differences in `visual-review.md`. The selected design must score at least 90/100 using the visual director scorecard before handoff.

### Task 5: Full verification and preview handoff

**Files:**
- Verify: `src/Prototype.tsx`
- Verify: `src/prototype.css`
- Verify: `tests/prototype-h5.spec.ts`
- Verify: protected runtime files

- [ ] **Step 1: Run all browser tests**

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/Users/xinwei/.cache/puppeteer/chrome-headless-shell/mac_arm-148.0.7778.97/chrome-headless-shell-mac-arm64/chrome-headless-shell \
npx playwright test
```

Expected: all 21 tests pass.

- [ ] **Step 2: Run runtime, TypeScript, Sites, and production checks**

```bash
npm run check:runtime && npx tsc --noEmit && npm run test:sites && npm run build
```

Expected: 28 protected runtime files pass integrity checks; TypeScript passes; 4 Sites tests pass; Vite production build completes.

- [ ] **Step 3: Scan for unfinished source markers**

```bash
rg -n "TBD|TODO|FIXME|lorem ipsum|coming soon" src tests docs/superpowers/specs/2026-08-24-home-redesign-bracelet-first-design.md docs/superpowers/plans/2026-08-24-home-redesign-bracelet-first.md
```

Expected: no unfinished product or test markers. A literal scan command inside this plan is not a source-code defect.

- [ ] **Step 4: Verify and open the local preview**

```bash
curl -I http://127.0.0.1:4173
open http://127.0.0.1:4173
```

Expected: HTTP 200 and the verified B homepage opens in the user's browser.

## Execution modes

- **Inline Execution:** continue in this session through all tasks, reporting only meaningful visual checkpoints. This is the selected mode because the user confirmed the specification and asked for the redesign to be built.
- **Checkpoint Execution:** stop after each task for review. Use only if a new visual or product decision appears during implementation.
