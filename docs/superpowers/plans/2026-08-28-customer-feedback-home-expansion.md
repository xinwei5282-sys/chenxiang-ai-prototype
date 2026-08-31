# Customer Feedback Home Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the selected Guangken Mini Program homepage into a scrollable, fully clickable collection-and-brand prototype while keeping the mall as a bottom-tab coming-soon placeholder.

**Architecture:** Preserve the protected mobile runtime and keep app-owned implementation in `src/Prototype.tsx` and `src/prototype.css`. Extend the existing `FlowStack` with collection, adoption, industrial-park, and knowledge screens; use the runtime `Carousel` for all horizontal content; keep static prototype data in `Prototype.tsx`; serve two generated demonstration certificates from `public/assets/certificates/`.

**Tech Stack:** React 19, TypeScript 7, Vite 8, existing mobile runtime (`FlowStack`, `MobileScroll`, `Carousel`, `BottomSheet`), Radix/Lucide icons, Playwright 1.61, ReportLab/PyPDF/Poppler for PDF generation and QA.

**Spec:** `docs/superpowers/specs/2026-08-28-customer-feedback-home-expansion-design.md`

## Global Constraints

- The visual source of truth is the supplied Guangken homepage composition: logo, Eastern garden scene, illustrated girl holding the bracelet, warm paper cards, deep green actions, and native Mini Program capsule.
- Root tabs are exactly `首页 / 商城 / 问帖 / 我的`.
- The mall has no page in this phase; every mall-oriented entry shows `商城即将上线，敬请期待` without changing the active root tab.
- The homepage is vertically scrollable, and its final copyright row must clear the fixed tabs on iPhone and Pixel 10.
- AI entry copy is exactly: label `AI 传统文化解读`, title `以香静心，聊聊心中挂心事`, subtitle `借沉香感悟心绪，AI香道文化解读`, button `开始问帖`.
- Existing shared authorization, AI conversation, reading history, certificate, care, knowledge, profile, keyboard, status bar, device picker, and product-document drawer behavior must not regress.
- Do not edit protected runtime files listed in `AGENTS.md`.
- The project is not a Git worktree. Do not initialize Git. Replace commit steps with passing-test and saved-render checkpoints.
- Use `apply_patch` for source and text asset edits. Use the PDF skill and its runtime for PDF creation and render inspection.

---

## File Responsibility Map

- Modify `src/Prototype.tsx`: prototype data, toast behavior, four-tab navigation, expanded homepage, collection interactions, new FlowStack screens, certificate downloads, product-document page mappings.
- Modify `src/prototype.css`: long-form homepage, four-tab layout, selection showcase, collection carousel, archive/adoption/park/article pages, toast, iPhone/Pixel responsive states.
- Modify `tests/prototype-h5.spec.ts`: replace obsolete one-screen/three-tab assertions and add full interaction coverage.
- Modify `docs/codex/prd/2026-08-24-agarwood-digital-identity-ai-traditional-culture-agent-mvp-v2.md`: add the four new delivery pages and acceptance requirements used by the contextual review drawer.
- Create `scripts/generate-demo-certificates.py`: deterministic generation of the two demonstration PDFs.
- Create `public/assets/certificates/bracelet-digital-certificate-demo.pdf`: downloadable bracelet archive.
- Create `public/assets/certificates/tree-adoption-certificate-demo.pdf`: downloadable adoption certificate.
- Create `public/assets/customer-feedback/collection-tree.svg`: adopted-tree collection artwork.
- Create `public/assets/customer-feedback/park-base.svg`, `park-nursery.svg`, `park-workshop.svg`, `park-quality.svg`: four industrial-park carousel illustrations.
- Create `public/assets/customer-feedback/knowledge-authenticity.svg`: authenticity article thumbnail/hero.
- Create `scripts/capture-customer-feedback.mjs`: deterministic iPhone/Pixel visual acceptance capture.
- Create `audit/customer-feedback-expansion-2026-08-28/visual-review.md`: rendered QA findings and resolution notes.
- Create `audit/customer-feedback-expansion-2026-08-28/round-1/` and `round-2/`: iPhone and Pixel acceptance captures.

---

### Task 1: Replace obsolete homepage expectations with the approved behavior

**Files:**
- Modify: `tests/prototype-h5.spec.ts`
- Test: `tests/prototype-h5.spec.ts`

**Interfaces:**
- Consumes: current app at `/`, existing device picker, existing `data-testid="flow-current"`.
- Produces: executable behavioral contract for Tasks 3–7.

- [ ] **Step 1: Rewrite the homepage composition test**

Replace the old one-screen/three-service assertions with exact approved content:

```ts
test("customer homepage keeps the selected visual source and complete module order", async ({ page }) => {
  const current = page.getByTestId("flow-current");
  await expect(current.locator(".home-reference-hero")).toBeVisible();
  await expect(current.getByText("AI 传统文化解读", { exact: true })).toBeVisible();
  await expect(current.getByRole("heading", { name: "以香静心，聊聊心中挂心事" })).toBeVisible();
  await expect(current.getByText("借沉香感悟心绪，AI香道文化解读", { exact: true })).toBeVisible();
  await expect(current.getByRole("heading", { name: "广垦沉香甄选" })).toBeVisible();
  await expect(current.getByRole("heading", { name: "我的藏品" })).toBeVisible();
  await expect(current.getByRole("heading", { name: "广垦沉香·源头产业园" })).toBeVisible();
  await expect(current.getByRole("heading", { name: "沉香小知识" })).toBeVisible();
  await expect(current.getByText("广东农垦曙光农场有限公司 © 广垦沉香", { exact: true })).toBeVisible();

  const order = await current.locator(".mini-home-body").evaluate(root =>
    ["home-hero", "home-reading", "home-selection", "home-collection", "home-services", "home-park", "home-knowledge", "home-copyright"]
      .map(id => root.querySelector<HTMLElement>(`[data-home-section="${id}"]`)!.offsetTop)
  );
  expect(order).toEqual([...order].sort((a, b) => a - b));
});
```

- [ ] **Step 2: Add the four-tab and mall-placeholder test**

```ts
test("mall stays a non-navigating coming-soon root tab", async ({ page }) => {
  const current = page.getByTestId("flow-current");
  const nav = current.getByRole("navigation", { name: "小程序导航" });
  await expect(nav.getByRole("button")).toHaveCount(4);
  await expect(nav.getByText("首页", { exact: true })).toBeVisible();
  await expect(nav.getByText("商城", { exact: true })).toBeVisible();
  await expect(nav.getByText("问帖", { exact: true })).toBeVisible();
  await expect(nav.getByText("我的", { exact: true })).toBeVisible();
  await nav.getByRole("button", { name: "商城" }).click();
  await expect(page.getByRole("status")).toHaveText("商城即将上线，敬请期待");
  await expect(page.getByTestId("flow-current")).toHaveAttribute("data-flow-screen", "home");
  await expect(nav.getByRole("button", { name: "首页" })).toHaveAttribute("aria-current", "page");
});
```

- [ ] **Step 3: Add selection, collection, archive, park, knowledge, and download tests**

```ts
test("selection showcase and adoption purchase entry remain mall placeholders", async ({ page }) => {
  for (const label of ["手串收藏", "香道礼盒", "企业定制", "沉香树认种", "进入商城"]) {
    await page.getByRole("button", { name: label }).click();
    await expect(page.getByRole("status")).toHaveText("商城即将上线，敬请期待");
  }
});

test("collection carousel opens the selected bracelet and tree archives", async ({ page }) => {
  const collection = page.getByRole("region", { name: "我的藏品" });
  await expect(collection.locator(".collection-card")).toHaveCount(2);
  await collection.getByRole("button", { name: "查看海南琼南沉香手串档案" }).click();
  await expect(page.getByRole("heading", { name: "海南琼南沉香手串档案" })).toBeVisible();
  await page.getByRole("button", { name: "返回" }).click();
  await page.waitForTimeout(350);
  await page.getByRole("region", { name: "我的藏品" }).getByRole("button", { name: "查看琼南一号认种沉香树档案" }).click();
  await expect(page.getByRole("heading", { name: "琼南一号认种沉香树" })).toBeVisible();
  await expect(page.getByText("TR-2026-018", { exact: true })).toBeVisible();
  await expect(page.getByText("最近巡检", { exact: true })).toBeVisible();
});

test("certificate links point at the matching demonstration PDFs", async ({ page }) => {
  const bracelet = page.getByRole("link", { name: "导出海南琼南沉香手串电子证书" });
  const tree = page.getByRole("link", { name: "导出琼南一号认种沉香树电子证书" });
  await expect(bracelet).toHaveAttribute("href", "/assets/certificates/bracelet-digital-certificate-demo.pdf");
  await expect(bracelet).toHaveAttribute("download", "海南琼南沉香手串-电子证书-演示.pdf");
  await expect(tree).toHaveAttribute("href", "/assets/certificates/tree-adoption-certificate-demo.pdf");
  await expect(tree).toHaveAttribute("download", "琼南一号认种沉香树-认种证书-演示.pdf");
});

test("certificate download reports success and an unavailable file can be retried", async ({ page }) => {
  const success = page.waitForEvent("download");
  await page.getByRole("link", { name: "导出海南琼南沉香手串电子证书" }).click();
  await expect((await success).suggestedFilename()).toBe("海南琼南沉香手串-电子证书-演示.pdf");
  await expect(page.getByRole("status")).toHaveText("电子证书已开始下载");

  await page.route("**/tree-adoption-certificate-demo.pdf", async route => {
    if (route.request().method() === "HEAD") await route.fulfill({ status: 404, body: "missing" });
    else await route.continue();
  });
  await page.getByRole("link", { name: "导出琼南一号认种沉香树电子证书" }).click();
  await expect(page.getByRole("status")).toHaveText("电子证书下载失败，请重试");
});

test("industrial park and knowledge rows open complete destinations", async ({ page }) => {
  await page.getByRole("button", { name: "走进产业园" }).click();
  await expect(page.getByRole("region", { name: "产业园图集" }).locator(".park-slide")).toHaveCount(4);
  await page.getByRole("button", { name: "播放产业园介绍" }).click();
  await expect(page.getByRole("button", { name: "暂停产业园介绍" })).toBeVisible();
  await page.getByRole("button", { name: "返回" }).click();
  await page.waitForTimeout(350);
  await page.getByRole("button", { name: "如何快速辨别沉香手串的真假" }).click();
  await expect(page.getByRole("heading", { name: "如何快速辨别沉香手串的真假" })).toBeVisible();
  await expect(page.getByText("香味", { exact: true })).toBeVisible();
  await expect(page.getByText("油脂线", { exact: true })).toBeVisible();
  await expect(page.getByText("密度", { exact: true })).toBeVisible();
});
```

- [ ] **Step 4: Replace one-screen geometry assertions**

Assert the approved scroll and safe-area behavior instead:

```ts
const geometry = await page.evaluate(() => {
  const scroll = document.querySelector<HTMLElement>('[data-testid="flow-current"] [data-testid="mobile-scroll"]')!;
  const copyright = document.querySelector<HTMLElement>('[data-home-section="home-copyright"]')!;
  const tabs = document.querySelector<HTMLElement>('[aria-label="小程序导航"]')!;
  scroll.scrollTop = scroll.scrollHeight;
  return {
    scrollHeight: scroll.scrollHeight,
    clientHeight: scroll.clientHeight,
    copyrightBottom: copyright.getBoundingClientRect().bottom,
    tabsTop: tabs.getBoundingClientRect().top,
  };
});
expect(geometry.scrollHeight).toBeGreaterThan(geometry.clientHeight + 300);
expect(geometry.copyrightBottom).toBeLessThanOrEqual(geometry.tabsTop);
```

- [ ] **Step 5: Run the focused tests and confirm RED**

Run:

```bash
npx playwright test tests/prototype-h5.spec.ts -g "customer homepage|mall stays|selection showcase|collection carousel|certificate links|industrial park"
```

Expected: FAIL on missing four-tab mall control, new modules, new pages, and certificate assets. Existing runtime should still start successfully.

---

### Task 2: Create and verify the demonstration media and certificate assets

**Files:**
- Create: `scripts/generate-demo-certificates.py`
- Create: `public/assets/certificates/bracelet-digital-certificate-demo.pdf`
- Create: `public/assets/certificates/tree-adoption-certificate-demo.pdf`
- Create: `public/assets/customer-feedback/collection-tree.svg`
- Create: `public/assets/customer-feedback/park-base.svg`
- Create: `public/assets/customer-feedback/park-nursery.svg`
- Create: `public/assets/customer-feedback/park-workshop.svg`
- Create: `public/assets/customer-feedback/park-quality.svg`
- Create: `public/assets/customer-feedback/knowledge-authenticity.svg`

**Interfaces:**
- Consumes: Vite static asset serving under `/assets/`.
- Produces: exact asset paths asserted in Task 1 and used by Tasks 4–6.

- [ ] **Step 1: Read and follow the PDF skill before creating PDFs**

Read `/Users/xinwei/.codex/plugins/cache/openai-primary-runtime/pdf/26.826.12353/skills/pdf/SKILL.md` completely. Run its required artifact-operation marker exactly once for two PDF outputs before the first PDF authoring command.

- [ ] **Step 2: Add the deterministic certificate generator**

Create `scripts/generate-demo-certificates.py` using ReportLab with `UnicodeCIDFont("STSong-Light")`. Define:

```python
CERTIFICATES = (
    {
        "filename": "bracelet-digital-certificate-demo.pdf",
        "title": "海南琼南沉香手串电子证书",
        "number": "CX-2018-072",
        "rows": (("材质", "海南沉香"), ("规格", "18mm · 16颗"), ("产区", "海南 · 琼南产区"), ("状态", "身份已核验")),
    },
    {
        "filename": "tree-adoption-certificate-demo.pdf",
        "title": "琼南一号认种沉香树电子证书",
        "number": "TR-2026-018",
        "rows": (("基地", "琼南沉香产业园"), ("认种日期", "2026年8月18日"), ("树龄", "3年"), ("状态", "生长良好 · 已建档")),
    },
)
```

Each A4 PDF must include the Guangken name, certificate title, number, all four rows, `需求原型演示文件 · 非正式签发证书`, issue date `2026年8月28日`, and a pale diagonal `DEMO` watermark. Exit nonzero if either output is missing or smaller than 5 KB.

- [ ] **Step 3: Generate the PDFs with the managed PDF runtime**

Run the generator with the runtime resolved by the PDF skill and output directory `public/assets/certificates/`.

- [ ] **Step 4: Create the six SVG illustrations**

Use a shared `viewBox="0 0 800 480"`, cream background `#f5efe3`, forest `#174c3c`, leaf `#6d8a64`, warm brown `#9a6c43`, and ink `#26352e`. Every SVG must include a `<title>` matching its use and must avoid embedded text so labels remain live HTML. The four park images must depict distinct compositions: field rows and farm building; nursery trays and seedlings; clean workshop tables and windows; quality document, seal, and linked checkpoints.

- [ ] **Step 5: Structurally and visually verify both PDFs**

Use PyPDF to assert one page and extract the title, number, and `需求原型演示文件` from each PDF. Render both PDFs to PNG with the PDF skill, inspect both page images at 100%, and correct any missing glyph, overlap, clipping, or weak contrast before continuing.

- [ ] **Step 6: Verify every static asset is addressable**

Run:

```bash
test -s public/assets/certificates/bracelet-digital-certificate-demo.pdf
test -s public/assets/certificates/tree-adoption-certificate-demo.pdf
for asset in collection-tree park-base park-nursery park-workshop park-quality knowledge-authenticity; do test -s "public/assets/customer-feedback/${asset}.svg"; done
```

Expected: exit code 0.

---

### Task 3: Add the four-tab shell, coming-soon feedback, and expanded homepage skeleton

**Files:**
- Modify: `src/Prototype.tsx`
- Modify: `src/prototype.css`
- Test: `tests/prototype-h5.spec.ts`

**Interfaces:**
- Consumes: existing `Home`, `Profile`, shared authorization context, supplied `hero-banner.png`.
- Produces: `PrototypeToast`, `useTransientMessage`, `MiniTabs` with `onMall`, and the approved module order with stable selectors.

- [ ] **Step 1: Add the transient message primitive**

Implement:

```tsx
function useTransientMessage() {
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(""), 2200);
    return () => window.clearTimeout(timer);
  }, [message]);
  return { message, showMessage: setMessage };
}

function PrototypeToast({ message }: { message: string }) {
  return <div className="prototype-toast" role="status" aria-live="polite" data-visible={Boolean(message)}>{message}</div>;
}
```

Use the exact mall message constant `const mallComingSoon = "商城即将上线，敬请期待";`.

- [ ] **Step 2: Expand `RootTab` and `MiniTabs`**

Change `RootTab` to `"home" | "mall" | "ask" | "profile"`. Add `onMall`. Render `首页 / 商城 / 问帖 / 我的` in that order with native icon components. The mall button calls `onMall` but never receives `aria-current="page"` in this phase. Both `Home` and `Profile` must own `useTransientMessage()`, pass `showMessage(mallComingSoon)` to `MiniTabs`, and render `PrototypeToast`, so the mall placeholder works from either root page.

- [ ] **Step 3: Replace the homepage hero with the selected supplied banner**

Render `/assets/home-reference/hero-banner.png` as the sole hero image, with alt `广垦沉香 沉香手串`. Keep `MiniProgramNav root` over the image so the live status bar and capsule remain runtime-owned. Add `data-home-section="home-hero"`.

- [ ] **Step 4: Update the AI card and insert the selection module**

Use the exact copy from Global Constraints. Insert `SelectionShowcase` immediately after the AI card; Tasks 4 and 5 add the remaining approved sections in order.

```tsx
<section data-home-section="home-reading" className="question-section home-reading-card">
  <p className="home-ai-tag"><MagicWandIcon aria-hidden="true" /><span>AI 传统文化解读</span></p>
  <h2>以香静心，聊聊心中挂心事</h2>
  <img className="home-cloud-deco" src="/assets/home-reference/cloud-deco.png" alt="" />
  <span>借沉香感悟心绪，AI香道文化解读</span>
  <button data-testid="home-reading-action" className="start-reading" aria-label="开始问帖" onClick={openReading}>开始问帖</button>
</section>
<SelectionShowcase onComingSoon={() => showMessage(mallComingSoon)} />
```

- [ ] **Step 5: Implement `SelectionShowcase`**

Render heading `广垦沉香甄选`, four 44px-minimum buttons named `手串收藏 / 香道礼盒 / 企业定制 / 沉香树认种`, and `进入商城`. Every button calls the same coming-soon callback.

- [ ] **Step 6: Enable vertical homepage scrolling and four-column tabs**

Remove the homepage `height: 100%`, `overflow: hidden`, `margin-top: auto`, and no-scroll assumptions. Give the scroll content bottom padding equal to `calc(var(--root-bottom-safe) + 92px)`. Change `.mini-tabs` to `grid-template-columns: repeat(4, 1fr)` and horizontal padding `7px 14px var(--root-bottom-safe)`.

- [ ] **Step 7: Run the shell and homepage tests**

Run:

```bash
npx playwright test tests/prototype-h5.spec.ts -g "mall stays|selection showcase|authorization"
```

Expected: PASS for mall behavior, exact AI copy, four tabs, selection placeholders, and existing authorization flow. The full homepage-order test remains RED until Tasks 4 and 5 add the remaining sections.

---

### Task 4: Implement collections, archives, adoption, and matching downloads

**Files:**
- Modify: `src/Prototype.tsx`
- Modify: `src/prototype.css`
- Test: `tests/prototype-h5.spec.ts`

**Interfaces:**
- Consumes: Task 2 asset paths, Task 3 toast callback, existing `Carousel` and `FlowStack`.
- Produces: `Collectible`, `collectibles`, `CollectionSection`, `collectionArchiveScreen`, `AdoptionArchive`, `adoptionArchiveScreen`.

- [ ] **Step 1: Define exact collection data**

```ts
type Collectible = {
  id: "bracelet" | "tree";
  name: string;
  number: string;
  image: string;
  imageAlt: string;
  facts: readonly [string, string][];
  certificateHref: string;
  certificateFilename: string;
};

const collectibles: readonly Collectible[] = [
  {
    id: "bracelet", name: "海南琼南沉香手串", number: "CX-2018-072",
    image: "/assets/product/agarwood-bracelet-hero.png", imageAlt: "海南琼南沉香手串",
    facts: [["材质", "海南沉香"], ["规格", "18mm · 16颗"], ["状态", "身份已核验"]],
    certificateHref: "/assets/certificates/bracelet-digital-certificate-demo.pdf",
    certificateFilename: "海南琼南沉香手串-电子证书-演示.pdf",
  },
  {
    id: "tree", name: "琼南一号认种沉香树", number: "TR-2026-018",
    image: "/assets/customer-feedback/collection-tree.svg", imageAlt: "琼南一号认种沉香树",
    facts: [["基地", "琼南沉香产业园"], ["树龄", "3年"], ["状态", "生长良好 · 已建档"]],
    certificateHref: "/assets/certificates/tree-adoption-certificate-demo.pdf",
    certificateFilename: "琼南一号认种沉香树-认种证书-演示.pdf",
  },
] as const;
```

- [ ] **Step 2: Add a checked semantic download link**

Implement the link so it remains accessible and retains its real `href`/`download` attributes while checking the static file before triggering the download:

```tsx
function CertificateDownloadLink({ collectible, onMessage }: { collectible: Collectible; onMessage: (message: string) => void }) {
  const download = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    try {
      const response = await fetch(collectible.certificateHref, { method: "HEAD" });
      if (!response.ok) throw new Error(`certificate ${response.status}`);
      const link = document.createElement("a");
      link.href = collectible.certificateHref;
      link.download = collectible.certificateFilename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      onMessage("电子证书已开始下载");
    } catch {
      onMessage("电子证书下载失败，请重试");
    }
  };
  return <a href={collectible.certificateHref} download={collectible.certificateFilename} onClick={download}>
    导出电子证书
  </a>;
}
```

- [ ] **Step 3: Build `CollectionSection` with runtime `Carousel`**

Render two `.collection-card` articles inside `<Carousel ariaLabel="我的藏品">`. The first owns `查看海南琼南沉香手串档案`; the second owns `查看琼南一号认种沉香树档案`. Each card owns its matching `CertificateDownloadLink` so a horizontal drag can never change which record its actions reference. Give each link the exact accessible name `导出${collectible.name}电子证书`. Do not add `data-scroll-drag="ignore"`, CSS scroll snapping, or another gesture handler.

- [ ] **Step 4: Add collection archive routing**

`collectionArchiveScreen(keyboard, collectible)` must use page ID `collection-archive`, a `TopBar` with title `${collectible.name}档案`, and `data-product-doc-page="collection-archive"`. For a bracelet, show source, specification, identity status, and a link to the existing certificate screen. For a tree, render `AdoptionArchive` directly.

- [ ] **Step 5: Implement the complete adoption archive**

Render exact metadata `TR-2026-018`, `琼南沉香产业园`, `2026年8月18日`, `3年`, `生长良好 · 已建档`. Render timeline items `认种登记 / 养护建档 / 最近巡检 / 下一次回访`. Include the matching download link and a `前往认种` button that shows the mall coming-soon toast without navigation.

- [ ] **Step 6: Add the fourth home service**

Render `认种我的沉香树` with note `查看树木档案、电子认种证书`; click pushes `adoptionArchiveScreen(keyboard)`. Keep the other three existing destinations unchanged.

Insert `CollectionSection` directly after `SelectionShowcase`, followed by the four-entry service section with `data-home-section="home-services"`. The collection wrapper uses `data-home-section="home-collection"`.

- [ ] **Step 7: Run collection and existing service tests**

Run:

```bash
npx playwright test tests/prototype-h5.spec.ts -g "collection carousel|certificate links|each home service|certificate and traceability|care and knowledge"
```

Expected: PASS.

---

### Task 5: Implement the industrial-park and knowledge destinations

**Files:**
- Modify: `src/Prototype.tsx`
- Modify: `src/prototype.css`
- Test: `tests/prototype-h5.spec.ts`

**Interfaces:**
- Consumes: Task 2 SVG assets, existing `Carousel`, `FlowStack`, and care page.
- Produces: `IndustrialPark`, `industrialParkScreen`, `AuthenticityArticle`, `authenticityArticleScreen`, homepage teaser/rows.

- [ ] **Step 1: Add the industrial-park teaser**

Render heading `广垦沉香·源头产业园`, exact body `广东农垦国资国企｜万亩沉香种植基地｜标准化无尘加工车间，全链路品控`, and button `走进产业园` under `data-home-section="home-park"`.

- [ ] **Step 2: Build `IndustrialPark`**

Use `<Carousel ariaLabel="产业园图集">` with four `.park-slide` items:

```ts
const parkSlides = [
  ["/assets/customer-feedback/park-base.svg", "万亩沉香种植基地", "从林场环境、种植批次到日常养护建立基础档案。"],
  ["/assets/customer-feedback/park-nursery.svg", "标准化育苗", "记录苗木来源、生长阶段与养护责任。"],
  ["/assets/customer-feedback/park-workshop.svg", "无尘加工车间", "分区完成选料、加工、质检与包装。"],
  ["/assets/customer-feedback/park-quality.svg", "全链路品控", "把批次、制作、质检与芯片身份串联起来。"],
] as const;
```

Add a simulated video panel with local `playing` state. Its button toggles accessible names `播放产业园介绍` and `暂停产业园介绍`; the playing state shows an animated progress bar and `00:18 / 01:12`, while paused shows `00:00 / 01:12`. Honor `prefers-reduced-motion` by disabling progress animation.

- [ ] **Step 3: Add homepage knowledge rows**

Under `data-home-section="home-knowledge"`, render heading `沉香小知识` and two full-row buttons:

- `如何快速辨别沉香手串的真假？` → `authenticityArticleScreen`.
- `沉香手串如何日常保养？` → existing `careScreen`.

Insert the industrial-park teaser immediately after the service section, then the knowledge section, then `<footer data-home-section="home-copyright">广东农垦曙光农场有限公司 © 广垦沉香</footer>`. This completes the section order asserted in Task 1.

- [ ] **Step 4: Build the authenticity article**

Use title `如何快速辨别沉香手串的真假`, hero `/assets/customer-feedback/knowledge-authenticity.svg`, lead `先看自然纹理，再闻香气层次，最后结合密度与证书信息综合判断。`, and four sections named `香味 / 油脂线 / 密度 / 证书与来源`. Include a restrained note that sensory checks are preliminary and official identity/traceability should be used for the current product.

- [ ] **Step 5: Run park and knowledge tests**

Run:

```bash
npx playwright test tests/prototype-h5.spec.ts -g "customer homepage|industrial park|knowledge rows|care and knowledge"
```

Expected: PASS, including the complete approved homepage section order.

---

### Task 6: Update the contextual product document for the new pages

**Files:**
- Modify: `docs/codex/prd/2026-08-24-agarwood-digital-identity-ai-traditional-culture-agent-mvp-v2.md`
- Modify: `src/Prototype.tsx`
- Modify: `tests/prototype-h5.spec.ts`

**Interfaces:**
- Consumes: existing product-document parser and stable `data-product-doc-page` IDs.
- Produces: non-empty current-page guidance for `collection-archive`, `adoption-archive`, `industrial-park`, and `authenticity-article`.

- [ ] **Step 1: Add four page records to `productDocPages`**

Add keys and labels:

```ts
"collection-archive": {
  label: "P-13 藏品档案", guideHeading: "DOC-P-13 藏品档案", specHeading: "P-13 藏品档案",
  flowHeadings: [], stateHeadings: [], requirementPrefixes: ["FR-COLLECTION-"],
  apiHeadings: ["`GET /v1/bracelets/{bracelet_id}`", "`GET /v1/certificates/{certificate_id}`"], acceptancePrefixes: ["AC-COLLECTION-", "AC-ERROR-"],
},
"adoption-archive": {
  label: "P-14 认种档案", guideHeading: "DOC-P-14 认种档案", specHeading: "P-14 认种档案",
  flowHeadings: [], stateHeadings: [], requirementPrefixes: ["FR-ADOPTION-"],
  apiHeadings: ["`GET /v1/content/{content_key}`"], acceptancePrefixes: ["AC-ADOPTION-", "AC-ERROR-"],
},
"industrial-park": {
  label: "P-15 产业园", guideHeading: "DOC-P-15 产业园", specHeading: "P-15 产业园",
  flowHeadings: [], stateHeadings: [], requirementPrefixes: ["FR-CONTENT-"],
  apiHeadings: ["`GET /v1/content/{content_key}`"], acceptancePrefixes: ["AC-CONTENT-", "AC-ERROR-"],
},
"authenticity-article": {
  label: "P-16 真假辨别", guideHeading: "DOC-P-16 真假辨别", specHeading: "P-16 真假辨别",
  flowHeadings: [], stateHeadings: [], requirementPrefixes: ["FR-CONTENT-"],
  apiHeadings: ["`GET /v1/content/{content_key}`"], acceptancePrefixes: ["AC-CONTENT-", "AC-ERROR-"],
},
```

- [ ] **Step 2: Add matching page and delivery-guide headings to the PRD**

For each P-13–P-16, document the visible content, user action, local-prototype state, failure behavior, and acceptance target from the approved spec. Add `DOC-P-13` through `DOC-P-16` headings so the current-page drawer never shows `该页面说明尚未配置`. Add exact requirement IDs `FR-COLLECTION-001` (two local collection records and matching actions) and `FR-ADOPTION-001` (tree metadata, growth timeline, matching certificate). Add exact acceptance IDs `AC-COLLECTION-001` and `AC-ADOPTION-001`. State that the displayed APIs are future production contracts and that this phase uses local data; do not add a tree API that the existing PRD has not defined.

- [ ] **Step 3: Update the drawer release label**

Change `开发交付版 v2 · 2026-08-24` to `客户反馈扩展版 · 2026-08-28`.

- [ ] **Step 4: Add and run a contextual-document test**

```ts
test("product documentation follows the new adoption archive", async ({ page }) => {
  await page.getByRole("button", { name: "认种我的沉香树" }).click();
  await page.getByRole("button", { name: "产品文档" }).click();
  const drawer = page.getByRole("dialog", { name: "产品文档" });
  await expect(drawer.getByRole("heading", { name: "P-14 认种档案" })).toBeVisible();
  await expect(drawer.getByText("该页面说明尚未配置")).toHaveCount(0);
});
```

Run:

```bash
npx playwright test tests/prototype-h5.spec.ts -g "product documentation follows the new adoption archive|product document"
```

Expected: PASS.

---

### Task 7: Complete visual refinement, regression, and real-render acceptance

**Files:**
- Modify: `src/prototype.css`
- Modify: `tests/prototype-h5.spec.ts`
- Create: `audit/customer-feedback-expansion-2026-08-28/visual-review.md`
- Create: `audit/customer-feedback-expansion-2026-08-28/round-1/*`
- Create: `audit/customer-feedback-expansion-2026-08-28/round-2/*`
- Create: `scripts/capture-customer-feedback.mjs`

**Interfaces:**
- Consumes: all implemented pages and existing screenshot tooling.
- Produces: verified delivery state with runtime integrity, full tests, build, and visual evidence.

- [ ] **Step 1: Apply the approved visual hierarchy**

Use `#f7f4ed` paper, `#154d3c` deep green, `#8c633f` warm brown, `#e7ded0` lines, and tinted off-white surfaces. Keep the hero full width, preserve the supplied art ratio, use limited Songti accents, and avoid gradients, glow, glassmorphism, nested cards, and generic equal-weight icon grids. Use a 2×2 service layout if four items cannot keep 12px minimum labels and 44px touch targets in one row.

- [ ] **Step 2: Add explicit responsive rules**

Use the existing device selectors. Verify iPhone safe-area bottom padding and Pixel's reserved navigation region separately. Ensure carousel cards expose the next card edge by 18–26px, all page headers clear the capsule, and footer content can scroll entirely above tabs.

- [ ] **Step 3: Run runtime integrity and TypeScript/build checks**

```bash
npm run check:runtime
npx tsc --noEmit
npm run build
```

Expected: all commands exit 0; `dist/client/index.html`, `dist/server/index.js`, `dist/.openai/hosting.json`, and `.openai/hosting.json` exist.

- [ ] **Step 4: Run the complete Playwright suite**

```bash
npx playwright test
npm run test:sites
```

Expected: all tests pass with no retries hiding a first-attempt failure.

- [ ] **Step 5: Add the deterministic capture script**

Create `scripts/capture-customer-feedback.mjs`. It must launch the project-installed Chromium through Playwright, open `http://127.0.0.1:4173/`, select iPhone then Pixel 10 through the existing device picker, and save full-page PNGs for these exact states: `home-top`, `home-collection`, `home-bottom`, `tree-archive`, `industrial-park-paused`, `industrial-park-playing`, `authenticity-article`, `authorization-sheet`, and `profile`. Accept the round name from `process.argv[2]`; reject any value other than `round-1` or `round-2`; write only under `audit/customer-feedback-expansion-2026-08-28/<round>/`.

- [ ] **Step 6: Capture and inspect round 1**

Start the verified preview in a persistent terminal session:

```bash
npm run dev -- --host 127.0.0.1 --port 4173
```

Then run:

```bash
node scripts/capture-customer-feedback.mjs round-1
```

Capture iPhone and Pixel for: homepage top, homepage middle/collection, homepage bottom, tree archive, industrial park paused, industrial park playing, authenticity article, authorization sheet, and profile. Save under `round-1/`. Inspect every image for copy, hierarchy, clipping, status/capsule collisions, tab overlap, carousel affordance, 44/48px targets, and inconsistent card radii.

- [ ] **Step 7: Record findings and fix every P0/P1 issue**

Write `visual-review.md` with one row per finding: device, screen, severity, evidence, fix, verification. Make only app-owned changes in `Prototype.tsx`/`prototype.css`; do not edit protected runtime to mask layout problems.

- [ ] **Step 8: Capture and inspect round 2**

Run `node scripts/capture-customer-feedback.mjs round-2`, inspect the same screen matrix, confirm all P0/P1 findings are closed, and record any accepted P2 limitation.

- [ ] **Step 9: Run the final delivery gate after the last visual change**

```bash
npm run check:runtime
npm run build
npx playwright test
npm run test:sites
```

Expected: all commands exit 0. Do not claim completion without the final command output and reviewed round-2 images.
