# ChatGPT-Style Question Flow Implementation Plan

> **For Codex execution:** This plan may be executed inline in the current session or step-by-step with explicit checkpoints. Keep checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the mobile prototype's `AI问事` screen as the approved two-state ChatGPT-style, text-only conversation that always starts fresh and uses the official Guangken Agarwood logo in its empty state.

**Architecture:** Keep the protected mobile runtime and existing `FlowStack` navigation intact. Refactor only the app-owned `FortuneAgent` state/rendering and its CSS, using the current keyboard-aware `KeyboardTextarea`, local simulated replies, and actual brand asset. Drive the behavior with Playwright regression tests first, then complete browser-rendered iPhone/Pixel design QA against the two selected source images.

**Tech Stack:** React 19, TypeScript, Vite, project mobile runtime (`FlowStack`, `MobileScroll`, `KeyboardTextarea`), Radix Icons, Playwright.

---

## File responsibility map

**Modify**

- `tests/prototype-h5.spec.ts` — executable acceptance coverage for fresh entry, official logo, text-only composer, send behavior, follow-up flow, and reset on re-entry.
- `src/Prototype.tsx` — `FortuneAgent` state machine, empty-state markup, text sending, local reply flow, and all entry points into a fresh conversation.
- `src/prototype.css` — faithful empty-state, message stream, disclaimer, composer, send button, keyboard, iPhone, and Pixel styling.
- `AGENTS.md` — durable project decision recording the approved two-state question-page visual and text-only boundary.
- `design-qa.md` — final source-versus-rendered comparison evidence and exact `final result`.

**Reference only**

- `reference/chatgpt-question-new-logo-selected.png` — approved default new-conversation visual truth.
- `reference/chatgpt-question-conversation-selected.png` — approved active-conversation visual truth.
- `public/assets/home-reference/guangken-chenxiang-logo.png` — official Logo rendered by the app.
- `docs/superpowers/specs/2026-08-31-chatgpt-style-question-flow-design.md` — approved product and acceptance specification.
- `src/mobile/` and other protected runtime paths — must remain unchanged.

**Generated QA evidence**

- `audit/chatgpt-question-flow/iphone-initial.png`
- `audit/chatgpt-question-flow/iphone-follow-up.png`
- `audit/chatgpt-question-flow/iphone-answer.png`
- `audit/chatgpt-question-flow/pixel-initial.png`
- `audit/chatgpt-question-flow/pixel-answer.png`
- normalized same-size comparison boards under `audit/chatgpt-question-flow/`.

This workspace is not a Git repository, so commit steps are intentionally omitted; each task ends in an explicit verification checkpoint instead.

---

### Task 1: Specify the fresh, branded, text-only entry state with failing tests

**Files:**

- Modify: `tests/prototype-h5.spec.ts`
- Test: `tests/prototype-h5.spec.ts`

- [ ] **Step 1: Replace the old voice-composer expectation with the approved text-only contract**

Change the existing composer test to assert the real UI boundary:

```ts
test("AI composer supports text and send only", async ({ page }) => {
  await page.getByRole("button", { name: "开始问帖" }).click();
  await page.getByRole("button", { name: "微信授权并继续" }).click();
  const composer = page.locator(".reading-composer");
  const input = composer.getByRole("textbox", { name: "向 AI 问事助手提问" });
  const send = composer.getByRole("button", { name: "发送" });

  await expect(send).toBeVisible();
  await expect(send).toBeDisabled();
  await expect(composer.getByRole("button", { name: "语音输入" })).toHaveCount(0);
  await expect(composer.locator('input[type="file"]')).toHaveCount(0);
  await input.fill("近期是否适合推进新的合作？");
  await expect(send).toBeEnabled();
  await send.click();
  await expect(page.getByText("近期是否适合推进新的合作？", { exact: true })).toBeVisible();
});
```

- [ ] **Step 2: Update the question-tab test to require the official empty state**

Assert:

```ts
await expect(current.getByTestId("reading-empty-state")).toBeVisible();
await expect(current.getByRole("img", { name: "广垦沉香" })).toHaveAttribute(
  "src",
  "/assets/home-reference/guangken-chenxiang-logo.png",
);
await expect(current.getByRole("heading", { name: "今天想问什么？" })).toBeVisible();
await expect(current.getByText(/我是你的 AI 问事助手/)).toHaveCount(0);
await expect(current.getByRole("button", { name: "发送" })).toBeDisabled();
await expect(current.getByRole("button", { name: "语音输入" })).toHaveCount(0);
```

Keep the existing no-bracelet, no-avatar, no-result-card, no-root-tabs, starter-topic, and disclaimer assertions.

- [ ] **Step 3: Add a regression test for a new conversation on every entry**

The test must send a starter topic, wait for the follow-up, leave the pushed screen, and enter again through the root `问帖` tab:

```ts
test("each reading entry starts a fresh conversation", async ({ page }) => {
  await page.getByRole("button", { name: "开始问帖" }).click();
  await page.getByRole("button", { name: "微信授权并继续" }).click();
  await page.getByRole("button", { name: "事业" }).click();
  await expect(page.getByText(/我想再确认/)).toBeVisible({ timeout: 3000 });

  await page.getByRole("button", { name: "返回" }).click();
  await page.getByRole("navigation", { name: "小程序导航" })
    .getByRole("button", { name: "问帖" }).click();

  const current = page.getByTestId("flow-current");
  await expect(current.getByTestId("reading-empty-state")).toBeVisible();
  await expect(current.locator(".fortune-message")).toHaveCount(0);
  await expect(current.getByRole("button", { name: "事业" })).toBeVisible();
});
```

- [ ] **Step 4: Update the history-detail action expectation to the approved lifecycle**

Change the record-detail action from context continuation to a fresh entry. The button should be named `开启新问帖`; after clicking, assert the empty state and absence of `接着聊你之前关于合作的问帖`.

- [ ] **Step 5: Run the focused tests and verify RED for the intended reasons**

Run:

```bash
npx playwright test tests/prototype-h5.spec.ts -g "AI composer supports text and send only|question tab opens|each reading entry starts a fresh conversation|reading record opens detail" --reporter=line
```

Expected: failures because the current screen still renders an initial AI bubble and microphone, lacks the brand empty state and external send button, and still continues history context. Fix selector or setup errors until the failures are behavioral.

---

### Task 2: Implement the two-state React conversation flow

**Files:**

- Modify: `src/Prototype.tsx`
- Test: `tests/prototype-h5.spec.ts`

- [ ] **Step 1: Remove the obsolete media-input implementation**

Remove `Mic` from imports, `listening`, `voiceTimerRef`, `toggleVoiceInput`, listening placeholders/classes, and all voice timer cleanup. Import `ArrowUpIcon` from `@radix-ui/react-icons` for the real send control.

- [ ] **Step 2: Start `FortuneAgent` with no messages**

Remove the `continued` prop and initialize:

```ts
const [messages, setMessages] = useState<AgentMessage[]>([]);
const isNewConversation = messages.length === 0 && !thinking;
const userTurns = messages.filter(message => message.role === "user").length;
```

Keep `sequenceRef`, draft, thinking, timer cleanup, scroll tracking, and the local `simulatedReply` sequence.

- [ ] **Step 3: Render the approved empty state before the message log**

When `isNewConversation` is true, render:

```tsx
<section className="reading-empty" data-testid="reading-empty-state">
  <img
    className="reading-empty-logo"
    src="/assets/home-reference/guangken-chenxiang-logo.png"
    alt="广垦沉香"
  />
  <h2>今天想问什么？</h2>
  <p>先说说最近最挂心的事，我会再问两三句。</p>
  <nav className="reading-prompts" aria-label="常见问题">
    {starterPrompts.map(item => (
      <button type="button" key={item.label} onClick={() => send(item.prompt)}>
        {item.label}
      </button>
    ))}
  </nav>
</section>
```

When messages exist, render only `.reading-log`. Do not retain the previous AI opening bubble or the `也可以从这里开始` label.

- [ ] **Step 4: Add the text-only composer and semantic send button**

Keep `KeyboardTextarea`, set the exact placeholder, and add a real button:

```tsx
<div className="reading-input-shell">
  <KeyboardTextarea
    aria-label="向 AI 问事助手提问"
    value={draft}
    disabled={thinking}
    onChange={event => setDraft(event.target.value)}
    onKeyDown={event => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        send();
      }
    }}
    placeholder={thinking ? "正在推演，请稍候…" : "给 AI 问事发消息"}
    rows={1}
    maxLength={160}
  />
  <button
    className="reading-send"
    type="button"
    aria-label="发送"
    disabled={thinking || !draft.trim()}
    onClick={() => send()}
  >
    <ArrowUpIcon aria-hidden="true" />
  </button>
</div>
```

Keep the exact disclaimer `内容由 AI 生成，仅供娱乐参考` immediately above this input shell inside `.reading-composer` so it remains visible in every state.

- [ ] **Step 5: Make every AI screen entry fresh**

Replace the continuation signature with:

```ts
const interpretScreen = (keyboard: ReturnType<typeof useKeyboard>): FlowScreen => ({
  id: "interpret",
  header: flow => <TopBar title="AI问事" back={flow.pop} keyboard={keyboard} />,
  headerHeight: 54,
  render: () => <FortuneAgent keyboard={keyboard} />,
});
```

Change the history-detail action label to `开启新问帖` and call `interpretScreen(keyboard)` without context. All home, profile, and root-tab entry points continue using the same fresh screen factory.

- [ ] **Step 6: Run the Task 1 focused tests and verify GREEN**

Run the same focused Playwright command from Task 1.

Expected: all four named behaviors pass, no voice or upload control exists, the send button transitions disabled → enabled, and re-entry has zero messages.

---

### Task 3: Match the approved ChatGPT-style visual target

**Files:**

- Modify: `src/prototype.css`
- Test: `tests/prototype-h5.spec.ts`

- [ ] **Step 1: Establish the white, full-height reading canvas**

Update the reading shell to a neutral white canvas and reserve composer space without touching runtime safe-area ownership:

```css
.reading-shell { background: #fff; }
.reading-scroll { inset: 0; }
.reading-page { min-height: 100%; padding: 0 20px 118px; }
```

Keep the composer positioned with `bottom: var(--agent-composer-bottom)` from `useKeyboardInsets()`; do not add `var(--keyboard-height)` to scroll content.

- [ ] **Step 2: Recreate the default composition with the real logo**

Add `.reading-empty` as a centered flex column with generous top/bottom breathing room, `.reading-empty-logo` at approximately `160–168px` wide with `height: auto`, a `28–30px` semibold heading, gray `14–15px` helper copy, and three equal 44px minimum-height outlined pills. Preserve the logo's aspect ratio, transparency, and source colors.

- [ ] **Step 3: Flatten the active conversation into a continuous message stream**

Use 16px side rhythm, 18–22px message-group spacing, user bubbles in low-saturation `#f2f2f2` with near-black text and rounded corners, and agent messages without a surrounding card/border/background. Keep body copy around 15px/1.7 and `.fortune-answer-label` in the existing deep Guangken green.

- [ ] **Step 4: Match the fixed disclaimer/composer treatment**

Style `.reading-composer` as a white bottom layer without a heavy top divider. Center the disclaimer in small gray text above a 54–56px rounded input shell. Give `.reading-send` a 40–44px black circle with a white upward arrow, turning to a quiet gray disabled state. Input, send, and starter pills retain at least 44px effective touch targets; Pixel remains at least 48px where the existing project convention requires it.

- [ ] **Step 5: Add focus, keyboard, and reduced-motion states**

Replace `.reading-voice` selectors with `.reading-send`, preserve a visible focus ring, keep thinking-dot motion disabled under `prefers-reduced-motion`, and ensure the final message stays above the keyboard/composer at both device presets.

- [ ] **Step 6: Extend Playwright layout checks**

Add concrete assertions that the Logo is not distorted, controls are at least 44px, the send button is circular, and the empty-state content and composer remain inside the device screen. For example:

```ts
const logo = await current.getByRole("img", { name: "广垦沉香" }).evaluate(node => {
  const img = node as HTMLImageElement;
  const box = img.getBoundingClientRect();
  return { width: box.width, height: box.height, naturalRatio: img.naturalWidth / img.naturalHeight, renderedRatio: box.width / box.height };
});
expect(Math.abs(logo.naturalRatio - logo.renderedRatio)).toBeLessThan(0.02);
```

- [ ] **Step 7: Run the focused AI-flow suite**

Run:

```bash
npx playwright test tests/prototype-h5.spec.ts -g "reading|AI composer|question tab|agent actively|Pixel critical" --reporter=line
```

Expected: all matched tests pass with no console/runtime errors in test output.

---

### Task 4: Record the durable decision and verify runtime integrity

**Files:**

- Modify: `AGENTS.md`
- Verify: `src/App.tsx`, `src/main.tsx`, `src/styles.css`, `src/mobile/`, protected asset/runtime paths

- [ ] **Step 1: Add the approved page decision to `AGENTS.md`**

Add a dated note near the existing care note:

```md
## AI question-page fidelity note (2026-08-31)

The selected new-conversation source is `reference/chatgpt-question-new-logo-selected.png`; the selected active-conversation source is `reference/chatgpt-question-conversation-selected.png`. Every normal entry starts fresh. Use the official `public/assets/home-reference/guangken-chenxiang-logo.png` only in the empty state, then switch to a clean ChatGPT-style message stream. The composer is text-and-send only: never add upload, attachment, camera, microphone, voice, waveform, or audio controls unless a later explicit decision overrides this note.
```

- [ ] **Step 2: Run protected runtime verification**

Run:

```bash
npm run check:runtime
```

Expected: exit code `0`; do not weaken hashes or modify protected runtime files to make this pass.

- [ ] **Step 3: Run TypeScript and production build**

Run:

```bash
npm run build
```

Expected: TypeScript, Vite build, and Sites preparation all exit `0`.

---

### Task 5: Browser acceptance and blocking design QA

**Files:**

- Create/replace: `design-qa.md`
- Create: `audit/chatgpt-question-flow/*.png`
- Reference: `reference/chatgpt-question-new-logo-selected.png`
- Reference: `reference/chatgpt-question-conversation-selected.png`

- [ ] **Step 1: Open the checked local preview in the user's normal preview surface**

Use the existing Vite project directly and keep its preview process alive:

```bash
npm run dev -- --host 127.0.0.1 --port 4174 --strictPort
```

After the server is ready, open `http://127.0.0.1:4174/` in the user's normal browser with the already approved `open` command. If port 4174 is already serving this project, reuse the running process instead of starting a duplicate.

- [ ] **Step 2: Capture the same states at both device presets**

Capture browser-rendered phone-screen content for:

- iPhone initial empty state.
- iPhone first follow-up state.
- iPhone structured answer state.
- Pixel initial empty state.
- Pixel structured answer state.

Verify primary interactions: authorize, starter prompt, typed send button, Enter send, AI thinking disabled state, second-turn structured response, keyboard open/close, back, and fresh re-entry. Inspect browser console errors.

- [ ] **Step 3: Normalize reference and implementation evidence**

Record source pixel sizes. Normalize both references and browser captures to the same visible app-content dimensions before comparing; do not compare a framed source to an unframed implementation. Put each source and matching implementation in the same comparison board/input.

- [ ] **Step 4: Run the first design-QA comparison**

Explicitly evaluate typography, spacing/layout rhythm, colors/tokens, official Logo fidelity, icons, and copy/content. Save findings with P0–P3 severity in `design-qa.md`. Any actionable P0/P1/P2 keeps `final result: blocked`.

- [ ] **Step 5: Fix every P0/P1/P2 and repeat capture/comparison**

For each iteration, record earlier finding, code fix, revised screenshot path, and post-fix evidence. Do not pass based on build output or screenshots viewed separately.

- [ ] **Step 6: Complete the final report**

`design-qa.md` must include source paths, implementation screenshot paths, viewport/CSS dimensions, pixel density normalization, states, full-view evidence, focused Logo/composer/message evidence, interactions tested, console check, comparison history, findings, and exactly:

```text
final result: passed
```

Only use `passed` when no actionable P0/P1/P2 remains.

---

### Task 6: Final regression gate and preview handoff

**Files:**

- Test: `tests/prototype-h5.spec.ts`
- Verify: `design-qa.md`

- [ ] **Step 1: Run the full prototype Playwright suite**

Run:

```bash
npx playwright test tests/prototype-h5.spec.ts --reporter=line
```

Expected: all in-scope tests pass. If the known unrelated homepage small-type test still fails, record its exact test name and output separately; do not claim the full suite passed.

- [ ] **Step 2: Re-run the final delivery commands with fresh evidence**

Run:

```bash
npm run check:runtime
npm run build
```

Expected: both commands exit `0` in this final verification run.

- [ ] **Step 3: Confirm the QA gate and keep the preview open**

Verify `design-qa.md` contains exactly `final result: passed`, reopen the final `AI问事` initial state in the user's normal browser, and hand off the working preview with a concise list of changed behavior, verified commands, and any remaining unrelated risk.
