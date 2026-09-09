import test from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';

import { git } from './git.mjs';
import { snapshot } from './inventory.mjs';
import { rewriteObjects } from './rewrite.mjs';
import { verifyMapping } from './verify.mjs';
import { repositoryFixture } from '../test-support/commit-history-fixture.mjs';

function ledgerFor(
  inventory,
  changedOid,
  replacement = Buffer.from('feat(github.io): add root\n'),
) {
  return inventory.commits.map((commit) => {
    const changed = commit.oid === changedOid;
    return {
      oid: commit.oid,
      decision: changed ? 'change' : 'keep',
      originalMessageBase64: commit.messageBase64,
      replacementMessageBase64: changed ? replacement.toString('base64') : null,
      domain: 'workflow',
      reason: changed
        ? 'approved historical scope correction'
        : 'scope is already accurate',
      evidence: [
        {
          path: 'scripts/commit-history/verify.test.mjs',
          explanation: 'synthetic graph fixture',
        },
      ],
      changeKind: changed ? 'scope' : 'none',
      releaseEffect: 'releasing',
      containingRefs: commit.containingRefs,
    };
  });
}

function setupVerification(t) {
  const fixture = repositoryFixture(t);
  const root = fixture.commit('feat(skills): add root');
  const child = fixture.commit('fix(workflow): add child');
  const inventory = snapshot(fixture.cwd);
  const destination = join(fixture.cwd, '.verify.git');
  fixture.git('clone', '--quiet', '--bare', '--no-hardlinks', '.', destination);
  const ledger = ledgerFor(inventory, root);
  const mapping = rewriteObjects({ cwd: destination, inventory, ledger });
  return {
    source: fixture.cwd,
    destination,
    inventory,
    ledger,
    mapping,
    root,
    child,
  };
}

function replaceCommit(destination, mapping, oldOid, update, { literal } = {}) {
  const row = mapping.find((candidate) => candidate.oldOid === oldOid);
  const original = git(destination, ['cat-file', 'commit', row.newOid]);
  const replacement = update(original);
  const args = ['hash-object', '-t', 'commit', '-w', '--stdin'];
  if (literal) args.push('--literally');
  row.newOid = git(destination, args, replacement).toString('ascii').trim();
}

function writeCommit(cwd, raw) {
  return git(cwd, ['hash-object', '-t', 'commit', '-w', '--stdin'], raw)
    .toString('ascii')
    .trim();
}

function insertHeaders(raw, lines) {
  const separator = raw.indexOf('\n\n');
  return Buffer.concat([
    raw.subarray(0, separator),
    Buffer.from(`\n${lines.join('\n')}`),
    raw.subarray(separator),
  ]);
}

function replaceMessage(raw, message) {
  const separator = raw.indexOf('\n\n');
  return Buffer.concat([raw.subarray(0, separator + 2), message]);
}

function setupHeaderBinding(t, headerLines) {
  const fixture = repositoryFixture(t);
  const root = fixture.commit('feat(skills): add root');
  const originalChild = fixture.commit('fix(workflow): add child');
  const child = writeCommit(
    fixture.cwd,
    insertHeaders(
      git(fixture.cwd, ['cat-file', 'commit', originalChild]),
      headerLines,
    ),
  );
  fixture.git('update-ref', 'refs/heads/main', child, originalChild);
  const inventory = snapshot(fixture.cwd);
  const destination = join(fixture.cwd, '.binding.git');
  fixture.git('clone', '--quiet', '--bare', '--no-hardlinks', '.', destination);
  return {
    source: fixture.cwd,
    destination,
    inventory,
    root,
    child,
  };
}

test('independently verifies a complete message-only mapping', (t) => {
  const state = setupVerification(t);

  assert.deepEqual(verifyMapping(state), {
    commitCount: 2,
    rootCount: 1,
    treesEqual: true,
    parentsEqual: true,
    messagesEqual: true,
    metadataEqual: true,
  });
  const childMapping = state.mapping.find(
    ({ oldOid }) => oldOid === state.child,
  );
  assert.notEqual(
    childMapping.newOid,
    state.child,
    'a keep row still receives a new identity when its parent changed',
  );
});

test('verifier rejects incomplete, extra, and non-unique mappings', async (t) => {
  await t.test('incomplete coverage', () => {
    const state = setupVerification(t);
    state.mapping.pop();
    assert.throws(() => verifyMapping(state), /mapping count|coverage/);
  });

  await t.test('extra coverage', () => {
    const state = setupVerification(t);
    state.mapping.push({ oldOid: 'f'.repeat(40), newOid: 'e'.repeat(40) });
    assert.throws(() => verifyMapping(state), /mapping count|unknown old OID/);
  });

  await t.test('non-unique destination OID', () => {
    const state = setupVerification(t);
    state.mapping[1].newOid = state.mapping[0].newOid;
    assert.throws(() => verifyMapping(state), /duplicate new OID/);
  });
});

test('verifier rejects a changed tree', (t) => {
  const state = setupVerification(t);
  const rootTree = state.inventory.commits.find(
    ({ oid }) => oid === state.root,
  ).tree;
  replaceCommit(state.destination, state.mapping, state.child, (raw) =>
    Buffer.from(
      raw.toString('utf8').replace(/^tree [0-9a-f]+$/m, `tree ${rootTree}`),
    ),
  );

  assert.throws(() => verifyMapping(state), /tree differs/);
});

test('verifier rejects changed ordered parents', (t) => {
  const state = setupVerification(t);
  replaceCommit(state.destination, state.mapping, state.child, (raw) =>
    Buffer.from(
      raw
        .toString('utf8')
        .replace(/^parent [0-9a-f]+$/m, `parent ${state.root}`),
    ),
  );

  assert.throws(() => verifyMapping(state), /parents differ/);
});

test('verifier rejects a changed message', (t) => {
  const state = setupVerification(t);
  replaceCommit(state.destination, state.mapping, state.child, (raw) => {
    const separator = raw.indexOf('\n\n');
    return Buffer.concat([
      raw.subarray(0, separator + 2),
      Buffer.from('fix(workflow): corrupted message\n'),
    ]);
  });

  assert.throws(() => verifyMapping(state), /message differs/);
});

test('verifier rejects changed raw metadata', (t) => {
  const state = setupVerification(t);
  replaceCommit(state.destination, state.mapping, state.child, (raw) =>
    Buffer.from(
      raw
        .toString('utf8')
        .replace('author Commit History Fixture', 'author Changed Fixture'),
    ),
  );

  assert.throws(() => verifyMapping(state), /metadata differs/);
});

test('verifier rejects relocating a parent header among metadata', (t) => {
  const state = setupVerification(t);
  replaceCommit(
    state.destination,
    state.mapping,
    state.child,
    (raw) => {
      const separator = raw.indexOf('\n\n');
      const headers = raw.subarray(0, separator).toString('ascii').split('\n');
      const parentIndex = headers.findIndex((line) =>
        line.startsWith('parent '),
      );
      const [parent] = headers.splice(parentIndex, 1);
      const authorIndex = headers.findIndex((line) =>
        line.startsWith('author '),
      );
      headers.splice(authorIndex + 1, 0, parent);
      return Buffer.concat([
        Buffer.from(`${headers.join('\n')}\n\n`),
        raw.subarray(separator + 2),
      ]);
    },
    { literal: true },
  );

  assert.throws(() => verifyMapping(state), /header order|metadata differs/);
});

for (const signatureHeader of ['gpgsig', 'gpgsig-sha256']) {
  test(`verifier rejects a changed ${signatureHeader} commit identity`, (t) => {
    const state = setupHeaderBinding(t, [
      `${signatureHeader} -----BEGIN SIGNATURE-----`,
      ' continuation bytes',
    ]);
    const replacement = Buffer.from('fix(github.io): add child\n');
    const ledger = ledgerFor(state.inventory, state.child, replacement);
    const changedChild = writeCommit(
      state.destination,
      replaceMessage(
        git(state.source, ['cat-file', 'commit', state.child]),
        replacement,
      ),
    );
    const mapping = state.inventory.commits.map(({ oid }) => ({
      oldOid: oid,
      newOid: oid === state.child ? changedChild : oid,
    }));

    assert.throws(
      () => verifyMapping({ ...state, ledger, mapping }),
      /signature-bearing commit/,
    );
  });
}

test('verifier rejects a remapped parent on a directly signed commit', (t) => {
  const state = setupHeaderBinding(t, [
    'gpgsig -----BEGIN SIGNATURE-----',
    ' continuation bytes',
  ]);
  const ledger = ledgerFor(state.inventory, state.root);
  const newRoot = writeCommit(
    state.destination,
    replaceMessage(
      git(state.source, ['cat-file', 'commit', state.root]),
      Buffer.from('feat(github.io): add root\n'),
    ),
  );
  const newChild = writeCommit(
    state.destination,
    Buffer.from(
      git(state.source, ['cat-file', 'commit', state.child])
        .toString('utf8')
        .replace(`parent ${state.root}`, `parent ${newRoot}`),
    ),
  );
  const mapping = state.inventory.commits.map(({ oid }) => ({
    oldOid: oid,
    newOid: oid === state.root ? newRoot : newChild,
  }));

  assert.throws(
    () => verifyMapping({ ...state, ledger, mapping }),
    /signature-bearing commit/,
  );
});

test('verifier rejects a remapped parent retained beside a mergetag', (t) => {
  const fixture = repositoryFixture(t);
  const root = fixture.commit('feat(skills): add root');
  const originalChild = fixture.commit('fix(workflow): add child');
  const child = writeCommit(
    fixture.cwd,
    insertHeaders(git(fixture.cwd, ['cat-file', 'commit', originalChild]), [
      `mergetag object ${root}`,
      ' type commit',
      ' tag fixture',
      ' tagger Fixture <fixture@example.invalid> 3 +0000',
    ]),
  );
  fixture.git('update-ref', 'refs/heads/main', child, originalChild);
  const inventory = snapshot(fixture.cwd);
  const destination = join(fixture.cwd, '.mergetag.git');
  fixture.git('clone', '--quiet', '--bare', '--no-hardlinks', '.', destination);
  const ledger = ledgerFor(inventory, root);
  const newRoot = writeCommit(
    destination,
    replaceMessage(
      git(fixture.cwd, ['cat-file', 'commit', root]),
      Buffer.from('feat(github.io): add root\n'),
    ),
  );
  const childRaw = git(fixture.cwd, ['cat-file', 'commit', child]);
  const newChild = writeCommit(
    destination,
    Buffer.from(
      childRaw.toString('utf8').replace(`parent ${root}`, `parent ${newRoot}`),
    ),
  );
  const mapping = inventory.commits.map(({ oid }) => ({
    oldOid: oid,
    newOid: oid === root ? newRoot : newChild,
  }));

  assert.throws(
    () =>
      verifyMapping({
        source: fixture.cwd,
        destination,
        inventory,
        ledger,
        mapping,
      }),
    /mergetag/,
  );
});

test('verifier rejects a changed root count', (t) => {
  const state = setupVerification(t);
  replaceCommit(state.destination, state.mapping, state.root, (raw) => {
    const lineEnd = raw.indexOf('\n');
    return Buffer.concat([
      raw.subarray(0, lineEnd + 1),
      Buffer.from(`parent ${state.root}\n`),
      raw.subarray(lineEnd + 1),
    ]);
  });

  assert.throws(() => verifyMapping(state), /root count differs/);
});
