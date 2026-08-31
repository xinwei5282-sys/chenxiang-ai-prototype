# Profile Personal Incense Archive Implementation Plan

> **For Codex execution:** This plan may be executed inline in the current session or step-by-step with explicit checkpoints. Keep checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Mini Program “我的” root page into the approved C “个人香事档案” layout while preserving shared authorization, reading entry, bracelet navigation, and protected runtime behavior.

**Architecture:** Keep the existing `Profile` route and shared authorization context. Replace only Profile-owned markup with three bounded surfaces—archive identity card, primary management actions, and lightweight help rows—and scope all new styling to Profile classes in `src/prototype.css`.

**Tech Stack:** React 19, TypeScript, Radix Icons, project mobile runtime, CSS, Playwright.

---

## File responsibility map

- Modify `src/Prototype.tsx`: Profile-only semantic structure and existing click handlers.
- Modify `src/prototype.css`: Profile-only visual layout, responsive density, touch targets, and logged-in state.
- Modify `tests/prototype-h5.spec.ts`: behavioral and structural regression coverage for the redesigned Profile page.
- Modify `AGENTS.md`: record the durable, user-approved Profile design direction after the implementation is verified.
- Use `audit/profile-personal-incense-archive-2026-08-24/`: rendered iPhone and Pixel evidence for unauthenticated and authorized states.

The project is not a Git work tree, so commit steps are intentionally omitted; each task ends with an executable verification checkpoint.

### Task 1: Lock the new Profile contract with failing tests

**Files:**
- Modify: `tests/prototype-h5.spec.ts`
- Test: `tests/prototype-h5.spec.ts`

- [ ] **Step 1: Replace obsolete Profile hierarchy assertions**

Update the Profile tests to require the approved structure and removed content:

```ts
await expect(current.getByRole("heading", { name: "个人香事档案" })).toBeVisible();
await expect(current.getByText("你的香事，", { exact: false })).toHaveCount(0);
await expect(current.getByText("我的内容", { exact: true })).toHaveCount(0);
await expect(current.getByRole("button", { name: "问帖记录" })).toBeVisible();
await expect(current.getByRole("button", { name: "我的手串" })).toBeVisible();
```

- [ ] **Step 2: Add identity-card state and hierarchy checks**

Replace the old flat-background test with a same-card test:

```ts
const archive = current.locator(".profile-archive-card");
const auth = current.locator(".profile-auth");
await expect(archive).toContainText("登录后，保存每一次识香与问帖");
expect(await archive.evaluate((node, child) => node.contains(child as Node), await auth.elementHandle())).toBe(true);
```

After authorization, assert that `微信用户`, `已完成微信授权`, and `已登录` appear in the same `.profile-archive-card`, and the login button disappears.

- [ ] **Step 3: Add one-screen layout coverage**

For both device presets, navigate to Profile and compare the final content bottom with the fixed tab top:

```ts
const fit = await current.evaluate((root) => {
  const body = root.querySelector<HTMLElement>(".mini-profile-body")!;
  const tabs = document.querySelector<HTMLElement>(".mini-tabs")!;
  return body.getBoundingClientRect().bottom <= tabs.getBoundingClientRect().top + 1;
});
expect(fit).toBe(true);
```

- [ ] **Step 4: Run focused tests and verify failure**

Run:

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/Users/xinwei/.cache/puppeteer/chrome-headless-shell/mac_arm-148.0.7778.97/chrome-headless-shell-mac-arm64/chrome-headless-shell npx playwright test tests/prototype-h5.spec.ts --grep "profile|Profile"
```

Expected: FAIL because `.profile-archive-card`, the new heading, and the compact one-screen layout do not yet exist.

### Task 2: Implement the approved semantic structure

**Files:**
- Modify: `src/Prototype.tsx`
- Test: `tests/prototype-h5.spec.ts`

- [ ] **Step 1: Replace the old overview/statistics markup**

Use a single identity card that owns both authorization states:

```tsx
<section className="profile-archive-card" aria-labelledby="profile-archive-title">
  <p>个人香事档案</p>
  <h2 id="profile-archive-title">登录后，保存每一次<br />识香与问帖。</h2>
  <div className={`profile-auth${authorized ? " authorized" : ""}`} aria-label="微信账号授权">
    {authorized ? /* existing authorized content */ : /* existing authorize button */}
  </div>
</section>
```

Keep `authorize`, `openReading`, `authorizeAndEnter`, and all shared context calls unchanged.

- [ ] **Step 2: Build the two primary management actions**

Replace the old `profile-list` group with:

```tsx
<section className="profile-management" aria-labelledby="profile-management-title">
  <h3 id="profile-management-title">记录与管理</h3>
  <div className="profile-primary-actions">
    <button aria-label="问帖记录" onClick={openReading}>...</button>
    <button aria-label="我的手串" onClick={existingCertificateNavigation}>...</button>
  </div>
</section>
```

Each button retains its existing icon, title, realistic secondary value, and full-cell click target.

- [ ] **Step 3: Flatten the help section**

Keep the two help rows and their icon-library components, but render them under one `profile-help` section without an outer rounded card. Remove the old editorial heading, standalone `dl`, `profile-group` wrappers, and `profile-footnote`.

- [ ] **Step 4: Run focused tests**

Run the focused command from Task 1.

Expected: structural and behavior assertions pass; visual fit assertions may still fail until Task 3.

### Task 3: Apply homepage-derived visual hierarchy

**Files:**
- Modify: `src/prototype.css`
- Test: `tests/prototype-h5.spec.ts`

- [ ] **Step 1: Replace obsolete Profile CSS selectors**

Remove or supersede rules for:

```css
.profile-overview
.profile-overview > p
.profile-overview h2
.profile-overview dl
.profile-group
.profile-list
.profile-help-list
.profile-footnote
```

Do not change shared Home, tabs, nav, runtime, or secondary-page selectors.

- [ ] **Step 2: Style the archive identity card**

Implement a fixed-height, warm-paper identity card:

```css
.profile-archive-card {
  min-height: 142px;
  padding: 18px;
  border: 1px solid #ddd5c7;
  border-radius: 12px;
  background: var(--surface);
}
.profile-archive-card h2 {
  font: 500 24px/1.28 "Songti SC", "STSong", serif;
  color: var(--green-deep);
}
```

Style `.profile-auth` as an integrated bottom row with a transparent background, no outer card, a 44px minimum login target, and equivalent occupied height in both states.

- [ ] **Step 3: Style the deep-green primary action container**

Implement `.profile-primary-actions` as a two-column deep-green surface with a subtle warm divider. Buttons use light text, muted light secondary copy, a transparent background, and at least 72px height. Avoid gradients, glows, heavy shadows, and nested cards.

- [ ] **Step 4: Style the lightweight help list**

Use only a section title, 52–56px rows, and hairline dividers. Keep Radix icons in restrained green/warm accents; do not add a rounded outer card.

- [ ] **Step 5: Tune one-screen density for both devices**

Keep `.mini-profile-body` padding compact and ensure the final help row clears `.mini-tabs` on iPhone and Pixel. If platform-specific adjustment is required, scope it under the existing `.device-screen[data-device="pixel-10"]` selector.

- [ ] **Step 6: Run focused tests and verify pass**

Run the Task 1 focused Playwright command.

Expected: PASS for Profile structure, authorization state, click behavior, and one-screen fit.

### Task 4: Record the approved direction and run full verification

**Files:**
- Modify: `AGENTS.md`
- Test: `tests/prototype-h5.spec.ts`
- Evidence: `audit/profile-personal-incense-archive-2026-08-24/`

- [ ] **Step 1: Record the durable Profile decision**

Append one concise Product Direction bullet describing the selected C “个人香事档案” structure, integrated authorization card, deep-green management pair, and flat help rows.

- [ ] **Step 2: Run protected runtime verification**

Run:

```bash
npm run check:runtime
```

Expected: PASS with all protected runtime hashes unchanged.

- [ ] **Step 3: Run the full Playwright suite**

Run:

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/Users/xinwei/.cache/puppeteer/chrome-headless-shell/mac_arm-148.0.7778.97/chrome-headless-shell-mac-arm64/chrome-headless-shell npx playwright test
```

Expected: all tests pass, including existing reading authorization and navigation flows.

- [ ] **Step 4: Run the production build**

Run:

```bash
npm run build
```

Expected: TypeScript and Vite build succeed, and the existing runtime preparation completes.

- [ ] **Step 5: Capture four real rendered states**

Save screenshots under `audit/profile-personal-incense-archive-2026-08-24/`:

- `01-iphone-profile-logged-out.png`
- `02-iphone-profile-authorized.png`
- `03-pixel-profile-logged-out.png`
- `04-pixel-profile-authorized.png`

Inspect all four images for clipping, tab overlap, vertical imbalance, mismatched radius, weak hierarchy, authorization layout jump, and visual drift from the homepage palette.

- [ ] **Step 6: Compare, fix, and reverify**

If visual inspection finds a mismatch, update only Profile-owned markup or CSS, recapture the affected state, and rerun the focused Profile tests plus `npm run check:runtime` before handoff.
