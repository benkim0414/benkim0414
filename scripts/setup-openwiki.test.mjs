import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const script = path.resolve("scripts/setup-openwiki.mjs");

test("installs an idempotent project integration with local resolution", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "openwiki-setup-test-"));
  const git = spawnSync("git", ["init", "--quiet", root], { encoding: "utf8" });
  assert.equal(git.status, 0, git.stderr);
  await mkdir(path.join(root, ".codex"), { recursive: true });
  await writeFile(path.join(root, ".codex", "config.toml"), "model = \"test\"\n");

  for (const expected of ["installed", "unchanged"]) {
    const result = spawnSync(process.execPath, [script, root], {
      cwd: root,
      encoding: "utf8",
    });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, new RegExp(`^${expected} Codex`, "m"));
  }

  const config = await readFile(path.join(root, ".codex", "config.toml"), "utf8");
  assert.match(config, /^model = "test"$/m);
  assert.match(config, /^command = "pnpm"$/m);
  assert.match(config, /^args = \["exec", "openwiki", "mcp", "--host", "codex"\]$/m);

  const receipt = JSON.parse(
    await readFile(path.join(root, ".agents", "skills", "openwiki", ".openwiki-install.json"), "utf8"),
  );
  assert.deepEqual(receipt.mcpServerCommand, {
    command: "pnpm",
    args: ["exec", "openwiki", "mcp", "--host", "codex"],
  });
});
