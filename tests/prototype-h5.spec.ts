import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("customer homepage keeps the selected visual source and complete module order", async ({ page }) => {
  const current = page.getByTestId("flow-current");
  await expect(current.locator(".home-reference-hero")).toBeVisible();
  await expect(current.getByRole("img", { name: "广垦沉香男孩手持沉香手串" })).toHaveAttribute("src", "/assets/home-reference/hero-boy-banner.png");
  await expect(current.getByText("AI 传统文化解读", { exact: true })).toBeVisible();
  await expect(current.getByRole("button", { name: "开始问帖" })).toBeVisible();
  await expect(current.getByRole("heading", { name: "以香静心，聊聊心中挂心事" })).toBeVisible();
  await expect(current.getByText("借沉香感悟心绪，AI香道文化解读", { exact: true })).toBeVisible();
  for (const name of ["广垦沉香甄选", "广垦沉香 · 源头产业园", "沉香小知识"]) await expect(current.getByRole("heading", { name })).toBeVisible();
  await expect(current.locator('[data-home-section="home-collection"]').getByRole("heading", { name: "我的藏品" }).first()).toBeVisible();
  await expect(current.getByText("广东农垦曙光农场有限公司 © 广垦沉香", { exact: true })).toBeVisible();
  const order = await current.locator(".mini-home-body").evaluate(root => ["home-hero", "home-reading", "home-selection", "home-collection", "home-services", "home-park", "home-knowledge", "home-copyright"].map(id => root.querySelector<HTMLElement>(`[data-home-section="${id}"]`)!.offsetTop));
  expect(order.every((value, index) => index === 0 || value > order[index - 1])).toBe(true);
});

test("homepage top hero combines the supplied logo and product title with the image-led banner", async ({ page }) => {
  const hero = page.getByTestId("home-bracelet-hero");
  await expect(hero.locator(".home-hero-copy")).toBeVisible();
  await expect(hero.getByRole("img", { name: "广垦沉香 Logo" })).toHaveAttribute("src", "/assets/home-reference/guangken-chenxiang-logo.png");
  await expect(hero.getByRole("heading", { name: "海南琼南沉香手串", exact: true })).toBeVisible();
  await expect(hero.getByText("清甜木香 · 海南沉香", { exact: true })).toBeVisible();
  const crop = await hero.evaluate((node) => {
    const heroBox = node.getBoundingClientRect();
    const imageBox = node.querySelector<HTMLElement>(".bracelet-hero-photo")!.getBoundingClientRect();
    return { widthDelta: Math.abs(imageBox.width - heroBox.width), leftDelta: Math.abs(imageBox.left - heroBox.left), heightRatio: heroBox.height / heroBox.width, objectPosition: getComputedStyle(node.querySelector<HTMLElement>(".bracelet-hero-photo")!).objectPosition };
  });
  expect(crop.widthDelta).toBeLessThanOrEqual(1);
  expect(crop.leftDelta).toBeLessThanOrEqual(1);
  expect(crop.heightRatio).toBeGreaterThanOrEqual(1.35);
  expect(crop.objectPosition).toBe("50% 0%");
});

test("home reading card uses the supplied ink-landscape background", async ({ page }) => {
  const reading = page.locator('[data-home-section="home-reading"]');
  await expect(reading).toBeVisible();
  await expect(reading.locator(".home-cloud-deco")).toHaveCount(0);
  expect(await reading.evaluate((card) => getComputedStyle(card).backgroundImage)).toContain("reading-card-background.png");
});

test("homepage banner paints behind the status bar and gains an opaque chrome after scrolling", async ({ page }) => {
  const current = page.getByTestId("flow-current");
  const readChrome = () => current.evaluate((screen) => {
    const root = screen.querySelector<HTMLElement>(".home-root-screen")!;
    const nav = root.querySelector<HTMLElement>(":scope > .mini-nav")!;
    return {
      safeBackground: getComputedStyle(root, "::before").backgroundColor,
      navBackground: getComputedStyle(nav).backgroundColor,
      scrolled: root.classList.contains("is-scrolled"),
    };
  });

  expect(await readChrome()).toEqual({ safeBackground: "rgba(0, 0, 0, 0)", navBackground: "rgba(0, 0, 0, 0)", scrolled: false });
  await current.locator('[data-testid="mobile-scroll"]').evaluate((scroll) => { scroll.scrollTop = 240; scroll.dispatchEvent(new Event("scroll")); });
  await expect(current.locator(".home-root-screen")).toHaveClass(/is-scrolled/);
  const afterScroll = await readChrome();
  expect(afterScroll.safeBackground).toBe("rgb(247, 244, 237)");
  expect(afterScroll.navBackground).toBe("rgb(247, 244, 237)");
});

test("mall stays a non-navigating coming-soon root tab", async ({ page }) => {
  const current = page.getByTestId("flow-current"); const nav = current.getByRole("navigation", { name: "小程序导航" });
  await expect(nav.getByRole("button")).toHaveCount(4);
  for (const label of ["首页", "商城", "问帖", "我的"]) await expect(nav.getByText(label, { exact: true })).toBeVisible();
  await expect(nav.getByText("即将上线", { exact: true })).toBeVisible();
  await nav.getByRole("button", { name: "商城" }).click(); await expect(page.getByRole("status")).toHaveText("商城即将上线，敬请期待");
  await expect(page.getByTestId("flow-current")).toHaveAttribute("data-flow-screen", "home"); await expect(nav.getByRole("button", { name: "首页" })).toHaveAttribute("aria-current", "page");
});

test("selection showcase uses a two-column illustrated catalog and remains a mall placeholder", async ({ page }) => {
  const selection = page.locator('[data-home-section="home-selection"]');
  await expect(selection.getByText("从日常佩戴到香事雅集", { exact: true })).toBeVisible();
  await expect(selection.getByRole("button", { name: "即将上线" })).toBeVisible();
  await expect(selection.locator(".selection-item")).toHaveCount(4);
  await expect(selection.locator(".selection-item-background")).toHaveCount(4);
  await expect(selection.locator(".selection-item-icon")).toHaveCount(0);
  await expect(selection.locator(".selection-item-action")).toHaveCount(0);
  const columns = await selection.locator(".selection-grid").evaluate(node => getComputedStyle(node).gridTemplateColumns.split(" ").filter(Boolean).length);
  expect(columns).toBe(2);
  for (const label of ["手串收藏", "香道礼盒", "企业定制", "沉香树认种"] as const) {
    const item = selection.getByRole("button", { name: new RegExp(label) });
    await expect(item).toBeVisible();
    const box = await item.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(94);
    expect((box?.width ?? 0) / (box?.height ?? 1)).toBeGreaterThan(1.55);
    await item.click();
    await expect(page.getByRole("status")).toHaveText("商城即将上线，敬请期待");
  }
  await selection.getByRole("button", { name: "即将上线" }).click();
  await expect(page.getByRole("status")).toHaveText("商城即将上线，敬请期待");
});

test("certificate service keeps its visible title", async ({ page }) => {
  const certificate = page.locator('[data-home-section="home-services"]').getByRole("button", { name: "查看证书查询" });
  await expect(certificate.locator("strong")).toHaveText("证书查询");
});

test("material certificate shows the supplied original and structured fields without provenance", async ({ page }) => {
  await page.getByRole("button", { name: "查看证书查询" }).click();

  await expect(page.getByRole("heading", { name: "证书详情", exact: true })).toBeVisible();
  const detail = page.locator(".material-certificate-detail");
  await expect(detail.getByRole("heading", { name: "奇楠沉香算盘珠手串", exact: true })).toBeVisible();
  await expect(detail.getByText("证书原件已收录", { exact: true })).toBeVisible();
  await expect(detail.getByRole("img", { name: "材质检验证证书原件" })).toHaveAttribute("src", "/assets/certificates/material-appraisal-certificate-zhtc26063030124.jpg");

  for (const value of [
    "ZHTC26063030124",
    "4.3g+",
    "符合奇楠沉香构造特征",
    "瑞香科沉香属",
    "无",
    "横切面构造",
    "T/DBCX010-2025",
    "1706",
  ]) {
    await expect(detail.locator("dd").filter({ hasText: value })).toHaveCount(1);
  }

  await expect(detail.locator(".timeline")).toHaveCount(0);
  await expect(detail.getByText("产地", { exact: true })).toHaveCount(0);
  await expect(detail.getByText("香韵", { exact: true })).toHaveCount(0);
});

test("certificate original opens a contained zoom viewer", async ({ page }) => {
  await page.getByRole("button", { name: "查看证书查询" }).click();
  await page.getByRole("button", { name: "查看证书原件" }).click();

  const screen = page.getByTestId("device-screen");
  const viewer = page.getByRole("dialog", { name: "证书原件查看" });
  await expect(viewer).toBeVisible();
  const [screenBox, viewerBox] = await Promise.all([screen.boundingBox(), viewer.boundingBox()]);
  expect(screenBox).not.toBeNull();
  expect(viewerBox).not.toBeNull();
  expect(Math.abs(viewerBox!.x - screenBox!.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(viewerBox!.y - screenBox!.y)).toBeLessThanOrEqual(1);
  expect(Math.abs(viewerBox!.width - screenBox!.width)).toBeLessThanOrEqual(1);
  expect(Math.abs(viewerBox!.height - screenBox!.height)).toBeLessThanOrEqual(1);
  const closeBox = await viewer.getByRole("button", { name: "关闭证书原件" }).boundingBox();
  expect(closeBox).not.toBeNull();
  expect(closeBox!.y).toBeGreaterThanOrEqual(screenBox!.y + 54);
  expect(closeBox!.x + closeBox!.width).toBeLessThanOrEqual(screenBox!.x + screenBox!.width - 12);

  const imageButton = viewer.getByRole("button", { name: "放大证书原件" });
  await expect(imageButton).toHaveAttribute("data-zoomed", "false");
  await imageButton.click();
  await expect(viewer.getByRole("button", { name: "还原证书原件" })).toHaveAttribute("data-zoomed", "true");
  await page.keyboard.press("Escape");
  await expect(viewer).toHaveCount(0);

  await page.getByRole("button", { name: "查看证书原件" }).click();
  await page.getByRole("button", { name: "关闭证书原件" }).click();
  await expect(viewer).toHaveCount(0);
});

test("certificate asset failure keeps structured fields and shows an explicit fallback", async ({ page }) => {
  await page.route("**/material-appraisal-certificate-zhtc26063030124.jpg", (route) => route.abort());
  await page.reload();
  await page.getByRole("button", { name: "查看证书查询" }).click();

  const detail = page.locator(".material-certificate-detail");
  await expect(detail.getByText("证书原件暂时无法加载", { exact: true })).toBeVisible();
  await expect(detail.getByRole("img", { name: "材质检验证证书原件" })).toHaveCount(0);
  await expect(detail.locator("dd").filter({ hasText: "ZHTC26063030124" })).toHaveCount(1);
  await expect(detail.locator("dd").filter({ hasText: "符合奇楠沉香构造特征" })).toHaveCount(1);
});

test("the four homepage service buttons share one row", async ({ page }) => {
  const services = page.locator('[data-home-section="home-services"]');
  await expect(services.getByRole("button")).toHaveCount(4);
  await expect(services.locator(".home-service-icon svg")).toHaveCount(4);
  await expect(services.locator(".home-service-icon img")).toHaveCount(0);
  await expect(services.locator("strong")).toHaveCount(4);
  const layout = await services.evaluate(node => ({
    columns: getComputedStyle(node).gridTemplateColumns.split(" ").filter(Boolean).length,
    gridAutoRows: getComputedStyle(node).gridAutoRows,
    minHeight: getComputedStyle(node).minHeight,
    tops: [...node.querySelectorAll<HTMLElement>("button")].map(button => Math.round(button.getBoundingClientRect().top)),
  }));
  expect(layout.columns).toBe(4);
  expect(layout.gridAutoRows).toBe("auto");
  expect(layout.minHeight).toBe("0px");
  expect(new Set(layout.tops).size).toBe(1);
});

test("homepage typography and utility states stay readable", async ({ page }) => {
  const current = page.getByTestId("flow-current");
  const tiny = await current.evaluate(root => [...root.querySelectorAll<HTMLElement>("*")].filter(el => {
    const s = getComputedStyle(el); return el.textContent?.trim() && parseFloat(s.fontSize) < 12;
  }).map(el => ({ tag: el.tagName, text: el.textContent?.trim().slice(0, 30), size: getComputedStyle(el).fontSize })));
  expect(tiny).toEqual([]);
  for (const control of [
    current.getByRole("button", { name: "开始问帖" }),
    current.locator('[data-home-section="home-selection"]').getByRole("button", { name: "即将上线" }),
    current.getByRole("button", { name: "走进产业园" }),
    current.getByRole("button", { name: "查看更多知识文章" }),
    current.getByRole("navigation", { name: "小程序导航" }).getByRole("button", { name: "首页" }),
  ]) await expect(control).toHaveCSS("font-size", "14px");
  await current.getByRole("button", { name: "开始问帖" }).click();
  await expect(page.getByRole("button", { name: "取消" })).toBeVisible();
  const cancel = await page.getByRole("button", { name: "取消" }).boundingBox();
  expect(cancel?.width).toBeGreaterThanOrEqual(44); expect(cancel?.height).toBeGreaterThanOrEqual(44);
  await expect(page.getByRole("button", { name: "取消" })).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
});

test("agarwood knowledge uses two thumbnail rows without trailing arrows", async ({ page }) => {
  const knowledge = page.locator('[data-home-section="home-knowledge"]');
  await expect(knowledge.getByRole("button", { name: "查看更多知识文章" })).toBeVisible();
  const rows = knowledge.locator(".home-knowledge-row");
  await expect(rows).toHaveCount(2);
  await expect(rows.locator("img")).toHaveCount(2);
  await expect(rows.locator("svg")).toHaveCount(0);
  await expect(rows.first().locator("img")).toHaveAttribute("src", "/assets/customer-feedback/collection-bracelet-thumbnail.png");
  await expect(rows.last().locator("img")).toHaveAttribute("src", "/assets/customer-feedback/knowledge-care-tea.png");
});

test("homepage content sections share the selection card horizontal alignment", async ({ page }) => {
  const current = page.getByTestId("flow-current");
  const boxes = await Promise.all([
    current.locator('[data-home-section="home-reading"]').boundingBox(),
    current.locator('[data-home-section="home-selection"]').boundingBox(),
    current.locator('[data-home-section="home-collection"] .collection-card').first().boundingBox(),
    current.locator('[data-home-section="home-services"]').boundingBox(),
    current.locator('[data-home-section="home-park"]').boundingBox(),
    current.locator('[data-home-section="home-knowledge"]').boundingBox(),
  ]);
  const screen = await current.boundingBox();
  expect(screen).not.toBeNull();
  for (const box of boxes) {
    expect(box).not.toBeNull();
    expect(Math.abs(box!.x - boxes[1]!.x)).toBeLessThanOrEqual(1);
    expect(Math.abs((screen!.x + screen!.width - box!.x - box!.width) - (screen!.x + screen!.width - boxes[1]!.x - boxes[1]!.width))).toBeLessThanOrEqual(1);
  }
});

test("homepage content sections use one consistent vertical gap", async ({ page }) => {
  const current = page.getByTestId("flow-current");
  const boxes = await Promise.all([
    current.locator('[data-home-section="home-reading"]').boundingBox(),
    current.locator('[data-home-section="home-selection"]').boundingBox(),
    current.locator('[data-home-section="home-collection"] .collection-card').first().boundingBox(),
    current.locator('[data-home-section="home-services"]').boundingBox(),
    current.locator('[data-home-section="home-park"]').boundingBox(),
    current.locator('[data-home-section="home-knowledge"]').boundingBox(),
  ]);
  const gaps = boxes.slice(1).map((box, index) => Math.round(box!.y - (boxes[index]!.y + boxes[index]!.height)));
  expect(gaps[0]).toBeGreaterThanOrEqual(12);
  expect(gaps[0]).toBeLessThanOrEqual(16);
  expect(new Set(gaps).size).toBe(1);
});

test("the source industrial park entry is a compact image-backed banner", async ({ page }) => {
  const park = page.locator('[data-home-section="home-park"]');
  await expect(park).toHaveClass(/home-park-banner/);
  await expect(park.getByRole("heading", { name: "广垦沉香 · 源头产业园" })).toBeVisible();
  await expect(park.getByText("广东电白曙光农场｜万亩种植基地", { exact: true })).toBeVisible();
  await expect(park.getByRole("button", { name: "走进产业园" })).toBeVisible();
  await expect(park.locator(":scope > img")).toHaveCount(0);
  expect(await park.evaluate(node => getComputedStyle(node).backgroundImage)).not.toBe("none");
});

test("my collection contains only the bracelet archive", async ({ page }) => {
  const collection = page.getByRole("region", { name: "我的藏品" });
  await expect(collection.locator(".collection-card")).toHaveCount(1);
  await expect(collection.getByText("海南琼南沉香手串", { exact: true })).toBeVisible();
  await expect(collection.getByText("琼南一号认种沉香树", { exact: true })).toHaveCount(0);
  await expect(collection.getByRole("button", { name: "上一件藏品" })).toHaveCount(0);
  await expect(collection.getByRole("button", { name: "下一件藏品" })).toHaveCount(0);
  await expect(collection.locator(".collection-pagination")).toHaveCount(0);
  await expect(collection.getByRole("link", { name: /认种证书/ })).toHaveCount(0);
  await collection.getByRole("button", { name: "查看海南琼南沉香手串档案" }).click();
  await expect(page.getByRole("heading", { name: "海南琼南沉香手串档案" })).toBeVisible();
});

test("adoption service hands off to an external mini program without an internal archive", async ({ page }) => {
  const service = page.getByRole("button", { name: "认种沉香树" });
  await expect(service).toHaveCount(1);
  await service.click();
  await expect(page.getByRole("status")).toHaveText("正在打开认种沉香小程序…");
  await expect(page.getByTestId("flow-current")).toHaveAttribute("data-flow-screen", "home");
  await expect(page.getByRole("heading", { name: "认种档案" })).toHaveCount(0);
  await expect(page.getByText("成长时间线", { exact: true })).toHaveCount(0);
});

test("collection card keeps bracelet identity and actions item-specific", async ({ page }) => {
  const collection = page.getByRole("region", { name: "我的藏品" });
  const card = collection.locator('.collection-card[data-active="true"]');

  await expect(card).toContainText("海南琼南沉香手串");
  await expect(card).toContainText("已认证");
  await expect(card).toContainText("档案编号");
  await expect(card).toContainText("CX-2018-072");
  await expect(card.getByRole("img", { name: "海南琼南沉香手串" })).toHaveAttribute("src", "/assets/customer-feedback/collection-bracelet-thumbnail.png");
  await expect(card.getByRole("link", { name: "导出海南琼南沉香手串电子证书" })).toBeVisible();
  await expect(collection.getByRole("link", { name: /导出.*电子证书/ })).toHaveCount(1);
  await expect(collection.getByRole("button", { name: "查看海南琼南沉香手串档案" })).toBeVisible();
});

test("single bracelet collection card fits without horizontal overflow on iPhone and Pixel", async ({ page }) => {
  for (const device of ["iphone", "pixel-10"] as const) {
    await page.getByTestId("device-picker").click();
    await page.getByTestId(`device-option-${device}`).click();
    const card = page.getByRole("region", { name: "我的藏品" }).locator('.collection-card[data-active="true"]');
    const layout = await card.evaluate(cardNode => {
      const viewport = cardNode.closest<HTMLElement>(".collection-carousel")!;
      const cardBox = cardNode.getBoundingClientRect();
      const image = cardNode.querySelector<HTMLElement>(".collection-card-body > img")!.getBoundingClientRect();
      const copy = cardNode.querySelector<HTMLElement>(".collection-card-copy")!.getBoundingClientRect();
      const metadata = [...cardNode.querySelectorAll<HTMLElement>("dd")];
      return {
        widthDelta: Math.abs(cardBox.width - viewport.clientWidth),
        hasHorizontalOverflow: viewport.scrollWidth > viewport.clientWidth + 1,
        imageCopyGap: copy.left - image.right,
        metadataFits: metadata.every(item => item.scrollWidth <= item.clientWidth + 1),
      };
    });
    expect(layout.widthDelta).toBeLessThanOrEqual(1);
    expect(layout.hasHorizontalOverflow).toBe(false);
    expect(layout.imageCopyGap).toBeGreaterThanOrEqual(18);
    expect(layout.metadataFits).toBe(true);
  }
});

test("bracelet certificate link points at its matching demonstration PDF", async ({ page }) => {
  const collection = page.getByRole("region", { name: "我的藏品" });
  const bracelet = collection.locator('.collection-card[data-active="true"]').getByRole("link", { name: "导出海南琼南沉香手串电子证书" });
  await expect(bracelet).toBeVisible();
  await expect(bracelet).toHaveAttribute("href", "/assets/certificates/bracelet-digital-certificate-demo.pdf"); await expect(bracelet).toHaveAttribute("download", "海南琼南沉香手串-电子证书-演示.pdf");
});

test("certificate download reports success and an unavailable file can be retried", async ({ page }) => {
  const success = page.waitForEvent("download"); await page.getByRole("link", { name: "导出海南琼南沉香手串电子证书" }).click();
  await expect((await success).suggestedFilename()).toBe("海南琼南沉香手串-电子证书-演示.pdf"); await expect(page.getByRole("status")).toHaveText("电子证书已开始下载");
  await page.route("**/bracelet-digital-certificate-demo.pdf", async route => { if (route.request().method() === "HEAD") await route.fulfill({ status: 404, body: "missing" }); else await route.continue(); });
  await page.getByRole("link", { name: "导出海南琼南沉香手串电子证书" }).click(); await expect(page.getByRole("status")).toHaveText("电子证书下载失败，请重试");
  await page.unroute("**/bracelet-digital-certificate-demo.pdf");
  const retry = page.waitForEvent("download"); await page.getByRole("link", { name: "导出海南琼南沉香手串电子证书" }).click();
  await expect((await retry).suggestedFilename()).toBe("海南琼南沉香手串-电子证书-演示.pdf"); await expect(page.getByRole("status")).toHaveText("电子证书已开始下载");
});

test("industrial park and knowledge rows open complete destinations", async ({ page }) => {
  await page.getByRole("button", { name: "走进产业园" }).click();
  const park = page.getByTestId("flow-current").locator('[data-product-doc-page="industrial-park"]');
  await expect(park.locator(".industry-metrics > div")).toHaveCount(4);
  await expect(park.locator(".industry-photo img")).toHaveCount(3);
  await expect(park).toContainText("2019年");
  await expect(park).toContainText("生态化、标准化、国际化");
  await expect(park.getByRole("region", { name: "沉香全产业链" }).getByRole("listitem")).toHaveCount(5);
  await expect(park.locator(".industry-introduction > section")).toHaveCount(6);
  await expect(park).toContainText("Q/GDNSGNC 001-2024");
  await expect(park).toContainText("2025年至2026年带动外汇收入近千万元");
  await expect(park.locator(".park-carousel, .park-video-button")).toHaveCount(0);
  const scroll = page.getByTestId("flow-current").getByTestId("mobile-scroll");
  await scroll.evaluate(node => { node.scrollTop = node.scrollHeight; });
  await expect(park.locator(".industry-signature")).toBeInViewport();
  await page.getByRole("button", { name: "返回" }).click(); await page.waitForTimeout(350); await page.getByRole("button", { name: "如何快速辨别沉香手串的真假" }).click(); await expect(page.getByRole("heading", { name: "如何快速辨别沉香手串的真假" })).toBeVisible();
  for (const label of ["先闻香味", "再看油脂线", "结合密度与来源"]) await expect(page.getByRole("heading", { name: label, exact: true })).toBeVisible();
  await page.getByRole("button", { name: "返回", exact: true }).click();
  await page.getByRole("button", { name: "查看更多知识文章" }).click();
  const knowledge = page.getByTestId("flow-current").locator('[data-product-doc-page="knowledge"]');
  await expect(knowledge.locator(".knowledge-topic-row")).toHaveCount(3);
  await expect(knowledge.getByRole("button")).toHaveCount(0);
  await expect(knowledge).not.toContainText("产业源头");
});

test("knowledge rows open display-only WeChat-style articles while care service stays manual", async ({ page }) => {
  await page.getByRole("button", { name: "如何快速辨别沉香手串的真假" }).click();
  let current = page.getByTestId("flow-current");
  await expect(page.getByTestId("flow-fixed-header").getByRole("heading", { name: "沉香小知识", exact: true })).toBeVisible();
  await expect(current.getByRole("heading", { name: "如何快速辨别沉香手串的真假", exact: true })).toBeVisible();
  await expect(current.getByText("广垦沉香", { exact: true })).toBeVisible();
  await expect(current.locator("article")).toHaveCount(1);
  await expect(current.locator("article img")).toHaveAttribute("src", "/assets/customer-feedback/knowledge-authenticity.svg");
  await expect(current.locator("article button, article input, article textarea")).toHaveCount(0);
  await page.getByRole("button", { name: "返回" }).click();
  await page.getByRole("button", { name: "沉香手串如何日常保养" }).click();
  current = page.getByTestId("flow-current");
  await expect(page.getByTestId("flow-fixed-header").getByRole("heading", { name: "沉香小知识", exact: true })).toBeVisible();
  await expect(current.getByRole("heading", { name: "沉香手串如何日常保养", exact: true })).toBeVisible();
  await expect(current.locator("article img")).toHaveAttribute("src", "/assets/customer-feedback/knowledge-care-tea.png");
  await expect(current.locator(".care-guide-row")).toHaveCount(0);
  await expect(current.locator("article button, article input, article textarea")).toHaveCount(0);
  await page.getByRole("button", { name: "返回" }).click();
  await page.getByRole("button", { name: "佩戴养护" }).click();
  await expect(page.getByRole("heading", { name: /七件小事/ })).toBeVisible();
  await expect(page.locator(".care-guide-row")).toHaveCount(7);
});

test("homepage scrolls above fixed navigation and keeps copyright clear", async ({ page }) => {
  const geometry = await page.evaluate(() => {
    const scroll = document.querySelector<HTMLElement>('[data-testid="flow-current"] [data-testid="mobile-scroll"]')!;
    const copyright = document.querySelector<HTMLElement>('[data-home-section="home-copyright"]')!;
    const tabs = document.querySelector<HTMLElement>('[aria-label="小程序导航"]')!;
    scroll.scrollTop = scroll.scrollHeight;
    return { scrollHeight: scroll.scrollHeight, clientHeight: scroll.clientHeight, copyrightBottom: copyright.getBoundingClientRect().bottom, tabsTop: tabs.getBoundingClientRect().top };
  });
  expect(geometry.scrollHeight).toBeGreaterThan(geometry.clientHeight + 300);
  expect(geometry.copyrightBottom).toBeLessThanOrEqual(geometry.tabsTop);
});

test("Chinese H5 declares its language so Chrome does not translate and offset the phone layout", async ({ page }) => {
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
});

test("approved Chinese product copy opts out of browser translation", async ({ page }) => {
  await expect(page.locator("html")).toHaveAttribute("translate", "no");
  await expect(page.locator('meta[name="google"]')).toHaveAttribute("content", "notranslate");
});

test("mini-program tabs switch between home and my without opening a pushed detail header", async ({ page }) => {
  const tabs = page.getByRole("navigation", { name: "小程序导航" });
  await tabs.getByRole("button", { name: "我的" }).click();

  let current = page.getByTestId("flow-current");
  await expect(page.getByRole("heading", { name: "我的", exact: true })).toBeVisible();
  await expect(current.getByRole("button", { name: "本串证书" })).toContainText("3 串");
  await expect(current.getByRole("button", { name: "返回" })).toHaveCount(0);

  await page.waitForTimeout(350);
  await current.getByRole("navigation", { name: "小程序导航" }).last().getByRole("button", { name: "首页" }).click();
  current = page.getByTestId("flow-current");
  await expect(current.getByRole("heading", { name: "以香静心，聊聊心中挂心事" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "我的沉香", exact: true })).toHaveCount(0);
});

test("profile separates records and management from repeated home content", async ({ page }) => {
  await page.getByRole("navigation", { name: "小程序导航" }).getByRole("button", { name: "我的" }).click();
  await page.waitForTimeout(350);
  const current = page.getByTestId("flow-current");

  const accountBanner = current.locator(".profile-account-banner");
  await expect(accountBanner).toBeVisible();
  await expect(accountBanner.locator(".profile-account-banner-image")).toHaveAttribute("src", "/assets/profile/profile-account-banner.png");
  const bannerActions = accountBanner.locator(".profile-banner-actions");
  await expect(bannerActions.getByRole("button")).toHaveCount(2);
  await expect(bannerActions.getByRole("button", { name: "问帖记录" })).toContainText("1 条");
  await expect(bannerActions.getByRole("button", { name: "本串证书" })).toContainText("3 串");
  const actions = current.locator(".profile-action-list");
  await expect(actions.getByRole("button")).toHaveCount(1);
  const chipHelpAction = actions.getByRole("button", { name: "芯片识别说明" });
  await expect(chipHelpAction).toBeVisible();
  await expect(chipHelpAction.locator("small")).toHaveCount(0);
  await expect(actions.getByRole("button", { name: "关于传统文化解读" })).toHaveCount(0);
  await expect(actions.getByRole("button", { name: "问帖记录" })).toHaveCount(0);
  await expect(actions.getByRole("button", { name: "本串证书" })).toHaveCount(0);
  await expect(current.getByText("个人香事档案", { exact: true })).toHaveCount(0);
  await expect(current.getByText("记录与管理", { exact: true })).toHaveCount(0);
  await expect(current.getByText("使用帮助", { exact: true })).toHaveCount(0);
  await expect(current.locator(".profile-archive-card")).toHaveCount(0);
  await expect(current.locator(".profile-primary-actions")).toHaveCount(0);
  await expect(current.getByText("你的香事，", { exact: false })).toHaveCount(0);
  await expect(current.getByText("我的内容", { exact: true })).toHaveCount(0);
  await expect(current.getByRole("img", { name: "海南琼南沉香手串" })).toHaveCount(0);
  await expect(current.getByText("证书与溯源", { exact: true })).toHaveCount(0);
  await expect(current.getByText("佩戴养护", { exact: true })).toHaveCount(0);
});

test("profile simulates WeChat authorization before showing the signed-in state", async ({ page }) => {
  await page.getByRole("navigation", { name: "小程序导航" }).getByRole("button", { name: "我的" }).click();
  await page.waitForTimeout(350);
  const current = page.getByTestId("flow-current");
  const account = current.locator(".profile-account-banner");
  const authorize = current.getByRole("button", { name: "微信授权登录" });

  await expect(authorize).toBeVisible();
  await expect(account.getByText("微信账号", { exact: true })).toBeVisible();
  await expect(account.getByText("授权后同步香事记录", { exact: true })).toBeVisible();
  const loggedOutHeight = await account.evaluate((node) => node.getBoundingClientRect().height);
  await authorize.click();
  await expect(page.getByRole("heading", { name: "微信授权登录", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "确认微信授权" })).toBeVisible();
  await expect(account.getByText("微信账号", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "确认微信授权" }).click();
  await expect(account.getByText("微信用户", { exact: true })).toBeVisible();
  await expect(account.getByText("已完成微信授权", { exact: true })).toBeVisible();
  await expect(account.getByText("已登录", { exact: true })).toBeVisible();
  await expect(authorize).toHaveCount(0);
  await expect(current.getByRole("button", { name: "问帖记录" })).toBeVisible();
  const loggedInHeight = await account.evaluate((node) => node.getBoundingClientRect().height);
  expect(Math.abs(loggedInHeight - loggedOutHeight)).toBeLessThanOrEqual(2);
});

test("profile separates the account banner from one flat full-width action list", async ({ page }) => {
  await page.getByRole("navigation", { name: "小程序导航" }).getByRole("button", { name: "我的" }).click();
  await page.waitForTimeout(350);
  const current = page.getByTestId("flow-current").last();
  await expect(current.locator(".profile-account-banner")).toBeVisible();
  await expect(current.locator(".profile-banner-actions")).toBeVisible();
  await expect(current.locator(".profile-action-list")).toBeVisible();

  const visual = await current.evaluate((current) => {
    const pageRoot = current.querySelector<HTMLElement>(".mini-profile")!;
    const account = current.querySelector<HTMLElement>(".profile-account-banner")!;
    const accountContent = current.querySelector<HTMLElement>(".profile-account-content")!;
    const bannerActions = current.querySelector<HTMLElement>(".profile-banner-actions")!;
    const list = current.querySelector<HTMLElement>(".profile-action-list")!;
    const root = current.querySelector<HTMLElement>(".profile-root-screen")!;
    const accountBox = account.getBoundingClientRect();
    const accountContentBox = accountContent.getBoundingClientRect();
    const bannerActionRows = [...bannerActions.querySelectorAll<HTMLElement>("button")].map((button) => {
      const box = button.getBoundingClientRect();
      return { top: box.top, width: box.width, height: box.height };
    });
    const listBox = list.getBoundingClientRect();
    const rootBox = root.getBoundingClientRect();
    const rows = [...list.querySelectorAll<HTMLElement>(".profile-action-row")].map((row) => {
      const box = row.getBoundingClientRect();
      return { left: box.left, width: box.width, height: box.height };
    });
    return {
      accountParentIsBody: account.parentElement?.classList.contains("mini-profile-body") ?? false,
      accountBackground: getComputedStyle(account).backgroundColor,
      pageBackground: getComputedStyle(pageRoot).backgroundColor,
      accountHeight: accountBox.height,
      accountContentTopInset: accountContentBox.top - accountBox.top,
      bannerListGap: listBox.top - accountBox.bottom,
      bannerTopGap: accountBox.top - rootBox.top,
      bannerLeftGap: accountBox.left - rootBox.left,
      bannerRightGap: rootBox.right - accountBox.right,
      actionCount: rows.length,
      bannerActionCount: bannerActionRows.length,
      bannerActionRows,
      distinctLeftEdges: new Set(rows.map((row) => Math.round(row.left))).size,
      rows,
    };
  });

  expect(visual.accountParentIsBody).toBe(true);
  expect(visual.accountBackground).not.toBe(visual.pageBackground);
  expect(visual.accountHeight).toBeGreaterThanOrEqual(140);
  expect(visual.accountContentTopInset).toBeLessThanOrEqual(160);
  expect(visual.bannerListGap).toBeGreaterThanOrEqual(16);
  expect(Math.abs(visual.bannerTopGap)).toBeLessThanOrEqual(1);
  expect(Math.abs(visual.bannerLeftGap)).toBeLessThanOrEqual(1);
  expect(Math.abs(visual.bannerRightGap)).toBeLessThanOrEqual(1);
  expect(visual.bannerActionCount).toBe(2);
  expect(visual.bannerActionRows.every((row) => row.width >= 130)).toBe(true);
  expect(visual.bannerActionRows.every((row) => row.height >= 48)).toBe(true);
  expect(visual.actionCount).toBe(1);
  expect(visual.distinctLeftEdges).toBe(1);
  expect(visual.rows.every((row) => row.width >= 300)).toBe(true);
  expect(visual.rows.every((row) => row.height >= 56)).toBe(true);
});

test("profile banner data actions stay transparent and center their content in each clickable half", async ({ page }) => {
  await page.getByRole("navigation", { name: "小程序导航" }).getByRole("button", { name: "我的" }).click();
  await page.waitForTimeout(350);
  const current = page.getByTestId("flow-current").last();
  const actions = current.locator(".profile-banner-actions");
  await expect(actions.getByRole("button")).toHaveCount(2);

  const layout = await actions.evaluate((container) => {
    const buttons = [...container.querySelectorAll<HTMLElement>("button")];
    const style = getComputedStyle(container);
    return {
      background: style.backgroundColor,
      borderWidths: [style.borderTopWidth, style.borderRightWidth, style.borderBottomWidth, style.borderLeftWidth],
      borderRadius: style.borderRadius,
      buttons: buttons.map((button) => {
        const buttonBox = button.getBoundingClientRect();
        const children = [...button.children].map((child) => child.getBoundingClientRect());
        const contentBox = {
          left: Math.min(...children.map((box) => box.left)),
          right: Math.max(...children.map((box) => box.right)),
          top: Math.min(...children.map((box) => box.top)),
          bottom: Math.max(...children.map((box) => box.bottom)),
        };
        const buttonStyle = getComputedStyle(button);
        return {
          height: buttonBox.height,
          background: buttonStyle.backgroundColor,
          flexDirection: buttonStyle.flexDirection,
          rightBorder: buttonStyle.borderRightWidth,
          quantityAboveLabel: children[0].bottom <= children[1].top,
          quantityLabelGap: children[1].top - children[0].bottom,
          horizontalCenterOffset: Math.abs((contentBox.left + contentBox.right) / 2 - (buttonBox.left + buttonBox.right) / 2),
          verticalCenterOffset: Math.abs((contentBox.top + contentBox.bottom) / 2 - (buttonBox.top + buttonBox.bottom) / 2),
        };
      }),
    };
  });

  expect(layout.background).toBe("rgba(0, 0, 0, 0)");
  expect(layout.borderWidths).toEqual(["0px", "0px", "0px", "0px"]);
  expect(layout.borderRadius).toBe("0px");
  expect(layout.buttons.every((button) => button.height >= 48)).toBe(true);
  expect(layout.buttons.every((button) => button.background === "rgba(0, 0, 0, 0)")).toBe(true);
  expect(layout.buttons.every((button) => button.flexDirection === "column")).toBe(true);
  expect(layout.buttons.every((button) => button.quantityAboveLabel)).toBe(true);
  expect(layout.buttons.every((button) => button.quantityLabelGap >= 7)).toBe(true);
  expect(layout.buttons[0].rightBorder).not.toBe("0px");
  expect(layout.buttons[1].rightBorder).toBe("0px");
  expect(layout.buttons.every((button) => button.horizontalCenterOffset <= 2)).toBe(true);
  expect(layout.buttons.every((button) => button.verticalCenterOffset <= 2)).toBe(true);
});

test("profile login button stays compact and reachable inside the account banner", async ({ page }) => {
  await page.getByRole("navigation", { name: "小程序导航" }).getByRole("button", { name: "我的" }).click();
  await page.waitForTimeout(350);
  const current = page.getByTestId("flow-current").last();
  await expect(current.locator(".profile-account-banner")).toBeVisible();
  await expect(current.locator('.profile-account-content > button')).toBeVisible();

  const layout = await current.evaluate((current) => {
    const row = current.querySelector<HTMLElement>(".profile-account-banner")!;
    const content = current.querySelector<HTMLElement>(".profile-account-content")!;
    const avatar = current.querySelector<HTMLElement>(".profile-account-avatar")!;
    const button = current.querySelector<HTMLElement>('.profile-account-content > button')!;
    const rowBox = row.getBoundingClientRect();
    const contentBox = content.getBoundingClientRect();
    const avatarBox = avatar.getBoundingClientRect();
    const buttonBox = button.getBoundingClientRect();
    return {
      buttonWidth: buttonBox.width,
      buttonHeight: buttonBox.height,
      topInset: buttonBox.top - rowBox.top,
      bottomInset: rowBox.bottom - buttonBox.bottom,
      avatarButtonCenterOffset: Math.abs((avatarBox.top + avatarBox.height / 2) - (buttonBox.top + buttonBox.height / 2)),
      buttonRightGap: contentBox.right - buttonBox.right,
    };
  });

  expect(layout.buttonWidth).toBeLessThanOrEqual(120);
  expect(layout.buttonHeight).toBeGreaterThanOrEqual(44);
  expect(layout.topInset).toBeGreaterThanOrEqual(12);
  expect(layout.bottomInset).toBeGreaterThanOrEqual(12);
  expect(layout.avatarButtonCenterOffset).toBeLessThanOrEqual(2);
  expect(Math.abs(layout.buttonRightGap)).toBeLessThanOrEqual(1);
});

test("profile primary content fits above the fixed tabs on iPhone and Pixel", async ({ page }) => {
  await page.getByRole("navigation", { name: "小程序导航" }).getByRole("button", { name: "我的" }).click();
  await page.waitForTimeout(350);

  const readFit = () => page.getByTestId("flow-current").last().evaluate((current) => {
    const scroller = current.querySelector<HTMLElement>('[data-testid="mobile-scroll"]')!;
    const body = current.querySelector<HTMLElement>(".mini-profile-body")!;
    const tabs = current.querySelector<HTMLElement>(".mini-tabs")!;
    return {
      scrollHeight: scroller.scrollHeight,
      clientHeight: scroller.clientHeight,
      bodyBottom: body.getBoundingClientRect().bottom,
      tabsTop: tabs.getBoundingClientRect().top,
    };
  });

  let fit = await readFit();
  expect(fit.scrollHeight).toBeLessThanOrEqual(fit.clientHeight + 1);
  expect(fit.bodyBottom).toBeLessThanOrEqual(fit.tabsTop + 1);

  await page.getByTestId("device-picker").click();
  await page.getByTestId("device-option-pixel-10").click();
  await page.waitForTimeout(250);
  fit = await readFit();
  expect(fit.scrollHeight).toBeLessThanOrEqual(fit.clientHeight + 1);
  expect(fit.bodyBottom).toBeLessThanOrEqual(fit.tabsTop + 1);
});

test("reading entry requires WeChat authorization and continues after consent", async ({ page }) => {
  await page.getByRole("button", { name: "开始问帖" }).click();

  await expect(page.getByRole("heading", { name: "登录后开始问帖", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "先完成微信授权", exact: true })).toHaveCount(0);
  await expect(page.getByRole("textbox", { name: "向 AI 问事助手提问" })).toHaveCount(0);
  await page.getByRole("button", { name: "微信授权并继续" }).click();

  await expect(page.getByRole("heading", { name: "AI问事", exact: true })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "向 AI 问事助手提问" })).toBeVisible();
});

test("reading records authorize into a real history list", async ({ page }) => {
  await page.getByRole("navigation", { name: "小程序导航" }).getByRole("button", { name: "我的" }).click();
  await page.getByRole("button", { name: "问帖记录" }).click();
  await expect(page.getByText("登录后查看记录")).toBeVisible();
  await page.getByRole("button", { name: "微信授权并继续" }).click();
  await expect(page.getByTestId("flow-fixed-header").getByRole("heading", { name: "问帖记录", exact: true })).toBeVisible();
  const record = page.getByRole("button", { name: /新的合作是否适合推进/ });
  await expect(record).toBeVisible();
  const recordLayout = await record.evaluate((node) => {
    const icon = node.querySelector("svg")!.getBoundingClientRect();
    const summary = node.querySelector("p")!.getBoundingClientRect();
    const box = node.getBoundingClientRect();
    return {
      iconCenterOffset: Math.abs((icon.top + icon.height / 2) - (box.top + box.height / 2)),
      iconRightGap: box.right - icon.right,
      summaryRight: summary.right,
      iconLeft: icon.left,
    };
  });
  expect(recordLayout.iconCenterOffset).toBeLessThanOrEqual(2);
  expect(recordLayout.iconRightGap).toBeGreaterThanOrEqual(12);
  expect(recordLayout.iconRightGap).toBeLessThanOrEqual(20);
  expect(recordLayout.summaryRight).toBeLessThan(recordLayout.iconLeft);
  await expect(page.getByRole("heading", { name: "AI问事" })).toHaveCount(0);
});

test("reading record opens detail and starts a fresh question", async ({ page }) => {
  await page.getByRole("navigation", { name: "小程序导航" }).getByRole("button", { name: "我的" }).click();
  await page.getByRole("button", { name: "问帖记录" }).click();
  await page.getByRole("button", { name: "微信授权并继续" }).click();
  await page.getByRole("button", { name: /新的合作是否适合推进/ }).click();
  await expect(page.getByRole("heading", { name: "问帖详情" })).toBeVisible();
  await expect(page.getByText(/七天内可完成的小目标/)).toBeVisible();
  await expect(page.locator(".history-transcript .fortune-message")).toHaveCount(5);
  await expect(page.locator(".history-transcript").getByText("近期是否适合推进新的合作？", { exact: true })).toBeVisible();
  await expect(page.locator(".history-transcript").getByText("我更担心合作对象是否可靠。", { exact: true })).toBeVisible();
  await expect(page.getByRole("textbox")).toHaveCount(0);
  await page.getByRole("button", { name: "开启新问帖" }).click();
  await expect(page.getByRole("heading", { name: "AI问事" })).toBeVisible();
  await expect(page.getByTestId("reading-empty-state")).toBeVisible();
  await expect(page.getByText(/接着聊你之前关于合作的问帖/)).toHaveCount(0);
});

test("profile certificate and chip-help rows open their intended pages", async ({ page }) => {
  await page.getByRole("navigation", { name: "小程序导航" }).getByRole("button", { name: "我的" }).click();
  const current = page.getByTestId("flow-current");
  await expect(current.getByRole("button", { name: "本串证书" })).toBeVisible();
  await expect(current.getByRole("button", { name: "我的手串" })).toHaveCount(0);
  await expect(current.getByRole("button", { name: "关于传统文化解读" })).toHaveCount(0);
  await current.getByRole("button", { name: "本串证书" }).click();
  await expect(page.getByRole("heading", { name: "我的手串", exact: true })).toBeVisible();
  const certificateList = page.locator(".certificate-list");
  await expect(certificateList.locator(".page-eyebrow")).toHaveCount(0);
  await expect(certificateList.locator("h2")).toHaveCount(0);
  await expect(certificateList.locator(".certificate-list-intro")).toHaveCount(0);
  const braceletRows = certificateList.locator(".certificate-list-row");
  await expect(braceletRows).toHaveCount(3);
  await expect(braceletRows.nth(0)).toContainText("ZHTC26063030124");
  await expect(braceletRows.nth(0)).toContainText("原件已收录");
  await expect(braceletRows.nth(1)).toContainText("原件待补充");
  await expect(braceletRows.nth(2)).toContainText("原件待补充");
  for (const label of ["奇楠沉香算盘珠手串", "琼南蜜韵沉香手串", "岭南雅韵沉香手串"]) await expect(page.getByRole("button", { name: new RegExp(label) })).toBeVisible();
  await page.getByRole("button", { name: /琼南蜜韵沉香手串.*原件待补充/ }).click();
  await expect(page.getByRole("heading", { name: "证书详情", exact: true })).toBeVisible();
  await expect(page.getByText("琼南蜜韵沉香手串", { exact: true })).toBeVisible();
  await expect(page.getByText("证书原件待补充", { exact: true })).toBeVisible();
  await expect(page.getByText("ZHTC26063030124", { exact: true })).toHaveCount(0);
  await expect(page.getByText("证书原件已收录", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("img", { name: "材质检验证证书原件" })).toHaveCount(0);
  await page.getByRole("button", { name: "返回" }).click();
  await expect(page.getByRole("heading", { name: "我的手串", exact: true })).toBeVisible();
  await page.getByRole("button", { name: /岭南雅韵沉香手串.*原件待补充/ }).click();
  await expect(page.getByText("证书原件待补充", { exact: true })).toBeVisible();
  await expect(page.getByText("ZHTC26063030124", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "返回" }).click();
  await page.getByRole("button", { name: "返回" }).click();
  await page.waitForTimeout(250);
  await current.getByRole("button", { name: "芯片识别说明" }).click();
  await expect(page.getByRole("heading", { name: "芯片识别说明", exact: true })).toBeVisible();
});

test("multi-certificate list stays full-width and reachable on iPhone and Pixel", async ({ page }) => {
  await page.getByRole("navigation", { name: "小程序导航" }).getByRole("button", { name: "我的" }).click();
  await page.getByRole("button", { name: "本串证书" }).click();

  const readLayout = () => page.getByTestId("flow-current").last().evaluate((current) => {
    const scroller = current.querySelector<HTMLElement>('[data-testid="mobile-scroll"]')!;
    const rows = [...current.querySelectorAll<HTMLElement>(".certificate-list-row")].map((row) => {
      const box = row.getBoundingClientRect();
      const image = row.querySelector<HTMLImageElement>("img")!;
      return { left: box.left, width: box.width, height: box.height, imageSrc: image.getAttribute("src") };
    });
    return {
      rowCount: rows.length,
      distinctLeftEdges: new Set(rows.map((row) => Math.round(row.left))).size,
      rows,
      hasHorizontalOverflow: scroller.scrollWidth > scroller.clientWidth + 1,
    };
  });

  let layout = await readLayout();
  expect(layout.rowCount).toBe(3);
  expect(layout.distinctLeftEdges).toBe(1);
  expect(layout.rows.every((row) => row.width >= 340 && row.height >= 76 && Boolean(row.imageSrc))).toBe(true);
  expect(layout.hasHorizontalOverflow).toBe(false);

  await page.getByTestId("device-picker").click();
  await page.getByTestId("device-option-pixel-10").click();
  await page.waitForTimeout(250);
  layout = await readLayout();
  expect(layout.rowCount).toBe(3);
  expect(layout.rows.every((row) => row.width >= 370 && row.height >= 76)).toBe(true);
  expect(layout.hasHorizontalOverflow).toBe(false);
});

test("profile chip-help page explains the complete recognition flow", async ({ page }) => {
  await page.getByRole("navigation", { name: "小程序导航" }).getByRole("button", { name: "我的" }).click();
  await page.getByRole("button", { name: "芯片识别说明" }).click();
  for (const text of ["轻触手串芯片", "识别成功后进入手串首页"]) {
    await expect(page.getByText(text, { exact: true })).toBeVisible();
  }
  await expect(page.getByText(/芯片不会直接开始问帖/)).toBeVisible();
});

test("reading disclaimer stays in the conversation while answers keep structured labels", async ({ page }) => {
  await page.getByRole("button", { name: "开始问帖" }).click();
  await page.getByRole("button", { name: "微信授权并继续" }).click();
  const composer = page.locator(".reading-composer");
  await expect(page.locator(".reading-page > .reading-disclaimer")).toHaveCount(0);
  await expect(page.getByText("内容由 AI 生成，仅供娱乐参考", { exact: true })).toBeVisible();
  await expect(composer.locator(".reading-disclaimer")).toBeVisible();
  const input = page.getByRole("textbox", { name: "向 AI 问事助手提问" });
  await input.fill("合作对象是否可靠");
  await input.press("Enter");
  await expect(input).toBeDisabled();
  await expect(input).toBeEnabled({ timeout: 3000 });
  await input.fill("我更担心兑现能力");
  await input.press("Enter");
  await expect(page.locator(".fortune-answer-label")).toHaveCount(3, { timeout: 3000 });
  await expect(page.locator(".reading-result")).toHaveCount(0);
});

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

test("care page presents the selected seven-part editorial guide", async ({ page }) => {
  await page.getByRole("button", { name: "佩戴养护" }).click();
  await page.waitForTimeout(350);
  const current = page.getByTestId("flow-current").last();
  await expect(current.getByRole("heading", { name: /七件小事，\s*让香气陪你更久/ })).toBeVisible();
  await expect(current.getByRole("img", { name: "沉香手串日常养护" })).toHaveAttribute("src", "/assets/home-reference/care-editorial-hero-v3.png");
  const guide = current.locator(".care-guide-list");
  await expect(guide.locator(".care-guide-row")).toHaveCount(7);
  for (const title of ["远离化学品", "避水与护肤品", "避高温与油烟", "密封独立存放", "香味减淡后的恢复", "轻柔清洁", "日常盘护"]) await expect(guide.getByRole("heading", { name: title })).toBeVisible();
  await expect(current.locator(".care-reminder")).toContainText("细心养护");
  await expect(current.locator(".care-guide-row").first()).toHaveText(/01/);
  await expect(current.locator(".care-guide-row").last()).toHaveText(/07/);
  await page.getByRole("button", { name: "返回" }).click();
  await page.waitForTimeout(350);
  await expect(page.getByTestId("flow-current").last()).toHaveAttribute("data-flow-screen", "home");
});

test("Pixel critical controls and auxiliary copy meet readable sizes", async ({ page }) => {
  await page.getByTestId("device-picker").click();
  await page.getByTestId("device-option-pixel-10").click();
  await page.getByRole("navigation", { name: "小程序导航" }).getByRole("button", { name: "我的" }).click();
  await expect(page.getByRole("button", { name: "微信授权登录" })).toHaveCSS("min-height", "48px");
  await page.waitForTimeout(350);
  await page.getByTestId("flow-current").last().getByRole("navigation", { name: "小程序导航" }).getByRole("button", { name: "首页" }).last().click();
  await page.getByRole("button", { name: "开始问帖" }).click();
  const auth = page.getByRole("button", { name: "微信授权并继续" });
  await expect(auth).toBeVisible();
  await expect(auth).toHaveCSS("min-height", "48px");
  await expect(page.locator(".authorization-gate small")).toHaveCSS("font-size", "12px");
  await auth.click();
  for (const label of ["事业", "感情", "财运"]) await expect(page.getByRole("button", { name: label })).toHaveCSS("min-height", "48px");
  await expect(page.getByRole("button", { name: "发送" })).toHaveCSS("height", "48px");
  const composerLayout = await page.locator(".reading-input-shell").evaluate((shell) => {
    const send = shell.querySelector<HTMLElement>(".reading-send")!;
    const screen = document.querySelector<HTMLElement>('[data-testid="device-screen"]')!;
    const shellBox = shell.getBoundingClientRect();
    const sendBox = send.getBoundingClientRect();
    const screenBox = screen.getBoundingClientRect();
    return {
      shellWidth: shellBox.width,
      leftGap: shellBox.left - screenBox.left,
      rightGap: screenBox.right - shellBox.right,
      sendWidth: sendBox.width,
      sendHeight: sendBox.height,
      sendRight: sendBox.right,
      shellRight: shellBox.right,
    };
  });
  expect(composerLayout.shellWidth).toBeGreaterThan(360);
  expect(composerLayout.leftGap).toBeGreaterThanOrEqual(14);
  expect(composerLayout.rightGap).toBeGreaterThanOrEqual(14);
  expect(composerLayout.sendWidth).toBe(composerLayout.sendHeight);
  expect(composerLayout.sendRight).toBeLessThanOrEqual(composerLayout.shellRight);
});

test("certificate navigation keeps the simulated keyboard hidden below the phone and clears the safe area", async ({ page }) => {
  const seededScrollTop = await page.getByTestId("device-screen").evaluate((element) => {
    element.scrollTop = 180;
    return element.scrollTop;
  });
  expect(seededScrollTop).toBe(0);
  await page.getByRole("button", { name: "查看证书查询" }).click();
  await expect(page.getByTestId("keyboard-dock")).toHaveAttribute("data-visible", "false");
  await expect(page.getByRole("button", { name: "返回" })).toBeFocused();

  await page.waitForTimeout(350);
  const layout = await page.evaluate(() => {
    const screen = document.querySelector<HTMLElement>('[data-testid="device-screen"]')!;
    const header = document.querySelector<HTMLElement>('[data-testid="flow-fixed-header"]')!;
    const current = document.querySelector<HTMLElement>('[data-testid="flow-current"]')!;
    const heading = current.querySelector<HTMLElement>("h2")!;
    const keyboard = document.querySelector<HTMLElement>('[data-testid="keyboard-dock"]')!;

    return {
      screenScrollTop: screen.scrollTop,
      screenTop: screen.getBoundingClientRect().top,
      screenBottom: screen.getBoundingClientRect().bottom,
      headerTop: header.getBoundingClientRect().top,
      headerBottom: header.getBoundingClientRect().bottom,
      headingTop: heading.getBoundingClientRect().top,
      keyboardTop: keyboard.getBoundingClientRect().top,
    };
  });

  expect(layout.screenScrollTop).toBeLessThanOrEqual(1);
  expect(layout.headerTop).toBeGreaterThanOrEqual(layout.screenTop - 1);
  expect(layout.headingTop).toBeGreaterThanOrEqual(layout.headerBottom);
  expect(layout.keyboardTop).toBeGreaterThanOrEqual(layout.screenBottom - 1);
});

test("question tab opens a standalone AI fortune chat without bracelet context", async ({ page }) => {
  await page.getByRole("navigation", { name: "小程序导航" }).getByRole("button", { name: "问帖" }).click();
  await page.getByRole("button", { name: "微信授权并继续" }).click();

  await expect(page.getByRole("heading", { name: "AI问事" })).toBeVisible();
  const current = page.getByTestId("flow-current");
  await expect(current.getByText("当前手串", { exact: true })).toHaveCount(0);
  await expect(current.getByRole("img", { name: /当前手串/ })).toHaveCount(0);
  await expect(current.getByText(/CX-2018-072/)).toHaveCount(0);
  await expect(current.locator(".reading-bracelet")).toHaveCount(0);
  await expect(current.getByTestId("reading-empty-state")).toBeVisible();
  await expect(current.getByRole("img", { name: "广垦沉香" })).toHaveAttribute("src", "/assets/home-reference/guangken-chenxiang-logo.png");
  await expect(current.getByRole("heading", { name: "今天想问什么？" })).toBeVisible();
  await expect(page.getByText(/我是你的 AI 问事助手/)).toHaveCount(0);
  await expect(current.getByRole("button", { name: "事业" })).toBeVisible();
  await expect(current.getByRole("button", { name: "感情" })).toBeVisible();
  await expect(current.getByRole("button", { name: "财运" })).toBeVisible();
  await expect(page.getByText("AI 在线")).toHaveCount(0);
  await expect(page.getByRole("textbox", { name: "向 AI 问事助手提问" })).toBeVisible();
  await expect(page.getByRole("button", { name: "发送" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "语音输入" })).toHaveCount(0);
  await expect(current.getByRole("navigation", { name: "小程序导航" })).toHaveCount(0);
  await expect(current.getByText("内容由 AI 生成，仅供娱乐参考", { exact: true })).toBeVisible();
});

test("each reading entry starts a fresh conversation", async ({ page }) => {
  await page.getByRole("button", { name: "开始问帖" }).click();
  await page.getByRole("button", { name: "微信授权并继续" }).click();
  await page.getByRole("button", { name: "事业" }).click();
  await expect(page.getByText(/我想再确认/)).toBeVisible({ timeout: 3000 });
  await page.getByRole("button", { name: "返回" }).click();
  await page.getByRole("navigation", { name: "小程序导航" }).getByRole("button", { name: "问帖" }).click();
  const current = page.getByTestId("flow-current");
  await expect(current.getByTestId("reading-empty-state")).toBeVisible();
  await expect(current.locator(".fortune-message")).toHaveCount(0);
  await expect(current.getByRole("button", { name: "事业" })).toBeVisible();
});

test("agent actively asks for context before answering the user", async ({ page }) => {
  await page.getByRole("button", { name: "开始问帖" }).click();
  await page.getByRole("button", { name: "微信授权并继续" }).click();
  const current = page.getByTestId("flow-current");
  const composer = page.getByRole("textbox", { name: "向 AI 问事助手提问" });
  await composer.fill("近期是否适合推进新的合作？");
  await composer.press("Enter");

  await expect(page.getByTestId("keyboard-dock")).toHaveAttribute("data-visible", "false");
  await expect(page.getByText(/我想再确认/)).toBeVisible({ timeout: 3000 });
  for (const prompt of ["大概持续多久", "时机不对", "最想守住的结果"]) {
    await expect(page.getByText(new RegExp(prompt))).toBeVisible();
  }

  const bubbleLayout = await current.locator(".fortune-bubble").evaluateAll((items) => items.map((item) => ({
    role: item.closest(".fortune-message")?.classList.contains("user") ? "user" : "agent",
    left: item.getBoundingClientRect().left,
    right: item.getBoundingClientRect().right,
  })));
  expect(bubbleLayout.at(0)?.role).toBe("user");
  expect(bubbleLayout.some((item) => item.role === "user" && item.left > bubbleLayout.at(-1)!.left)).toBe(true);

  const bubbleStyles = await current.locator(".fortune-message").evaluateAll((items) => items.map((item) => {
    const bubble = item.querySelector<HTMLElement>(".fortune-bubble")!;
    const style = getComputedStyle(bubble);
    return {
      role: item.classList.contains("user") ? "user" : "agent",
      backgroundColor: style.backgroundColor,
      borderTopWidth: style.borderTopWidth,
      color: style.color,
    };
  }));
  expect(bubbleStyles.find(item => item.role === "agent")).toMatchObject({
    backgroundColor: "rgba(0, 0, 0, 0)",
    borderTopWidth: "0px",
  });
  expect(bubbleStyles.find(item => item.role === "user")).toMatchObject({
    backgroundColor: "rgb(242, 242, 242)",
    color: "rgb(47, 47, 47)",
  });

  await composer.fill("我更担心合作对象是否可靠。");
  await composer.press("Enter");
  await expect(page.getByText(/判断：/)).toBeVisible({ timeout: 3000 });
  await expect(page.getByText(/提醒：/)).toBeVisible();
  await expect(page.getByText(/建议：/)).toBeVisible();
  await expect(current.locator(".reading-result")).toHaveCount(0);
  await expect(page.getByText("风山渐", { exact: true })).toHaveCount(0);

  const layout = await page.evaluate(() => {
    const current = document.querySelector<HTMLElement>('[data-testid="flow-current"]')!;
    const scroller = current.querySelector<HTMLElement>('[data-testid="mobile-scroll"]')!;
    const latest = current.querySelector<HTMLElement>('.fortune-message.agent[data-last="true"] .fortune-bubble')!;
    const composer = current.querySelector<HTMLElement>(".reading-composer")!;
    return {
      scrollerTop: scroller.getBoundingClientRect().top,
      latestTop: latest.getBoundingClientRect().top,
      composerTop: composer.getBoundingClientRect().top,
    };
  });

  expect(layout.latestTop).toBeGreaterThanOrEqual(layout.scrollerTop - 1);
  expect(layout.latestTop).toBeLessThan(layout.composerTop);
});

test("page PRD entry and drawer match the consumer-commission reference", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  const phoneScreen = page.getByTestId("device-screen");
  const trigger = page.getByRole("button", { name: "查看首页 · 页面 PRD" });

  await expect(trigger).toBeVisible();
  await expect(trigger.getByText("页面", { exact: true })).toBeVisible();
  await expect(trigger.getByText("PRD", { exact: true })).toBeVisible();
  await expect(phoneScreen.getByRole("button", { name: /页面 PRD/ })).toHaveCount(0);
  expect(await trigger.evaluate((node) => Boolean(node.closest("[data-phone-screen]")))).toBe(false);

  const triggerGeometry = await trigger.evaluate(node => {
    const rect = node.getBoundingClientRect();
    const style = getComputedStyle(node);
    return { right: window.innerWidth - rect.right, top: rect.top, width: rect.width, height: rect.height, position: style.position, borderRadius: style.borderRadius };
  });
  expect(triggerGeometry).toMatchObject({ right: 0, top: 454, width: 44, height: 92, position: "fixed", borderRadius: "8px 0px 0px 8px" });

  await trigger.click();
  const drawer = page.getByRole("dialog", { name: "首页 · 页面 PRD" });
  const mask = page.getByTestId("product-doc-review-mask");
  await expect(drawer).toBeVisible();
  await expect(mask).toBeVisible();
  await expect(drawer.getByText("页面级产品需求 · 字段级", { exact: true })).toBeVisible();
  await expect(drawer.getByRole("heading", { name: "首页 · 页面 PRD", exact: true })).toBeVisible();
  await expect(drawer.getByRole("heading", { name: "页面概述", exact: true })).toBeAttached();
  await expect(drawer.getByRole("heading", { name: "页面字段", exact: true })).toBeAttached();
  await expect(drawer.getByRole("heading", { name: "页面验收标准", exact: true })).toBeAttached();
  await expect(drawer.getByRole("button", { name: "完整 PRD", exact: true })).toHaveCount(0);
  await expect(drawer.getByText("琼南沉香 · 15 个产品上下文 · 当前：首页", { exact: true })).toBeVisible();
  await expect(drawer.getByText(/跳转外部认种小程序/).first()).toBeVisible();
  await expect(drawer.getByText("认种档案", { exact: true })).toHaveCount(0);
  await expect(drawer.getByText("成长时间线", { exact: true })).toHaveCount(0);
  await expect(drawer.getByRole("button", { name: "关闭 PRD", exact: true })).toBeVisible();
});

test("current-page PRD follows the consumer-commission field-level writing pattern", async ({ page }) => {
  await page.getByRole("button", { name: "查看首页 · 页面 PRD" }).click();
  const drawer = page.locator(".product-doc-review-drawer");

  await expect(drawer.getByRole("heading", { name: "首页 · 页面 PRD", exact: true })).toBeVisible();
  await expect(drawer.getByText("需求已整理", { exact: true })).toBeVisible();
  await expect(drawer.getByText("页面键：home", { exact: true })).toBeVisible();
  await expect(drawer.getByText("更新：2026-09-01", { exact: true })).toBeVisible();

  for (const heading of [
    "页面概述",
    "页面级业务规则",
    "页面字段",
    "操作与结果",
    "治理边界提示",
    "状态与跳转",
    "通知与日志",
    "异常与空状态",
    "页面验收标准",
    "技术评估项",
  ]) {
    await expect(drawer.getByRole("heading", { name: heading, exact: true })).toBeAttached();
  }

  for (const column of ["字段", "类型", "必填/展示规则", "业务口径", "按钮/操作", "展示条件", "执行结果", "权限与记录"]) {
    await expect(drawer.getByRole("columnheader", { name: column, exact: true })).toBeAttached();
  }
  await expect(drawer.getByRole("cell", { name: "AI 问帖主入口", exact: true })).toBeAttached();
  await expect(drawer.getByRole("cell", { name: "开始问帖", exact: true })).toBeAttached();

  for (const staleHeading of ["完整页面规格", "相关流程与状态", "功能需求", "数据与接口", "验收用例"]) {
    await expect(drawer.getByRole("heading", { name: staleHeading, exact: true })).toHaveCount(0);
  }
});

test("product document follows the active page and gives the login layer precedence", async ({ page }) => {
  test.setTimeout(35_000);
  const trigger = page.locator(".product-doc-review-trigger");
  const drawer = page.locator(".product-doc-review-drawer");

  await page.getByRole("button", { name: "查看证书查询" }).click();
  await expect(trigger).toHaveAttribute("aria-label", "查看证书详情 · 页面 PRD");
  await trigger.click();
  await expect(drawer.getByRole("heading", { name: "证书详情 · 页面 PRD", exact: true })).toBeVisible();
  await expect(drawer.getByText("证书原件", { exact: true }).first()).toBeVisible();
  await expect(drawer.getByText(/原件待补充/).first()).toBeVisible();
  await expect(drawer.getByText(/多手串/).first()).toBeVisible();
  await expect(drawer.getByText("溯源时间线", { exact: true })).toHaveCount(0);
  await expect(drawer.getByText("产地", { exact: true })).toHaveCount(0);
  await expect(drawer.getByText("香韵", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "关闭 PRD", exact: true }).first().click();
  await page.getByRole("button", { name: "返回" }).click();

  await page.getByRole("button", { name: "佩戴养护" }).click();
  await trigger.click();
  await expect(drawer.getByRole("heading", { name: "佩戴养护 · 页面 PRD", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "关闭 PRD", exact: true }).first().click();
  await page.getByRole("button", { name: "返回" }).click();

  await page.getByRole("button", { name: "查看更多知识文章" }).click();
  await trigger.click();
  await expect(drawer.getByRole("heading", { name: "沉香知识 · 页面 PRD", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "关闭 PRD", exact: true }).first().click();
  await page.getByRole("button", { name: "返回" }).click();

  await page.getByRole("button", { name: "如何快速辨别沉香手串的真假" }).click();
  await trigger.click();
  await expect(drawer.getByRole("heading", { name: "沉香小知识文章 · 页面 PRD", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "关闭 PRD", exact: true }).first().click();
  await page.getByRole("button", { name: "返回" }).click();

  await page.getByRole("button", { name: "走进产业园" }).click();
  await trigger.click();
  await expect(drawer.getByRole("heading", { name: "源头产业园 · 页面 PRD", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "关闭 PRD", exact: true }).first().click();
  await page.getByRole("button", { name: "返回" }).click();

  await page.getByRole("navigation", { name: "小程序导航" }).getByRole("button", { name: "我的" }).click();
  await page.getByRole("button", { name: "本串证书" }).click();
  await trigger.click();
  await expect(drawer.getByRole("heading", { name: "我的手串 · 页面 PRD", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "关闭 PRD", exact: true }).first().click();
  await page.getByRole("button", { name: "返回" }).click();
  await page.getByRole("navigation", { name: "小程序导航" }).getByRole("button", { name: "首页" }).click();

  await page.getByRole("button", { name: "开始问帖" }).click();
  await expect(page.getByRole("button", { name: "微信授权并继续" })).toBeVisible();
  await page.locator(".product-doc-review-trigger").click();
  await expect(drawer.getByRole("heading", { name: "登录确认层 · 页面 PRD", exact: true })).toBeVisible();
});

test("product document drawer navigates, closes, and leaves the phone operable", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  const trigger = page.getByRole("button", { name: "查看首页 · 页面 PRD" });
  await trigger.click();
  const drawer = page.getByRole("dialog", { name: "首页 · 页面 PRD" });
  await page.waitForTimeout(250);

  const geometry = await page.evaluate(() => {
    const productDrawer = document.querySelector<HTMLElement>(".product-doc-review-drawer")!.getBoundingClientRect();
    const body = document.querySelector<HTMLElement>(".product-doc-review-body")!;
    const footer = document.querySelector<HTMLElement>(".product-doc-review-footer")!.getBoundingClientRect();
    return { drawerLeft: productDrawer.left, drawerWidth: productDrawer.width, drawerTop: productDrawer.top, drawerHeight: productDrawer.height, bodyScrollable: body.scrollHeight > body.clientHeight, footerBottom: window.innerHeight - footer.bottom };
  });
  expect(geometry).toMatchObject({ drawerLeft: 880, drawerWidth: 720, drawerTop: 0, drawerHeight: 1000, bodyScrollable: true, footerBottom: 0 });

  await page.getByTestId("product-doc-review-mask").click({ position: { x: 20, y: 20 } });
  await expect(drawer).toBeHidden();
  await expect(trigger).toBeFocused();

  await page.getByTestId("device-picker").click();
  await page.getByTestId("device-option-pixel-10").click();
  await expect(page.getByTestId("device-screen")).toHaveAttribute("data-device", "pixel-10");

  await trigger.click();
  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
  await expect(trigger).toBeFocused();
});


for (const device of ["iphone", "pixel-10"]) {
  test(`provenance replaces knowledge with the six source stages on ${device}`, async ({ page }) => {
    test.setTimeout(40000);
    await page.getByTestId("device-picker").click();
    await page.getByTestId(`device-option-${device}`).click();
    const services = page.locator('[data-home-section="home-services"]');
    await expect(services.locator("strong")).toHaveText(["证书查询", "佩戴养护", "防伪溯源", "认种沉香树"]);
    await page.getByTestId("home-provenance-link").click();
    const current = page.getByTestId("flow-current");
    const detail = current.locator(".provenance-detail");
    await expect(detail).toContainText("GKCX-20260915");
    await expect(detail.getByText("原型演示数据 · 芯片 UID 待补充", { exact: true })).toHaveCount(0);
    await expect(detail.locator(".provenance-stage h3")).toHaveText(["种苗培育", "种植管理", "打孔造香", "采收取香", "精工淳化", "成品成串"]);
    await expect.poll(() => current.evaluate(el => Math.abs(new DOMMatrix(getComputedStyle(el).transform).m41))).toBeLessThan(0.1);
    await page.addStyleTag({ content: ".mobile-cursor { display:none !important; }" });
    await page.getByTestId("device-screen").screenshot({ path: `audit/provenance-restored-2026-09-15/${device}.png` });
    for (const [index, expected] of [[0, "GK-YM-2018-03"], [1, "担杆岭"], [2, "2023 年 6 月"], [3, "温国波"], [4, "约 90 天"], [5, "2026 年 9 月 10 日"]] as const) {
      const stage = detail.locator(".provenance-stage").nth(index);
      await expect(stage.locator("details, summary")).toHaveCount(0);
      await stage.locator("dl").scrollIntoViewIfNeeded();
      await expect(stage.locator("dl")).toBeVisible();
      await expect(stage.locator("dl")).toContainText(expected);
      if (index === 2 || index === 5) await page.getByTestId("device-screen").screenshot({ path: `audit/provenance-restored-2026-09-15/${device}-stage-${index + 1}.png` });

    }
    for (const photo of await detail.locator("img").all()) {
      await photo.scrollIntoViewIfNeeded();
      await expect.poll(() => photo.evaluate(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0)).toBe(true);
    }
    expect(await detail.evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
    await expect(current.getByRole("button", { name: "查看本串证书", exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "返回", exact: true }).click();
    await expect(page.getByTestId("home-provenance-link")).toBeVisible();
    await page.getByRole("button", { name: "查看更多知识文章" }).click();
    await expect(page.getByRole("heading", { name: "沉香知识", exact: true })).toBeVisible();
  });
}

test("certificate details omit provenance links for present and missing originals", async ({ page }) => {
  await page.getByRole("navigation", { name: "小程序导航" }).getByRole("button", { name: "我的" }).click();
  await page.getByRole("button", { name: "本串证书" }).click();
  for (const name of ["奇楠沉香算盘珠手串", "琼南蜜韵沉香手串", "岭南雅韵沉香手串"]) {
    const current = page.getByTestId("flow-current");
    await current.getByRole("button", { name: new RegExp(name) }).click();
    await expect(current.locator(".material-certificate-detail")).toContainText(name);
    await expect(current.getByRole("button", { name: "查看防伪溯源", exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "返回", exact: true }).click();
    await expect(page.getByRole("heading", { name: "我的手串", exact: true })).toBeVisible();
  }
});
