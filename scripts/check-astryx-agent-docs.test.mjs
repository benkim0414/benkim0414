import assert from 'node:assert/strict';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  symlinkSync,
  utimesSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { spawnSync } from 'node:child_process';

import {
  ASTRYX_MARKER_END,
  ASTRYX_MARKER_START,
  checkAstryxAgentDocs,
  extractAstryxBlock,
  formatError,
  generateExpectedAgentDocs,
  resolveRepoPath,
} from './check-astryx-agent-docs.mjs';
import { refreshAstryxAgentDocs } from './refresh-astryx-agent-docs.mjs';

const block = (version) =>
  `${ASTRYX_MARKER_START}\nAstryx v${version}\n${ASTRYX_MARKER_END}`;

function writeFakeAstryxCli(repoRoot, source) {
  const cliPath = join(
    repoRoot,
    'node_modules/@astryxdesign/cli/bin/astryx.mjs',
  );
  mkdirSync(dirname(cliPath), { recursive: true });
  writeFileSync(cliPath, source);
}

function runRefreshExecutable(repoRoot, ...args) {
  return spawnSync(
    process.execPath,
    [join(process.cwd(), 'scripts/refresh-astryx-agent-docs.mjs'), ...args],
    { cwd: repoRoot, encoding: 'utf8' },
  );
}

test('extractAstryxBlock returns one complete managed block', () => {
  assert.equal(
    extractAstryxBlock(`before\n${block('0.1.4')}\nafter`, 'fixture'),
    block('0.1.4'),
  );
});

test('extractAstryxBlock accepts top-level markers after unmatched backticks', () => {
  const content = `prose \`\`\n${block('0.1.4')}`;
  assert.equal(
    extractAstryxBlock(content, 'unmatched backticks'),
    block('0.1.4'),
  );
});

for (const [name, content] of [
  ['incomplete', `${ASTRYX_MARKER_START}\nAstryx v0.1.4`],
  ['duplicate', `${block('0.1.4')}\n${block('0.1.4')}`],
]) {
  test(`extractAstryxBlock rejects ${name} markers`, () => {
    assert.throws(
      () => extractAstryxBlock(content, name),
      /malformed Astryx managed markers/,
    );
  });
}

for (const spaces of [1, 2, 3]) {
  test(`extractAstryxBlock accepts ${spaces} leading spaces`, () => {
    const content = `${' '.repeat(spaces)}${block('0.1.4')}`;
    assert.equal(
      extractAstryxBlock(content, 'valid indentation'),
      content.trimStart(),
    );
  });
}

for (const [name, content] of [
  ['multiline code span', `prose \`\`\n${block('0.1.4')}\n\`\` tail`],
  [
    'blockquote',
    `> ${ASTRYX_MARKER_START}\n> generated\n> ${ASTRYX_MARKER_END}`,
  ],
  ['list item', `- item\n  ${block('0.1.4').replaceAll('\n', '\n  ')}`],
  ['empty list item', `-\n  ${block('0.1.4').replaceAll('\n', '\n  ')}`],
  [
    'nested list item',
    `- outer\n  - nested\n  ${block('0.1.4').replaceAll('\n', '\n  ')}`,
  ],
  [
    'inline text',
    `before ${ASTRYX_MARKER_START}\ngenerated\n${ASTRYX_MARKER_END}`,
  ],
]) {
  test(`extractAstryxBlock rejects markers in ${name}`, () => {
    assert.throws(
      () => extractAstryxBlock(content, name),
      /standalone top-level Markdown nodes.*Restore.*region/s,
    );
  });
}

for (const [name, content] of [
  [
    'five-space bullet list separator',
    `-     item\n  ${block('0.1.4').replaceAll('\n', '\n  ')}`,
  ],
  [
    'five-space ordered list separator',
    `1.     item\n   ${block('0.1.4').replaceAll('\n', '\n   ')}`,
  ],
]) {
  test(`extractAstryxBlock rejects markers in a ${name}`, () => {
    assert.throws(
      () => extractAstryxBlock(content, name),
      /standalone top-level Markdown nodes.*Restore.*region/s,
    );
  });
}

for (const tag of ['pre', 'script', 'style', 'textarea']) {
  test(`extractAstryxBlock rejects markers in a ${tag} raw HTML block`, () => {
    assert.throws(
      () =>
        extractAstryxBlock(
          `<${tag} data-fixture>\n${block('0.1.4')}\n</${tag}>`,
          `${tag} raw HTML`,
        ),
      /standalone top-level Markdown nodes.*Restore.*region/s,
    );
  });
}

for (const [name, content] of [
  ['div', `<div data-fixture>\n${block('0.1.4')}\n</div>`],
  ['comment', `<!-- fixture\n${block('0.1.4')}\n-->`],
  ['processing instruction', `<?fixture\n${block('0.1.4')}\n?>`],
  ['declaration', `<!FIXTURE\n${block('0.1.4')}\n>`],
  ['CDATA', `<![CDATA[\n${block('0.1.4')}\n]]>`],
]) {
  test(`extractAstryxBlock rejects markers in a ${name} raw HTML block`, () => {
    assert.throws(
      () => extractAstryxBlock(content, `${name} raw HTML`),
      /standalone top-level Markdown nodes.*Restore.*region/s,
    );
  });
}

for (const [name, content] of [
  [
    'custom element type 7 raw HTML block',
    `<x-panel data-fixture="true">\n${block('0.1.4')}\n</x-panel>`,
  ],
  [
    'self-closing type 7 raw HTML block',
    `<x-panel data-fixture />\n${block('0.1.4')}`,
  ],
  ['closing-tag type 7 raw HTML block', `</x-panel>\n${block('0.1.4')}`],
]) {
  test(`extractAstryxBlock rejects markers in a ${name}`, () => {
    assert.throws(
      () => extractAstryxBlock(content, name),
      /standalone top-level Markdown nodes.*Restore.*region/s,
    );
  });
}

for (const [name, prefix] of [
  ['ordinary inline HTML', 'prose <x-panel>inline</x-panel>'],
  ['same-line open and close tags', '<x-panel></x-panel>'],
]) {
  test(`extractAstryxBlock accepts markers after ${name}`, () => {
    assert.equal(
      extractAstryxBlock(`${prefix}\n${block('0.1.4')}`, name),
      block('0.1.4'),
    );
  });
}

for (const [name, prefix] of [
  ['complete tag continuing a paragraph', 'paragraph\n<x-panel>'],
  [
    'self-closing tag continuing a multiline paragraph',
    'paragraph\ncontinuation\n<x-panel />',
  ],
  ['closing tag continuing a paragraph', 'paragraph\n</x-panel>'],
  [
    'three-space tag continuation in a paragraph',
    'paragraph\n   <x-panel data-fixture>',
  ],
]) {
  test(`extractAstryxBlock accepts markers after a ${name}`, () => {
    assert.equal(
      extractAstryxBlock(`${prefix}\n${block('0.1.4')}`, name),
      block('0.1.4'),
    );
  });
}

test('extractAstryxBlock rejects type 7 markers after a paragraph-ending blank line', () => {
  const content = `paragraph\n\n<x-panel>\n${block('0.1.4')}`;
  assert.throws(
    () => extractAstryxBlock(content, 'type 7 after blank line'),
    /standalone top-level Markdown nodes.*Restore.*region/s,
  );
});

for (const indentation of ['\t', ' \t', '  \t', '   \t']) {
  test(`extractAstryxBlock rejects ${JSON.stringify(indentation)} indentation`, () => {
    assert.throws(
      () =>
        extractAstryxBlock(
          `${indentation}${block('0.1.4')}`,
          'tab indentation',
        ),
      /markers inside fenced or indented Markdown code.*Restore.*region/s,
    );
  });
}

test('refresh relies on the installed CLI explicit target without rewriting root AGENTS.md', () => {
  const repoRoot = mkdtempSync(join(process.cwd(), '.astryx-refresh-root-'));
  try {
    const rootPath = join(repoRoot, 'AGENTS.md');
    const targetPath = join(repoRoot, 'apps/github.io/AGENTS.md');
    mkdirSync(dirname(targetPath), { recursive: true });
    writeFileSync(rootPath, 'root handwritten\n');
    writeFileSync(targetPath, 'target handwritten\n');
    symlinkSync(
      join(process.cwd(), 'node_modules'),
      join(repoRoot, 'node_modules'),
    );
    const oldTimestamp = new Date('2000-01-01T00:00:00.000Z');
    utimesSync(rootPath, oldTimestamp, oldTimestamp);
    const before = statSync(rootPath, { bigint: true });
    const result = spawnSync(
      process.execPath,
      [join(process.cwd(), 'scripts/refresh-astryx-agent-docs.mjs')],
      { cwd: repoRoot, encoding: 'utf8' },
    );
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
    const after = statSync(rootPath, { bigint: true });
    assert.equal(readFileSync(rootPath, 'utf8'), 'root handwritten\n');
    assert.equal(after.mtimeNs, before.mtimeNs);
    assert.match(readFileSync(targetPath, 'utf8'), /<!-- ASTRYX:START -->/);
  } finally {
    rmSync(repoRoot, { recursive: true, force: true });
  }
});

test('refresh executable rejects positional targets without writing either guide', () => {
  const repoRoot = mkdtempSync(join(process.cwd(), '.astryx-refresh-target-'));
  try {
    const productionPath = join(repoRoot, 'apps/github.io/AGENTS.md');
    const customPath = join(repoRoot, 'custom/AGENTS.md');
    mkdirSync(dirname(productionPath), { recursive: true });
    mkdirSync(dirname(customPath), { recursive: true });
    writeFileSync(productionPath, 'production handwritten\n');
    writeFileSync(customPath, 'custom handwritten\n');
    symlinkSync(
      join(process.cwd(), 'node_modules'),
      join(repoRoot, 'node_modules'),
    );

    const result = spawnSync(
      process.execPath,
      [
        join(process.cwd(), 'scripts/refresh-astryx-agent-docs.mjs'),
        'custom/AGENTS.md',
      ],
      { cwd: repoRoot, encoding: 'utf8' },
    );

    assert.notEqual(result.status, 0);
    assert.match(
      result.stderr,
      /does not accept a target.*apps\/github\.io\/AGENTS\.md/s,
    );
    assert.equal(
      readFileSync(productionPath, 'utf8'),
      'production handwritten\n',
    );
    assert.equal(readFileSync(customPath, 'utf8'), 'custom handwritten\n');
  } finally {
    rmSync(repoRoot, { recursive: true, force: true });
  }
});

test('refresh refuses to recreate a missing production guide', () => {
  const repoRoot = mkdtempSync(join(process.cwd(), '.astryx-refresh-missing-'));
  const targetPath = join(repoRoot, 'apps/github.io/AGENTS.md');
  try {
    mkdirSync(dirname(targetPath), { recursive: true });
    symlinkSync(
      join(process.cwd(), 'node_modules'),
      join(repoRoot, 'node_modules'),
    );

    const result = spawnSync(
      process.execPath,
      [join(process.cwd(), 'scripts/refresh-astryx-agent-docs.mjs')],
      { cwd: repoRoot, encoding: 'utf8' },
    );

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /must already exist.*handwritten guidance/s);
    assert.equal(statSync(dirname(targetPath)).isDirectory(), true);
    assert.throws(() => readFileSync(targetPath, 'utf8'), /ENOENT/);
  } finally {
    rmSync(repoRoot, { recursive: true, force: true });
  }
});

test('refresh fails when a zero-exit CLI removes its output', () => {
  const repoRoot = mkdtempSync(
    join(process.cwd(), '.astryx-refresh-no-output-'),
  );
  const targetPath = join(repoRoot, 'apps/github.io/AGENTS.md');
  try {
    mkdirSync(dirname(targetPath), { recursive: true });
    writeFileSync(targetPath, `handwritten\n${block('0.1.3')}\n`);
    writeFakeAstryxCli(
      repoRoot,
      "import {rmSync} from 'node:fs'; const output = process.argv.at(-1); rmSync(output);\n",
    );

    const result = runRefreshExecutable(repoRoot);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /postcondition.*ENOENT/s);
  } finally {
    rmSync(repoRoot, { recursive: true, force: true });
  }
});

test('refresh fails when a zero-exit CLI writes malformed output', () => {
  const repoRoot = mkdtempSync(
    join(process.cwd(), '.astryx-refresh-malformed-'),
  );
  const targetPath = join(repoRoot, 'apps/github.io/AGENTS.md');
  try {
    mkdirSync(dirname(targetPath), { recursive: true });
    writeFileSync(targetPath, `handwritten\n${block('0.1.3')}\n`);
    writeFakeAstryxCli(
      repoRoot,
      "import {writeFileSync} from 'node:fs'; const output = process.argv.at(-1); writeFileSync(output, '<!-- ASTRYX:START -->\\nbroken\\n');\n",
    );

    const result = runRefreshExecutable(repoRoot);

    assert.notEqual(result.status, 0);
    assert.match(
      result.stderr,
      /postcondition.*malformed Astryx managed markers/s,
    );
  } finally {
    rmSync(repoRoot, { recursive: true, force: true });
  }
});

test('refresh fails when a zero-exit CLI leaves stale output', () => {
  const repoRoot = mkdtempSync(join(process.cwd(), '.astryx-refresh-stale-'));
  const targetPath = join(repoRoot, 'apps/github.io/AGENTS.md');
  try {
    mkdirSync(dirname(targetPath), { recursive: true });
    writeFileSync(targetPath, `handwritten\n${block('0.1.3')}\n`);
    writeFakeAstryxCli(
      repoRoot,
      `import {mkdirSync,writeFileSync} from 'node:fs';
import {dirname} from 'node:path';
const output = process.argv.at(-1);
if (output.startsWith('.astryx-agent-docs-check-')) {
  mkdirSync(dirname(output), {recursive: true});
  writeFileSync(output, ${JSON.stringify(block('0.1.4'))});
}\n`,
    );

    const result = runRefreshExecutable(repoRoot);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /postcondition.*stale.*pnpm astryx:agents/s);
  } finally {
    rmSync(repoRoot, { recursive: true, force: true });
  }
});

test('checker executable rejects positional targets', () => {
  const result = spawnSync(
    process.execPath,
    [join(process.cwd(), 'scripts/check-astryx-agent-docs.mjs'), 'AGENTS.md'],
    { cwd: process.cwd(), encoding: 'utf8' },
  );

  assert.notEqual(result.status, 0);
  assert.match(
    result.stderr,
    /does not accept a target.*apps\/github\.io\/AGENTS\.md/s,
  );
});

test('extractAstryxBlock gives the production guide a refresh instruction', () => {
  assert.throws(
    () =>
      extractAstryxBlock(
        'handwritten guidance only',
        'apps/github.io/AGENTS.md',
      ),
    /missing an Astryx managed block.*pnpm astryx:agents/s,
  );
});

for (const [name, content] of [
  ['fenced', '```md\n' + block('0.1.4') + '\n```'],
  ['mixed delimiter', '````\n' + block('0.1.4') + '\n~~~\n'],
  [
    'indented',
    `    ${ASTRYX_MARKER_START}\nAstryx v0.1.4\n${ASTRYX_MARKER_END}`,
  ],
  [
    'tab-indented',
    `\t${ASTRYX_MARKER_START}\nAstryx v0.1.4\n${ASTRYX_MARKER_END}`,
  ],
]) {
  test(`extractAstryxBlock rejects ${name} code markers`, () => {
    assert.throws(
      () => extractAstryxBlock(content, name),
      /markers inside fenced or indented Markdown code.*Restore.*region/s,
    );
  });
}

test('resolveRepoPath rejects targets outside the repository', () => {
  assert.throws(
    () => resolveRepoPath('/workspace/repo', '../AGENTS.md'),
    /must stay inside the repository/,
  );
});

test('resolveRepoPath rejects a file symlink escaping the repository', () => {
  const repoRoot = mkdtempSync(join(process.cwd(), '.astryx-safe-path-file-'));
  const outsideRoot = mkdtempSync(
    join(process.cwd(), '.astryx-safe-path-out-'),
  );
  try {
    writeFileSync(join(outsideRoot, 'AGENTS.md'), 'outside');
    symlinkSync(join(outsideRoot, 'AGENTS.md'), join(repoRoot, 'AGENTS.md'));
    assert.throws(
      () => resolveRepoPath(repoRoot, 'AGENTS.md'),
      /must stay inside the repository/,
    );
  } finally {
    rmSync(repoRoot, { recursive: true, force: true });
    rmSync(outsideRoot, { recursive: true, force: true });
  }
});

test('resolveRepoPath rejects a symlinked ancestor escaping the repository', () => {
  const repoRoot = mkdtempSync(
    join(process.cwd(), '.astryx-safe-path-ancestor-'),
  );
  const outsideRoot = mkdtempSync(
    join(process.cwd(), '.astryx-safe-path-out-'),
  );
  try {
    symlinkSync(outsideRoot, join(repoRoot, 'apps'));
    assert.throws(
      () => resolveRepoPath(repoRoot, 'apps/github.io/AGENTS.md'),
      /must stay inside the repository/,
    );
  } finally {
    rmSync(repoRoot, { recursive: true, force: true });
    rmSync(outsideRoot, { recursive: true, force: true });
  }
});

test('resolveRepoPath rejects dangling file and ancestor symlinks', () => {
  const repoRoot = mkdtempSync(
    join(process.cwd(), '.astryx-safe-path-dangling-'),
  );
  try {
    symlinkSync(join(repoRoot, 'missing.md'), join(repoRoot, 'AGENTS.md'));
    assert.throws(
      () => resolveRepoPath(repoRoot, 'AGENTS.md'),
      /must stay inside/,
    );
    rmSync(join(repoRoot, 'AGENTS.md'));
    symlinkSync(join(repoRoot, 'missing-dir'), join(repoRoot, 'apps'));
    assert.throws(
      () => resolveRepoPath(repoRoot, 'apps/github.io/AGENTS.md'),
      /must stay inside/,
    );
  } finally {
    rmSync(repoRoot, { recursive: true, force: true });
  }
});

for (const [name, content] of [
  ['orphan start', `handwritten\n${ASTRYX_MARKER_START}\nold generated body\n`],
  ['orphan end', `handwritten\nold generated body\n${ASTRYX_MARKER_END}\n`],
  ['duplicate', `${block('0.1.3')}\n${block('0.1.3')}\n`],
  [
    'crossed',
    `${ASTRYX_MARKER_START}\none\n${ASTRYX_MARKER_START}\ntwo\n${ASTRYX_MARKER_END}\n`,
  ],
]) {
  test(`refresh rejects ${name} markers without changing the target`, () => {
    const repoRoot = mkdtempSync(
      join(process.cwd(), `.astryx-refresh-${name}-`),
    );
    const targetPath = join(repoRoot, 'AGENTS.md');
    try {
      writeFileSync(targetPath, content);
      const before = readFileSync(targetPath, 'utf8');
      assert.throws(
        () =>
          refreshAstryxAgentDocs({ repoRoot, targetRelativePath: 'AGENTS.md' }),
        /Restore the entire stale Astryx guidance region/,
      );
      assert.equal(readFileSync(targetPath, 'utf8'), before);
    } finally {
      rmSync(repoRoot, { recursive: true, force: true });
    }
  });
}

test('astryx:agents forwards init arguments without a pnpm separator', () => {
  const packageJson = JSON.parse(
    readFileSync(join(process.cwd(), 'package.json'), 'utf8'),
  );

  assert.equal(
    packageJson.scripts['astryx:agents'],
    'node scripts/refresh-astryx-agent-docs.mjs',
  );
});

test('github.io AGENTS guidance satisfies the independent Astryx contract', () => {
  const content = readFileSync(
    join(process.cwd(), 'apps/github.io/AGENTS.md'),
    'utf8',
  );
  const managed = extractAstryxBlock(content, 'apps/github.io/AGENTS.md');
  const requirements = [
    ['marker start', ASTRYX_MARKER_START],
    ['marker end', ASTRYX_MARKER_END],
    ['workflow', /WORKFLOW/],
    ['template discovery', /template --list/],
    ['template skeleton syntax', /template <name> \[--skeleton\]/],
    ['component docs', /component <Name>/],
    ['raw element prohibition', /No <div>/],
    ['inline style prohibition', /No inline style objects/],
    ['token guidance', /Tokens for every value/],
    ['CLI reference', /MORE CLI/],
  ];

  for (const [name, pattern] of requirements) {
    if (typeof pattern === 'string') {
      assert.ok(content.includes(pattern), `missing ${name} guidance`);
    } else {
      assert.match(content, pattern, `missing ${name} guidance`);
    }
  }

  assert.doesNotMatch(
    managed,
    /No inline style objects/,
    'inline-style prohibition must remain handwritten outside the managed block',
  );
});

test('checkAstryxAgentDocs accepts current content and cleans generated files', () => {
  const repoRoot = mkdtempSync(
    join(process.cwd(), '.astryx-agent-docs-test-current-'),
  );
  const targetRelativePath = 'apps/github.io/AGENTS.md';
  const targetPath = resolveRepoPath(repoRoot, targetRelativePath);

  try {
    mkdirSync(dirname(targetPath), { recursive: true });
    writeFileSync(targetPath, `handwritten\n${block('0.1.4')}\n`);

    checkAstryxAgentDocs({
      repoRoot,
      targetRelativePath,
      generateExpected: ({ repoRoot: root, outputRelativePath }) => {
        writeFileSync(
          resolveRepoPath(root, outputRelativePath),
          block('0.1.4'),
        );
      },
    });

    assert.deepEqual(
      readdirSync(repoRoot).filter((name) =>
        name.startsWith('.astryx-agent-docs-check-'),
      ),
      [],
    );
  } finally {
    rmSync(repoRoot, { recursive: true, force: true });
  }
});

test('checkAstryxAgentDocs rejects a stale copy and cleans generated files', () => {
  const repoRoot = mkdtempSync(
    join(process.cwd(), '.astryx-agent-docs-test-stale-'),
  );
  const targetRelativePath = 'apps/github.io/AGENTS.md';
  const targetPath = resolveRepoPath(repoRoot, targetRelativePath);

  try {
    mkdirSync(dirname(targetPath), { recursive: true });
    writeFileSync(targetPath, `handwritten\n${block('0.1.3')}\n`);

    assert.throws(
      () =>
        checkAstryxAgentDocs({
          repoRoot,
          targetRelativePath,
          generateExpected: ({ repoRoot: root, outputRelativePath }) => {
            writeFileSync(
              resolveRepoPath(root, outputRelativePath),
              block('0.1.4'),
            );
          },
        }),
      /Astryx agent docs are stale.*pnpm astryx:agents/s,
    );

    assert.deepEqual(
      readdirSync(repoRoot).filter((name) =>
        name.startsWith('.astryx-agent-docs-check-'),
      ),
      [],
    );
  } finally {
    rmSync(repoRoot, { recursive: true, force: true });
  }
});

test('custom checker diagnostics do not recommend refreshing the production guide', () => {
  const repoRoot = mkdtempSync(
    join(process.cwd(), '.astryx-agent-docs-test-custom-'),
  );
  const targetRelativePath = 'fixtures/AGENTS.md';
  const targetPath = resolveRepoPath(repoRoot, targetRelativePath);

  try {
    mkdirSync(dirname(targetPath), { recursive: true });
    writeFileSync(targetPath, block('0.1.3'));

    assert.throws(
      () =>
        checkAstryxAgentDocs({
          repoRoot,
          targetRelativePath,
          generateExpected: ({ repoRoot: root, outputRelativePath }) => {
            writeFileSync(
              resolveRepoPath(root, outputRelativePath),
              block('0.1.4'),
            );
          },
        }),
      (error) => {
        assert.match(error.message, /Astryx agent docs are stale/);
        assert.doesNotMatch(error.message, /pnpm astryx:agents/);
        return true;
      },
    );
  } finally {
    rmSync(repoRoot, { recursive: true, force: true });
  }
});

test('checkAstryxAgentDocs preserves generator diagnostics and cleans on failure', () => {
  const repoRoot = mkdtempSync(
    join(process.cwd(), '.astryx-generator-failure-'),
  );
  const targetRelativePath = 'AGENTS.md';
  const targetPath = resolveRepoPath(repoRoot, targetRelativePath);
  try {
    writeFileSync(targetPath, block('0.1.4'));
    assert.throws(
      () =>
        checkAstryxAgentDocs({
          repoRoot,
          targetRelativePath,
          generateExpected: () => {
            throw new Error('Astryx CLI failed (7).\nstderr diagnostic');
          },
        }),
      /Astryx CLI failed \(7\).*stderr diagnostic/s,
    );
    assert.deepEqual(
      readdirSync(repoRoot).filter((name) =>
        name.startsWith('.astryx-agent-docs-check-'),
      ),
      [],
    );
  } finally {
    rmSync(repoRoot, { recursive: true, force: true });
  }
});

test('checker renders nested generation and cleanup failures primary-first', () => {
  const repoRoot = mkdtempSync(join(process.cwd(), '.astryx-dual-failure-'));
  const targetRelativePath = 'apps/github.io/AGENTS.md';
  const targetPath = resolveRepoPath(repoRoot, targetRelativePath);
  try {
    mkdirSync(dirname(targetPath), { recursive: true });
    writeFileSync(targetPath, block('0.1.4'));
    let failure;

    try {
      checkAstryxAgentDocs({
        repoRoot,
        targetRelativePath,
        generateExpected: () => {
          throw new Error('primary generation failure');
        },
        removeTemp: () => {
          throw new AggregateError(
            [new Error('cleanup leaf failure')],
            'cleanup aggregate failure',
          );
        },
      });
    } catch (error) {
      failure = error;
    }

    assert.ok(failure instanceof AggregateError);
    const rendered = formatError(failure);
    assert.match(rendered, /primary generation failure/);
    assert.match(rendered, /cleanup leaf failure/);
    assert.match(rendered, /cleanup aggregate failure/);
    assert.ok(
      rendered.indexOf('primary generation failure') <
        rendered.indexOf('cleanup leaf failure'),
    );
  } finally {
    rmSync(repoRoot, { recursive: true, force: true });
  }
});

test('generateExpectedAgentDocs reports a missing CLI and cleans checker temp files', () => {
  const repoRoot = mkdtempSync(
    join(process.cwd(), '.astryx-generator-missing-'),
  );
  try {
    writeFileSync(join(repoRoot, 'AGENTS.md'), block('0.1.4'));
    const before = readFileSync(join(repoRoot, 'AGENTS.md'), 'utf8');
    assert.throws(
      () =>
        checkAstryxAgentDocs({
          repoRoot,
          targetRelativePath: 'AGENTS.md',
          generateExpected: generateExpectedAgentDocs,
        }),
      /Astryx CLI executable is missing/,
    );
    assert.deepEqual(
      readdirSync(repoRoot).filter((name) =>
        name.startsWith('.astryx-agent-docs-check-'),
      ),
      [],
    );
    assert.equal(readFileSync(join(repoRoot, 'AGENTS.md'), 'utf8'), before);
  } finally {
    rmSync(repoRoot, { recursive: true, force: true });
  }
});

test('generateExpectedAgentDocs preserves nonzero CLI diagnostics', () => {
  const repoRoot = mkdtempSync(
    join(process.cwd(), '.astryx-generator-nonzero-'),
  );
  const cliPath = join(
    repoRoot,
    'node_modules/@astryxdesign/cli/bin/astryx.mjs',
  );
  try {
    mkdirSync(dirname(cliPath), { recursive: true });
    writeFileSync(
      cliPath,
      "process.stderr.write('fake stderr diagnostic'); process.exitCode = 7;\n",
    );
    writeFileSync(join(repoRoot, 'AGENTS.md'), block('0.1.4'));
    const before = readFileSync(join(repoRoot, 'AGENTS.md'), 'utf8');
    assert.throws(
      () =>
        generateExpectedAgentDocs({
          repoRoot,
          outputRelativePath: 'AGENTS.md',
        }),
      /Astryx CLI failed \(7\).*fake stderr diagnostic/s,
    );
    assert.equal(readFileSync(join(repoRoot, 'AGENTS.md'), 'utf8'), before);
  } finally {
    rmSync(repoRoot, { recursive: true, force: true });
  }
});
