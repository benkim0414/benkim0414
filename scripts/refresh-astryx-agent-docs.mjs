import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

import {
  checkAstryxAgentDocs,
  extractAstryxBlock,
  formatError,
  resolveRepoPath,
} from './check-astryx-agent-docs.mjs';

const SCRIPT_DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_REPO_ROOT = resolve(SCRIPT_DIR, '..');
const DEFAULT_TARGET = 'apps/github.io/AGENTS.md';

export function refreshAstryxAgentDocs({
  repoRoot = DEFAULT_REPO_ROOT,
  targetRelativePath = DEFAULT_TARGET,
} = {}) {
  const targetPath = resolveRepoPath(repoRoot, targetRelativePath);
  if (!existsSync(targetPath)) {
    throw new Error(
      `${targetRelativePath} must already exist so refresh preserves its handwritten guidance.`,
    );
  }
  const current = readFileSync(targetPath, 'utf8');
  if (current.includes('ASTRYX:START') || current.includes('ASTRYX:END')) {
    extractAstryxBlock(current, targetRelativePath);
  }
  const cliPath = join(
    repoRoot,
    'node_modules/@astryxdesign/cli/clients/cli/bin/astryx.mjs',
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

  try {
    checkAstryxAgentDocs({ repoRoot, targetRelativePath });
  } catch (error) {
    throw new Error(
      `Astryx refresh postcondition failed for ${targetRelativePath}.`,
      { cause: error },
    );
  }
}

const invokedPath = process.argv[1]
  ? pathToFileURL(resolve(process.argv[1])).href
  : undefined;
if (invokedPath === import.meta.url) {
  try {
    if (process.argv.length > 2) {
      throw new Error(
        `Astryx agent-doc refresh does not accept a target; it always refreshes ${DEFAULT_TARGET}.`,
      );
    }
    refreshAstryxAgentDocs({
      repoRoot: process.cwd(),
    });
  } catch (error) {
    console.error(formatError(error));
    process.exitCode = 1;
  }
}
