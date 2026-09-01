# Material Appraisal Certificate Implementation Plan

> **For Codex execution:** This plan may be executed inline in the current session or step-by-step with explicit checkpoints. Keep checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the prototype's generic certificate-and-traceability detail with the supplied material appraisal certificate, a readable structured detail, a phone-contained original-image viewer, and honest missing-certificate states for the other bracelets.

**Architecture:** Keep certificate navigation inside the existing `FlowStack` and model the appraisal certificate as an optional object owned by each bracelet record. The first bracelet receives the supplied certificate asset and structured fields; the other records remain selectable but render an explicit missing-original state. The viewer is an app-owned overlay clipped to the phone screen, while page-review content remains browser-level and page-specific.

**Tech Stack:** React 19, TypeScript, Vite, existing mobile runtime components, Lucide icons, Playwright browser tests, Node test runner.

---

## File responsibility map

**Create**

- `public/assets/certificates/material-appraisal-certificate-zhtc26063030124.jpg` — durable public copy of the user-supplied certificate original.

**Modify**

- `src/Prototype.tsx` — certificate data model, home/list/detail copy, structured certificate fields, missing-original state, phone-scoped viewer state and interaction, and P-07 page PRD content.
- `src/prototype.css` — certificate list/status, original preview, field table, empty state, and full-screen viewer presentation inside the phone model.
- `tests/prototype-h5.spec.ts` — browser-level acceptance coverage for the new label, supplied certificate, missing records, viewer, image error, and page PRD.
- `AGENTS.md` — durable prototype rule recording that P-07 is certificate-only for this phase and that unbound bracelets must never reuse another bracelet's certificate.

**Verify only**

- `src/mobile/**`, `src/App.tsx`, `src/main.tsx`, `src/styles.css`, `vite.config.ts`, `worker/index.js` — protected runtime; verify hashes and behavior without modification.
- `.github/workflows/deploy-pages.yml` — existing public GitHub Pages pipeline; use unchanged after the implementation is verified.

---

### Task 1: Bind the supplied certificate to the correct bracelet

**Files:**

- Create: `public/assets/certificates/material-appraisal-certificate-zhtc26063030124.jpg`
- Modify: `src/Prototype.tsx`
- Test: `tests/prototype-h5.spec.ts`

- [ ] **Step 1: Add a failing browser test for the certificate-only detail**

Add a Playwright test named `material certificate shows the supplied original and structured fields without provenance`. It must:

```ts
await page.getByRole("button", { name: "查看证书查询" }).click();
await expect(page.getByRole("heading", { name: "奇楠沉香算盘珠手串" })).toBeVisible();
await expect(page.getByText("ZHTC26063030124", { exact: true })).toBeVisible();
await expect(page.getByText("4.3g+", { exact: true })).toBeVisible();
await expect(page.getByText("符合奇楠沉香构造特征", { exact: true })).toBeVisible();
await expect(page.getByText("瑞香科沉香属", { exact: true })).toBeVisible();
await expect(page.getByText("横切面构造", { exact: true })).toBeVisible();
await expect(page.getByText("T/DBCX010-2025", { exact: true })).toBeVisible();
await expect(page.getByText("1706", { exact: true })).toBeVisible();
await expect(page.locator(".material-certificate-detail .timeline")).toHaveCount(0);
await expect(page.getByText("产地", { exact: true })).toHaveCount(0);
await expect(page.getByText("香韵", { exact: true })).toHaveCount(0);
```

Also assert that the detail header is `证书详情`, the status is `证书原件已收录`, and the original image `src` ends in `/assets/certificates/material-appraisal-certificate-zhtc26063030124.jpg`.

- [ ] **Step 2: Run the focused test and verify the old experience fails**

Run:

```bash
MOBILE_RUNTIME_TEST_PORT=4175 PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/Users/xinwei/.cache/puppeteer/chrome-headless-shell/mac_arm-148.0.7778.97/chrome-headless-shell-mac-arm64/chrome-headless-shell npm run test:runtime -- --grep "material certificate shows"
```

Expected: FAIL because the home action is still `查看证书与溯源` and the detail still shows generic origin/scent/timeline content.

- [ ] **Step 3: Copy the supplied certificate into the public asset tree**

Copy:

```text
/Users/xinwei/Library/Containers/com.tencent.xinWeChat/Data/Documents/xwechat_files/wpfk1253s5_6b99/temp/RWTemp/2026-09/e192cb409297fbbe819099583fe4c195.jpg
```

to:

```text
public/assets/certificates/material-appraisal-certificate-zhtc26063030124.jpg
```

Verify the copied file is a readable JPEG and retain the complete uncropped image.

- [ ] **Step 4: Replace the generic certificate record with an optional appraisal object**

In `src/Prototype.tsx`, define and use these fields consistently:

```ts
type CertificateAppraisal = {
  image: string;
  sampleName: string;
  certificateNumber: string;
  weight: string;
  conclusion: string;
  taxonomy: string;
  note: string;
  inspection: string;
  standard: string;
  queryCode: string;
};

type CertificateRecord = {
  key: string;
  name: string;
  image: string;
  spec: string;
  certificate?: CertificateAppraisal;
};
```

Bind the first record to:

```ts
certificate: {
  image: "/assets/certificates/material-appraisal-certificate-zhtc26063030124.jpg",
  sampleName: "奇楠沉香算盘珠手串",
  certificateNumber: "ZHTC26063030124",
  weight: "4.3g+",
  conclusion: "符合奇楠沉香构造特征",
  taxonomy: "瑞香科沉香属",
  note: "无",
  inspection: "横切面构造",
  standard: "T/DBCX010-2025",
  queryCode: "1706",
}
```

Do not create a `certificate` object for the other two records.

- [ ] **Step 5: Implement the new home label and certificate detail**

Change the home service title and accessible label to `证书查询` / `查看证书查询`. Change the route title to `证书详情`. For a bound certificate, render:

- `证书原件已收录`
- the complete original image in an image button labeled `查看证书原件`
- a semantic field list containing sample name, certificate number, weight, conclusion, taxonomy, note, inspection, standard, and query code

Remove origin, scent, provenance timeline, batch, making, and quality claims from this detail. Keep the handwritten inspector and reviewer visible only inside the source image.

- [ ] **Step 6: Run the focused test and verify it passes**

Run the Step 2 command again.

Expected: PASS with the real certificate asset and no traceability timeline.

- [ ] **Step 7: Commit the certificate data and detail**

```bash
git add public/assets/certificates/material-appraisal-certificate-zhtc26063030124.jpg src/Prototype.tsx tests/prototype-h5.spec.ts
git commit -m "feat: add material appraisal certificate detail"
```

---

### Task 2: Prevent cross-bracelet certificate leakage

**Files:**

- Modify: `src/Prototype.tsx`
- Modify: `src/prototype.css`
- Test: `tests/prototype-h5.spec.ts`

- [ ] **Step 1: Add a failing browser test for unbound bracelet records**

Add a Playwright test named `unavailable certificates never reuse another bracelet certificate`. From `我的`, open `证书数量`, confirm three full-width bracelet rows, and assert:

```ts
await expect(rows.nth(0)).toContainText("ZHTC26063030124");
await expect(rows.nth(0)).toContainText("原件已收录");
await expect(rows.nth(1)).toContainText("原件待补充");
await expect(rows.nth(2)).toContainText("原件待补充");
```

Open the second record and assert that it shows `证书原件待补充`, while `ZHTC26063030124`, `证书原件已收录`, and the supplied certificate image are all absent. Repeat the no-leak assertion after opening the third record.

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```bash
MOBILE_RUNTIME_TEST_PORT=4175 PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/Users/xinwei/.cache/puppeteer/chrome-headless-shell/mac_arm-148.0.7778.97/chrome-headless-shell-mac-arm64/chrome-headless-shell npm run test:runtime -- --grep "unavailable certificates"
```

Expected: FAIL because the existing rows all imply bound certificates and their detail schema requires certificate-like metadata.

- [ ] **Step 3: Implement explicit list statuses and the missing-original detail**

For each list row, render one of these mutually exclusive summaries:

```ts
record.certificate
  ? `${record.certificate.certificateNumber} · ${record.certificate.weight} · 原件已收录`
  : `${record.spec} · 原件待补充`
```

When `record.certificate` is absent, render a quiet empty state with the current bracelet name and `证书原件待补充`; do not show any sample fields, first-record identifiers, first-record image, or “已收录” wording.

- [ ] **Step 4: Style the list status and empty state without adding a new product card system**

Use existing warm white, hairline divider, dark green, and muted copper tokens. Preserve the current full-width list layout and 44px minimum touch targets. The missing state should be visually clear but secondary, using one simple icon, one title, and one explanatory sentence at most.

- [ ] **Step 5: Run the focused test and verify it passes**

Run the Step 2 command again.

Expected: PASS for all three records with no cross-record certificate leakage.

- [ ] **Step 6: Commit the multi-bracelet states**

```bash
git add src/Prototype.tsx src/prototype.css tests/prototype-h5.spec.ts
git commit -m "fix: isolate certificates by bracelet"
```

---

### Task 3: Add a contained original-image viewer and failure state

**Files:**

- Modify: `src/Prototype.tsx`
- Modify: `src/prototype.css`
- Test: `tests/prototype-h5.spec.ts`

- [ ] **Step 1: Add a failing viewer interaction test**

Add a test named `certificate original opens a contained zoom viewer`. It must click `查看证书原件`, assert a dialog named `证书原件查看`, and compare its bounding box to `[data-phone-screen]` so the dialog does not exceed the phone screen. Then assert the image button toggles from `放大证书原件` to `还原证书原件`, exposes `data-zoomed="true"`, and closes from both the explicit close button and Escape.

- [ ] **Step 2: Add a failing image-load error test**

Before navigating, abort the certificate asset request:

```ts
await page.route("**/material-appraisal-certificate-zhtc26063030124.jpg", (route) => route.abort());
```

Open the certificate detail and assert `证书原件暂时无法加载` is visible, the browser's broken-image icon is not rendered as content, and structured fields remain readable.

- [ ] **Step 3: Run the focused viewer tests and verify they fail**

Run:

```bash
MOBILE_RUNTIME_TEST_PORT=4175 PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/Users/xinwei/.cache/puppeteer/chrome-headless-shell/mac_arm-148.0.7778.97/chrome-headless-shell-mac-arm64/chrome-headless-shell npm run test:runtime -- --grep "certificate original|certificate asset failure"
```

Expected: FAIL because no viewer, zoom mode, or explicit image-error state exists.

- [ ] **Step 4: Implement viewer state and keyboard behavior**

Create a certificate-detail component local to `src/Prototype.tsx` with:

```ts
const [viewerOpen, setViewerOpen] = useState(false);
const [zoomed, setZoomed] = useState(false);
const [imageFailed, setImageFailed] = useState(false);
```

Opening the image resets `zoomed` to false. The dialog exposes `role="dialog"`, `aria-modal="true"`, and `aria-label="证书原件查看"`. Clicking the original toggles fit-width and 2× display; the zoomed container scrolls in both axes. Escape and the explicit `关闭证书原件` control close it. Reset viewer state when the selected bracelet changes.

- [ ] **Step 5: Implement the resilient image fallback**

On image error, remove the failed `<img>` from the visible layout and render `证书原件暂时无法加载`. Do not replace it with a generated certificate or another bracelet's image. Keep all structured fields visible beneath the fallback.

- [ ] **Step 6: Style and verify the viewer on both device presets**

The overlay must fill only the device screen, sit above app content but below protected device chrome, use an opaque dark background, and leave the close control reachable. Fit-width mode shows the full original without cropping; zoomed mode uses `width: 200%` and scrollable overflow.

Run the Step 3 command again.

Expected: PASS for containment, zoom toggle, close behavior, and image failure.

- [ ] **Step 7: Commit the viewer**

```bash
git add src/Prototype.tsx src/prototype.css tests/prototype-h5.spec.ts
git commit -m "feat: add certificate original viewer"
```

---

### Task 4: Align the page PRD and durable project rule

**Files:**

- Modify: `src/Prototype.tsx`
- Modify: `tests/prototype-h5.spec.ts`
- Modify: `AGENTS.md`

- [ ] **Step 1: Add a failing page-PRD browser test**

Update the active-page review test so that opening the certificate detail and then the browser-level review drawer expects:

```ts
await expect(drawer).toContainText("证书详情 · 页面 PRD");
await expect(drawer).toContainText("证书原件");
await expect(drawer).toContainText("原件待补充");
await expect(drawer).toContainText("多手串");
await expect(drawer).not.toContainText("溯源时间线");
await expect(drawer).not.toContainText("产地");
await expect(drawer).not.toContainText("香韵");
```

Keep testing the fixed `页面 / PRD` entry, 720px full-height drawer, mask, close paths, and focus return required by `AGENTS.md`.

- [ ] **Step 2: Run the focused PRD test and verify it fails**

Run:

```bash
MOBILE_RUNTIME_TEST_PORT=4175 PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/Users/xinwei/.cache/puppeteer/chrome-headless-shell/mac_arm-148.0.7778.97/chrome-headless-shell-mac-arm64/chrome-headless-shell npm run test:runtime -- --grep "active page.*PRD|certificate.*PRD"
```

Expected: FAIL because P-07 is still labeled and described as certificate plus provenance.

- [ ] **Step 3: Rewrite only the certificate-related page PRD records**

In `productDocPages`, rename the label to `P-07 证书详情`. In the P-07 page definition, replace provenance-oriented overview, rules, fields, actions, boundaries, state flow, exceptions, acceptance, and technical assessment with the confirmed scope:

- original certificate image and structured display fields
- fit-width / 2× viewer and failure state
- list-first multi-bracelet route from `我的`
- direct current-bracelet shortcut from the home page
- optional per-bracelet certificate binding and mismatch prevention
- explicit exclusion of provenance records, query API, copy action, and generated QR code in this phase

Update certificate-list copy to describe entry into `证书详情`, not `证书与溯源`.

- [ ] **Step 4: Record the durable product decision in `AGENTS.md`**

Add a concise dated fidelity note stating that this phase's P-07 is certificate-only, uses the supplied original plus structured fields, excludes provenance records, and requires missing-original states without cross-bracelet reuse.

- [ ] **Step 5: Run the focused PRD test and verify it passes**

Run the Step 2 command again.

Expected: PASS with the review drawer matching the shipped certificate behavior.

- [ ] **Step 6: Commit the PRD alignment**

```bash
git add src/Prototype.tsx tests/prototype-h5.spec.ts AGENTS.md
git commit -m "docs: align certificate page PRD"
```

---

### Task 5: Regression, visual QA, and public preview delivery

**Files:**

- Verify: all changed files and generated build output

- [ ] **Step 1: Run protected-runtime and source checks**

Run:

```bash
npm run check:runtime
npm run typecheck
```

Expected: both commands exit 0; no protected runtime hash changes.

- [ ] **Step 2: Run the complete mobile behavior suite**

Run:

```bash
MOBILE_RUNTIME_TEST_PORT=4175 PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/Users/xinwei/.cache/puppeteer/chrome-headless-shell/mac_arm-148.0.7778.97/chrome-headless-shell-mac-arm64/chrome-headless-shell npm run test:runtime
```

Expected: all existing and new Playwright tests pass on both iPhone and Pixel coverage configured by the suite.

- [ ] **Step 3: Build and verify Pages artifacts**

Run:

```bash
npm run build
node --test tests/github-pages-build.test.mjs
npm run test:sites
npm run build:pages
```

Expected: all commands exit 0, with `dist/client/index.html`, `dist/server/index.js`, `dist/.openai/hosting.json`, source `.openai/hosting.json`, and the GitHub Pages bundle present.

- [ ] **Step 4: Inspect real renders and interactions**

Open the local preview and visually inspect on iPhone and Pixel:

- complete, uncropped certificate preview
- readable field hierarchy and wrapping
- second and third bracelet missing states
- viewer containment, close reachability, fit-width mode, 2× mode, and scroll
- image-error fallback
- P-07 review drawer content and layout

Capture screenshots for the first detail, missing state, and zoom viewer. Confirm there is no horizontal overflow or clipping and that the original certificate remains legible enough to justify the zoom interaction.

- [ ] **Step 5: Review the diff and make the delivery commit if needed**

Run:

```bash
git diff --check
git status --short
git diff --stat HEAD~4..HEAD
```

Expected: no whitespace errors, no unrelated edits, and only the planned files changed. If visual-QA fixes were required, commit them as `fix: polish material certificate experience` after rerunning the affected checks.

- [ ] **Step 6: Push and wait for GitHub Pages terminal success**

Push the verified `main` branch, monitor the deployment workflow until it finishes, and do not report completion while it is queued or running.

- [ ] **Step 7: Verify the public preview**

Open `https://xinwei5282-sys.github.io/chenxiang-ai-prototype/`, bypass stale cache, and recheck the home `证书查询` entry, real certificate detail, image viewer, another bracelet's missing state, and the P-07 drawer. Confirm the deployed page serves the new certificate asset with HTTP 200.

---

## Plan self-check

- Spec coverage: every confirmed requirement maps to Tasks 1–4; provenance records are explicitly excluded.
- Placeholder scan: no TODO/TBD or deferred implementation language remains.
- Type consistency: `CertificateAppraisal`, `CertificateRecord.certificate`, and all field names are identical across tasks.
- Boundary check: only app-owned UI, tests, public content, and project guidance change; protected mobile runtime files remain verification-only.
- Execution mode: use Inline Execution, with a commit after each green task and a final public deployment only after full verification.
