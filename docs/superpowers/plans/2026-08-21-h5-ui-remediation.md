# AI 手串 H5 UI 整改 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复 AI 手串移动端 H5 的键盘、焦点、安全区和可读性问题，并保持已确认的 B 方案视觉方向。

**Architecture:** 保留受保护的 `MobileRuntime` 与 `FlowStack`，在 `Prototype.tsx` 内增加业务级 H5 跳转准备逻辑，统一释放焦点和键盘；在 `prototype.css` 内完成页面级视觉整改。通过独立的 H5 Playwright 用例验证真实交互，不改动运行时锁定文件。

**Tech Stack:** React 19、TypeScript、Vite、Motion、Radix Dialog、Playwright。

**Spec:** `docs/superpowers/specs/2026-08-21-h5-ui-remediation-design.md`

## Global Constraints

- 页面是消费者扫码后直接访问的移动端 H5，不是原生 App。
- 只能修改业务页面 `src/Prototype.tsx`、`src/prototype.css` 和测试/文档文件。
- 保持 `reference/b-museum-credential.png` 的构图、配色和档案感。
- 使用 `AI传统文化解读`，不出现算命、改运、风水断言或医疗功效表达。
- 不增加登录、官网、驾驶舱或数字人。

---

### Task 1: 建立 H5 交互回归测试

**Files:**
- Create: `tests/prototype-h5.spec.ts`
- Modify: `playwright.config.ts`

**Interfaces:**
- Consumes: 现有 Vite 预览和移动运行时测试配置。
- Produces: 可验证路由、键盘、弹层和双设备状态的 Playwright 用例。

- [ ] 添加可选的 `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` 启动配置，不影响默认 Playwright 安装。
- [ ] 编写证书页和文化解读页测试：点击入口后键盘关闭、固定顶栏可见、首标题位于安全区下方。
- [ ] 编写 AI 顾问测试：弹层初始不弹键盘，输入后弹出，提交后收起并显示完整成功操作。
- [ ] 编写 Pixel 10 首页测试：切换设备后键盘关闭且核心入口可见。
- [ ] 运行新用例并确认在现有实现上按预期失败。

### Task 2: 修复 H5 跳转、焦点和键盘状态

**Files:**
- Modify: `src/Prototype.tsx`

**Interfaces:**
- Consumes: `useKeyboard()`、`FlowControls.push/pop`、`BottomSheet`。
- Produces: `prepareH5Transition(keyboard)` 和统一的业务跳转/提交行为。

- [ ] 在业务层增加跳转准备函数：释放 `document.activeElement` 并调用 `keyboard.hide()`。
- [ ] 首页所有详情入口在 `flow.push` 前调用准备函数；顾问弹层打开前同样调用。
- [ ] 顶栏返回按钮先释放焦点和键盘，再执行 `flow.pop()`。
- [ ] AI 顾问提交、关闭和返回首页时先收起键盘，再切换状态。
- [ ] 让详情页返回按钮成为新页面的焦点目标，并避免页面自动滚动。
- [ ] 运行 H5 回归用例，确认键盘与安全区用例通过。

### Task 3: 提升 H5 可读性与入口层级

**Files:**
- Modify: `src/Prototype.tsx`
- Modify: `src/prototype.css`

**Interfaces:**
- Consumes: 既有首页与详情页 DOM 类名。
- Produces: 更清楚的品牌栏、小字、详情正文和 AI 服务入口层级。

- [ ] 首页入口统一使用 `AI传统文化解读` 合规文案，并标记次主入口样式。
- [ ] 调整品牌栏占位，保证档案名称在 iPhone 宽度可读。
- [ ] 将核验说明、元数据、证书信息、时间线和文章正文提升到真机可读字号与对比度。
- [ ] 强化证书主入口，突出 AI 传统文化解读，弱化知识/顾问辅助入口。
- [ ] 为返回和信息按钮补充 H5 可见焦点样式，保持 44px 触控区。
- [ ] 检查首页构图仍与 B 方案一致，不增加新卡片或无关模块。

### Task 4: 完整验证与交付

**Files:**
- Update: `audit/ui-visual-2026-08-21/` 下的整改后截图和说明。

**Interfaces:**
- Consumes: 完成后的 H5 页面与测试。
- Produces: 构建结果、双设备截图和已知边界。

- [ ] 运行 `npm run check:runtime`，确认受保护运行时未变更。
- [ ] 运行 H5 Playwright 回归测试和现有站点测试。
- [ ] 运行 `npm run build`。
- [ ] 在真实 Chrome 中依次检查首页、证书、文化解读、顾问输入/成功和 Pixel 10 首页。
- [ ] 保存整改后截图，确认无破图、遮挡、异常键盘和控制台错误。

