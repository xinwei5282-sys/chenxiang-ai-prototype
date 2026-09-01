# GitHub Pages Preview Implementation Plan

> **For Codex execution:** This plan may be executed inline in the current session or step-by-step with explicit checkpoints. Keep checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the public `chenxiang-ai-prototype` repository at `https://xinwei5282-sys.github.io/chenxiang-ai-prototype/` through an automatic GitHub Actions Pages workflow without changing the local prototype runtime.

**Architecture:** Vite performs a dedicated Pages build with the repository subpath as its base. A small post-build module rewrites only remaining root `/assets/` references in `dist/client`, validates the artifact, and leaves protected source files untouched. A two-job GitHub Actions workflow builds and uploads the static artifact, then deploys it through the official Pages actions.

**Tech Stack:** Node.js 22, Node test runner, TypeScript 7, Vite 8, GitHub Actions, GitHub Pages

---

## File responsibility map

**Create**

- `scripts/prepare-github-pages.mjs`: transform and validate only the generated Pages artifact.
- `tests/github-pages-build.test.mjs`: unit and fixture-level coverage for rewriting, idempotence, and artifact validation; contract coverage for the npm command and workflow.
- `.github/workflows/deploy-pages.yml`: build and deploy the public Pages artifact from `main`.

**Modify**

- `package.json`: expose the deterministic `build:pages` command while preserving the existing `build` and local preview paths.

**Do not modify**

- `src/mobile/**`: protected mobile runtime remains byte-for-byte unchanged.
- `src/Prototype.tsx`, `src/prototype.css`, and `public/assets/**`: Pages adaptation happens after build, not in product source or assets.

### Task 1: Pages artifact transformer

**Files:**
- Create: `tests/github-pages-build.test.mjs`
- Create: `scripts/prepare-github-pages.mjs`

- [ ] **Step 1: Write the failing transformer tests**

Create tests that import `prepareGitHubPages` and `rewriteAssetRoots` before the module exists:

```js
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  PAGES_BASE,
  prepareGitHubPages,
  rewriteAssetRoots,
} from "../scripts/prepare-github-pages.mjs";

test("rewrites only root asset URLs and is idempotent", () => {
  const input = [
    'src="/assets/logo.png"',
    "url(/assets/frame.png)",
    'src="/chenxiang-ai-prototype/assets/ready.png"',
    'src="https://cdn.example.com/assets/remote.png"',
  ].join("\n");
  const once = rewriteAssetRoots(input);
  const twice = rewriteAssetRoots(once);

  assert.equal(PAGES_BASE, "/chenxiang-ai-prototype");
  assert.match(once, /\/chenxiang-ai-prototype\/assets\/logo\.png/);
  assert.match(once, /\/chenxiang-ai-prototype\/assets\/frame\.png/);
  assert.match(once, /https:\/\/cdn\.example\.com\/assets\/remote\.png/);
  assert.equal(twice, once);
});

test("prepares a fixture artifact and rejects missing inputs", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "chenxiang-pages-"));
  const distDir = path.join(root, "client");
  try {
    await mkdir(path.join(distDir, "assets"), { recursive: true });
    await writeFile(path.join(distDir, "index.html"), '<img src="/assets/logo.png">');
    await writeFile(path.join(distDir, "assets", "app.js"), 'const icon="/assets/icon.svg";');

    const result = await prepareGitHubPages({ distDir });
    assert.equal(result.rewrittenFiles, 2);
    assert.doesNotMatch(await readFile(path.join(distDir, "index.html"), "utf8"), /src="\/assets\//);
    await assert.rejects(
      prepareGitHubPages({ distDir: path.join(root, "missing") }),
      /Missing GitHub Pages build input/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `node --test tests/github-pages-build.test.mjs`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `scripts/prepare-github-pages.mjs`.

- [ ] **Step 3: Implement the minimal transformer**

Create `scripts/prepare-github-pages.mjs` with one exported pure rewriter and one filesystem boundary:

```js
#!/usr/bin/env node
import { access, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const PAGES_BASE = "/chenxiang-ai-prototype";
const ROOT_ASSET_PATTERN = /(?<![A-Za-z0-9_-])\/assets\//g;
const TEXT_EXTENSIONS = new Set([".html", ".css", ".js", ".mjs"]);

export function rewriteAssetRoots(source) {
  return source.replace(ROOT_ASSET_PATTERN, `${PAGES_BASE}/assets/`);
}

async function collectTextFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectTextFiles(target);
    return TEXT_EXTENSIONS.has(path.extname(entry.name)) ? [target] : [];
  }));
  return nested.flat();
}

export async function prepareGitHubPages({
  distDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../dist/client"),
} = {}) {
  const indexFile = path.join(distDir, "index.html");
  const assetsDir = path.join(distDir, "assets");
  for (const target of [indexFile, assetsDir]) {
    await access(target).catch(() => {
      throw new Error(`Missing GitHub Pages build input: ${target}`);
    });
  }

  let rewrittenFiles = 0;
  for (const file of await collectTextFiles(distDir)) {
    const before = await readFile(file, "utf8");
    const after = rewriteAssetRoots(before);
    if (after !== before) {
      await writeFile(file, after);
      rewrittenFiles += 1;
    }
    if (ROOT_ASSET_PATTERN.test(after)) {
      ROOT_ASSET_PATTERN.lastIndex = 0;
      throw new Error(`Unresolved root asset URL in ${file}`);
    }
    ROOT_ASSET_PATTERN.lastIndex = 0;
  }
  return { distDir, rewrittenFiles };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await prepareGitHubPages();
  console.log(`Prepared GitHub Pages artifact: ${result.distDir} (${result.rewrittenFiles} files rewritten)`);
}
```

- [ ] **Step 4: Run the focused test and verify it passes**

Run: `node --test tests/github-pages-build.test.mjs`

Expected: PASS, 2 tests.

- [ ] **Step 5: Commit the transformer**

```bash
git add tests/github-pages-build.test.mjs scripts/prepare-github-pages.mjs
git commit -m "test: cover GitHub Pages artifact preparation"
```

### Task 2: Pages build command and deployment workflow

**Files:**
- Modify: `tests/github-pages-build.test.mjs`
- Modify: `package.json`
- Create: `.github/workflows/deploy-pages.yml`

- [ ] **Step 1: Add failing configuration contract tests**

Append tests that load `package.json` and the workflow as text:

```js
test("defines a Pages build without changing the regular build", async () => {
  const pkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
  assert.equal(pkg.scripts.build, "tsc && vite build && node scripts/prepare-sites-build.mjs");
  assert.equal(
    pkg.scripts["build:pages"],
    "npm run check:runtime && tsc && vite build --base=/chenxiang-ai-prototype/ && node scripts/prepare-github-pages.mjs",
  );
});

test("deploy workflow uses the official Pages actions and minimum permissions", async () => {
  const workflow = await readFile(new URL("../.github/workflows/deploy-pages.yml", import.meta.url), "utf8");
  for (const required of [
    "actions/checkout@v6",
    "actions/setup-node@v6",
    "actions/configure-pages@v5",
    "actions/upload-pages-artifact@v4",
    "actions/deploy-pages@v4",
    "pages: write",
    "id-token: write",
    "npm run build:pages",
    "path: dist/client",
  ]) assert.match(workflow, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});
```

- [ ] **Step 2: Run the tests and verify the contract fails**

Run: `node --test tests/github-pages-build.test.mjs`

Expected: FAIL because `build:pages` and `.github/workflows/deploy-pages.yml` do not yet exist.

- [ ] **Step 3: Add the dedicated npm command**

Add exactly this script to `package.json` without changing the existing `build` script:

```json
"build:pages": "npm run check:runtime && tsc && vite build --base=/chenxiang-ai-prototype/ && node scripts/prepare-github-pages.mjs"
```

- [ ] **Step 4: Add the official two-job Pages workflow**

Create `.github/workflows/deploy-pages.yml`:

```yaml
name: Deploy GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v6
      - name: Set up Node
        uses: actions/setup-node@v6
        with:
          node-version: 22
          cache: npm
      - name: Install dependencies
        run: npm ci
      - name: Test Pages preparation
        run: node --test tests/github-pages-build.test.mjs
      - name: Build Pages artifact
        run: npm run build:pages
      - name: Configure Pages
        uses: actions/configure-pages@v5
      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v4
        with:
          path: dist/client

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy Pages artifact
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 5: Run the focused contract tests**

Run: `node --test tests/github-pages-build.test.mjs`

Expected: PASS, 4 tests.

- [ ] **Step 6: Build the real Pages artifact and inspect root references**

Run: `npm run build:pages`

Expected: PASS and log `Prepared GitHub Pages artifact: .../dist/client`.

Run: `rg -n '(src|href)="/assets/|url\(["'"']?/assets/|["'"']/assets/' dist/client --glob '*.html' --glob '*.css' --glob '*.js'`

Expected: no matches; `dist/client/index.html` references `/chenxiang-ai-prototype/assets/`.

- [ ] **Step 7: Commit the build and workflow**

```bash
git add package.json tests/github-pages-build.test.mjs .github/workflows/deploy-pages.yml
git commit -m "ci: deploy prototype to GitHub Pages"
```

### Task 3: Regression verification and publication

**Files:**
- Verify only: all tracked source and configuration files

- [ ] **Step 1: Verify the protected runtime**

Run: `npm run check:runtime`

Expected: PASS with all protected mobile runtime files matching the lock.

- [ ] **Step 2: Verify the normal production build remains intact**

Run: `npm run build`

Expected: PASS and prepare both `dist/client` and existing Sites packaging under `dist/server` and `dist/.openai`.

- [ ] **Step 3: Run the existing browser regression suite**

Run: `npm run test:runtime`

Expected: PASS, 58 tests.

- [ ] **Step 4: Review the final diff and worktree**

Run: `git diff origin/main...HEAD --check && git status --short --branch`

Expected: no whitespace errors; branch contains only the design, plan, transformer, test, package script, and Pages workflow changes.

- [ ] **Step 5: Push the public repository**

Run: `git push origin main`

Expected: the remote `main` advances and the `Deploy GitHub Pages` workflow starts.

### Task 4: Enable Pages and verify the live site

**Files:**
- External state only: GitHub repository Pages settings and Actions run

- [ ] **Step 1: Confirm or enable the Actions publishing source**

Run: `gh api repos/xinwei5282-sys/chenxiang-ai-prototype/pages`

Expected: `build_type` is `workflow`. If the endpoint returns 404, create the Pages site with `gh api --method POST repos/xinwei5282-sys/chenxiang-ai-prototype/pages -f build_type=workflow`; if it exists with another source, update it with `gh api --method PUT repos/xinwei5282-sys/chenxiang-ai-prototype/pages -f build_type=workflow`.

- [ ] **Step 2: Monitor the deployment workflow to a terminal state**

Run: `gh run list --repo xinwei5282-sys/chenxiang-ai-prototype --workflow deploy-pages.yml --limit 1`

Expected: one run for the pushed commit.

Run: `gh run watch <run-id> --repo xinwei5282-sys/chenxiang-ai-prototype --exit-status`

Expected: build and deploy jobs both complete successfully.

- [ ] **Step 3: Verify the public HTTP endpoint**

Run: `curl -I https://xinwei5282-sys.github.io/chenxiang-ai-prototype/`

Expected: HTTP 200.

- [ ] **Step 4: Verify the rendered product in an isolated browser**

Open `https://xinwei5282-sys.github.io/chenxiang-ai-prototype/` in Playwright Chromium and record console errors, failed requests, and responses with status 400 or above. Confirm the phone prototype, Guangken logo, hero image, and status/device assets render; click `页面 / PRD`, then enter the home, question, and profile flows.

Expected: no JavaScript errors or asset 404 responses; the PRD drawer opens; all three core entries remain interactive.

- [ ] **Step 5: Capture and inspect final evidence**

Save a full-page screenshot to `/private/tmp/chenxiang-github-pages-final.png` and inspect it visually.

Expected: the deployed page matches the verified local prototype composition and contains no blank device screen or missing-image placeholders.

