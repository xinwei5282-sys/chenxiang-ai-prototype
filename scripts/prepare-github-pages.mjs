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

export async function prepareGitHubPages({ distDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../dist/client") } = {}) {
  const indexFile = path.join(distDir, "index.html");
  const assetsDir = path.join(distDir, "assets");
  for (const target of [indexFile, assetsDir]) {
    await access(target).catch(() => { throw new Error(`Missing GitHub Pages build input: ${target}`); });
  }
  let rewrittenFiles = 0;
  for (const file of await collectTextFiles(distDir)) {
    const before = await readFile(file, "utf8");
    const after = rewriteAssetRoots(before);
    if (after !== before) { await writeFile(file, after); rewrittenFiles += 1; }
    ROOT_ASSET_PATTERN.lastIndex = 0;
    if (ROOT_ASSET_PATTERN.test(after)) { ROOT_ASSET_PATTERN.lastIndex = 0; throw new Error(`Unresolved root asset URL in ${file}`); }
    ROOT_ASSET_PATTERN.lastIndex = 0;
  }
  return { distDir, rewrittenFiles };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await prepareGitHubPages();
  console.log(`Prepared GitHub Pages artifact: ${result.distDir} (${result.rewrittenFiles} files rewritten)`);
}
