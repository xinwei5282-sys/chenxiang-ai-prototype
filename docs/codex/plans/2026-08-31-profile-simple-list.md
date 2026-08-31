# Profile Simple List Implementation Plan

> **For Codex execution:** This plan may be executed inline in the current session or step-by-step with explicit checkpoints. Keep checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the mobile prototype's `我的` root page with a focused authorization product-photo Banner and the approved flat single-column action list while preserving authorization, history, certificate, help, and bottom-tab behavior.

**Architecture:** Keep the protected mobile runtime, `FlowStack`, shared authorization context, and existing destination screens unchanged. Replace only the app-owned `Profile` markup and Profile CSS, drive the new observable structure with Playwright tests first, then verify the selected visual target against browser-rendered iPhone and Pixel states.

**Tech Stack:** React 19, TypeScript, Vite, project mobile runtime, Radix Icons, Playwright.

---

## File responsibility map

**Create**

- `docs/superpowers/specs/2026-08-31-profile-simple-list-design.md` — approved product, visual, interaction, and acceptance specification.
- `docs/codex/plans/2026-08-31-profile-simple-list.md` — executable implementation plan.
- `reference/profile-simple-list-selected.png` — selected visual truth copied from the first displayed ideation result.
- `audit/profile-simple-list-2026-08-31/` — iPhone/Pixel render evidence and normalized comparison boards.

**Modify**

- `tests/prototype-h5.spec.ts` — observable single-list structure, authorization-state, touch-target, navigation, and two-device fit coverage.
- `src/Prototype.tsx` — `Profile` markup using one authorization Banner with two data actions and one single-row chip-help list.
- `src/prototype.css` — flat layout, grouping rhythm, typography, icon, divider, press-state, and responsive rules.
- `AGENTS.md` — durable latest Profile visual decision, including the later Banner refinement.
- `design-qa.md` — final selected-reference-versus-render comparison history and exact result.

**Reference only**

- `src/mobile/` and all paths marked protected in `AGENTS.md` — runtime ownership remains unchanged.
- `docs/superpowers/specs/2026-08-31-profile-simple-list-design.md` — acceptance truth for implementation.

This workspace is not a Git repository, so commit steps are omitted. Each task ends with an explicit verification checkpoint.

---

### Task 1: Specify the flat Profile contract with failing tests

**Files:**

- Modify: `tests/prototype-h5.spec.ts`
- Test: `tests/prototype-h5.spec.ts`

- [ ] **Step 1: Replace the old archive-card structure assertions**

Update the Profile test to assert one authorization Banner, two Banner data actions, one help list with two buttons, preserved labels/routes, and absence of the old card/group headings:

```ts
const profile = page.getByTestId("flow-current");
await expect(profile.locator(".profile-account-banner")).toBeVisible();
await expect(profile.locator(".profile-banner-actions").getByRole("button")).toHaveCount(2);
await expect(profile.locator(".profile-action-list").getByRole("button")).toHaveCount(2);
await expect(profile.getByText("个人香事档案", { exact: true })).toHaveCount(0);
await expect(profile.getByText("记录与管理", { exact: true })).toHaveCount(0);
await expect(profile.getByText("使用帮助", { exact: true })).toHaveCount(0);
```

- [ ] **Step 2: Replace card-based authorization assertions with the Banner and popup contract**

Assert that `微信授权登录` opens a phone-scoped `微信授权登录` sheet first; clicking `确认微信授权` swaps content in the same `.profile-account-banner`, keeps its height stable within 2px, and removes the login button.

- [ ] **Step 3: Add layout assertions for a true single column and mobile touch targets**

Measure the four action rows and assert:

```ts
expect(new Set(rows.map(row => Math.round(row.left))).size).toBe(1);
expect(rows.every(row => row.width >= 300)).toBe(true);
expect(rows.every(row => row.height >= 56)).toBe(true);
expect(loginButton.height).toBeGreaterThanOrEqual(44);
```

This catches regressions back to the previous split two-column block or undersized controls.

- [ ] **Step 4: Run focused Profile tests and verify RED**

Run:

```bash
npx playwright test tests/prototype-h5.spec.ts -g "profile separates|profile simulates|profile uses one flat|profile login button|profile primary content" --reporter=line
```

Expected: failures because `.profile-account-banner`, `.profile-banner-actions`, and the authorization popup contract do not exist and the old headings/card/two-column block remain. Fix only setup or selector errors until the failure is behavioral.

---

### Task 2: Implement the approved Profile structure

**Files:**

- Modify: `src/Prototype.tsx`
- Test: `tests/prototype-h5.spec.ts`

- [ ] **Step 1: Replace the archive card with one focused authorization Banner**

Render `.profile-account-banner` with the text-free `public/assets/profile/profile-account-banner.png`, existing `PersonIcon`, shared authorization state, exact account copy, and semantic login button. Keep the authorized and unauthorized branches in the same DOM position and keep text/actions as HTML rather than baking them into the image.

- [ ] **Step 2: Move records and certificate into Banner data actions**

Render `.profile-banner-actions` with two semantic buttons:

```tsx
<button aria-label="问帖记录"><strong>1 条</strong><small>问帖记录</small></button>
<button aria-label="本串证书"><strong>1 串</strong><small>证书数量</small></button>
```

Render the lower `.profile-action-list` with only the chip-help row:

```tsx
<button className="profile-action-row profile-action-row--help" aria-label="芯片识别说明">…</button>
```

Reuse the existing click handlers and destination screens exactly; do not add routes or change authorization behavior.

- [ ] **Step 3: Run the Task 1 focused tests and verify the structural behavior turns GREEN**

Run the same focused command from Task 1. Expected: structure, authorization, single-column, and fit tests pass.

---

### Task 3: Match the selected minimalist visual target

**Files:**

- Modify: `src/prototype.css`
- Test: `tests/prototype-h5.spec.ts`

- [ ] **Step 1: Establish the flat page rhythm**

Make the product-photo Banner extend from the device top behind the status/battery area and bleed to both horizontal edges. Keep the lower help list at an 18px horizontal inset and separate it from the Banner by at least 16px. Remove obsolete `.profile-archive-card`, `.profile-management`, `.profile-primary-actions`, and `.profile-help` styling.

- [ ] **Step 2: Style account and action rows**

Keep the Banner text readable over the asset's intentional negative space. Put avatar, account copy, and authorization/status in one upper horizontal row; keep the right-aligned authorization control at least 44px high. Put the two data actions in one 48px-or-taller split surface in the Banner lower area. Make both help rows at least 64px high, align chevrons consistently, and keep separators one CSS pixel.

- [ ] **Step 3: Separate help by rhythm, not a container**

Render only the single-line chip-help row below the Banner, using one flat list with hairline separators and no heading, subtitle, card, record row, or certificate row.

- [ ] **Step 4: Verify touch targets and two-device fit**

Run the focused Profile tests on iPhone and Pixel selector states. Expected: no horizontal overflow, every row stays above the fixed tabs, and touch sizes pass.

---

### Task 4: Record the durable decision and run browser design QA

**Files:**

- Modify: `AGENTS.md`
- Create/Modify: `audit/profile-simple-list-2026-08-31/*`
- Modify: `design-qa.md`

- [ ] **Step 1: Record the latest Profile decision**

Add a top-level note stating that `reference/profile-simple-list-selected.png` supersedes the 2026-08-24 Profile card direction and that later feedback locks the full-bleed authorization Banner, popup authorization, two vertically stacked Banner data actions, and one single-line chip-help row.

- [ ] **Step 2: Run runtime integrity before capture**

Run `npm run check:runtime`. Expected: exit 0 with all protected runtime hashes intact.

- [ ] **Step 3: Capture the same signed-out Profile state at 1:1 phone-screen size**

Capture iPhone and Pixel app-owned phone screens with the existing Playwright/headless-Chrome setup, record actual CSS dimensions and device scale factor, and save evidence under `audit/profile-simple-list-2026-08-31/round-1/`.

- [ ] **Step 4: Create same-input comparison boards and inspect them**

Normalize the selected source and implementation to the same content ratio. Put the source and each implementation capture in one comparison image before judging full layout; create focused account/list comparisons if typography or row alignment is too small in the full board.

- [ ] **Step 5: Fix P0/P1/P2 issues and repeat capture**

Record each blocking finding, CSS/markup fix, and post-fix evidence. Do not hand off while any P0/P1/P2 issue remains.

- [ ] **Step 6: Write `design-qa.md` with the required final result**

Include source/implementation paths, dimensions, density, viewport, state, interactions tested, console status, five required fidelity surfaces, comparison history, and exactly `final result: passed` only when no actionable P0/P1/P2 remains.

---

### Task 5: Final regression and delivery gate

**Files:**

- Test: `tests/prototype-h5.spec.ts`
- Verify: protected runtime and production build output

- [ ] **Step 1: Run focused Profile and existing Question-flow tests**

Run:

```bash
npx playwright test tests/prototype-h5.spec.ts -g "profile|reading|AI composer|question tab|agent actively|Pixel critical" --reporter=line
```

Expected: zero failures.

- [ ] **Step 2: Run the full Playwright suite**

Run:

```bash
npx playwright test tests/prototype-h5.spec.ts --reporter=line
```

Expected: zero failures, or explicitly record any verified pre-existing unrelated failure without claiming a fully green suite.

- [ ] **Step 3: Run fresh runtime and build checks**

Run:

```bash
npm run check:runtime
npm run build
```

Expected: both exit 0.

- [ ] **Step 4: Keep the verified preview open and hand off evidence**

Open the checked local preview in Codex Desktop's allowed browser surface, keep it running, and report the changed files, fresh test counts, build/runtime results, screenshot paths, and `design-qa.md` path.
