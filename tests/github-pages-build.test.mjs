import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { PAGES_BASE, prepareGitHubPages, rewriteAssetRoots } from "../scripts/prepare-github-pages.mjs";

test("rewrites only root asset URLs", () => {
  const input = ['src="/assets/logo.png"', "url(/assets/frame.png)", 'src="/chenxiang-ai-prototype/assets/ready.png"', 'src="https://cdn.example.com/assets/remote.png"'].join("\n");
  const once = rewriteAssetRoots(input);
  assert.equal(PAGES_BASE, "/chenxiang-ai-prototype");
  assert.match(once, /\/chenxiang-ai-prototype\/assets\/logo\.png/);
  assert.match(once, /\/chenxiang-ai-prototype\/assets\/frame\.png/);
  assert.match(once, /https:\/\/cdn\.example\.com\/assets\/remote\.png/);
});

test("keeps prepared asset URLs unchanged", () => {
  const prepared = 'src="/chenxiang-ai-prototype/assets/ready.png"';
  assert.equal(rewriteAssetRoots(prepared), prepared);
});

test("prepares a fixture artifact", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "chenxiang-pages-"));
  const distDir = path.join(root, "client");
  try {
    await mkdir(path.join(distDir, "assets"), { recursive: true });
    await writeFile(path.join(distDir, "index.html"), '<img src="/assets/logo.png">');
    await writeFile(path.join(distDir, "assets", "app.js"), 'const icon="/assets/icon.svg";');
    const result = await prepareGitHubPages({ distDir });
    assert.equal(result.rewrittenFiles, 2);
    assert.doesNotMatch(await readFile(path.join(distDir, "index.html"), "utf8"), /src="\/assets\//);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("rejects an artifact with missing inputs", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "chenxiang-pages-missing-"));
  try { await assert.rejects(prepareGitHubPages({ distDir: path.join(root, "client") }), /Missing GitHub Pages build input/); }
  finally { await rm(root, { recursive: true, force: true }); }
});
