# External Product Document Drawer Implementation Plan

> **For Codex execution:** This plan may be executed inline in the current session or step-by-step with explicit checkpoints. Keep checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a browser-level product-document button and right-side PRD drawer outside the phone model while preserving all Mini Program behavior.

**Architecture:** `Prototype.tsx` imports the authoritative PRD as raw Markdown and renders an isolated review-layer component through `createPortal(..., document.body)`. A small, safe Markdown renderer converts only the supported headings, paragraphs, lists, links, emphasis, and inline code to React elements; prefixed CSS owns the fixed review controls and responsive drawer without modifying the protected mobile runtime.

**Tech Stack:** React 19, React DOM Portal, TypeScript, Vite raw imports, project CSS, Playwright.

---

## File responsibility map

- Modify `src/Prototype.tsx`: review-layer state, external Portal, safe Markdown parsing/rendering, table-of-contents navigation, keyboard/focus behavior.
- Modify `src/prototype.css`: isolated `product-doc-review-*` entry and drawer styling, responsive width, typography, motion reduction.
- Modify `tests/prototype-h5.spec.ts`: browser-layer placement, complete PRD rendering, navigation, close/focus, and phone-operability regression tests.
- Reference only `docs/codex/prd/2026-08-24-agarwood-digital-identity-ai-reflection-mvp.md`: authoritative document source; do not copy or edit its content.
- Reference only `docs/superpowers/specs/2026-08-24-external-product-doc-drawer-design.md`: approved behavior and acceptance criteria.

### Task 1: Lock the browser-layer contract with failing tests

**Files:**
- Modify: `tests/prototype-h5.spec.ts`

- [x] **Step 1: Add a placement and content test**

Append a test with these exact assertions:

```ts
test("product document review drawer lives outside the phone and renders the PRD", async ({ page }) => {
  const phoneScreen = page.getByTestId("device-screen");
  const trigger = page.getByRole("button", { name: "产品文档" });

  await expect(trigger).toBeVisible();
  await expect(phoneScreen.getByRole("button", { name: "产品文档" })).toHaveCount(0);
  expect(await trigger.evaluate((node) => Boolean(node.closest("[data-phone-screen]")))).toBe(false);

  await trigger.click();
  const drawer = page.getByRole("dialog", { name: "产品文档" });
  await expect(drawer).toBeVisible();
  await expect(drawer.getByRole("heading", { name: "琼南沉香小程序 MVP PRD：数字身份 + AI 自我反思助手" })).toBeVisible();
  for (const section of ["Problem Statement", "Solution", "User Stories", "Implementation Decisions", "Testing Decisions", "Scope Priority", "Out of Scope", "Further Notes"]) {
    await expect(drawer.getByRole("heading", { name: section, exact: true })).toBeAttached();
  }
});
```

- [x] **Step 2: Add interaction and non-regression assertions**

Add a second test that opens the drawer, clicks the `Solution` table-of-contents button, verifies the `Solution` heading is in the drawer viewport, switches to `Pixel 10`, confirms the phone still uses `data-device="pixel-10"`, presses `Escape`, and verifies focus returns to the `产品文档` trigger.

```ts
test("product document drawer navigates, closes, and leaves the phone operable", async ({ page }) => {
  const trigger = page.getByRole("button", { name: "产品文档" });
  await trigger.click();
  const drawer = page.getByRole("dialog", { name: "产品文档" });
  await drawer.getByRole("button", { name: "Solution" }).click();
  await expect(drawer.getByRole("heading", { name: "Solution", exact: true })).toBeInViewport();

  await page.getByTestId("device-picker").click();
  await page.getByTestId("device-option-pixel-10").click();
  await expect(page.getByTestId("device-screen")).toHaveAttribute("data-device", "pixel-10");

  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
  await expect(trigger).toBeFocused();
});
```

- [x] **Step 3: Run the new tests and verify they fail for the missing trigger**

Run:

```bash
npx playwright test tests/prototype-h5.spec.ts --grep "product document"
```

Expected: both tests fail because the `产品文档` browser-level trigger does not exist.

### Task 2: Implement the external review layer and safe Markdown rendering

**Files:**
- Modify: `src/Prototype.tsx`

- [x] **Step 1: Add imports and authoritative document input**

Add `createPortal`, document icons, and the raw PRD import:

```ts
import { createPortal } from "react-dom";
import { FileText, Mic, X } from "lucide-react";
import productDocMarkdown from "../docs/codex/prd/2026-08-24-agarwood-digital-identity-ai-reflection-mvp.md?raw";
```

Replace the existing standalone `Mic` import rather than creating a duplicate `lucide-react` import.

- [x] **Step 2: Add supported Markdown types and parsing helpers**

Define a local `MarkdownBlock` union for headings, paragraphs, unordered lists, and ordered lists. Parse the source line-by-line, group adjacent list items, and assign stable IDs to headings. The top-level English section IDs must map exactly to:

```ts
const productDocSections = [
  "Problem Statement",
  "Solution",
  "User Stories",
  "Implementation Decisions",
  "Testing Decisions",
  "Scope Priority",
  "Out of Scope",
  "Further Notes",
] as const;
```

Inline rendering must recognize links, inline code, and bold text. All unmatched text must stay as React text nodes; do not use `dangerouslySetInnerHTML`.

- [x] **Step 3: Add `ProductDocumentReview`**

Implement one isolated component with:

```tsx
function ProductDocumentReview() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const blocks = useMemo(() => parseProductMarkdown(productDocMarkdown), []);

  // While open: Escape closes. After close: focus trigger.
  // On open: focus close control without locking focus inside the non-modal drawer.
  // TOC buttons call document.getElementById(id)?.scrollIntoView(...).

  return createPortal(
    <div className="product-doc-review-layer" data-testid="product-doc-review-layer">
      {/* external trigger and non-modal role=dialog drawer */}
    </div>,
    document.body,
  );
}
```

The trigger is always present. The drawer uses `role="dialog"`, `aria-modal="false"`, `aria-labelledby="product-doc-review-title"`, `aria-hidden={!open}`, and an `open` class/data attribute for transition styling. Keep the drawer mounted so exit animation and hidden assertions are stable; disable pointer events and visibility when closed.

- [x] **Step 4: Mount the review layer without changing FlowStack**

Update the `Prototype` return value so `ProductDocumentReview` is a sibling of `FlowStack` inside the authorization provider:

```tsx
<AuthorizationContext.Provider value={...}>
  <FlowStack initial={homeScreen(keyboard)} />
  <ProductDocumentReview />
</AuthorizationContext.Provider>
```

Because `ProductDocumentReview` portals to `document.body`, its rendered nodes must not be descendants of `[data-phone-screen]`.

- [x] **Step 5: Run the focused tests**

Run:

```bash
npx playwright test tests/prototype-h5.spec.ts --grep "product document"
```

Expected: placement/content test passes; interaction test may still fail only if layout styles required for viewport visibility are not yet present.

### Task 3: Style the review controls and finish accessibility behavior

**Files:**
- Modify: `src/prototype.css`
- Modify: `tests/prototype-h5.spec.ts`

- [x] **Step 1: Add isolated browser-layer CSS**

Create only `product-doc-review-*` selectors. Required rules:

```css
.product-doc-review-layer { position: fixed; inset: 0; z-index: 900; pointer-events: none; }
.product-doc-review-trigger { position: absolute; top: 21px; right: 138px; min-height: 34px; pointer-events: auto; }
.product-doc-review-drawer { position: absolute; top: 12px; right: 12px; bottom: 12px; width: min(440px, calc(100vw - 24px)); pointer-events: auto; transform: translateX(calc(100% + 24px)); visibility: hidden; }
.product-doc-review-drawer[data-open="true"] { transform: translateX(0); visibility: visible; }
.product-doc-review-body { overflow-y: auto; overscroll-behavior: contain; }
```

Add the approved white/warm-neutral surface, restrained green/gold accents, fixed header and table-of-contents treatment, readable 14–16px body typography, heading rhythm, list spacing, link/focus states, and shadow. When open, move the trigger to the left edge of the drawer or visually mark it active so it never sits under the panel.

- [x] **Step 2: Add reduced-motion and narrow-view handling**

```css
@media (prefers-reduced-motion: reduce) {
  .product-doc-review-drawer { transition: none; }
  .product-doc-review-body { scroll-behavior: auto; }
}

@media (max-width: 760px) {
  .product-doc-review-trigger { top: 58px; right: 18px; }
}
```

Do not change `.phone-stage`, `.phone-device`, `.device-screen`, or protected runtime styles.

- [x] **Step 3: Add a geometry assertion**

Extend the interaction test to confirm, at the default 1100px Playwright viewport, the drawer and phone occupy separate horizontal regions:

```ts
const geometry = await page.evaluate(() => {
  const phone = document.querySelector<HTMLElement>('[data-testid="phone-frame"]')!.getBoundingClientRect();
  const drawer = document.querySelector<HTMLElement>('.product-doc-review-drawer')!.getBoundingClientRect();
  return { phoneRight: phone.right, drawerLeft: drawer.left };
});
expect(geometry.drawerLeft).toBeGreaterThanOrEqual(geometry.phoneRight - 1);
```

If the existing phone scale at 1100px causes overlap, reduce the drawer test viewport only for this test by setting it to at least `1440 × 1100`; do not move or rescale the phone implementation.

- [x] **Step 4: Run the focused tests again**

Run:

```bash
npx playwright test tests/prototype-h5.spec.ts --grep "product document"
```

Expected: both product-document tests pass.

### Task 4: Full verification and real-render review

**Files:**
- Verify only: protected runtime and built output
- Create screenshot artifact under: `audit/product-doc-drawer-2026-08-24/`

- [x] **Step 1: Verify protected runtime integrity**

Run:

```bash
npm run check:runtime
```

Expected: runtime integrity check passes without lock updates.

- [x] **Step 2: Run the complete Playwright suite**

Run:

```bash
npm run test:runtime
```

Expected: all existing and new Playwright tests pass.

- [x] **Step 3: Build the prototype**

Run:

```bash
npm run build
```

Expected: TypeScript, Vite build, runtime check, and static worker preparation complete successfully.

- [x] **Step 4: Capture and inspect the real rendered drawer**

Use the existing local preview workflow to capture a desktop viewport with the PRD drawer open and the phone visible. Save the screenshot to:

```text
audit/product-doc-drawer-2026-08-24/product-doc-drawer-open.png
```

Inspect the image for: document outside the bezel, no phone overlap at desktop width, readable title/TOC/body, visible close control, intact device picker, and no style leakage into the Mini Program.

- [x] **Step 5: Record completion**

Mark every checklist item complete and report the changed files, test counts, build result, screenshot path, and any remaining narrow-viewport limitation. This project is not a Git repository, so omit commit steps rather than claiming commits.
