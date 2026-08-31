# Design QA — 佩戴养护编辑手册

## Source truth

- Selected visual direction: `reference/care-editorial-manual-selected.png`
- Source dimensions: 853 × 1844 px
- Normalized comparison source: `audit/care-editorial-manual-2026-08-31/source-normalized-393.png` at 393 × 850 px
- Approved design specification: `docs/superpowers/specs/2026-08-31-care-editorial-manual-design.md`

## Implementation evidence

| Device/state | CSS viewport | deviceScaleFactor | Screenshot |
| --- | ---: | ---: | --- |
| iPhone, page top | 393 × 852 | 1 | `audit/care-editorial-manual-2026-08-31/iphone-care-top.png` (394 × 852 px capture) |
| iPhone, page bottom | 393 × 852 | 1 | `audit/care-editorial-manual-2026-08-31/iphone-care-bottom.png` (394 × 852 px capture) |
| Pixel 10, page top | 427 × 952 | 1 | `audit/care-editorial-manual-2026-08-31/pixel-10-care-top.png` |
| Pixel 10, page bottom | 427 × 952 | 1 | `audit/care-editorial-manual-2026-08-31/pixel-10-care-bottom.png` |

State under test: 首页进入「佩戴养护」，检查题图和第一则；滚动至最底部，检查第七则、养护提醒和底部余量；再执行返回。

## Comparison evidence

- Full-view comparison: the 393px normalized source and the final iPhone/Pixel top and bottom captures were opened together in one comparison input after the final CSS and copy adjustment.
- Long-page coverage: both device bottom captures were inspected to verify all seven sections and the final reminder remain reachable and unobscured.
- Interaction coverage: focused Playwright flow verifies entry, semantic heading, seven ordered rows, image alternative text, reminder, scrolling, and return.
- Console coverage: the capture script records browser console errors and completed without errors.
- Focused-region evidence: no separate crop was required because the source and implementation were viewed at original 1:1 pixels and the hero typography, row copy, dividers, and reminder were readable in the combined full-view input.

## Findings history

1. **P2 — fixed:** the first render placed the lower-left bracelet over the introductory paragraph on both target widths.
2. Fix: kept the title at 74–76% width, removed the global copy-width constraint, and shifted/constrained only the lead paragraph to clear the bracelet.
3. Post-fix comparison: iPhone and Pixel top captures show no overlap, clipping, or collision; both bottom captures show complete content and safe bottom spacing.
4. **P1 — reopened from user review:** the implementation preserved the information structure but did not faithfully reproduce the selected visual target. The current hero uses a small green bracelet, omits the upper-right bamboo motif, starts the title at the left edge, and expands the seven rows into a much longer generic article layout.
5. **P2 — reopened from visual comparison:** title scale/wrapping, row typography, number-column proportions, divider rhythm, and the final reminder anatomy differ visibly from the source. The next iteration must use the source as a measurable layout target rather than a loose style reference.
6. **P1 — fixed:** generated and installed `public/assets/home-reference/care-editorial-hero-v3.png`, reproducing the dark-brown bracelet entering from the lower-left and the low-contrast bamboo entering from the upper-right on warm paper.
7. **P2 — fixed:** set the hero to 186px total height, aligned eyebrow/title/lead at approximately x115px, corrected the title to 26px Songti, reduced the number column to 36px, and compacted row typography and spacing to the source rhythm.
8. **P2 — fixed:** restored all seven body texts, the introductory sentence, item 05 title, and the reminder copy to the selected visual source. The final iPhone/Pixel captures show the same hierarchy and wrapping behavior without overlap or clipping.

## Fidelity review

- Typography: the 26px Songti hero title, 14px row titles, 12px body copy, copper serif numbers, line heights, and wrapping now reproduce the source hierarchy while remaining readable in the prototype.
- Layout: the 186px warm-paper hero, x115px copy origin, lower-left bracelet, upper-right bamboo, 36px number column, continuous dividers, and bordered reminder match the selected composition.
- Color: deep green title, copper-brown numbering, warm ivory background, and muted gray-green body copy follow the selected direction and existing project tokens.
- Imagery: a dedicated high-resolution raster hero supplies the dark agarwood bracelet, paper texture, and pale bamboo motif; it is not approximated with CSS/SVG and retains meaningful Chinese alternative text in the DOM.
- Copy: the intro, seven topics, bodies, and reminder match the selected source, in order, with no missing or duplicated section.
- Runtime constraint: the native status bar and device chrome remain visible per the protected mobile runtime, so the full editorial page scrolls modestly instead of replacing the runtime with the mock's frameless presentation.

## Final result

final result: passed

---

# Design QA — 页面 PRD 入口与字段级抽屉

## Source truth

- Reference URL: `http://127.0.0.1:8010/index.html?review=home`
- Source code: `/Users/xinwei/weiran-env/knowledge-hub/10-项目/杭小消/prototype/scripts/hangxiaoxiao-page-prd.js`
- Source styles: `/Users/xinwei/weiran-env/knowledge-hub/10-项目/杭小消/prototype/assets/hangxiaoxiao-admin.css`
- Source open-state capture: `/private/tmp/hxx-prd-desktop-top.png` (1600 × 1000 px)
- Source closed-entry capture: `/private/tmp/hxx-prd-entry-closed.png` (1600 × 1000 px)

## Implementation evidence

- Local implementation: `http://127.0.0.1:4174/`
- Open-state captures: `/private/tmp/chenxiang-prd-desktop-top.png`, `/private/tmp/chenxiang-prd-desktop-middle.png`, `/private/tmp/chenxiang-prd-desktop-bottom.png` (1600 × 1000 px)
- Closed-entry capture: `/private/tmp/chenxiang-prd-entry-closed.png` (1600 × 1000 px)
- Narrow implementation capture: `/private/tmp/chenxiang-prd-mobile-open.png` (390 × 844 px)
- Same-input full comparison: `/private/tmp/prd-compare-full.png` (1600 × 540 px)
- Same-input focused drawer comparison: `/private/tmp/prd-compare-focus.png` (1440 × 1040 px)
- Same-input closed-entry comparison: `/private/tmp/prd-compare-entry.png` (1600 × 540 px)

All desktop source and implementation captures used the same 1600 × 1000 CSS viewport, `deviceScaleFactor: 1`, and 1600 × 1000 output pixels. The narrow implementation used a 390 × 844 CSS viewport and density 1. No density normalization was required.

## State and measured shell

- Closed: fixed right-edge `页面 / PRD` entry at x=1556, y=454, 44 × 92 px, matching the supplied reference.
- Open: blocking mask plus drawer at x=880, y=0, 720 × 1000 px.
- Drawer regions: 78px header, 853px scroll body, 69px fixed footer; footer bottom offset is 0.
- Narrow width: drawer becomes x=0, y=0, 390 × 844 px and its body remains vertically scrollable.
- Browser console/page errors: none during the final capture.

## Findings and comparison history

1. **P1 — fixed:** the earlier implementation used a top-right horizontal `产品文档` button and a rounded 440px warm drawer, which materially differed from the supplied review component.
2. **P1 — fixed:** replaced it with the fixed 44 × 92 right-middle vertical entry, full blocking mask, and 720px full-height right drawer.
3. **P2 — fixed:** stale mobile CSS moved the entry back to the top-right and shortened the drawer. The obsolete override was removed; narrow widths now keep the middle-right entry and use a full-screen drawer.
4. **P2 — fixed:** the first rebuilt shell retained agarwood green, a circular icon close control, and oversized status spacing. Final CSS uses the reference blue review palette, rectangular `关闭` control, 22px status badge, matching card rhythm, neutral surfaces, and source-like table styling.
5. **P2 — fixed:** the active-page observer initially lost `登录确认层` precedence when opening the PRD from a WeChat authorization sheet. The page-at-open guard was restored while keeping the trigger label live before opening.
6. Post-fix comparison: the full, focused drawer, and closed-entry same-input boards show no remaining actionable P0/P1/P2 mismatch. The mobile reference itself exposes only a narrow slice of its desktop drawer; the implementation intentionally improves this to a usable full-width mobile drawer.

## Fidelity review

- Typography: system UI family, weights, sizes, line heights, status metadata, heading hierarchy, table density, and button labels visually match the reference shell. App-specific PRD copy remains page-specific.
- Spacing/layout: entry geometry, full-height drawer proportions, header/body/footer anatomy, 20px body inset, 16px card padding, 12px card rhythm, 6px radii, dividers, and fixed footer align with the reference.
- Colors/tokens: reference blue is used for the entry, section rules, markers, focus affordances, and flow arrows; neutral blue-gray body/cards and the translucent slate mask reproduce the review-tool tone.
- Image quality/assets: this browser-level review component contains no source image assets or custom illustration requirements; no source imagery was replaced by CSS or placeholder art.
- Copy/content: title format, field-level sections, table columns, state flow, boundaries, exceptions, acceptance criteria, and technical assessment are present for the active product context; the obsolete `完整 PRD` switch is absent.
- Interaction/accessibility: entry, header/footer close controls, mask, Escape, focus return, live active-page title, authorization-layer precedence, scrolling, and background device operation after close all pass browser tests.

## Verification

- PRD-focused browser regression: 4 passed.
- Protected mobile runtime integrity: 28 protected files passed.
- TypeScript and production build: passed.
- Full prototype regression: 57 passed; 1 known unrelated homepage collection-card typography-size assertion remains at `tests/prototype-h5.spec.ts:121` and is outside this PRD-entry change.

## Final result

final result: passed

---

# Design QA — 沉香小知识公众号式文章

## Source truth and evidence

- Visual reference: `reference/wechat-official-account-article-reference.jpg` (1920 × 1920 px), used for article hierarchy and reading rhythm rather than literal scene recreation.
- iPhone authenticity top: `audit/knowledge-wechat-article-2026-08-31/round-1/iphone-authenticity-top.png` (394 × 852 px capture; 393 × 852 CSS screen, device scale 1).
- iPhone authenticity bottom: `audit/knowledge-wechat-article-2026-08-31/round-1/iphone-authenticity-bottom.png`.
- iPhone care top: `audit/knowledge-wechat-article-2026-08-31/round-1/iphone-care-top.png`.
- Pixel authenticity top: `audit/knowledge-wechat-article-2026-08-31/round-1/pixel-10-authenticity-top.png` (427 × 952 px capture; 427 × 952 CSS screen, device scale 1).
- Pixel authenticity bottom and care top are stored in the same round-1 directory.
- The source and iPhone implementation top capture were opened together in one comparison input at original density. The source is a photographed handset, so the comparison was normalized to content hierarchy and rhythm rather than bezel geometry.

## Findings and comparison history

- No actionable P0/P1/P2 issue remained in the first browser-rendered comparison, so no visual-fix iteration was required.
- Typography: the implementation preserves the source hierarchy of large editorial title, muted metadata, emphasized lead, readable body, and clear section headings; Chinese line lengths remain comfortable on both devices.
- Spacing/layout rhythm: the single column uses consistent 20px side insets, restrained vertical gaps, a wide opening image, and natural long-form scroll. The fixed Mini Program navigation remains outside the article content.
- Colors/tokens: warm paper, charcoal copy, muted secondary text, and restrained brand green remain consistent with the prototype while retaining the quiet Official Account reading tone.
- Image quality: the care photograph is sharp and appropriately cropped; the authenticity illustration is a deliberate existing project asset and remains crisp at its rendered size.
- Copy/content: both homepage knowledge topics have distinct title, lead, sections, and closing note; `佩戴养护` still opens the separate seven-row manual.
- Interaction/accessibility: the article itself contains no buttons, inputs, textareas, like/comment/share/favorite bar, or other false affordances. Navigation back remains in the fixed Mini Program header.
- Responsive/rendering: top and scrolled states were captured at iPhone and Pixel sizes with no horizontal overflow, clipping, or browser console errors.

## Verification

- Focused knowledge/Profile/certificate browser suite: 3 passed.
- Full prototype regression after the final article assertions: 48 passed, with 1 known unrelated homepage typography-size failure at `tests/prototype-h5.spec.ts:121`.
- Browser capture: 6 states captured with zero console errors.
- Protected runtime and production build: passed.

## Final result

final result: passed

---

# Design QA — 多手串证书列表

## Source truth

- Approved interaction specification: `docs/superpowers/specs/2026-08-31-multi-certificate-list-design.md`.
- Visual language source: the existing Profile flat list, certificate detail, paper/green tokens, and current bracelet product assets.
- User refinement: `我的手串` keeps only the top navigation title; the content area starts directly with the bracelet rows and contains no eyebrow, hero title, count summary, or guidance copy.

## Implementation evidence

| Device/state | CSS viewport | Screenshot |
| --- | ---: | --- |
| iPhone, bracelet list | 393 × 852 | `audit/multi-certificate-list-2026-08-31/round-1/iphone-certificate-list.png` |
| iPhone, second certificate detail | 393 × 852 | `audit/multi-certificate-list-2026-08-31/round-1/iphone-certificate-detail-second.png` |
| Pixel, bracelet list | 427 × 952 | `audit/multi-certificate-list-2026-08-31/round-1/pixel-10-certificate-list.png` |
| Pixel, second certificate detail | 427 × 952 | `audit/multi-certificate-list-2026-08-31/round-1/pixel-10-certificate-detail-second.png` |

## Findings history

1. **P1 — fixed:** Profile previously opened one static certificate even when the product model called for multiple bound bracelets. It now displays `3 串`, opens `我的手串`, and requires an explicit bracelet selection before detail.
2. **P2 — fixed:** the first list render repeated one thumbnail for all three records. The final render uses three existing product assets with distinct crops so similar bracelet records are easier to scan.
3. **P2 — fixed:** the initial list contained an eyebrow, large editorial heading, and repeated guidance. The final user-approved version begins directly with the three full-width rows below the top navigation.
4. **Capture evidence issue — fixed:** the first detail screenshot caught the Flow transition before it settled. The final capture waits 650ms and shows no previous-screen artifacts.

## Fidelity review

- Layout: three 82px full-width flat rows begin immediately below the navigation; no nested cards, hero copy, horizontal overflow, or bottom-safe-area collision.
- Typography: item name, certificate number, specification, bead count, and binding status have a compact two-line hierarchy.
- Imagery: each row uses an existing real bracelet/product asset; all thumbnails share the same 58px geometry and crop treatment.
- Interaction: Profile opens the list, the second row opens `CX-2024-116`, Back restores the list, and the homepage service still opens the current bracelet directly.
- Responsive/accessibility: rows exceed 76px, the complete row is a semantic button, and iPhone/Pixel geometry tests pass.
- Console/rendering: the four-state capture completed without console errors.

## Verification

- Focused Profile/certificate suite: 13 passed.
- Full prototype regression: 47 passed, 1 known unrelated homepage typography failure at `tests/prototype-h5.spec.ts:121`.
- Protected runtime integrity: 28 files passed.
- TypeScript and production build: passed.

## Final result

final result: passed

Non-blocking content note: item 05 should still receive brand-owner terminology and safety review before production publication.

---

# Design QA — AI 问帖与「我的」页面

## Source truth

- AI 问帖空态：`reference/chatgpt-question-new-logo-selected.png`
- AI 问帖连续对话：`reference/chatgpt-question-conversation-selected.png`
- 「我的」基础方向：`reference/profile-simple-list-selected.png`
- 「我的」后续确认要求：Banner 通铺至状态栏、账号横排上移、微信授权弹窗、Banner 内放置问帖记录和证书数量、下方仅保留单行芯片识别入口。
- 「我的」Banner 图：`public/assets/profile/profile-account-banner.png`
- Approved specifications:
  - `docs/superpowers/specs/2026-08-31-profile-simple-list-design.md`
  - the confirmed AI chat decisions recorded in the project tests and current implementation.

## Implementation evidence

| Page/state | CSS viewport | Screenshot |
| --- | ---: | --- |
| AI 问帖，默认新对话 | 393 × 852 | `audit/chatgpt-question-flow-2026-08-31/round-6/iphone-initial.png` |
| AI 问帖，连续消息 | 393 × 852 | `audit/chatgpt-question-flow-2026-08-31/round-6/iphone-answer.png` |
| 我的，未授权 | 393 × 852 | `audit/profile-simple-list-2026-08-31/round-5/iphone-profile-signed-out.png` |
| 我的，微信授权弹窗 | 393 × 852 | `audit/profile-simple-list-2026-08-31/round-5/iphone-profile-authorization-sheet.png` |
| 我的，已授权 | 393 × 852 | `audit/profile-simple-list-2026-08-31/round-5/iphone-profile-signed-in.png` |
| 我的，未授权 | 427 × 952 | `audit/profile-simple-list-2026-08-31/round-5/pixel-profile-signed-out.png` |
| 我的，微信授权弹窗 | 427 × 952 | `audit/profile-simple-list-2026-08-31/round-5/pixel-profile-authorization-sheet.png` |
| 我的，已授权 | 427 × 952 | `audit/profile-simple-list-2026-08-31/round-5/pixel-profile-signed-in.png` |

Comparison boards opened at original pixel density:

- `audit/chatgpt-question-flow-2026-08-31/round-6/iphone-initial-comparison.png`
- `audit/chatgpt-question-flow-2026-08-31/round-6/iphone-answer-comparison.png`
- `audit/profile-simple-list-2026-08-31/round-5/iphone-profile-full-comparison.png`
- `audit/profile-simple-list-2026-08-31/round-5/iphone-profile-content-focus-comparison.png`

## Findings history

1. **AI 问帖 P1 — fixed:** removed the earlier card-based fortune layout and rebuilt the page as a standalone, ChatGPT-like text conversation.
2. **AI 问帖 P1 — fixed:** every entry now starts a fresh conversation; after the first user message the assistant asks exactly three context questions before producing a structured answer.
3. **AI 问帖 P2 — fixed:** removed image and voice affordances, kept text plus send only, and inset the composer 14px from the phone edge.
4. **AI 问帖 P2 — fixed:** replaced the generic mark with the 广垦沉香 logo and preserved the AI-content disclaimer in both empty and conversation states.
5. **我的 P1 — fixed:** replaced the indistinct header/list boundary with a photo-led Banner extending behind the native status area and to both horizontal edges.
6. **我的 P1 — fixed:** moved the avatar/account line upward, kept authorization on the same row and right aligned it, and changed the click behavior to a confirmable WeChat authorization sheet.
7. **我的 P2 — fixed:** used the Banner's lower space for two 48px-plus data actions, `1 条 / 问帖记录` and `1 串 / 证书数量`, while preserving their original destinations.
8. **我的 P2 — fixed:** removed the duplicate lower record/certificate rows; the lower list now contains only chip-recognition help and traditional-culture interpretation help.
9. **Capture evidence issue — fixed:** the round-4 authorization screenshot caught the sheet mid-transition; round 5 waits for the transition and shows the complete sheet, controls, safe-area spacing, and backdrop.

## Fidelity review

- Typography: both pages use the established Chinese type scale; the AI screen follows the selected restrained conversation hierarchy, while Profile keeps account data and help copy readable at both widths.
- Layout: AI composer, disclaimer, and messages remain clear of the home indicator; Profile Banner is truly full bleed, account controls share one aligned row, data actions occupy the lower Banner surface, and only the single-line chip-recognition row remains below.
- Color: the deep agarwood green is reserved for brand, active controls, and high-value data; translucent ivory surfaces preserve contrast on the product photo.
- Imagery: the Profile Banner uses a dedicated text-free product image and the AI empty state uses the official 广垦沉香 logo.
- Copy and states: fresh chat, three-question follow-up, authorization sheet, signed-in state, record history, certificate, and both help destinations are covered without duplicated entries.
- Interaction/accessibility: all primary Profile actions meet a minimum 48px touch target; the authorization action does not mutate state until confirmation; the sheet has visible confirm and cancel paths.
- Console/rendering: round-5 capture completed without browser console errors on iPhone and Pixel target widths.

## Verification

- Focused Profile/AI/reading regression: 17 passed.
- Full prototype regression: 45 passed, 1 pre-existing unrelated homepage typography failure (`tests/prototype-h5.spec.ts:121`, collection-card text below 12px).
- Protected mobile runtime integrity: 28 files passed.
- TypeScript and production build: passed; Sites artifacts prepared.

### Round 6 — Banner data actions refinement

- User-approved delta: remove the shared white action surface, center each `数量 + 名称` group inside its own half, retain only the center divider, and keep both halves fully clickable.
- Render evidence: `audit/profile-simple-list-2026-08-31/round-6/iphone-profile-signed-out.png` and `audit/profile-simple-list-2026-08-31/round-6/pixel-10-profile-signed-out.png`.
- Same-input comparison evidence: `audit/profile-simple-list-2026-08-31/round-6/iphone-profile-full-comparison.png` and `audit/profile-simple-list-2026-08-31/round-6/iphone-profile-content-focus-comparison.png`.
- Visual result: both data groups are horizontally and vertically centered over the Banner, the nested-card effect is removed, and the center divider remains readable without competing with the product image.
- Interaction result: the question-record half still completes authorization and opens the real record list; the certificate half still opens `证书与溯源`.
- Fresh checks: transparent/centering TDD test 1 passed after the expected RED; all 8 Profile tests passed; both destination tests passed; protected runtime 28 files passed; production build passed.
- Console/rendering: round-6 iPhone and Pixel captures completed without console errors, clipping, or safe-area collisions.

### Round 9 — Final Profile simplification

- Quantity and label are stacked vertically with a 7px gap and remain centered inside each transparent clickable half.
- Removed the `关于传统文化解读` Profile entry and its unused destination; removed the chip-recognition subtitle from the root page.
- Final evidence: `audit/profile-simple-list-2026-08-31/round-9/iphone-profile-signed-out.png`, `audit/profile-simple-list-2026-08-31/round-9/pixel-10-profile-signed-out.png`, and `audit/profile-simple-list-2026-08-31/round-9/iphone-profile-content-focus-comparison.png`.
- Five focused behavior/layout tests passed, the capture completed without console errors, protected runtime integrity passed for 28 files, and the production build passed.

## Final result

final result: passed
