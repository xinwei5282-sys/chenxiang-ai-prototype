# Knowledge WeChat-style Article Implementation Plan

> **For Codex execution:** This plan may be executed inline in the current session or step-by-step with explicit checkpoints. Keep checkbox (`- [ ]`) syntax for tracking.

**Goal:** Present both homepage knowledge details as display-only WeChat-style mobile articles without changing the separate care manual service.

**Architecture:** Add one reusable article-content renderer driven by two literal article records. Route only the two homepage knowledge rows to these article screens; preserve the existing `careScreen` for the service shortcut.

**Tech Stack:** React 19, TypeScript, existing FlowStack runtime, CSS, Playwright.

---

## File responsibility map

**Modify**

- `tests/prototype-h5.spec.ts` — article structure, display-only contract, route separation, two-device fit.
- `src/Prototype.tsx` — two article records, shared article screen, homepage row routes.
- `src/prototype.css` — WeChat-style reading typography and image rhythm.
- `AGENTS.md` — durable knowledge-detail decision.
- `design-qa.md` — final visual and behavior evidence.

### Task 1: Add failing article-flow tests

- [x] Assert the authenticity row opens `沉香小知识` with the expected title, metadata, hero, and article sections.
- [x] Assert the care row opens a separate `沉香小知识` article and does not render the seven-row care manual.
- [x] Assert article details have no non-navigation buttons, textboxes, or bottom action toolbar.
- [x] Assert the service button `佩戴养护` still opens the seven-row manual.
- [x] Run the focused route assertions. The execution environment could not launch its bundled browser for a strict pre-implementation RED run; the primary session completed the browser verification after implementation.

### Task 2: Implement the shared display-only article renderer

- [x] Define two literal article records with title, date, hero asset, lead, sections, and closing note.
- [x] Render the shared article anatomy with semantic `article`, heading, metadata, image, paragraphs, and section headings.
- [x] Route the two homepage knowledge rows to the matching article record while leaving the service route unchanged.
- [x] Run the focused tests and verify GREEN.

### Task 3: Style and verify

- [x] Add restrained single-column article CSS matching the saved WeChat reference and existing project palette.
- [x] Capture both article details on iPhone and Pixel; inspect top and scrolled states.
- [x] Run focused tests, `npm run check:runtime`, and `npm run build`.
- [x] Update `design-qa.md` and keep the preview open.
