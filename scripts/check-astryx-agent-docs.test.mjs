import assert from 'node:assert/strict';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';

import {
  ASTRYX_MARKER_END,
  ASTRYX_MARKER_START,
  checkAstryxAgentDocs,
  extractAstryxBlock,
  generateExpectedAgentDocs,
  resolveRepoPath,
} from './check-astryx-agent-docs.mjs';

const block = (version) =>
  `${ASTRYX_MARKER_START}\nAstryx v${version}\n${ASTRYX_MARKER_END}`;

test('extractAstryxBlock returns one complete managed block', () => {
  assert.equal(
    extractAstryxBlock(`before\n${block('0.1.4')}\nafter`, 'fixture'),
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

test('extractAstryxBlock gives a repair instruction for missing markers', () => {
  assert.throws(
    () => extractAstryxBlock('handwritten guidance only', 'missing'),
    /missing an Astryx managed block.*pnpm astryx:agents/s,
  );
});

for (const [name, content] of [
  ['fenced', '```md\n' + block('0.1.4') + '\n```'],
  ['indented', `  ${ASTRYX_MARKER_START}\nAstryx v0.1.4\n${ASTRYX_MARKER_END}`],
]) {
  test(`extractAstryxBlock rejects ${name} code markers`, () => {
    assert.throws(
      () => extractAstryxBlock(content, name),
      /markers inside fenced or indented Markdown code.*Remove.*marker/s,
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

test('generateExpectedAgentDocs reports a missing CLI and cleans checker temp files', () => {
  const repoRoot = mkdtempSync(
    join(process.cwd(), '.astryx-generator-missing-'),
  );
  try {
    writeFileSync(join(repoRoot, 'AGENTS.md'), block('0.1.4'));
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
    assert.throws(
      () =>
        generateExpectedAgentDocs({
          repoRoot,
          outputRelativePath: 'AGENTS.md',
        }),
      /Astryx CLI failed \(7\).*fake stderr diagnostic/s,
    );
  } finally {
    rmSync(repoRoot, { recursive: true, force: true });
  }
});
