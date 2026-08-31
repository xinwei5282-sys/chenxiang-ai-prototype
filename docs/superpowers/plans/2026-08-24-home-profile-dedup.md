# Home and Profile Deduplication Implementation Plan

> **For Codex execution:** Execute inline in the current session. This project is not a Git repository, so do not create commits. Keep checkbox (`- [ ]`) syntax for tracking.

**Goal:** Separate the home usage flow from profile management and add a secondary Guangken agarwood story Banner to home.

**Architecture:** Keep the existing `FlowStack`, routes, Agent, and protected mobile runtime. Change only app-owned markup and styling in `src/Prototype.tsx` and `src/prototype.css`, reusing the certificate route for both the Banner and “我的手串”.

**Tech Stack:** React 19, TypeScript, Radix Icons, Playwright, Vite.

---

## File responsibility map

- Modify `tests/prototype-h5.spec.ts`: observable home Banner and profile de-duplication behavior.
- Modify `src/Prototype.tsx`: Banner content/actions and profile information architecture.
- Modify `src/prototype.css`: Banner composition and profile overview/list styling.
- Modify `AGENTS.md`: durable product responsibility decision.
- Create `audit/home-profile-dedup-2026-08-24/`: two-round iPhone/Pixel screenshots and review notes.

### Task 1: Lock the revised information architecture

**Files:**
- Test: `tests/prototype-h5.spec.ts`

- [ ] **Step 1: Write failing tests**

Require the home Banner and require profile to expose management entries without repeating the home bracelet summary.

- [ ] **Step 2: Verify RED**

Run: `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=... npx playwright test tests/prototype-h5.spec.ts -g "Guangken story|profile separates"`

Expected: FAIL because the Banner does not exist and profile still renders the full bracelet card.

### Task 2: Implement Banner and profile de-duplication

**Files:**
- Modify: `src/Prototype.tsx`
- Modify: `src/prototype.css`

- [ ] **Step 1: Add the home Banner**

Use `officialLogo` and the existing product image. Keep it after recent readings and wire its button to `certificateScreen(keyboard)`.

- [ ] **Step 2: Replace profile content**

Remove `BraceletSummary profile`. Add a compact WeChat authorization panel, text overview, grouped management rows, and the existing NFC footnote. Authorization is local React state for the requirements prototype and does not call a real WeChat API. Reuse existing routes and do not add unrelated settings.

- [ ] **Step 3: Verify GREEN**

Run the two focused Playwright tests and confirm both pass.

### Task 3: Render and verify

**Files:**
- Create: `audit/home-profile-dedup-2026-08-24/round-1/*.png`
- Create: `audit/home-profile-dedup-2026-08-24/round-2/*.png`
- Create: `audit/home-profile-dedup-2026-08-24/visual-review.md`

- [ ] **Step 1: Capture iPhone and Pixel home/profile screens**
- [ ] **Step 2: Compare hierarchy, Banner crop, repetition, safe areas, and 25% thumbnail readability**
- [ ] **Step 3: Fix visible issues and capture round two**
- [ ] **Step 4: Run full verification**

Run:

```bash
npm run check:runtime
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=... npx playwright test
npm run test:sites
npm run build
```

Expected: all commands pass.
