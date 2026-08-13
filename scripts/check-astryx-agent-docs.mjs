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
const RAW_HTML_BLOCK_TAGS =
  'address|article|aside|base|basefont|blockquote|body|caption|center|col|' +
  'colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|' +
  'footer|form|frame|frameset|h1|h2|h3|h4|h5|h6|head|header|hr|html|' +
  'iframe|legend|li|link|main|menu|menuitem|nav|noframes|ol|optgroup|' +
  'option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|' +
  'title|tr|track|ul';
const RAW_HTML_BLOCK_TAG_PATTERN = new RegExp(
  `^ {0,3}</?(?:${RAW_HTML_BLOCK_TAGS})(?:\\s|/?>|$)`,
  'i',
);
const RAW_HTML_COMPLETE_TAG_PATTERN =
  /^ {0,3}(?:<([A-Za-z][A-Za-z0-9-]*)(?:[ \t]+[A-Za-z_:][A-Za-z0-9_.:-]*(?:[ \t]*=[ \t]*(?:[^\s"'=<>`]+|'[^']*'|"[^"]*"))?)*[ \t]*\/?>|<\/([A-Za-z][A-Za-z0-9-]*)[ \t]*>)[ \t]*$/;

function productionRefreshInstruction(label) {
  return label === DEFAULT_TARGET
    ? ' Run `pnpm astryx:agents` and commit the updated block.'
    : '';
}

function markerRepairInstruction(label) {
  return (
    'Restore the entire stale Astryx guidance region from version control ' +
    '(or remove that complete region manually).' +
    productionRefreshInstruction(label)
  );
}

export function formatError(error) {
  if (error instanceof AggregateError) {
    return [...error.errors.map(formatError), error.message]
      .filter(Boolean)
      .join('\n');
  }
  if (error instanceof Error) {
    const cause =
      error.cause === undefined ? '' : `\n${formatError(error.cause)}`;
    return `${error.message}${cause}`;
  }
  return String(error);
}

function countOccurrences(content, marker) {
  return content.split(marker).length - 1;
}

function leadingIndentColumns(line) {
  let columns = 0;
  for (const character of line) {
    if (character === ' ') columns += 1;
    else if (character === '\t') columns += 4 - (columns % 4);
    else break;
  }
  return columns;
}

function listContentIndent(line) {
  const match = /^( {0,3})([*+-]|\d{1,9}[.)])(?:([ \t]+)(?=\S)|[ \t]*$)/.exec(
    line,
  );
  if (!match) return undefined;

  const [, indentation, marker, whitespace = ' '] = match;
  const separatorWidth = leadingIndentColumns(whitespace);
  return (
    leadingIndentColumns(indentation) +
    marker.length +
    (separatorWidth > 4 ? 1 : separatorWidth)
  );
}

function rawHtmlBlockStart(line, paragraphOpen) {
  const typeOne = /^ {0,3}<(pre|script|style|textarea)(?:\s|>|$)/i.exec(line);
  if (typeOne) {
    return { endPattern: new RegExp(`</${typeOne[1]}\\s*>`, 'i') };
  }

  for (const [startPattern, endPattern] of [
    [/^ {0,3}<!--/, /-->/],
    [/^ {0,3}<\?/, /\?>/],
    [/^ {0,3}<![A-Z]/, />/],
    [/^ {0,3}<!\[CDATA\[/, /\]\]>/],
  ]) {
    if (startPattern.test(line)) return { endPattern };
  }

  if (RAW_HTML_BLOCK_TAG_PATTERN.test(line)) return { endsOnBlankLine: true };
  const completeTag = RAW_HTML_COMPLETE_TAG_PATTERN.exec(line);
  const tag = completeTag?.[1] ?? completeTag?.[2];
  if (!paragraphOpen && tag && !/^(?:pre|script|style|textarea)$/i.test(tag)) {
    return { endsOnBlankLine: true };
  }
  return undefined;
}

function rawHtmlBlockEnds(block, line) {
  return block.endsOnBlankLine
    ? line.trim() === ''
    : block.endPattern.test(line);
}

function isEscaped(line, index) {
  let precedingBackslashes = 0;
  for (let cursor = index - 1; cursor >= 0 && line[cursor] === '\\'; cursor--) {
    precedingBackslashes += 1;
  }
  return precedingBackslashes % 2 === 1;
}

function hasCodeSpanCloser(lines, lineIndex, column, delimiterLength) {
  for (let index = lineIndex; index < lines.length; index++) {
    const candidate = lines[index];
    if (index > lineIndex && candidate.trim() === '') return false;

    for (const run of candidate.matchAll(/`+/g)) {
      if (index === lineIndex && run.index <= column) continue;
      if (
        !isEscaped(candidate, run.index) &&
        run[0].length === delimiterLength
      ) {
        return true;
      }
    }
  }
  return false;
}

function scanCodeSpanDelimiter(lines, lineIndex, delimiterLength) {
  const line = lines[lineIndex];
  const runs = line.matchAll(/`+/g);
  let activeDelimiter = delimiterLength;

  for (const run of runs) {
    if (isEscaped(line, run.index)) continue;

    if (
      activeDelimiter === undefined &&
      hasCodeSpanCloser(lines, lineIndex, run.index, run[0].length)
    ) {
      activeDelimiter = run[0].length;
    } else if (run[0].length === activeDelimiter) activeDelimiter = undefined;
  }

  return activeDelimiter;
}

export function extractAstryxBlock(content, label) {
  const starts = countOccurrences(content, ASTRYX_MARKER_START);
  const ends = countOccurrences(content, ASTRYX_MARKER_END);
  const startIndex = content.indexOf(ASTRYX_MARKER_START);
  const endIndex = content.indexOf(ASTRYX_MARKER_END);

  if (starts === 0 && ends === 0) {
    throw new Error(
      `${label} is missing an Astryx managed block.` +
        productionRefreshInstruction(label),
    );
  }

  if (starts !== 1 || ends !== 1 || endIndex < startIndex) {
    throw new Error(
      `${label} has malformed Astryx managed markers. ${markerRepairInstruction(label)}`,
    );
  }

  const lines = content.split('\n');
  let fence;
  let rawHtmlBlock;
  let codeSpanDelimiter;
  let paragraphOpen = false;
  const listIndents = [];
  for (const [lineIndex, line] of lines.entries()) {
    const containsMarker =
      line.includes(ASTRYX_MARKER_START) || line.includes(ASTRYX_MARKER_END);
    const indentation = leadingIndentColumns(line);
    if (line.trim() === '') paragraphOpen = false;
    if (line.trim() !== '') {
      while (
        listIndents.length > 0 &&
        indentation < listIndents[listIndents.length - 1]
      ) {
        listIndents.pop();
      }
    }

    if (containsMarker) {
      if (fence || indentation >= 4) {
        throw new Error(
          `${label} has Astryx managed markers inside fenced or indented Markdown code. ` +
            markerRepairInstruction(label),
        );
      }

      const standaloneMarker =
        /^ {0,3}<!-- ASTRYX:(?:START|END) -->[ \t]*$/.test(line);
      if (
        !standaloneMarker ||
        rawHtmlBlock !== undefined ||
        codeSpanDelimiter !== undefined ||
        listIndents.length > 0
      ) {
        throw new Error(
          `${label} must use standalone top-level Markdown nodes for Astryx managed markers. ` +
            markerRepairInstruction(label),
        );
      }
    }

    const fenceMatch = /^( {0,3})(`{3,}|~{3,})(.*)$/.exec(line);
    if (fence) {
      if (fenceMatch) {
        const [, , run, info] = fenceMatch;
        if (
          run[0] === fence.char &&
          run.length >= fence.length &&
          info.trim() === ''
        ) {
          fence = undefined;
        }
      }
      continue;
    }

    if (rawHtmlBlock !== undefined) {
      if (rawHtmlBlockEnds(rawHtmlBlock, line)) rawHtmlBlock = undefined;
      continue;
    }

    if (codeSpanDelimiter === undefined && fenceMatch) {
      const [, , run, info] = fenceMatch;
      if (run[0] !== '`' || !info.includes('`')) {
        fence = { char: run[0], length: run.length };
        paragraphOpen = false;
        continue;
      }
    }

    const nextRawHtmlBlock = rawHtmlBlockStart(line, paragraphOpen);
    if (codeSpanDelimiter === undefined && nextRawHtmlBlock) {
      paragraphOpen = false;
      if (!rawHtmlBlockEnds(nextRawHtmlBlock, line)) {
        rawHtmlBlock = nextRawHtmlBlock;
      }
      continue;
    }

    codeSpanDelimiter = scanCodeSpanDelimiter(
      lines,
      lineIndex,
      codeSpanDelimiter,
    );
    const contentIndent = listContentIndent(line);
    if (contentIndent !== undefined) {
      listIndents.push(contentIndent);
      paragraphOpen = false;
    } else if (
      line.trim() !== '' &&
      listIndents.length === 0 &&
      indentation < 4
    ) {
      paragraphOpen = true;
    }
  }

  return content.slice(startIndex, endIndex + ASTRYX_MARKER_END.length);
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
  removeTemp = rmSync,
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
        `Astryx agent docs are stale in ${targetRelativePath}.` +
          productionRefreshInstruction(targetRelativePath),
      );
    }
  } catch (error) {
    primaryError = error;
  }

  try {
    removeTemp(tempDir, { recursive: true, force: true });
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
  try {
    if (process.argv.length > 2) {
      throw new Error(
        `Astryx agent-doc check does not accept a target; it always checks ${DEFAULT_TARGET}.`,
      );
    }
    checkAstryxAgentDocs();
    console.log(`Astryx agent docs are current: ${DEFAULT_TARGET}`);
  } catch (error) {
    console.error(formatError(error));
    process.exitCode = 1;
  }
}
