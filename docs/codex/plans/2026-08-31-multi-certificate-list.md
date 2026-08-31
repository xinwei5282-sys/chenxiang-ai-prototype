# Multi-certificate List Implementation Plan

> **For Codex execution:** This plan may be executed inline in the current session or step-by-step with explicit checkpoints. Keep checkbox (`- [ ]`) syntax for tracking.

**Goal:** Route the Profile certificate count through a three-item bracelet list and render the selected bracelet's certificate detail while preserving the homepage's current-bracelet shortcut.

**Architecture:** Add a typed in-memory certificate record model and parameterize the existing certificate detail screen. Add one list Flow screen that pushes the selected record into the same detail renderer; change only the Profile certificate action to open the list.

**Tech Stack:** React 19, TypeScript, existing FlowStack mobile runtime, CSS, Playwright.

---

## File responsibility map

**Create**

- `docs/superpowers/specs/2026-08-31-multi-certificate-list-design.md` — approved product and interaction contract.
- `docs/codex/plans/2026-08-31-multi-certificate-list.md` — executable TDD plan.

**Modify**

- `tests/prototype-h5.spec.ts` — list-first Profile path, selected-record detail, homepage shortcut, touch/fit assertions.
- `src/Prototype.tsx` — typed records, certificate list Flow screen, parameterized certificate detail, Profile count/action.
- `src/prototype.css` — compact full-width bracelet list and responsive details.
- `AGENTS.md` — durable list-first certificate decision.
- `design-qa.md` — final render and test evidence.

### Task 1: Lock the list-first behavior with failing tests

- [x] Change Profile certificate-count assertions from `1 串` to `3 串`.
- [x] Add a test that clicks `本串证书`, expects `我的手串`, and verifies exactly three semantic bracelet buttons with the specified names and certificate numbers.
- [x] Click the second row and assert the detail displays `琼南蜜韵沉香手串` and `CX-2024-116`; return and verify the list is restored.
- [x] Add layout assertions for at least 76px row height, one left edge, full usable width, visible thumbnails, and no horizontal overflow on iPhone/Pixel.
- [x] Run the focused test; browser launch was unavailable in the execution Agent, so the primary Agent performed the first behavior-capable run after implementation and corrected one stale Profile row-count assertion.

### Task 2: Implement record-driven list and detail screens

- [x] Define a `CertificateRecord` type and three literal records with image, number, specification, origin, scent, and timeline fields.
- [x] Parameterize `certificateScreen(keyboard, record)` and render all identity fields from the chosen record.
- [x] Add `certificateListScreen(keyboard)` with three full-row buttons that push the selected detail screen.
- [x] Change only the Profile certificate button to push the list and display `3 串`; keep the homepage service opening the first/current record detail.
- [x] Run the Task 1 tests and verify GREEN.

### Task 3: Style and verify the real mobile flow

- [x] Add flat list styles using current paper, green, divider, and typography tokens; keep touch targets and safe areas valid.
- [x] Capture Profile, `我的手串`, and the second certificate detail at iPhone 393×852 and Pixel 427×952.
- [x] Run focused Profile/certificate tests, `npm run check:runtime`, and `npm run build`.
- [x] Update `design-qa.md`, keep the local preview open, and report any unrelated existing regression separately.
