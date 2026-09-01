# GitHub Pages 在线预览设计

日期：2026-09-01
状态：待实施
仓库：`xinwei5282-sys/chenxiang-ai-prototype`

## 1. 目标

为当前公开 GitHub 仓库提供可直接访问的在线原型预览：

`https://xinwei5282-sys.github.io/chenxiang-ai-prototype/`

每次 `main` 分支更新后，GitHub Actions 自动执行校验、构建并发布 GitHub Pages。发布不得改变现有本地预览地址、手机模型运行时或产品页面行为。

## 2. 方案选择

采用 GitHub Actions 官方 Pages 工作流，不维护独立 `gh-pages` 分支，也不提交 `dist/` 构建产物。

工作流分为两个阶段：

1. `build`：检出代码、安装锁定依赖、检查受保护运行时、构建 Pages 静态文件、上传 Pages artifact。
2. `deploy`：使用 GitHub Pages 官方部署 Action 发布 artifact，并返回最终页面地址。

## 3. 子路径兼容

GitHub Pages 项目站点运行在 `/chenxiang-ai-prototype/` 子路径。当前应用包含两类资源：

- Vite 管理的入口、JS、CSS 和字体；
- 运行时写入的 `/assets/...` 图片、设备外框、状态栏图标和演示 PDF。

Pages 构建使用 Vite 的 `--base /chenxiang-ai-prototype/` 处理入口和打包资源；随后运行独立的 Pages 构建整理脚本，仅在 `dist/client` 中把剩余的根路径 `/assets/...` 重写为 `/chenxiang-ai-prototype/assets/...`。

该处理只作用于部署产物，不修改 `src/mobile/` 等受保护运行时源码，也不改变本地开发和普通生产构建行为。

整理脚本同时执行静态断言：如果 HTML、CSS 或 JS 中仍存在未适配的根路径资源，构建失败，阻止错误版本发布。

## 4. 项目改动

- `package.json`
  - 新增 `build:pages`，串联运行时检查、TypeScript、Vite Pages 构建和子路径整理。
- `scripts/prepare-github-pages.mjs`
  - 重写 Pages artifact 中的根路径资源。
  - 校验入口文件和资源目录存在。
  - 校验不存在遗留 `/assets/` 根路径。
- `.github/workflows/deploy-pages.yml`
  - 监听 `main` 推送和手动触发。
  - 使用最小必要权限：`contents: read`、`pages: write`、`id-token: write`。
  - 对同一 Pages 环境启用并发取消，避免旧构建覆盖新构建。
- `tests/github-pages-build.test.mjs`
  - 验证 Pages 构建后的入口路径、静态资源路径和关键公开资产均指向仓库子路径。

## 5. 数据流

`main push` → GitHub Actions → `npm ci` → `npm run build:pages` → `dist/client` → Pages artifact → GitHub Pages → 在线预览地址。

应用本身仍为纯前端需求原型，不新增接口、账号、密钥、数据库或运行时服务。

## 6. 异常处理

- 依赖安装、受保护运行时校验、TypeScript 或构建失败：停止发布，保留上一版可用 Pages。
- 子路径重写或静态断言失败：停止发布，避免出现页面空白或图片缺失。
- GitHub Pages 部署失败：通过 Actions 日志定位，不回退或修改本地原型运行时。
- Pages 首次启用未完成：轮询工作流与 Pages 状态，直至成功或返回明确错误。

## 7. 验收标准

1. Pages 地址返回 HTTP 200，并展示完整手机原型而非空白页。
2. 首页主视觉、广垦沉香 Logo、手机外框、状态栏图标和藏品图片加载成功。
3. 右侧 `页面 / PRD` 入口可打开和关闭字段级抽屉。
4. 首页、问帖、我的三个核心入口可交互，浏览器控制台无资源 404 或 JavaScript 错误。
5. 本地 `npm run build` 和现有 58 项浏览器测试继续通过。
6. Pages 工作流在后续 `main` 推送时自动重新发布。

## 8. 非目标

- 不配置自定义域名。
- 不接入真实微信授权、AI 服务或后端接口。
- 不把 `dist/` 提交到 Git。
- 不创建或维护 `gh-pages` 分支。
- 不改变产品 UI、PRD 内容或移动端运行时结构。
