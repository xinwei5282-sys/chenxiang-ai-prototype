import { expect, test } from "@playwright/test";

const STORAGE_KEY = "guangken-bracelet-bindings-v1";
const first = "cx-2018-072";
const second = "cx-2024-116";

test.setTimeout(40000);

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate((key) => localStorage.setItem(key, JSON.stringify({ boundIds: [], activeId: null })), STORAGE_KEY);
  await page.reload();
});

async function scan(page: import("@playwright/test").Page, id: string) {
  await page.getByLabel("模拟识别的手串").selectOption(id);
  await page.getByRole("button", { name: "模拟 NFC 识别" }).click();
}

async function confirmBinding(page: import("@playwright/test").Page, firstAuthorization = true) {
  await expect(page.getByRole("heading", { name: "是否绑定这串手串？" })).toBeVisible();
  await page.getByRole("button", { name: "确认绑定" }).click();
  if (firstAuthorization) {
    await expect(page.getByRole("heading", { name: "需要微信授权" })).toBeVisible();
    await page.getByRole("button", { name: "微信授权并绑定" }).click();
  }
  await expect(page.getByRole("status")).toHaveText("绑定成功");
}

test("拒绝绑定和取消微信授权都不写入绑定关系", async ({ page }) => {
  await scan(page, first);
  await page.getByRole("heading", { name: "是否绑定这串手串？" }).waitFor();
  await page.getByRole("button", { name: "暂不绑定" }).click();
  await expect(page.getByRole("heading", { name: "是否绑定这串手串？" })).toHaveCount(0);
  await expect(page.getByTestId("flow-current")).toHaveAttribute("data-flow-screen", "home");

  await scan(page, first);
  await page.getByRole("button", { name: "确认绑定" }).click();
  await expect(page.getByRole("heading", { name: "需要微信授权" })).toBeVisible();
  await page.getByRole("button", { name: "取消" }).click();
  await expect(page.getByRole("status").filter({ hasText: "绑定成功" })).toHaveCount(0);
  const rejectedStorage = await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);
  expect(rejectedStorage === null || rejectedStorage === "{}" || JSON.parse(rejectedStorage).boundIds?.length === 0).toBe(true);
});

test("授权绑定后刷新仍保持当前手串，重复识别不重复加入", async ({ page }) => {
  await scan(page, first);
  await confirmBinding(page);
  await expect(page.locator(".home-collection")).toContainText("奇楠沉香算盘珠手串");
  await page.reload();
  await expect(page.locator(".home-collection")).toContainText("奇楠沉香算盘珠手串");
  await scan(page, first);
  await expect(page.getByRole("status")).toHaveText(/已绑定|无需重复绑定/);
  const saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || "{}"), STORAGE_KEY);
  expect(saved.boundIds).toEqual([first]);
});

test("多串首页入口和列表记录按手串隔离证书与溯源", async ({ page }) => {
  await scan(page, first); await confirmBinding(page);
  await scan(page, second); await confirmBinding(page, false);
  await page.getByTestId("home-certificate-link").click();
  const current = page.getByTestId("flow-current");
  await expect(current.getByText("证书原件待补充", { exact: true })).toBeVisible();
  await expect(current.getByText("证书原件已收录", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "返回" }).click();
  await page.getByTestId("home-provenance-link").click();
  await expect(page.getByTestId("flow-current").getByText("本串溯源信息待补充", { exact: true })).toBeVisible();
  await expect(page.getByTestId("flow-current").getByText("种植管理", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "返回" }).click();
  await page.getByRole("button", { name: "我的", exact: true }).click();
  await page.locator(".profile-banner-actions").getByRole("button", { name: "我的手串", exact: true }).click();
  const rows = page.locator(".bracelet-swipe-row");
  await expect(rows).toHaveCount(2);
  await expect(rows.filter({ has: page.getByText("奇楠沉香算盘珠手串", { exact: true }) })).toHaveCount(1);
  await expect(rows.filter({ hasText: "原件待补充" })).toHaveCount(1);
  await rows.filter({ hasText: "原件待补充" }).locator(".certificate-list-row").click();
  await expect(page.locator(".certificate-list")).toBeVisible();
});

test("列表行点击不跳二级页，左滑取消与确认删除同步空态并可再绑定", async ({ page }) => {
  await scan(page, first); await confirmBinding(page);
  await scan(page, second); await confirmBinding(page, false);
  await page.getByRole("button", { name: "我的", exact: true }).click();
  await page.locator(".profile-banner-actions").getByRole("button", { name: "我的手串", exact: true }).click();
  const row = page.locator(`.bracelet-swipe-row[data-bracelet-id="${second}"]`);
  await row.locator(".certificate-list-row").click();
  await expect(page.locator(".certificate-list")).toBeVisible();
  const rowBox = await row.boundingBox();
  expect(rowBox).not.toBeNull();
  await page.mouse.move(rowBox!.x + rowBox!.width / 2, rowBox!.y + rowBox!.height / 2);
  await page.mouse.down();
  await page.mouse.move(rowBox!.x + rowBox!.width / 2 - 150, rowBox!.y + rowBox!.height / 2, { steps: 8 });
  await page.mouse.up();
  await expect(row).toHaveAttribute("data-open", "true");
  await row.getByRole("button", { name: /删除/ }).click();
  await expect(page.getByRole("heading", { name: "删除这串手串？" })).toBeVisible();
  await page.getByRole("button", { name: "取消" }).click();
  await expect(row).toBeVisible();
  await expect(row).toHaveAttribute("data-open", "true");
  await row.getByRole("button", { name: /删除/ }).click();
  await page.getByRole("button", { name: "确认删除" }).click();
  await expect(page.locator(".bracelet-swipe-row")).toHaveCount(1);
  const savedAfterFirstDelete = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || "{}"), STORAGE_KEY);
  expect(savedAfterFirstDelete.boundIds).toEqual([first]);
  expect(savedAfterFirstDelete.activeId).toBe(first);
  const lastRow = page.locator(`.bracelet-swipe-row[data-bracelet-id="${first}"]`);
  await expect(page.getByTestId("sheet-overlay")).toHaveCount(0);
  const lastBox = await lastRow.boundingBox();
  expect(lastBox).not.toBeNull();
  await page.mouse.move(lastBox!.x + lastBox!.width / 2, lastBox!.y + lastBox!.height / 2);
  await page.mouse.down();
  await page.mouse.move(lastBox!.x + lastBox!.width / 2 - 150, lastBox!.y + lastBox!.height / 2, { steps: 8 });
  await page.mouse.up();
  await expect(lastRow).toHaveAttribute("data-open", "true");
  await lastRow.getByRole("button", { name: /删除/ }).click();
  await page.getByRole("button", { name: "确认删除" }).click();
  await expect(page.locator(".bracelet-swipe-row")).toHaveCount(0);
  const savedAfterLastDelete = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || "{}"), STORAGE_KEY);
  expect(savedAfterLastDelete.boundIds).toEqual([]);
  expect(savedAfterLastDelete.activeId).toBeNull();
  await page.getByRole("button", { name: "返回", exact: true }).click();
  await page.getByRole("button", { name: "首页", exact: true }).click();
  await expect(page.getByText("暂未绑定手串", { exact: true })).toBeVisible();
  await scan(page, first); await confirmBinding(page, false);
  await expect(page.locator(".home-collection")).toContainText("奇楠沉香算盘珠手串");
});

test("首页多串左滑切换同步证书溯源并保留每串下载和档案", async ({ page }) => {
  await scan(page, first); await confirmBinding(page);
  await scan(page, second); await confirmBinding(page, false);
  const collection = page.locator('.home-collection');
  await expect(collection.locator('.collection-card')).toHaveCount(2);
  await collection.getByRole('button', { name: '切换到奇楠沉香算盘珠手串' }).click();
  await expect(collection.locator('.collection-card[data-active="true"]')).toHaveAttribute('data-bracelet-id', first);
  const firstCard = collection.locator(`[data-bracelet-id="${first}"]`);
  const downloaded = page.waitForEvent('download');
  await firstCard.getByRole('link', { name: /导出.*电子证书/ }).click();
  expect((await downloaded).suggestedFilename()).toBe('奇楠沉香算盘珠手串-ZHTC26063030124.jpg');
  await firstCard.getByRole('button', { name: /查看.*档案/ }).click();
  await expect(page.locator('.collection-archive')).toContainText('ZHTC26063030124');
  await page.getByRole('button', { name: '返回', exact: true }).click();
  await expect(collection.locator('.collection-carousel')).toBeVisible();
  const box = await collection.locator('.collection-carousel').boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x + box!.width * .85, box!.y + box!.height * .65);
  await page.mouse.down();
  await page.mouse.move(box!.x + box!.width * .15, box!.y + box!.height * .65, { steps: 12 });
  await page.mouse.up();
  await expect(collection.locator('.collection-card[data-active="true"]')).toHaveAttribute('data-bracelet-id', second);
  await page.getByTestId('device-screen').screenshot({ path: 'audit/nfc-binding-2026-09-20/multiple-bracelets.png' });
  const secondCard = collection.locator(`[data-bracelet-id="${second}"]`);
  await expect(secondCard.getByRole('link')).toHaveCount(0);
  await secondCard.getByRole('button', { name: /查看.*档案/ }).click();
  await expect(page.locator('.collection-archive')).toContainText('琼南蜜韵沉香手串');
  await expect(page.locator('.collection-archive')).not.toContainText('ZHTC26063030124');
  await page.getByRole('button', { name: '返回', exact: true }).click();
  await page.getByTestId('home-certificate-link').click();
  await expect(page.locator('.material-certificate-detail')).toContainText('证书原件待补充');
  await page.getByRole('button', { name: '返回', exact: true }).click();
  await page.getByTestId('home-provenance-link').click();
  await expect(page.locator('.provenance-detail')).toContainText('本串溯源信息待补充');
  await page.reload();
  await expect(collection.locator('.collection-card[data-active="true"]')).toHaveAttribute('data-bracelet-id', second);
});

test("无绑定和未知识别均不回退到示例证书，有效链接只提示绑定", async ({ page }) => {
  await page.getByTestId('home-certificate-link').click();
  await expect(page.locator('.material-certificate-detail')).toHaveCount(0);
  await expect(page.getByRole('status')).toContainText('请先通过 NFC');
  await page.goto('/?nfc=unknown-bracelet');
  await expect(page.getByRole('status')).toContainText('未识别到有效手串');
  await expect(page.getByRole('heading', { name: '是否绑定这串手串？' })).toHaveCount(0);
  await page.goto('/?nfc=cx-2018-072');
  await expect(page.getByRole('heading', { name: '是否绑定这串手串？' })).toBeVisible();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key) || "{}").boundIds, STORAGE_KEY)).toEqual([]);
});

test("初次预览有已绑定数据，证书与五站溯源可直接查看且删除空态不会被覆盖", async ({ page }) => {
  await page.evaluate(key => localStorage.removeItem(key), STORAGE_KEY);
  await page.reload();
  await expect(page.locator('.collection-card[data-active="true"]')).toHaveAttribute('data-bracelet-id', first);
  await page.getByTestId('home-certificate-link').click();
  await expect(page.locator('.material-certificate-detail')).toContainText('ZHTC26063030124');
  await page.getByRole('button', { name: '返回', exact: true }).click();
  await page.getByTestId('home-provenance-link').click();
  await expect(page.locator('.provenance-stage')).toHaveCount(5);
  await page.evaluate(key => localStorage.setItem(key, JSON.stringify({ boundIds: [], activeId: null })), STORAGE_KEY);
  await page.reload();
  await expect(page.getByText('暂未绑定手串', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '查看已绑定示例', exact: true }).click();
  await expect(page.locator('.collection-card[data-active="true"]')).toHaveAttribute('data-bracelet-id', first);
  await page.reload();
  await expect(page.locator('.collection-card[data-active="true"]')).toHaveAttribute('data-bracelet-id', first);
});

test("已有藏品时默认模拟未绑定手串，窄窗口也能打开识别场景", async ({ page }) => {
  await page.evaluate(key => localStorage.removeItem(key), STORAGE_KEY);
  await page.reload();
  await expect(page.getByLabel('模拟识别的手串')).toHaveValue(second);
  await page.getByRole('button', { name: '模拟 NFC 识别', exact: true }).click();
  await expect(page.getByRole('heading', { name: '是否绑定这串手串？' })).toBeVisible();
  await page.getByRole('button', { name: '暂不绑定', exact: true }).click();
  await expect(page.locator('.collection-card[data-active="true"]')).toHaveAttribute('data-bracelet-id', first);
  await page.setViewportSize({ width: 800, height: 900 });
  await page.reload();
  const toggle = page.getByRole('button', { name: 'NFC 模拟场景', exact: true });
  await expect(toggle).toBeInViewport();
  await toggle.click();
  await expect(page.getByRole('button', { name: '模拟 NFC 识别', exact: true })).toBeInViewport();
  await page.getByRole('button', { name: '模拟 NFC 识别', exact: true }).click();
  await expect(page.getByRole('heading', { name: '是否绑定这串手串？' })).toBeVisible();
});
