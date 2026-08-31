import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { rename, unlink, writeFile } from "node:fs/promises";
import net from "node:net";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const probePath = path.join(projectRoot, "src", "__vite_watch_probe__.ts");
const replacementPath = `${probePath}.next`;

async function reservePort() {
  const server = net.createServer();
  await new Promise((resolve, reject) => server.listen(0, "127.0.0.1", resolve).once("error", reject));
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;
  await new Promise(resolve => server.close(resolve));
  return port;
}

async function waitFor(check, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await check()) return true;
    await new Promise(resolve => setTimeout(resolve, 80));
  }
  return false;
}

test("development preview observes an editor-style atomic source save", async () => {
  const port = await reservePort();
  const url = `http://127.0.0.1:${port}/src/__vite_watch_probe__.ts`;
  await writeFile(probePath, 'export const marker = "before-save";\n');

  const vite = spawn("npm", ["run", "dev", "--", "--host", "127.0.0.1", "--port", String(port), "--strictPort"], {
    cwd: projectRoot,
    env: { ...process.env, FORCE_COLOR: "0" },
    stdio: "ignore",
  });

  try {
    const started = await waitFor(async () => {
      try { return (await fetch(url)).ok; } catch { return false; }
    }, 10_000);
    assert.equal(started, true, "Vite preview did not start");

    const initial = await (await fetch(url)).text();
    assert.match(initial, /before-save/);

    await writeFile(replacementPath, 'export const marker = "after-save";\n');
    await rename(replacementPath, probePath);

    const updated = await waitFor(async () => {
      try { return /after-save/.test(await (await fetch(url)).text()); } catch { return false; }
    }, 2_000);
    assert.equal(updated, true, "Vite kept serving the transformed module from before the editor save");
  } finally {
    vite.kill("SIGTERM");
    await Promise.allSettled([unlink(probePath), unlink(replacementPath)]);
  }
});
