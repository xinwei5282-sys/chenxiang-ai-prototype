# Collection Card Reference Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the homepage “我的藏品” module as the approved single-card archive carousel while preserving per-item archive navigation and certificate downloads.

**Architecture:** Keep the existing `collectibles` data and protected `Carousel` runtime. Add a focused `CollectionShowcase` component in `src/Prototype.tsx` that owns the active item index, reads the existing carousel scroll position, and renders two full-width `CollectionCard` slides; style only the app-owned module in `src/prototype.css`.

**Tech Stack:** React 19, TypeScript, existing mobile `Carousel`, CSS, Playwright.

**Spec:** `docs/superpowers/specs/2026-08-28-collection-card-reference-redesign.md`

## Global Constraints

- Modify only `src/Prototype.tsx`, `src/prototype.css`, and `tests/prototype-h5.spec.ts`.
- Do not edit protected runtime files under `src/mobile/` or alter the device frame, bottom tabs, archive screens, or certificate files.
- Preserve exact archive routes, certificate URLs, download filenames, and success/failure toast behavior.
- Use the supplied product images and existing icon libraries; do not create CSS art, inline SVG, or replacement image assets.
- Keep arrow controls at least `44 × 44px` and verify both iPhone and Pixel layouts.
- This workspace has no Git metadata, so commit steps are unavailable; do not initialize a repository.

## File Responsibility Map

- `tests/prototype-h5.spec.ts`: observable reference-card structure, active item switching, and per-item action behavior.
- `src/Prototype.tsx`: collection carousel state, semantic card markup, switching logic, archive callbacks, and certificate link reuse.
- `src/prototype.css`: reference-matched card geometry, typography, colors, responsive layout, and visible active state.
- `design-qa.md`: blocking visual comparison report created during final QA.

---

### Task 1: Lock the selected-item behavior with a failing browser test

**Files:**
- Test: `tests/prototype-h5.spec.ts`

**Interfaces:**
- Consumes: existing homepage region `role="region"` with accessible name `我的藏品`.
- Produces: a behavioral contract for `.collection-card[data-active="true"]`, `上一件藏品`, `下一件藏品`, and `.collection-pagination [aria-current="step"]`.

- [ ] **Step 1: Add a failing interaction test after the existing collection carousel test**

```ts
test("collection reference card switches the active archive and keeps actions item-specific", async ({ page }) => {
  const collection = page.getByRole("region", { name: "我的藏品" });
  const active = () => collection.locator('.collection-card[data-active="true"]');

  await expect(active()).toContainText("海南琼南沉香手串");
  await expect(active()).toContainText("已认证");
  await expect(active()).toContainText("档案编号");
  await expect(active()).toContainText("CX-2018-072");
  await expect(active().getByRole("link", { name: "导出海南琼南沉香手串电子证书" })).toBeVisible();
  await expect(collection.locator('.collection-pagination [aria-current="step"]')).toHaveAttribute("aria-label", "第 1 件：海南琼南沉香手串");

  const next = active().getByRole("button", { name: "下一件藏品" });
  const nextBox = await next.boundingBox();
  expect(nextBox?.width).toBeGreaterThanOrEqual(44);
  expect(nextBox?.height).toBeGreaterThanOrEqual(44);
  await next.click();

  await expect(active()).toContainText("琼南一号认种沉香树");
  await expect(active()).toContainText("已建档");
  await expect(active()).toContainText("认种编号");
  await expect(active()).toContainText("TR-2026-018");
  await expect(active().getByRole("link", { name: "导出琼南一号认种沉香树电子证书" })).toBeVisible();
  await expect(collection.locator('.collection-pagination [aria-current="step"]')).toHaveAttribute("aria-label", "第 2 件：琼南一号认种沉香树");

  await active().getByRole("button", { name: "查看琼南一号认种沉香树档案" }).click();
  await expect(page.getByRole("heading", { name: "琼南一号认种沉香树" })).toBeVisible();
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
npx playwright test tests/prototype-h5.spec.ts -g "collection reference card switches"
```

Expected: FAIL because no card has `data-active="true"`, the top-level current-item actions and pagination dots do not exist, and the current arrow controls are missing.

---

### Task 2: Implement the reference-card structure and switching behavior

**Files:**
- Modify: `src/Prototype.tsx:500-590`
- Test: `tests/prototype-h5.spec.ts`

**Interfaces:**
- Consumes: `collectibles`, `CertificateDownloadLink`, `Carousel`, `prepareH5Transition`, `collectionArchiveScreen`, and `adoptionArchiveScreen`.
- Produces: `CollectionShowcase({ flow, keyboard, onToast })`, full-width `.collection-card` slides, `data-active`, and semantic current-item controls.

- [ ] **Step 1: Extend the reusable certificate link without changing archive-page behavior**

Add an optional `showIcon` prop and render the existing imported `FileText` icon only for collection-card links:

```tsx
function CertificateDownloadLink({ item, onToast, showIcon = false }: { item: Collectible; onToast: (message: string) => void; showIcon?: boolean }) {
  // Keep the existing download function unchanged.
  return <a href={item.certificateHref} download={item.certificateFilename} aria-label={`导出${item.name}电子证书`} onClick={download}>
    {showIcon ? <FileText aria-hidden="true" /> : null}
    <span>导出电子证书</span>
  </a>;
}
```

- [ ] **Step 2: Replace the compact `CollectionCard` markup with the approved reference structure**

Use this component signature and semantic structure:

```tsx
function CollectionCard({ item, index, activeIndex, onStep, onOpen, onToast }: {
  item: Collectible;
  index: number;
  activeIndex: number;
  onStep: (delta: -1 | 1) => void;
  onOpen: () => void;
  onToast: (message: string) => void;
}) {
  const status = item.id === "tree" ? "已建档" : "已认证";
  const numberLabel = item.id === "tree" ? "认种编号" : "档案编号";
  const visibleFacts = item.facts.filter(([label]) => label !== "状态").slice(0, 2);
  return <article className="collection-card" data-active={index === activeIndex ? "true" : "false"}>
    <header className="collection-card-header">
      <h3>我的藏品</h3>
      <CertificateDownloadLink item={item} onToast={onToast} showIcon />
      <button type="button" aria-label={`查看${item.name}档案`} onClick={onOpen}>查看档案<ChevronRightIcon aria-hidden="true" /></button>
    </header>
    <div className="collection-card-body">
      <button className="collection-step previous" type="button" aria-label="上一件藏品" onClick={() => onStep(-1)}><ChevronLeftIcon aria-hidden="true" /></button>
      <img src={item.image} alt={item.imageAlt} />
      <div className="collection-card-copy">
        <div className="collection-name-row"><strong>{item.name}</strong><small><CheckCircledIcon aria-hidden="true" />{status}</small></div>
        <dl>
          <div><dt>{numberLabel}</dt><dd>{item.number}</dd></div>
          {visibleFacts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
        </dl>
      </div>
      <span className="collection-seal" aria-hidden="true">{item.id === "tree" ? "树" : "香"}</span>
      <button className="collection-step next" type="button" aria-label="下一件藏品" onClick={() => onStep(1)}><ChevronRightIcon aria-hidden="true" /></button>
    </div>
    <ol className="collection-pagination" aria-label="藏品位置">
      {collectibles.map((entry, dotIndex) => <li key={entry.id} aria-label={`第 ${dotIndex + 1} 件：${entry.name}`} aria-current={dotIndex === activeIndex ? "step" : undefined} />)}
    </ol>
  </article>;
}
```

- [ ] **Step 3: Add the focused `CollectionShowcase` state wrapper**

Implement the exact behavior below, keeping the protected `Carousel` unchanged:

```tsx
function CollectionShowcase({ flow, keyboard, onToast }: { flow: any; keyboard: ReturnType<typeof useKeyboard>; onToast: (message: string) => void }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const carousel = sectionRef.current?.querySelector<HTMLElement>(".collection-carousel");
    if (!carousel) return;
    const update = () => setActiveIndex(Math.max(0, Math.min(collectibles.length - 1, Math.round(carousel.scrollLeft / Math.max(1, carousel.clientWidth)))));
    carousel.addEventListener("scroll", update, { passive: true });
    update();
    return () => carousel.removeEventListener("scroll", update);
  }, []);

  const selectRelative = (delta: -1 | 1) => {
    const next = (activeIndex + delta + collectibles.length) % collectibles.length;
    const carousel = sectionRef.current?.querySelector<HTMLElement>(".collection-carousel");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setActiveIndex(next);
    carousel?.scrollTo({ left: next * carousel.clientWidth, behavior: reducedMotion ? "auto" : "smooth" });
  };

  const openArchive = (item: Collectible) => {
    prepareH5Transition(keyboard);
    flow.push(item.id === "tree" ? adoptionArchiveScreen(keyboard) : collectionArchiveScreen(keyboard));
  };

  return <section ref={sectionRef} className="home-collection" data-home-section="home-collection" aria-label="我的藏品">
    <Carousel className="collection-carousel" contentClassName="collection-carousel-content" ariaLabel="我的藏品轮播">
      {collectibles.map((item, index) => <CollectionCard key={item.number} item={item} index={index} activeIndex={activeIndex} onStep={selectRelative} onToast={onToast} onOpen={() => openArchive(item)} />)}
    </Carousel>
  </section>;
}
```

- [ ] **Step 4: Replace the existing inline home section**

Replace the current `<section className="home-collection" ...>` in `Home` with:

```tsx
<CollectionShowcase flow={flow} keyboard={keyboard} onToast={toast.show} />
```

- [ ] **Step 5: Run the focused test and verify GREEN**

Run:

```bash
npx playwright test tests/prototype-h5.spec.ts -g "collection reference card switches"
```

Expected: PASS.

---

### Task 3: Match the reference geometry and complete regression verification

**Files:**
- Modify: `src/prototype.css:418-455`
- Test: `tests/prototype-h5.spec.ts`
- Create: `design-qa.md`

**Interfaces:**
- Consumes: the Task 2 class names and current homepage design tokens.
- Produces: a full-width white archive card with reference-matched hierarchy at both device widths.

- [ ] **Step 1: Replace the old collection-card CSS block**

Implement these values as the first visual pass:

```css
.home-collection { padding: 18px 12px 4px; }
.collection-carousel { width: 100%; }
.collection-carousel-content { display: flex; gap: 0; padding: 0; }
.collection-card { flex: 0 0 100%; min-width: 0; overflow: hidden; border: 1px solid rgba(53, 67, 59, .08); border-radius: 13px; background: #fff; box-shadow: 0 5px 16px rgba(73, 54, 31, .07); }
.collection-card-header { min-height: 43px; display: grid; grid-template-columns: minmax(0, 1fr) auto auto; align-items: center; gap: 14px; padding: 0 14px; }
.collection-card-header h3 { margin: 0; color: #202823; font-size: 14px; font-weight: 700; }
.collection-card-header a, .collection-card-header button { min-height: 44px; border: 0; display: inline-flex; align-items: center; gap: 4px; padding: 0; background: transparent; color: #6f675d; font-size: 10.5px; text-decoration: none; white-space: nowrap; }
.collection-card-header a { color: #9a663d; }
.collection-card-header svg { width: 13px; height: 13px; }
.collection-card-body { min-height: 96px; display: grid; grid-template-columns: 44px 88px minmax(0, 1fr) 40px 44px; align-items: center; gap: 5px; padding: 0 4px 4px; }
.collection-card-body > img { width: 88px; height: 78px; object-fit: contain; border-radius: 8px; background: #f3efe8; }
.collection-step { width: 44px; height: 44px; border: 0; display: grid; place-items: center; padding: 0; background: transparent; color: #687069; }
.collection-step svg { width: 18px; height: 18px; }
.collection-card-copy { min-width: 0; align-self: center; }
.collection-name-row { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
.collection-name-row > strong { overflow: hidden; color: #22372d; font-size: 13px; line-height: 1.25; text-overflow: ellipsis; white-space: nowrap; }
.collection-name-row > small { flex: 0 0 auto; display: inline-flex; align-items: center; gap: 2px; margin: 0; color: #3a785f; font-size: 8.5px; white-space: nowrap; }
.collection-name-row svg { width: 10px; height: 10px; }
.collection-card-copy dl { margin: 0; display: grid; gap: 4px; }
.collection-card-copy dl > div { display: grid; grid-template-columns: 48px minmax(0, 1fr); gap: 4px; }
.collection-card-copy dt, .collection-card-copy dd { margin: 0; font-size: 9px; line-height: 1.25; white-space: nowrap; }
.collection-card-copy dt { color: #7a817b; }
.collection-card-copy dd { overflow: hidden; color: #2d3a33; text-overflow: ellipsis; }
.collection-seal { width: 40px; height: 40px; border: 1px solid rgba(91, 115, 102, .08); border-radius: 50%; display: grid; place-items: center; color: rgba(91, 115, 102, .09); font: 24px/1 "Songti SC", "STSong", serif; }
.collection-pagination { height: 15px; margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; gap: 5px; list-style: none; }
.collection-pagination li { width: 5px; height: 5px; border-radius: 50%; background: #deded9; }
.collection-pagination li[aria-current="step"] { width: 8px; border-radius: 5px; background: var(--ref-forest); }
.device-screen[data-device="pixel-10"] .collection-card-body { grid-template-columns: 44px 98px minmax(0, 1fr) 46px 44px; gap: 8px; }
.device-screen[data-device="pixel-10"] .collection-card-body > img { width: 98px; height: 82px; }
.device-screen[data-device="pixel-10"] .collection-seal { width: 46px; height: 46px; font-size: 28px; }
```

Delete the previous `.collection-card`, `.collection-card-actions`, and generic `.collection-card p, .collection-card span, .collection-card small` declarations so they cannot override the new component-specific rules.

- [ ] **Step 2: Run the complete collection and certificate regression slice**

Run:

```bash
npx playwright test tests/prototype-h5.spec.ts -g "collection|certificate"
```

Expected: all matching tests PASS, including the existing PDF download success/failure coverage.

- [ ] **Step 3: Run protected-runtime and production checks**

Run:

```bash
npm run check:runtime
npm run build
```

Expected: both commands exit `0`; the runtime hash check reports success and the production build produces `dist/client` and `dist/server`.

- [ ] **Step 4: Capture iPhone and Pixel homepage states**

Use the project’s existing preview/capture scripts or the Codex in-app browser, scroll each device to the “我的藏品” module, and capture:

- iPhone default bracelet state.
- iPhone tree state after using the next arrow.
- Pixel default bracelet state.
- Pixel tree state after using the next arrow.

Verify no clipping, overlap, horizontal page overflow, undersized arrow target, or stale certificate/archive action.

- [ ] **Step 5: Run blocking design QA against the supplied reference**

Open the supplied reference and the newest same-state app capture together. Write `design-qa.md` with visible differences classified P0–P3, fix every P0/P1/P2, recapture, and repeat until the report ends with:

```md
final result: passed
```

- [ ] **Step 6: Run final full project verification**

Run:

```bash
npm run check:runtime
npm run build
npx playwright test tests/prototype-h5.spec.ts
```

Expected: all three commands exit `0` with no Playwright failures.
