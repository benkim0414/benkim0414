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

function leadingIndentColumns(line, initialColumns = 0) {
  let columns = initialColumns;
  for (const character of line) {
    if (character === ' ') columns += 1;
    else if (character === '\t') columns += 4 - (columns % 4);
    else break;
  }
  return columns - initialColumns;
}

function listItemStart(line) {
  const match = /^( {0,3})([*+-]|\d{1,9}[.)])(?:([ \t]+)(?=\S)|[ \t]*$)/.exec(
    line,
  );
  if (!match) return undefined;

  const [, indentation, marker, whitespace = ' '] = match;
  const markerColumns = indentation.length + marker.length;
  const separatorWidth = leadingIndentColumns(whitespace, markerColumns);
  const effectiveSeparatorWidth = separatorWidth > 4 ? 1 : separatorWidth;
  const remainder = line.slice(match[0].length);
  const contentIndent =
    leadingIndentColumns(indentation) + marker.length + effectiveSeparatorWidth;
  const orderedStart = /^\d/.test(marker)
    ? Number.parseInt(marker, 10)
    : undefined;
  return {
    content:
      separatorWidth > 4
        ? `${' '.repeat(separatorWidth - effectiveSeparatorWidth)}${remainder}`
        : remainder,
    contentIndent,
    hasContent: remainder.trim() !== '',
    orderedStart,
  };
}

function rawHtmlBlockStart(line) {
  const typeOne = /^ {0,3}<(pre|script|style|textarea)(?:\s|>|$)/i.exec(line);
  if (typeOne) {
    return {
      endPattern: /<\/(?:pre|script|style|textarea)>/i,
      interruptsParagraph: true,
    };
  }

  for (const [startPattern, endPattern] of [
    [/^ {0,3}<!--/, /-->/],
    [/^ {0,3}<\?/, /\?>/],
    [/^ {0,3}<![A-Za-z]/, />/],
    [/^ {0,3}<!\[CDATA\[/, /\]\]>/],
  ]) {
    if (startPattern.test(line)) {
      return { endPattern, interruptsParagraph: true };
    }
  }

  if (RAW_HTML_BLOCK_TAG_PATTERN.test(line)) {
    return { endsOnBlankLine: true, interruptsParagraph: true };
  }
  const completeTag = RAW_HTML_COMPLETE_TAG_PATTERN.exec(line);
  const tag = completeTag?.[1] ?? completeTag?.[2];
  if (tag && !/^(?:pre|script|style|textarea)$/i.test(tag)) {
    return { endsOnBlankLine: true, interruptsParagraph: false };
  }
  return undefined;
}

function rawHtmlBlockEnds(block, line) {
  return block.endsOnBlankLine
    ? line.trim() === ''
    : block.endPattern.test(line);
}

function stripIndentColumns(line, columnsToStrip) {
  let columns = 0;
  let index = 0;
  while (index < line.length && columns < columnsToStrip) {
    if (line[index] === ' ') {
      columns += 1;
      index += 1;
    } else if (line[index] === '\t') {
      const nextTabStop = columns + 4 - (columns % 4);
      index += 1;
      if (nextTabStop > columnsToStrip) {
        return `${' '.repeat(nextTabStop - columnsToStrip)}${line.slice(index)}`;
      }
      columns = nextTabStop;
    } else break;
  }
  return line.slice(index);
}

function stripBlockQuoteMarker(line) {
  const marker = /^( {0,3})>/.exec(line);
  if (!marker) return undefined;

  let content = line.slice(marker[0].length);
  if (content.startsWith(' ')) content = content.slice(1);
  else if (content.startsWith('\t')) {
    const markerColumns = leadingIndentColumns(marker[1]) + 1;
    const tabWidth = 4 - (markerColumns % 4);
    content = `${' '.repeat(tabWidth - 1)}${content.slice(1)}`;
  }
  return content;
}

function stripBlockQuoteMarkers(line) {
  let content = line;
  let depth = 0;
  while (true) {
    const nextContent = stripBlockQuoteMarker(content);
    if (nextContent === undefined) return { content, depth };
    content = nextContent;
    depth += 1;
  }
}

function listItemEndsCurrentItem(line) {
  const item = listItemStart(stripBlockQuoteMarkers(line).content);
  return item?.hasContent === true;
}

function matchLeafContainers(line, containers) {
  if (line.trim() === '' && containers.every(({ kind }) => kind === 'list')) {
    return { content: line, listDepth: containers.length, matched: true };
  }

  let content = line;
  let listDepth = 0;
  for (const container of containers) {
    if (container.kind === 'quote') {
      const nextContent = stripBlockQuoteMarker(content);
      if (nextContent === undefined) return { listDepth, matched: false };
      content = nextContent;
    } else {
      if (leadingIndentColumns(content) < container.contentIndent) {
        return { listDepth, matched: false };
      }
      content = stripIndentColumns(content, container.contentIndent);
      listDepth += 1;
    }
  }
  return { content, listDepth, matched: true };
}

function codeFenceStart(line) {
  const match = /^( {0,3})(`{3,}|~{3,})(.*)$/.exec(line);
  if (!match) return undefined;
  const [, , run, info] = match;
  if (run[0] === '`' && info.includes('`')) return undefined;
  return { char: run[0], info, length: run.length };
}

function isAtxHeading(line) {
  return /^ {0,3}#{1,6}(?:[ \t]+|$)/.test(line);
}

function isSetextHeadingUnderline(line) {
  return /^ {0,3}(?:=+|-+)[ \t]*$/.test(line);
}

function isThematicBreak(line) {
  return /^ {0,3}(?:(?:\*[ \t]*){3,}|(?:-[ \t]*){3,}|(?:_[ \t]*){3,})$/.test(
    line,
  );
}

function paragraphLine(quoteDepth, continuesParagraph) {
  return { kind: 'paragraph', quoteDepth, continuesParagraph };
}

function classifyLeafContent(line, paragraph, quoteDepth) {
  if (line.trim() === '') return { kind: 'blank' };

  const fence = codeFenceStart(line);
  if (fence) return { kind: 'fence', ...fence, quoteDepth };

  const rawHtmlBlock = rawHtmlBlockStart(line);
  if (
    rawHtmlBlock &&
    (rawHtmlBlock.interruptsParagraph || paragraph === undefined)
  ) {
    return { kind: 'rawHtml', block: rawHtmlBlock, line, quoteDepth };
  }

  if (isAtxHeading(line)) return { kind: 'boundary' };
  if (paragraph && isSetextHeadingUnderline(line)) {
    return { kind: 'boundary' };
  }
  if (isThematicBreak(line)) return { kind: 'boundary' };

  const listItem = listItemStart(line);
  if (listItem) {
    const canInterruptParagraph =
      listItem.hasContent &&
      (listItem.orderedStart === undefined || listItem.orderedStart === 1);
    if (!paragraph || canInterruptParagraph) {
      return { kind: 'listItem', item: listItem, quoteDepth };
    }
  }

  if (leadingIndentColumns(line) >= 4) {
    return paragraph ? paragraphLine(quoteDepth, true) : { kind: 'boundary' };
  }

  return paragraphLine(quoteDepth, paragraph !== undefined);
}

function classifyMarkdownLine(line, paragraph) {
  const blockQuote = stripBlockQuoteMarkers(line);
  if (blockQuote.depth > 0) {
    const continuedParagraph =
      paragraph?.quoteDepth === blockQuote.depth ? paragraph : undefined;
    return classifyLeafContent(
      blockQuote.content,
      continuedParagraph,
      blockQuote.depth,
    );
  }

  if (paragraph?.quoteDepth > 0) {
    const lazyContinuation = classifyLeafContent(
      line,
      paragraph,
      paragraph.quoteDepth,
    );
    if (
      lazyContinuation.kind === 'paragraph' &&
      lazyContinuation.continuesParagraph
    ) {
      return lazyContinuation;
    }
    return classifyLeafContent(line, undefined, 0);
  }

  return classifyLeafContent(line, paragraph, 0);
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
  let leaf;
  const listContainers = [];

  function applyLineAction(action, baseIndent, lineIndex, containers = []) {
    const actionContainers = [
      ...containers,
      ...Array.from({ length: action.quoteDepth ?? 0 }, () => ({
        kind: 'quote',
      })),
    ];

    if (action.kind === 'listItem') {
      leaf = undefined;
      const contentIndent = baseIndent + action.item.contentIndent;
      const childContainers = [
        ...actionContainers,
        { kind: 'list', contentIndent: action.item.contentIndent },
      ];
      listContainers.push({ containerPath: childContainers, contentIndent });
      const child = classifyMarkdownLine(action.item.content, undefined);
      applyLineAction(child, contentIndent, lineIndex, childContainers);
      return;
    }

    if (action.kind === 'paragraph') {
      const activeDelimiter =
        action.continuesParagraph && leaf?.kind === 'paragraph'
          ? leaf.codeSpanDelimiter
          : undefined;
      leaf = {
        kind: 'paragraph',
        codeSpanDelimiter: scanCodeSpanDelimiter(
          lines,
          lineIndex,
          activeDelimiter,
        ),
        containerPath:
          action.continuesParagraph && leaf?.kind === 'paragraph'
            ? leaf.containerPath
            : actionContainers,
        listDepth: listContainers.length,
        quoteDepth:
          action.continuesParagraph && leaf?.kind === 'paragraph'
            ? leaf.quoteDepth
            : actionContainers.filter(({ kind }) => kind === 'quote').length,
      };
      return;
    }

    leaf = undefined;
    if (action.kind === 'fence') {
      leaf = {
        kind: 'fence',
        char: action.char,
        containerPath: actionContainers,
        length: action.length,
      };
    } else if (
      action.kind === 'rawHtml' &&
      !rawHtmlBlockEnds(action.block, action.line)
    ) {
      leaf = {
        kind: 'rawHtml',
        block: action.block,
        containerPath: actionContainers,
      };
    }
  }

  for (const [lineIndex, line] of lines.entries()) {
    const containsMarker =
      line.includes(ASTRYX_MARKER_START) || line.includes(ASTRYX_MARKER_END);
    const indentation = leadingIndentColumns(line);

    if (leaf?.kind === 'fence' || leaf?.kind === 'rawHtml') {
      const containerMatch = matchLeafContainers(line, leaf.containerPath);
      if (containerMatch.matched) {
        if (containsMarker) {
          const diagnostic =
            leaf.kind === 'fence'
              ? `${label} has Astryx managed markers inside fenced or indented Markdown code. `
              : `${label} must use standalone top-level Markdown nodes for Astryx managed markers. `;
          throw new Error(diagnostic + markerRepairInstruction(label));
        }

        if (leaf.kind === 'fence') {
          const fenceMatch = /^( {0,3})(`{3,}|~{3,})(.*)$/.exec(
            containerMatch.content,
          );
          if (fenceMatch) {
            const [, , run, info] = fenceMatch;
            if (
              run[0] === leaf.char &&
              run.length >= leaf.length &&
              info.trim() === ''
            ) {
              leaf = undefined;
            }
          }
        } else if (rawHtmlBlockEnds(leaf.block, containerMatch.content)) {
          leaf = undefined;
        }
        continue;
      }

      listContainers.length = Math.min(
        listContainers.length,
        containerMatch.listDepth,
      );
      leaf = undefined;
    }

    if (line.trim() === '') {
      leaf = undefined;
      continue;
    }

    const incomingCodeSpanDelimiter =
      leaf?.kind === 'paragraph' ? leaf.codeSpanDelimiter : undefined;
    let paragraph = leaf?.kind === 'paragraph' ? leaf : undefined;
    let baseIndent = 0;
    let containerPath = [];
    let markdownLine = line;
    let action;

    if (listContainers.length > 0) {
      const activeIndent =
        listContainers[listContainers.length - 1].contentIndent;
      if (indentation >= activeIndent) {
        baseIndent = activeIndent;
        containerPath = listContainers[listContainers.length - 1].containerPath;
        markdownLine = stripIndentColumns(line, activeIndent);
        if (paragraph?.listDepth !== listContainers.length) {
          paragraph = undefined;
        }
      } else if (paragraph?.listDepth === listContainers.length) {
        const retainedContainer = listContainers.findLast(
          (container) => indentation >= container.contentIndent,
        );
        const destinationLine = stripIndentColumns(
          line,
          retainedContainer?.contentIndent ?? 0,
        );
        if (!listItemEndsCurrentItem(destinationLine)) {
          const lazyAction = classifyMarkdownLine(line, paragraph);
          if (
            lazyAction.kind === 'paragraph' &&
            lazyAction.continuesParagraph
          ) {
            action = lazyAction;
            containerPath = paragraph.containerPath;
          }
        }
      }

      if (!action && indentation < activeIndent) {
        while (
          listContainers.length > 0 &&
          indentation < listContainers[listContainers.length - 1].contentIndent
        ) {
          listContainers.pop();
        }
        if (paragraph && paragraph.listDepth > listContainers.length) {
          paragraph = undefined;
          leaf = undefined;
        }
        baseIndent =
          listContainers[listContainers.length - 1]?.contentIndent ?? 0;
        containerPath =
          listContainers[listContainers.length - 1]?.containerPath ?? [];
        markdownLine = stripIndentColumns(line, baseIndent);
      }
    }

    action ??= classifyMarkdownLine(markdownLine, paragraph);

    if (containsMarker) {
      if (indentation >= 4) {
        throw new Error(
          `${label} has Astryx managed markers inside fenced or indented Markdown code. ` +
            markerRepairInstruction(label),
        );
      }

      const standaloneMarker =
        /^ {0,3}<!-- ASTRYX:(?:START|END) -->[ \t]*$/.test(line);
      if (
        !standaloneMarker ||
        incomingCodeSpanDelimiter !== undefined ||
        listContainers.length > 0
      ) {
        throw new Error(
          `${label} must use standalone top-level Markdown nodes for Astryx managed markers. ` +
            markerRepairInstruction(label),
        );
      }
    }

    applyLineAction(action, baseIndent, lineIndex, containerPath);
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
