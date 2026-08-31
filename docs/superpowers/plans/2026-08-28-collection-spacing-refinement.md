# Collection Spacing Refinement Implementation Plan

> **For Codex execution:** This plan may be executed inline in the current session or step-by-step with explicit checkpoints. Keep checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the collection card feel less crowded by separating the product image from its copy while preserving full identifiers, 44px controls, and item-specific carousel behavior.

**Architecture:** Keep the existing `CollectionCard` markup and `Carousel` behavior unchanged. Add a browser-visible spacing contract, then adjust only the collection-specific CSS and remove the collection subtree from the later homepage-wide minimum-font override.

**Tech Stack:** React 19, TypeScript, Vite, CSS Grid, Playwright.

---

## File responsibility map

- Modify `tests/prototype-h5.spec.ts`: define the rendered spacing/no-overflow contract for iPhone and Pixel.
- Modify `src/prototype.css`: apply collection-only typography and geometry changes.
- Update `design-qa.md`: record the focused comparison and final result after screenshots are inspected.
- No `src/Prototype.tsx` or protected mobile-runtime file changes are required.

### Task 1: Add the rendered spacing regression

**Files:**
- Modify: `tests/prototype-h5.spec.ts`

- [x] **Step 1: Write the failing browser test**

Add a test that selects both device presets and measures the active card:

```ts
test("collection card separates product imagery from readable metadata on both devices", async ({ page }) => {
  for (const device of ["iphone", "pixel-10"] as const) {
    await page.getByTestId("device-picker").click();
    await page.getByTestId(`device-option-${device}`).click();
    const active = page.getByRole("region", { name: "我的藏品" }).locator('.collection-card[data-active="true"]');
    const spacing = await active.evaluate(card => {
      const image = card.querySelector(".collection-card-body > img")!.getBoundingClientRect();
      const copy = card.querySelector(".collection-card-copy")!.getBoundingClientRect();
      const metadata = [...card.querySelectorAll<HTMLElement>("dd")];
      return {
        imageCopyGap: copy.left - image.right,
        metadataFits: metadata.every(item => item.scrollWidth <= item.clientWidth + 1),
      };
    });
    expect(spacing.imageCopyGap).toBeGreaterThanOrEqual(10);
    expect(spacing.metadataFits).toBe(true);
  }
});
```

- [x] **Step 2: Run the focused test and verify RED**

Run:

```bash
MOBILE_RUNTIME_TEST_PORT=4306 PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/Users/xinwei/.cache/puppeteer/chrome-headless-shell/mac_arm-148.0.7778.97/chrome-headless-shell-mac-arm64/chrome-headless-shell npx playwright test tests/prototype-h5.spec.ts -g "separates product imagery"
```

Expected: FAIL because the current iPhone image-to-copy gap is about `3px`, below the `10px` requirement.

### Task 2: Apply collection-only spacing and type hierarchy

**Files:**
- Modify: `src/prototype.css`

- [x] **Step 1: Remove the collection subtree from the homepage-wide minimum-font selector**

Delete `.home-root-screen .home-collection *` from the comma-separated blanket selector near the end of the reference-homepage rules. Remove the now-unused collection header-button entries from the adjacent `--home-font-size` selector list.

- [x] **Step 2: Apply the minimum CSS change**

Set the collection-specific rules to:

```css
.collection-card-header a,
.collection-card-header button { font-size: 11.5px; }
.collection-card-body { grid-template-columns: 44px 84px minmax(0, 1fr) 36px 44px; gap: 3px; }
.collection-card-body > img { width: 84px; height: 84px; }
.collection-card-copy { margin-left: 8px; }
.collection-name-row > small { font-size: 9.5px; }
.collection-card-copy dt,
.collection-card-copy dd { font-size: 10px; }
.collection-seal { width: 36px; height: 36px; font-size: 22px; }
.device-screen[data-device="pixel-10"] .collection-card-body { grid-template-columns: 44px 92px minmax(0, 1fr) 40px 44px; gap: 6px; }
.device-screen[data-device="pixel-10"] .collection-card-body > img { width: 92px; height: 92px; }
.device-screen[data-device="pixel-10"] .collection-seal { width: 40px; height: 40px; font-size: 24px; }
```

Keep `.collection-step` at `44 × 44px` and do not add CSS scroll snapping.

- [x] **Step 3: Run the focused test and verify GREEN**

Run the Task 1 command again.

Expected: PASS with `imageCopyGap >= 10` and no metadata overflow on both devices.

### Task 3: Regression, build, and visual QA

**Files:**
- Modify: `design-qa.md`
- Generate: `audit/collection-card-reference-2026-08-28/*.png`

- [x] **Step 1: Run collection/certificate regression**

```bash
MOBILE_RUNTIME_TEST_PORT=4307 PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/Users/xinwei/.cache/puppeteer/chrome-headless-shell/mac_arm-148.0.7778.97/chrome-headless-shell-mac-arm64/chrome-headless-shell npx playwright test tests/prototype-h5.spec.ts -g "collection|certificate"
```

Expected: all focused collection/certificate tests pass.

- [x] **Step 2: Verify runtime and production build**

```bash
npm run check:runtime
npm run build
```

Expected: both commands exit `0`; the existing Vite large-chunk warning may remain non-blocking.

- [x] **Step 3: Capture and inspect real rendering**

Run the existing collection QA capture against `http://127.0.0.1:4174/`, then inspect bracelet/tree cards on iPhone and Pixel. Compare the iPhone bracelet card beside the supplied `464 × 163` reference.

Expected: visibly larger image-to-copy breathing room, full `CX-2018-072` and `TR-2026-018`, no overlap/cropping, and unchanged active-item interactions.

- [x] **Step 4: Update the QA report**

Append the spacing iteration, screenshot evidence, test evidence, and set `final result: passed` only if no P0/P1/P2 issue remains.

## Execution mode

Use **Inline Execution** in the current session. The project has no Git metadata, so no commit step is possible; preserve unrelated workspace changes and report this limitation at handoff.
