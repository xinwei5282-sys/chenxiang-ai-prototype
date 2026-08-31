# Profile Banner Actions Refinement Implementation Plan

> **For Codex execution:** This plan may be executed inline in the current session or step-by-step with explicit checkpoints. Keep checkbox (`- [ ]`) syntax for tracking.

**Goal:** Flatten the two Profile Banner data actions into transparent, centered, fully clickable halves while preserving their destinations.

**Architecture:** Keep the existing semantic buttons, click handlers, routes, Banner asset, and authorization state unchanged. Add one focused Playwright layout contract first, then make a CSS-only refinement and verify the rendered iPhone/Pixel states.

**Tech Stack:** React 19, TypeScript, CSS, Vite, Playwright.

---

## File responsibility map

**Modify**

- `tests/prototype-h5.spec.ts` — assert transparent action surface, centered content, adequate touch size, and route behavior.
- `src/prototype.css` — remove the action container fill/frame/radius and center content in each equal-width button.
- `docs/superpowers/specs/2026-08-31-profile-simple-list-design.md` — record the approved refinement.
- `design-qa.md` — append final render and verification evidence.

**Reference only**

- `src/Prototype.tsx` — existing semantic buttons and route handlers already satisfy the click contract.
- `src/mobile/` — protected runtime remains unchanged.

### Task 1: Lock the transparent centered action contract

**Files:**

- Modify: `tests/prototype-h5.spec.ts`

- [x] Add a focused test that measures `.profile-banner-actions`, its two buttons, and each button's `strong + small` content bounds.
- [x] Assert transparent container and button backgrounds, zero outer border width/radius, one center divider, touch height of at least 48px, and content centers within 2px of each button center.
- [x] Exercise both existing destinations through the semantic action buttons.
- [x] Run the focused test and verify RED against the current filled rounded surface.

### Task 2: Apply the minimal CSS refinement

**Files:**

- Modify: `src/prototype.css`

- [x] Remove the action container's fill, frame, radius, and clipping.
- [x] Keep the equal two-column grid and one subtle center divider.
- [x] Center each button's content on both axes and retain a transparent press feedback.
- [x] Run the focused test and verify GREEN.

### Task 3: Render and verify

**Files:**

- Modify: `design-qa.md`
- Verify: `tests/prototype-h5.spec.ts`, protected runtime, production build.

- [x] Capture the updated Profile on iPhone and Pixel widths and inspect the real render.
- [x] Run the focused Profile regression, `npm run check:runtime`, and `npm run build`.
- [x] Record the final evidence and keep the local preview open.
