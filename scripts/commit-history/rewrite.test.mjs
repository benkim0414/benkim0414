import test from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';

import { git } from './git.mjs';
import { snapshot } from './inventory.mjs';
import { parseCommit } from './objects.mjs';
import { rewriteObjects } from './rewrite.mjs';
import { repositoryFixture } from '../test-support/commit-history-fixture.mjs';

function ledgerFor(inventory, replacements = new Map()) {
  return inventory.commits.map((commit) => {
    const replacement = replacements.get(commit.oid);
    return {
      oid: commit.oid,
      decision: replacement ? 'change' : 'keep',
      originalMessageBase64: commit.messageBase64,
      replacementMessageBase64: replacement?.toString('base64') ?? null,
      domain: 'workflow',
      reason: replacement
        ? 'approved historical scope correction'
        : 'scope is already accurate',
      evidence: [
        {
          path: 'scripts/commit-history/rewrite.test.mjs',
          explanation: 'synthetic graph fixture',
        },
      ],
      changeKind: replacement ? 'scope' : 'none',
      releaseEffect: 'releasing',
      containingRefs: commit.containingRefs,
    };
  });
}

function setupRewrite(t) {
  const fixture = repositoryFixture(t);
  const root = fixture.commit('feat(skills): add root');
  const child = fixture.commit('fix(workflow): add child');
  const inventory = snapshot(fixture.cwd);
  const destination = join(fixture.cwd, '.rewrite.git');
  fixture.git('clone', '--quiet', '--bare', '--no-hardlinks', '.', destination);
  return { fixture, root, child, inventory, destination };
}

test('rewrites synthetic objects topologically without updating refs', (t) => {
  const { root, child, inventory, destination } = setupRewrite(t);
  const refsBefore = git(destination, ['show-ref']);
  const replacement = Buffer.from('feat(github.io): add root\n');

  const mapping = rewriteObjects({
    cwd: destination,
    inventory,
    ledger: ledgerFor(inventory, new Map([[root, replacement]])),
  });
  const byOld = new Map(mapping.map(({ oldOid, newOid }) => [oldOid, newOid]));

  assert.notEqual(byOld.get(root), root);
  assert.notEqual(byOld.get(child), child);
  assert.deepEqual(git(destination, ['show-ref']), refsBefore);
  assert.deepEqual(
    parseCommit(git(destination, ['cat-file', 'commit', byOld.get(root)]))
      .message,
    replacement,
  );
  assert.deepEqual(
    parseCommit(git(destination, ['cat-file', 'commit', byOld.get(child)]))
      .headers.filter(({ name }) => name === 'parent')
      .map(({ value }) => value.toString('ascii')),
    [byOld.get(root)],
  );
  assert.ok(git(destination, ['cat-file', '-e', root]).equals(Buffer.alloc(0)));
  assert.ok(
    git(destination, ['cat-file', '-e', child]).equals(Buffer.alloc(0)),
  );
});

test('reuses byte-identical commits', (t) => {
  const { inventory, destination } = setupRewrite(t);

  const mapping = rewriteObjects({
    cwd: destination,
    inventory,
    ledger: ledgerFor(inventory),
  });

  assert.deepEqual(
    mapping,
    inventory.commits.map(({ oid }) => ({ oldOid: oid, newOid: oid })),
  );
});

test('fails when inventory order does not make every parent available', (t) => {
  const { inventory, destination } = setupRewrite(t);
  const reversed = { ...inventory, commits: [...inventory.commits].reverse() };

  assert.throws(
    () =>
      rewriteObjects({
        cwd: destination,
        inventory: reversed,
        ledger: ledgerFor(reversed),
      }),
    /missing mapped parent/,
  );
});
