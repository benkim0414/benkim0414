import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

import {
  ASTRYX_MARKER_END,
  ASTRYX_MARKER_START,
  extractAstryxBlock,
  repairAstryxAgentDocs,
  resolveRepoPath,
} from './check-astryx-agent-docs.mjs';

const SCRIPT_DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_REPO_ROOT = resolve(SCRIPT_DIR, '..');
const DEFAULT_TARGET = 'apps/github.io/AGENTS.md';

export function refreshAstryxAgentDocs({
  repoRoot = DEFAULT_REPO_ROOT,
  targetRelativePath = DEFAULT_TARGET,
} = {}) {
  resolveRepoPath(repoRoot, targetRelativePath);
  const targetPath = resolve(repoRoot, targetRelativePath);
  if (existsSync(targetPath)) {
    const current = readFileSync(targetPath, 'utf8');
    try {
      extractAstryxBlock(current, targetRelativePath);
    } catch {
      if (
        current.includes(ASTRYX_MARKER_START) ||
        current.includes(ASTRYX_MARKER_END)
      ) {
        writeFileSync(targetPath, repairAstryxAgentDocs(current));
      }
    }
  }
  const cliPath = join(
    repoRoot,
    'node_modules/@astryxdesign/cli/bin/astryx.mjs',
  );
  if (!existsSync(cliPath)) {
    throw new Error(
      `Astryx CLI executable is missing at ${cliPath}. Run \`pnpm install --frozen-lockfile\`.`,
    );
  }
  const result = spawnSync(
    process.execPath,
    [
      cliPath,
      'init',
      '--features',
      'agents',
      '--agent-docs-path',
      targetRelativePath,
    ],
    { cwd: repoRoot, encoding: 'utf8' },
  );
  if (result.error) {
    throw new Error(`Astryx CLI failed to start: ${result.error.message}`);
  }
  if (result.status !== 0) {
    const diagnostic = [result.stdout, result.stderr]
      .filter(Boolean)
      .join('\n');
    throw new Error(`Astryx CLI failed (${result.status}).\n${diagnostic}`);
  }
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
}

const invokedPath = process.argv[1]
  ? pathToFileURL(resolve(process.argv[1])).href
  : undefined;
if (invokedPath === import.meta.url) {
  try {
    refreshAstryxAgentDocs({
      targetRelativePath: process.argv[2] ?? DEFAULT_TARGET,
    });
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
