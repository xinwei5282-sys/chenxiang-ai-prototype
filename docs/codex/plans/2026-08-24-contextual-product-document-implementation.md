# Contextual Product Document Implementation Plan

> **For Codex execution:** This plan may be executed inline in the current session or step-by-step with explicit checkpoints. Keep checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the “AI 自我反思” positioning and make the browser-level product document drawer show the current phone page’s delivery notes by default while retaining the complete PRD.

**Architecture:** Keep the PRD as the single content source. Add stable app-owned page markers, map those markers to `DOC-P-xx` headings in the same Markdown file, and let `ProductDocumentReview` extract the relevant Markdown block range. The drawer observes the active Flow scene and login overlay without modifying the protected mobile runtime.

**Tech Stack:** React 19, TypeScript, Vite raw Markdown imports, Playwright, existing FlowStack/mobile runtime.

---

## File responsibility map

**Create**

- `docs/codex/plans/2026-08-24-contextual-product-document-implementation.md` — executable checklist and verification commands.

**Rename and modify**

- `docs/codex/prd/2026-08-24-agarwood-digital-identity-ai-traditional-culture-agent-mvp-v2.md` — renamed authoritative PRD; owns product naming and all `DOC-P-xx` page delivery notes.

**Modify**

- `src/Prototype.tsx` — imports renamed PRD, identifies active page, filters Markdown blocks, renders current-page/complete-PRD modes, adds page markers, and replaces user-visible copy.
- `src/prototype.css` — styles the drawer view switcher, contextual page header, missing-map state, and full-document table of contents.
- `tests/prototype-h5.spec.ts` — verifies naming removal, current-page mapping, login overlay precedence, full PRD access, drawer navigation, and unchanged phone operation.
- `AGENTS.md` — records the new approved positioning, exact disclaimer, renamed authoritative PRD, and contextual document behavior.

**Historical, not loaded**

- `docs/codex/prd/2026-08-24-agarwood-digital-identity-ai-reflection-mvp.md` remains an explicitly historical v1 artifact. It must not be imported or named as authoritative.

The project is not a Git worktree, so commit checkpoints are replaced by test-backed file checkpoints; no commit command is applicable.

---

### Task 1: Lock the new behavior with failing Playwright tests

**Files:**

- Modify: `tests/prototype-h5.spec.ts`
- Test: `tests/prototype-h5.spec.ts`

- [ ] **Step 1: Replace the obsolete naming assertions**

Update the chat and product-document expectations to require:

```ts
await expect(current.getByText("内容由 AI 生成，仅供娱乐参考", { exact: true })).toBeVisible();
await expect(drawer.getByRole("heading", {
  name: "琼南沉香小程序 MVP PRD：数字身份 + AI传统文化解读 Agent",
})).toBeVisible();
```

- [ ] **Step 2: Add a current-page drawer test**

Add a test that opens the drawer on home and asserts:

```ts
await expect(drawer.getByRole("heading", { name: "P-01 首页", exact: true })).toBeVisible();
await expect(drawer.getByText("页面目的", { exact: true })).toBeVisible();
await expect(drawer.getByRole("button", { name: "当前页面", exact: true })).toHaveAttribute("aria-pressed", "true");
```

Switch to `完整 PRD`, assert the PRD title and eight existing global headings, then switch back and assert P-01 again.

- [ ] **Step 3: Add route and overlay mapping tests**

Navigate through the full home service touch targets and assert `P-07 证书与溯源`, `P-08 佩戴养护`, and `P-09 沉香知识`. Open the authorization sheet from the home reading action and assert the drawer reports `P-02 登录确认层` instead of P-01.

- [ ] **Step 4: Run the focused tests and verify failure**

Run:

```bash
env MOBILE_RUNTIME_TEST_PORT=4201 PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/Users/xinwei/.cache/puppeteer/chrome-headless-shell/mac_arm-148.0.7778.97/chrome-headless-shell-mac-arm64/chrome-headless-shell npx playwright test tests/prototype-h5.spec.ts --grep "product document|self-reflection positioning" --workers=1
```

Expected: FAIL because the drawer still opens the complete old-title PRD and has no page mode controls or P-xx contextual heading.

---

### Task 2: Rename and normalize the authoritative PRD

**Files:**

- Rename: `docs/codex/prd/2026-08-24-agarwood-digital-identity-ai-reflection-mvp-v2.md`
- To: `docs/codex/prd/2026-08-24-agarwood-digital-identity-ai-traditional-culture-agent-mvp-v2.md`
- Modify: renamed PRD
- Modify: `AGENTS.md`

- [ ] **Step 1: Rename the v2 PRD path**

Run an explicit `mv` between the two exact paths. Do not rename or delete the historical non-v2 document.

- [ ] **Step 2: Replace the active product positioning**

Use these exact normative strings:

```text
琼南沉香小程序 MVP PRD：数字身份 + AI传统文化解读 Agent
沉香数字身份 + AI传统文化解读 Agent
内容由 AI 生成，仅供娱乐参考
```

Change the Agent system identity to `AI 问事助手`. Keep all non-deterministic prediction, luck-changing, medical, legal, financial, privacy, and prompt-injection safety requirements.

- [ ] **Step 3: Add page delivery-note headings to the same PRD**

Under `Solution`, add one unique h4 heading per mapped page:

```md
#### DOC-P-01 首页

- **页面目的**：...
- **入口与出口**：...
- **内容与交互**：...
- **状态与权限**：...
- **数据与接口**：...
- **验收条件**：...
```

Create equivalent blocks for P-02 through P-12. Each block must use existing PRD behavior, endpoints, FR IDs and AC IDs rather than inventing new requirements.

- [ ] **Step 4: Update active project rules**

In `AGENTS.md`, update the approved position, exact disclaimer, and authoritative PRD path. Add a current decision that the browser-level drawer defaults to the active page guide and retains a complete-PRD mode.

- [ ] **Step 5: Scan the active sources**

Run:

```bash
rg -n "自我反思|ai-reflection" AGENTS.md src tests docs/codex/prd/2026-08-24-agarwood-digital-identity-ai-traditional-culture-agent-mvp-v2.md
```

Expected: no matches in active sources. The explicitly historical v1 file is excluded from this scan.

---

### Task 3: Implement contextual Markdown selection and drawer modes

**Files:**

- Modify: `src/Prototype.tsx`
- Modify: `src/prototype.css`
- Test: `tests/prototype-h5.spec.ts`

- [ ] **Step 1: Point the raw import to the renamed PRD**

Use:

```ts
import productDocMarkdown from "../docs/codex/prd/2026-08-24-agarwood-digital-identity-ai-traditional-culture-agent-mvp-v2.md?raw";
```

- [ ] **Step 2: Define the stable route-to-document map**

Add a typed constant containing every approved mapping:

```ts
const productDocPages = {
  home: { label: "P-01 首页", guideHeading: "DOC-P-01 首页", specHeading: "P-01 首页" },
  "authorization-sheet": { label: "P-02 登录确认层", guideHeading: "DOC-P-02 登录确认层", specHeading: "P-02 登录确认层" },
  interpret: { label: "P-03 AI问事", guideHeading: "DOC-P-03 AI问事", specHeading: "P-03 AI问事" },
  profile: { label: "P-04 我的", guideHeading: "DOC-P-04 我的", specHeading: "P-04 我的" },
  "reading-records": { label: "P-05 问帖记录", guideHeading: "DOC-P-05 问帖记录", specHeading: "P-05 问帖记录" },
  "reading-record-detail": { label: "P-06 问帖详情", guideHeading: "DOC-P-06 问帖详情", specHeading: "P-06 问帖详情" },
  certificate: { label: "P-07 证书与溯源", guideHeading: "DOC-P-07 证书与溯源", specHeading: "P-07 证书与溯源" },
  care: { label: "P-08 佩戴养护", guideHeading: "DOC-P-08 佩戴养护", specHeading: "P-08 佩戴养护" },
  knowledge: { label: "P-09 沉香知识", guideHeading: "DOC-P-09 沉香知识", specHeading: "P-09 沉香知识" },
  "farm-story": { label: "P-10 农垦故事", guideHeading: "DOC-P-10 农垦故事", specHeading: "P-10 农垦故事" },
  "chip-help": { label: "P-11 芯片识别说明", guideHeading: "DOC-P-11 芯片识别说明", specHeading: "P-11 芯片识别说明" },
  "culture-help": { label: "P-12 关于传统文化解读", guideHeading: "DOC-P-12 关于传统文化解读", specHeading: "P-12 关于传统文化解读" },
} as const;
```

- [ ] **Step 3: Add pure block extraction helpers**

Implement `findProductDocPageBlocks(blocks, guideHeading)` so it starts after the matching h4 heading and stops at the next h4 heading. Return an empty array when the marker does not exist. Do not mutate the complete `blocks` array.

- [ ] **Step 4: Detect the active page**

Implement `readActiveProductDocPage()` with this precedence:

```ts
const overlay = document.querySelector<HTMLElement>("[data-product-doc-overlay]");
if (overlay?.dataset.productDocOverlay) return overlay.dataset.productDocOverlay;
return document
  .querySelector<HTMLElement>('[data-flow-current="true"] [data-product-doc-page]')
  ?.dataset.productDocPage ?? "";
```

While the drawer is open, observe document subtree/attribute changes and update the active page key. Disconnect the observer on close/unmount.

- [ ] **Step 5: Render the two drawer modes**

Use `view: "page" | "full"`, reset it to `page` whenever the drawer opens, and render:

```tsx
<div className="product-doc-review-view-switch" aria-label="产品文档视图">
  <button aria-pressed={view === "page"}>当前页面</button>
  <button aria-pressed={view === "full"}>完整 PRD</button>
</div>
```

In page mode render an h1 with the mapped `label`, the extracted guide blocks, the complete P-xx page specification, related FLOW/state sections, filtered FR requirements, complete API sections, and filtered AC cases. If mapping or blocks are missing, render `该页面说明尚未配置` and a button that enters full mode. In full mode render the existing status, eight-section table of contents and complete Markdown.

When switching to full mode, use the mapped `specHeading` ID to scroll to that page specification after React commits. When switching back, reset the drawer body scroll to the top.

- [ ] **Step 6: Style the contextual view**

Add compact segmented controls and a page-meta treatment using the existing paper/green visual language. Preserve the 440px drawer width, outside-phone placement, focus rings, reduced motion handling and independent scrolling.

- [ ] **Step 7: Run focused tests**

Run the Task 1 command. Expected: all focused tests PASS.

---

### Task 4: Add stable page markers and remove obsolete copy

**Files:**

- Modify: `src/Prototype.tsx`
- Test: `tests/prototype-h5.spec.ts`

- [ ] **Step 1: Mark every app-owned page root**

Add `data-product-doc-page` to the page root for home, profile, interpret, reading records, reading detail, certificate, care, knowledge, farm story, chip help and culture help. Use the route keys from `productDocPages`; do not use translated labels as IDs.

- [ ] **Step 2: Mark the login overlay only while open**

Inside `AuthorizationSheet`, render:

```tsx
{open ? <span hidden data-product-doc-overlay="authorization-sheet" /> : null}
```

This lets P-02 override the underlying page without changing FlowStack.

- [ ] **Step 3: Replace all user-visible self-reflection copy**

Set the chat disclaimer and profile subtitle to `内容由 AI 生成，仅供娱乐参考`. Update the culture-help headline and note so neither contains `自我反思`, while retaining the exact safety exclusions.

- [ ] **Step 4: Run copy and route tests**

Run:

```bash
env MOBILE_RUNTIME_TEST_PORT=4202 PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/Users/xinwei/.cache/puppeteer/chrome-headless-shell/mac_arm-148.0.7778.97/chrome-headless-shell-mac-arm64/chrome-headless-shell npx playwright test tests/prototype-h5.spec.ts --workers=1
```

Expected: all prototype tests PASS.

---

### Task 5: Full verification and real-render inspection

**Files:**

- Verify: `src/Prototype.tsx`
- Verify: `src/prototype.css`
- Verify: renamed PRD
- Verify: `tests/prototype-h5.spec.ts`

- [ ] **Step 1: Verify protected runtime integrity**

Run `npm run check:runtime`.

Expected: `Mobile runtime integrity check passed (28 protected files).`

- [ ] **Step 2: Build production output**

Run `npm run build`.

Expected: TypeScript and Vite finish with exit code 0 and Sites output is prepared.

- [ ] **Step 3: Run all Playwright tests**

Run:

```bash
env MOBILE_RUNTIME_TEST_PORT=4203 PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/Users/xinwei/.cache/puppeteer/chrome-headless-shell/mac_arm-148.0.7778.97/chrome-headless-shell-mac-arm64/chrome-headless-shell npm run test:runtime -- --workers=1
```

Expected: 0 failed tests.

- [ ] **Step 4: Capture iPhone contextual and full PRD states**

At a 1600×1100 browser viewport, capture:

- Home with `P-01 首页` current-page guide.
- Certificate with `P-07 证书与溯源` current-page guide.
- Home with the complete PRD mode open.

Record drawer/phone geometry, current page label, guide block presence and console errors. Expected: drawer left edge is not left of phone right edge, no console errors, no text clipping.

- [ ] **Step 5: Capture Pixel route state**

Switch to Pixel 10, open a secondary page and the contextual drawer. Expected: the phone remains operable, page mapping is correct and device chrome is unchanged.

- [ ] **Step 6: Final active-source scan**

Run:

```bash
rg -n "自我反思|ai-reflection" AGENTS.md src tests docs/codex/prd/2026-08-24-agarwood-digital-identity-ai-traditional-culture-agent-mvp-v2.md
```

Expected: no matches.
