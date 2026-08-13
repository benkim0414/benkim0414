import {existsSync, mkdtempSync, readFileSync, rmSync} from 'node:fs';
import {dirname, isAbsolute, join, relative, resolve, sep} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';

export const ASTRYX_MARKER_START = '<!-- ASTRYX:START -->';
export const ASTRYX_MARKER_END = '<!-- ASTRYX:END -->';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const DEFAULT_REPO_ROOT = resolve(SCRIPT_DIR, '..');
const DEFAULT_TARGET = 'apps/github.io/AGENTS.md';
const TEMP_PREFIX = '.astryx-agent-docs-check-';

function countOccurrences(content, marker) {
  return content.split(marker).length - 1;
}

export function extractAstryxBlock(content, label) {
  const starts = countOccurrences(content, ASTRYX_MARKER_START);
  const ends = countOccurrences(content, ASTRYX_MARKER_END);
  const startIndex = content.indexOf(ASTRYX_MARKER_START);
  const endIndex = content.indexOf(ASTRYX_MARKER_END);

  if (starts !== 1 || ends !== 1 || endIndex < startIndex) {
    throw new Error(
      `${label} must contain exactly one complete Astryx managed block. ` +
        'Run `pnpm astryx:agents` to regenerate it.',
    );
  }

  return content.slice(startIndex, endIndex + ASTRYX_MARKER_END.length);
}

export function resolveRepoPath(repoRoot, relativePath) {
  if (isAbsolute(relativePath)) {
    throw new Error(`Target must stay inside the repository: ${relativePath}`);
  }

  const absolutePath = resolve(repoRoot, relativePath);
  const fromRoot = relative(repoRoot, absolutePath);
  if (fromRoot === '..' || fromRoot.startsWith(`..${sep}`)) {
    throw new Error(`Target must stay inside the repository: ${relativePath}`);
  }

  return absolutePath;
}

export function generateExpectedAgentDocs({repoRoot, outputRelativePath}) {
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
      outputRelativePath,
    ],
    {cwd: repoRoot, encoding: 'utf8'},
  );

  if (result.error) {
    throw new Error(`Astryx CLI failed to start: ${result.error.message}`);
  }
  if (result.status !== 0) {
    const diagnostic = [result.stdout, result.stderr].filter(Boolean).join('\n');
    throw new Error(`Astryx CLI failed (${result.status}).\n${diagnostic}`);
  }
}

export function checkAstryxAgentDocs({
  repoRoot = DEFAULT_REPO_ROOT,
  targetRelativePath = DEFAULT_TARGET,
  generateExpected = generateExpectedAgentDocs,
} = {}) {
  const targetPath = resolveRepoPath(repoRoot, targetRelativePath);
  const checkedIn = extractAstryxBlock(
    readFileSync(targetPath, 'utf8'),
    targetRelativePath,
  );
  const tempDir = mkdtempSync(join(repoRoot, TEMP_PREFIX));
  let primaryError;

  try {
    const expectedPath = join(tempDir, 'AGENTS.md');
    const outputRelativePath = relative(repoRoot, expectedPath);
    generateExpected({repoRoot, outputRelativePath});
    const expected = extractAstryxBlock(
      readFileSync(expectedPath, 'utf8'),
      outputRelativePath,
    );

    if (checkedIn !== expected) {
      throw new Error(
        `Astryx agent docs are stale in ${targetRelativePath}. ` +
          'Run `pnpm astryx:agents` and commit the updated block.',
      );
    }
  } catch (error) {
    primaryError = error;
  }

  try {
    rmSync(tempDir, {recursive: true, force: true});
  } catch (cleanupError) {
    const message = `Failed to clean temporary Astryx docs at ${tempDir}: ${cleanupError.message}`;
    if (primaryError) {
      throw new AggregateError([primaryError, cleanupError], message);
    }
    throw new Error(message, {cause: cleanupError});
  }

  if (primaryError) {
    throw primaryError;
  }
}

const invokedPath = process.argv[1]
  ? pathToFileURL(resolve(process.argv[1])).href
  : undefined;

if (invokedPath === import.meta.url) {
  const targetRelativePath = process.argv[2] ?? DEFAULT_TARGET;
  try {
    checkAstryxAgentDocs({targetRelativePath});
    console.log(`Astryx agent docs are current: ${targetRelativePath}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
