# Home Question Folio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the NFC landing homepage so the verified bracelet remains the context while `为本串问一帖` becomes the unmistakable, fully visible primary action.

**Architecture:** Keep the existing `Home` component and `FlowStack` routes, but replace the equal-weight metadata and feature grids with four semantic sections: product stage, compact credential, primary question folio, and archive index. Preserve the protected mobile runtime and all existing destination flows; validate hierarchy through Playwright geometry assertions and two rounds of real iPhone/Pixel screenshots.

**Tech Stack:** React 19, TypeScript, Vite, project mobile runtime, Radix Icons, Playwright.

**Spec:** `docs/superpowers/specs/2026-08-21-home-question-folio-redesign.md`

## Global Constraints

- Modify only `src/Prototype.tsx`, `src/prototype.css`, and `tests/prototype-h5.spec.ts` for product behavior.
- Preserve `AI传统文化解读` as the business label and use `为本串问一帖` as the visible primary action.
- Keep NFC landing on the homepage; the primary action pushes the existing `interpretScreen`.
- Keep `2018`, `海南琼南`, `清甜木香`, `CX-2018-072`, the real product image, and the Guangdong Agricultural Reclamation logo.
- Maintain at least 44px touch targets and keep the entire primary action visible without scrolling on iPhone and Pixel 10.
- Do not edit protected runtime files; `npm run check:runtime` must remain green.
- This project directory is not a Git repository, so commit steps are replaced with explicit verification checkpoints.

---

### Task 1: Lock the homepage hierarchy with a failing browser test

**Files:**
- Modify: `tests/prototype-h5.spec.ts`

**Interfaces:**
- Consumes: the initial `Home` route rendered at `/`.
- Produces: a regression contract for `home-question-folio`, its labels, viewport visibility, and visual priority.

- [ ] **Step 1: Write the failing test**

Add a test that locates the primary action by accessible name and verifies that the old equal-weight grid classes are absent:

```ts
test("NFC homepage makes the bracelet question folio the primary above-fold action", async ({ page }) => {
  const current = page.getByTestId("flow-current");
  const questionFolio = current.getByRole("button", { name: /为本串问一帖/ });

  await expect(current.getByText("AI传统文化解读", { exact: true })).toBeVisible();
  await expect(questionFolio).toBeVisible();
  await expect(current.locator(".metadata-grid, .home-secondary-actions, .home-later-entry")).toHaveCount(0);

  const layout = await page.evaluate(() => {
    const screen = document.querySelector<HTMLElement>('[data-testid="device-screen"]')!;
    const folio = document.querySelector<HTMLElement>('[data-testid="home-question-folio"]')!;
    const certificate = document.querySelector<HTMLElement>('[data-testid="home-certificate-link"]')!;
    const folioRect = folio.getBoundingClientRect();
    const certificateRect = certificate.getBoundingClientRect();
    return {
      screenBottom: screen.getBoundingClientRect().bottom,
      folioBottom: folioRect.bottom,
      folioArea: folioRect.width * folioRect.height,
      certificateArea: certificateRect.width * certificateRect.height,
    };
  });

  expect(layout.folioBottom).toBeLessThanOrEqual(layout.screenBottom - 16);
  expect(layout.folioArea).toBeGreaterThan(layout.certificateArea * 1.45);
});
```

- [ ] **Step 2: Run the new test and verify RED**

Run:

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/Users/xinwei/.cache/puppeteer/chrome-headless-shell/mac_arm-148.0.7778.97/chrome-headless-shell-mac-arm64/chrome-headless-shell npx playwright test tests/prototype-h5.spec.ts --grep "question folio"
```

Expected: FAIL because `为本串问一帖` and `data-testid="home-question-folio"` do not exist.

- [ ] **Step 3: Verification checkpoint**

Record the failing assertion before implementation; do not weaken the viewport or area thresholds to make the current page pass.

---

### Task 2: Replace the homepage structure with the approved four-section composition

**Files:**
- Modify: `src/Prototype.tsx:28-56`

**Interfaces:**
- Consumes: existing `product`, `officialLogo`, `prepareH5Transition`, `certificateScreen`, `interpretScreen`, `careScreen`, `knowledgeScreen`, and `BottomSheet`.
- Produces: `.home-stage`, `.home-credential`, `.home-question-folio`, and `.home-archive-index` markup with unchanged route behavior.

- [ ] **Step 1: Implement semantic homepage markup**

Replace the old `hero-panel`, `verification-panel`, `metadata-grid`, `home-secondary-actions`, and `home-later-entry` composition with:

```tsx
<section className="home-stage">
  <div className="brand-bar">...</div>
  <img src={product} alt="海南琼南沉香手串" />
  <div className="home-stage-id"><small>当前手串</small><strong>CX-2018-072</strong></div>
</section>
<section className="home-credential" aria-label="手串数字身份">
  <div className="home-verified"><CheckCircledIcon /><strong>数字身份已核验</strong><span>2026-08-20</span></div>
  <dl><div><dt>年份</dt><dd>2018</dd></div><div><dt>产区</dt><dd>海南琼南</dd></div><div><dt>香韵</dt><dd>清甜木香</dd></div></dl>
</section>
<button data-testid="home-question-folio" className="home-question-folio" onClick={...}>
  <span><small>AI传统文化解读</small><strong>为本串问一帖</strong><em>说出此刻最挂心的事，我会先问清，再为你解读。</em></span>
  <ChevronRightIcon />
</button>
<nav className="home-archive-index" aria-label="手串档案与服务">...</nav>
```

- [ ] **Step 2: Preserve all destination behavior**

Use the existing navigation handlers exactly:

```tsx
onClick={() => {
  prepareH5Transition(keyboard);
  flow.push(interpretScreen(keyboard));
}}
```

Add `data-testid="home-certificate-link"` to the certificate button. Keep the care, knowledge, and advisor actions wired to their current destinations.

- [ ] **Step 3: Run the hierarchy test**

Run the Task 1 command.

Expected: the content assertions pass; geometry may still fail until Task 3 CSS lands.

---

### Task 3: Build the archive-stage visual system and make the primary action fit above the fold

**Files:**
- Modify: `src/prototype.css:63-66`

**Interfaces:**
- Consumes: Task 2 class names.
- Produces: iPhone and Pixel-safe layout with a single dominant question folio and non-card archive links.

- [ ] **Step 1: Replace legacy home CSS**

Implement the following size contract:

```css
.home-content { min-height:100%; background:#f4f0e6; color:#17231e; }
.home-stage { position:relative; height:352px; overflow:hidden; background:#0c3628; }
.home-stage > img { width:100%; height:248px; object-fit:cover; object-position:center; }
.home-credential { margin:-1px 20px 0; padding:14px 0 12px; border-bottom:1px solid #b9aa94; }
.home-question-folio { width:calc(100% - 40px); min-height:102px; margin:14px 20px 0; }
.home-archive-index button { min-height:48px; }
```

Refine typography, copper rules, square corners, focus-visible state, and pressed state. The primary folio must be the only filled interaction surface below the product stage; archive links must use rows and hairlines.

- [ ] **Step 2: Remove obsolete home selectors**

Delete the styles for `.hero-panel`, `.verification-panel`, `.metadata-grid`, `.certificate-action`, `.home-secondary-actions`, and `.home-later-entry`. Do not touch Agent folio styles or protected runtime CSS.

- [ ] **Step 3: Run the hierarchy and navigation tests**

Run:

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/Users/xinwei/.cache/puppeteer/chrome-headless-shell/mac_arm-148.0.7778.97/chrome-headless-shell-mac-arm64/chrome-headless-shell npx playwright test tests/prototype-h5.spec.ts --grep "question folio|traditional culture entry|certificate navigation"
```

Expected: all selected tests PASS.

- [ ] **Step 4: Verification checkpoint**

Run `npm run check:runtime` and confirm all 28 protected files pass integrity checking.

---

### Task 4: Render, compare, and refine the real mobile composition

**Files:**
- Create: `audit/home-question-folio-2026-08-21/round1-iphone.png`
- Create: `audit/home-question-folio-2026-08-21/round1-pixel.png`
- Create: `audit/home-question-folio-2026-08-21/round2-iphone.png`
- Create: `audit/home-question-folio-2026-08-21/round2-pixel.png`
- Create: `audit/home-question-folio-2026-08-21/report.md`
- Modify if required: `src/prototype.css`

**Interfaces:**
- Consumes: rendered homepage plus `reference/b-museum-credential.png`.
- Produces: screenshot evidence and a scorecard at 90/100 or higher.

- [ ] **Step 1: Capture round one at both device presets**

Capture the initial homepage at iPhone and Pixel 10 sizes, excluding the desktop-only simulated cursor from evidence images.

- [ ] **Step 2: Compare against the selected reference and record the three largest visible issues**

Check first-focus clarity, image-to-content proportion, primary-versus-secondary contrast, typography, clipping, safe areas, and whether the page still reads as a feature grid.

- [ ] **Step 3: Fix the three visible issues**

Apply only evidence-driven spacing, type, crop, or hierarchy changes in `src/prototype.css`; do not add modules.

- [ ] **Step 4: Capture round two and score**

Re-capture both devices. Score using the visual design scorecard; do not hand off below 90/100.

---

### Task 5: Run the full delivery gate and reopen preview

**Files:**
- Verify: `src/Prototype.tsx`
- Verify: `src/prototype.css`
- Verify: `tests/prototype-h5.spec.ts`
- Verify: `audit/home-question-folio-2026-08-21/report.md`

**Interfaces:**
- Consumes: Tasks 1-4.
- Produces: a verified local prototype ready for user inspection.

- [ ] **Step 1: Run the complete browser suite**

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/Users/xinwei/.cache/puppeteer/chrome-headless-shell/mac_arm-148.0.7778.97/chrome-headless-shell-mac-arm64/chrome-headless-shell npx playwright test
```

Expected: all tests PASS.

- [ ] **Step 2: Run runtime, build, and Sites checks**

```bash
npm run check:runtime
npm run build
npm run test:sites
```

Expected: runtime integrity passes, Vite build succeeds, and all Sites worker tests pass.

- [ ] **Step 3: Open the final local preview**

Open `http://127.0.0.1:4173/?preview=home-question-folio-final` in the user's browser and keep the preview server running.

