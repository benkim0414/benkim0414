import {
  existsSync,
  mkdtempSync,
  readFileSync,
  lstatSync,
  realpathSync,
  rmSync,
} from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

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

  if (starts === 0 && ends === 0) {
    throw new Error(
      `${label} is missing an Astryx managed block. ` +
        'Run `pnpm astryx:agents` to generate it.',
    );
  }

  if (starts !== 1 || ends !== 1 || endIndex < startIndex) {
    throw new Error(
      `${label} has malformed Astryx managed markers. Remove all ASTRYX:START and ASTRYX:END marker lines, then run pnpm astryx:agents.`,
    );
  }

  const lines = content.split('\n');
  let fence;
  for (const line of lines) {
    const trimmed = line.trimStart();
    const fenceMatch = /^( {0,3})(`{3,}|~{3,})(.*)$/.exec(line);
    if (fenceMatch) {
      const [, , run, info] = fenceMatch;
      if (!fence) {
        if (run[0] === '`' && info.includes('`')) continue;
        fence = { char: run[0], length: run.length };
      } else if (
        run[0] === fence.char &&
        run.length >= fence.length &&
        info.trim() === ''
      ) {
        fence = undefined;
      }
    }
    if (
      (line.includes(ASTRYX_MARKER_START) ||
        line.includes(ASTRYX_MARKER_END)) &&
      (fence || line.match(/^ {4}/))
    ) {
      throw new Error(
        `${label} has Astryx managed markers inside fenced or indented Markdown code. ` +
          'Remove all ASTRYX:START and ASTRYX:END marker lines, then run pnpm astryx:agents.',
      );
    }
  }

  return content.slice(startIndex, endIndex + ASTRYX_MARKER_END.length);
}

export function repairAstryxAgentDocs(content) {
  let repaired = content;
  const markerPattern = new RegExp(
    `${ASTRYX_MARKER_START}[\\s\\S]*?${ASTRYX_MARKER_END}\\n?`,
    'g',
  );
  repaired = repaired.replace(markerPattern, '');
  const orphanStart = repaired.indexOf(ASTRYX_MARKER_START);
  if (orphanStart !== -1) repaired = repaired.slice(0, orphanStart);
  return repaired.replaceAll(ASTRYX_MARKER_END, '');
}

export function resolveRepoPath(repoRoot, relativePath) {
  if (isAbsolute(relativePath)) {
    throw new Error(`Target must stay inside the repository: ${relativePath}`);
  }

  const absolutePath = resolve(repoRoot, relativePath);
  const lexicalFromRoot = relative(resolve(repoRoot), absolutePath);
  if (lexicalFromRoot === '..' || lexicalFromRoot.startsWith(`..${sep}`)) {
    throw new Error(`Target must stay inside the repository: ${relativePath}`);
  }
  const realRoot = realpathSync(repoRoot);
  let current = realRoot;
  const parts = relative(realRoot, absolutePath).split(sep).filter(Boolean);
  for (const part of parts) {
    current = join(current, part);
    let stat;
    try {
      stat = lstatSync(current);
    } catch {
      break;
    }
    if (stat.isSymbolicLink()) {
      try {
        current = realpathSync(current);
      } catch {
        throw new Error(
          `Target must stay inside the repository: ${relativePath}`,
        );
      }
    }
    const fromRoot = relative(realRoot, current);
    if (fromRoot === '..' || fromRoot.startsWith(`..${sep}`)) {
      throw new Error(
        `Target must stay inside the repository: ${relativePath}`,
      );
    }
  }

  return absolutePath;
}

export function generateExpectedAgentDocs({ repoRoot, outputRelativePath }) {
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
    generateExpected({ repoRoot, outputRelativePath });
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
    rmSync(tempDir, { recursive: true, force: true });
  } catch (cleanupError) {
    const message = `Failed to clean temporary Astryx docs at ${tempDir}: ${cleanupError.message}`;
    if (primaryError) {
      throw new AggregateError([primaryError, cleanupError], message);
    }
    throw new Error(message, { cause: cleanupError });
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
    checkAstryxAgentDocs({ targetRelativePath });
    console.log(`Astryx agent docs are current: ${targetRelativePath}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
