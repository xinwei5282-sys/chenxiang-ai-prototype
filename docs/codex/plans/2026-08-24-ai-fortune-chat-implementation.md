# AI Fortune Chat Implementation Plan

> **For Codex execution:** This plan may be executed inline in the current session or step-by-step with explicit checkpoints. Keep checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the bracelet-linked “沉香问帖” screen with a standalone “AI问事” chat Agent that asks follow-up questions and answers entirely inside a native chat flow.

**Architecture:** Preserve the existing `FortuneAgent` state machine, shared authorization context, keyboard-aware composer, and FlowStack route. Remove bracelet and reading-card concepts from the message model and render every Agent response through one reusable chat-bubble structure.

**Tech Stack:** React 19, TypeScript, project mobile runtime, CSS, Playwright.

---

## File responsibility map

- Modify `src/Prototype.tsx`: message data model, simulated replies, chat markup, composer copy, and `AI问事` route title.
- Modify `src/prototype.css`: left/right chat bubbles, prompt chips, thinking bubble, disclaimer, and composer spacing.
- Modify `tests/prototype-h5.spec.ts`: title, removed bracelet context, bubble alignment, progressive questioning, and no-result-card coverage.
- Modify `AGENTS.md`: record the user-approved standalone `AI问事` direction after verification.
- Create rendered evidence under `audit/ai-fortune-chat-2026-08-24/`.

The project is not a Git work tree, so commit steps are omitted.

### Task 1: Lock the standalone chat contract with failing tests

**Files:**
- Modify: `tests/prototype-h5.spec.ts`
- Test: `tests/prototype-h5.spec.ts`

- [ ] **Step 1: Replace obsolete screen assertions**

Update the entry test to require:

```ts
await expect(page.getByRole("heading", { name: "AI问事" })).toBeVisible();
await expect(current.getByText("当前手串", { exact: true })).toHaveCount(0);
await expect(current.getByRole("img", { name: /当前手串/ })).toHaveCount(0);
await expect(current.getByText(/CX-2018-072/)).toHaveCount(0);
await expect(page.getByText(/我是你的 AI 问事助手/)).toBeVisible();
await expect(page.getByRole("textbox", { name: "向 AI 问事助手提问" })).toBeVisible();
```

- [ ] **Step 2: Add chat-bubble layout assertions**

After sending one message, compare actual bubble positions:

```ts
const bubbleLayout = await current.locator(".fortune-bubble").evaluateAll((items) => items.map((item) => ({
  role: item.closest(".fortune-message")?.classList.contains("user") ? "user" : "agent",
  left: item.getBoundingClientRect().left,
  right: item.getBoundingClientRect().right,
})));
expect(bubbleLayout.at(0)?.role).toBe("agent");
expect(bubbleLayout.some((item) => item.role === "user" && item.left > bubbleLayout[0].left)).toBe(true);
```

Also assert there are no `.reading-bracelet` or `.reading-result` elements.

- [ ] **Step 3: Update progressive Agent assertions**

Keep the first proactive follow-up assertion. On the second user reply, expect the ordinary Agent message to contain `判断`、`提醒` and `建议`, and assert that no `风山渐` heading or `[aria-label$="解读"]` result section exists.

- [ ] **Step 4: Run focused tests and verify failure**

Run:

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/Users/xinwei/.cache/puppeteer/chrome-headless-shell/mac_arm-148.0.7778.97/chrome-headless-shell-mac-arm64/chrome-headless-shell npx playwright test tests/prototype-h5.spec.ts --grep "AI问事|Agent|question tab"
```

Expected: FAIL because the route is still “沉香问帖”, bracelet context is visible, and the existing UI uses editorial entries plus a result card.

### Task 2: Implement the pure chat Agent

**Files:**
- Modify: `src/Prototype.tsx`
- Modify: `src/prototype.css`
- Test: `tests/prototype-h5.spec.ts`

- [ ] **Step 1: Simplify the message model and replies**

Remove `AgentReading` and the optional `reading` field. Keep:

```ts
type AgentMessage = { id: number; role: "agent" | "user"; text: string };
```

Use the approved first message and return plain text from `simulatedReply`. The second reply must include short `判断：`、`提醒：` and `建议：` paragraphs without deterministic promises.

- [ ] **Step 2: Remove bracelet and result markup**

Delete the `.reading-bracelet` section. Render messages as:

```tsx
<article className={`fortune-message ${message.role}`} ...>
  <div className="fortune-bubble"><p>{message.text}</p></div>
</article>
```

Render thinking as the same Agent bubble with `正在推演…`. Keep the existing `role="log"`, live region, timer cleanup, and scroll-to-latest behavior.

- [ ] **Step 3: Update prompts, labels, and route title**

- Use shortcut labels `事业`、`感情`、`财运`.
- Change the textarea accessible name to `向 AI 问事助手提问`.
- Change the initial placeholder to `说说你想问的事`.
- Keep the disclaimer text exactly `仅供娱乐与自我反思参考`.
- Change `interpretScreen` title to `AI问事`.

- [ ] **Step 4: Replace editorial transcript CSS**

Remove or supersede bracelet, role-column, and result-card styling. Add:

```css
.fortune-message { display: flex; padding: 9px 0; }
.fortune-message.user { justify-content: flex-end; }
.fortune-bubble { max-width: 82%; padding: 12px 14px; border-radius: 4px 12px 12px; background: var(--surface); }
.fortune-message.user .fortune-bubble { border-radius: 12px 4px 12px 12px; background: var(--green-deep); color: #f8f2e7; }
```

Implement three compact prompt chips, a matching thinking bubble, 44px touch targets, and enough bottom padding to keep the newest message above the composer.

- [ ] **Step 5: Run focused tests and verify pass**

Run the focused command from Task 1.

Expected: PASS for title, removed bracelet context, chat-bubble layout, follow-up flow, final plain-message answer, input, and keyboard behavior.

### Task 3: Full verification and visual QA

**Files:**
- Modify: `AGENTS.md`
- Evidence: `audit/ai-fortune-chat-2026-08-24/`

- [ ] **Step 1: Record the durable direction**

Append one Product Direction bullet stating that “AI问事” is standalone from bracelet identity and uses native left/right chat bubbles with proactive questioning and plain-message answers.

- [ ] **Step 2: Run runtime, full tests, and build**

Run:

```bash
npm run check:runtime
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/Users/xinwei/.cache/puppeteer/chrome-headless-shell/mac_arm-148.0.7778.97/chrome-headless-shell-mac-arm64/chrome-headless-shell npx playwright test
npm run build
```

Expected: protected runtime passes, all Playwright tests pass, and the production build succeeds.

- [ ] **Step 3: Capture real rendered states**

Capture iPhone and Pixel screenshots for:

- initial greeting and prompt chips;
- one user message plus Agent follow-up;
- final Agent answer after the second user reply.

Inspect for bubble alignment, text density, composer overlap, newest-message clipping, keyboard safe-area errors, stale bracelet content, and AI-generic visual artifacts.

- [ ] **Step 4: Iterate and reverify**

Fix only visible issues in `FortuneAgent` or reading CSS, recapture affected states, rerun focused tests, and rerun `npm run check:runtime` before handoff.
