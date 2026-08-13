import assert from 'node:assert/strict';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import {dirname, join} from 'node:path';
import {test} from 'node:test';

import {
  ASTRYX_MARKER_END,
  ASTRYX_MARKER_START,
  checkAstryxAgentDocs,
  extractAstryxBlock,
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
  ['missing', 'handwritten guidance only'],
  ['incomplete', `${ASTRYX_MARKER_START}\nAstryx v0.1.4`],
  ['duplicate', `${block('0.1.4')}\n${block('0.1.4')}`],
]) {
  test(`extractAstryxBlock rejects ${name} markers`, () => {
    assert.throws(
      () => extractAstryxBlock(content, name),
      /exactly one complete Astryx managed block/,
    );
  });
}

test('resolveRepoPath rejects targets outside the repository', () => {
  assert.throws(
    () => resolveRepoPath('/workspace/repo', '../AGENTS.md'),
    /must stay inside the repository/,
  );
});

test('astryx:agents forwards init arguments without a pnpm separator', () => {
  const packageJson = JSON.parse(
    readFileSync(join(process.cwd(), 'package.json'), 'utf8'),
  );

  assert.equal(
    packageJson.scripts['astryx:agents'],
    'pnpm run astryx init --features agents --agent-docs-path apps/github.io/AGENTS.md',
  );
});

test('checkAstryxAgentDocs accepts current content and cleans generated files', () => {
  const repoRoot = mkdtempSync(
    join(process.cwd(), '.astryx-agent-docs-test-current-'),
  );
  const targetRelativePath = 'apps/github.io/AGENTS.md';
  const targetPath = resolveRepoPath(repoRoot, targetRelativePath);

  try {
    mkdirSync(dirname(targetPath), {recursive: true});
    writeFileSync(targetPath, `handwritten\n${block('0.1.4')}\n`);

    checkAstryxAgentDocs({
      repoRoot,
      targetRelativePath,
      generateExpected: ({repoRoot: root, outputRelativePath}) => {
        writeFileSync(resolveRepoPath(root, outputRelativePath), block('0.1.4'));
      },
    });

    assert.deepEqual(
      readdirSync(repoRoot).filter((name) =>
        name.startsWith('.astryx-agent-docs-check-'),
      ),
      [],
    );
  } finally {
    rmSync(repoRoot, {recursive: true, force: true});
  }
});

test('checkAstryxAgentDocs rejects a stale copy and cleans generated files', () => {
  const repoRoot = mkdtempSync(
    join(process.cwd(), '.astryx-agent-docs-test-stale-'),
  );
  const targetRelativePath = 'apps/github.io/AGENTS.md';
  const targetPath = resolveRepoPath(repoRoot, targetRelativePath);

  try {
    mkdirSync(dirname(targetPath), {recursive: true});
    writeFileSync(targetPath, `handwritten\n${block('0.1.3')}\n`);

    assert.throws(
      () =>
        checkAstryxAgentDocs({
          repoRoot,
          targetRelativePath,
          generateExpected: ({repoRoot: root, outputRelativePath}) => {
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
    rmSync(repoRoot, {recursive: true, force: true});
  }
});
