import test from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

import { git } from './git.mjs';
import { snapshot } from './inventory.mjs';
import { repositoryFixture } from '../test-support/commit-history-fixture.mjs';

test('git returns stdout as a Buffer without decoding commit bytes', (t) => {
  const fixture = repositoryFixture(t);
  fixture.commit('feat(workflow): add root');

  const output = git(fixture.cwd, ['show', '-s', '--format=%B', 'HEAD']);

  assert.ok(Buffer.isBuffer(output));
  assert.deepEqual(output, Buffer.from('feat(workflow): add root\n\n'));
});

test('snapshot enumerates shared commits once and records every containing ref', (t) => {
  const fixture = repositoryFixture(t);
  const root = fixture.commit('feat(workflow): add root');
  fixture.git('branch', 'topic');
  const main = fixture.commit('fix(workflow): update main');
  fixture.git('update-ref', 'refs/remotes/origin/main', main);
  fixture.git(
    'symbolic-ref',
    'refs/remotes/origin/HEAD',
    'refs/remotes/origin/main',
  );
  fixture.git('switch', '--quiet', 'topic');
  const topic = fixture.commit('docs(workflow): document topic');
  fixture.git('switch', '--quiet', 'main');
  writeFileSync(join(fixture.cwd, 'untracked.txt'), 'recovery material\n');
  fixture.git(
    'stash',
    'push',
    '--quiet',
    '--include-untracked',
    '-m',
    'inventory stash',
  );
  const stash = fixture.git('rev-parse', 'refs/stash').toString('ascii').trim();

  const inventory = snapshot(fixture.cwd);

  assert.equal(inventory.schemaVersion, 1);
  assert.equal(inventory.objectFormat, 'sha1');
  assert.deepEqual(
    inventory.refs.map(({ name, role, reason }) => ({ name, role, reason })),
    [
      { name: 'refs/heads/main', role: 'target', reason: 'local branch' },
      { name: 'refs/heads/topic', role: 'target', reason: 'local branch' },
      {
        name: 'refs/remotes/origin/HEAD',
        role: 'tracking',
        reason: 'symbolic tracking HEAD',
      },
      {
        name: 'refs/remotes/origin/main',
        role: 'tracking',
        reason: 'remote-tracking ref',
      },
      { name: 'refs/stash', role: 'preserve', reason: 'recovery ref' },
    ],
  );
  assert.equal(
    new Set(inventory.commits.map(({ oid }) => oid)).size,
    inventory.commits.length,
  );
  assert.deepEqual(
    inventory.commits.find(({ oid }) => oid === root).containingRefs,
    [
      'refs/heads/main',
      'refs/heads/topic',
      'refs/remotes/origin/HEAD',
      'refs/remotes/origin/main',
      'refs/stash',
    ],
  );
  assert.deepEqual(
    inventory.commits.find(({ oid }) => oid === main).containingRefs,
    [
      'refs/heads/main',
      'refs/remotes/origin/HEAD',
      'refs/remotes/origin/main',
      'refs/stash',
    ],
  );
  assert.deepEqual(
    inventory.commits.find(({ oid }) => oid === topic).containingRefs,
    ['refs/heads/topic'],
  );
  assert.deepEqual(
    inventory.commits.find(({ oid }) => oid === stash).containingRefs,
    ['refs/stash'],
  );
  assert.ok(
    inventory.commits.every(
      ({ messageBase64 }) => typeof messageBase64 === 'string',
    ),
  );
  assert.deepEqual(inventory.worktrees, [
    {
      path: fixture.cwd,
      head: main,
      branch: 'refs/heads/main',
      statusPorcelain: '',
    },
  ]);
});

test('snapshot traverses an unreferenced detached worktree HEAD', (t) => {
  const fixture = repositoryFixture(t);
  fixture.commit('feat(workflow): add root');
  const detachedPath = join(fixture.cwd, '.detached-worktree');
  fixture.git('worktree', 'add', '--quiet', '--detach', detachedPath, 'HEAD');
  writeFileSync(join(detachedPath, 'detached.txt'), 'detached history\n');
  fixture.git('-C', detachedPath, 'add', '--', 'detached.txt');
  fixture.git(
    '-C',
    detachedPath,
    'commit',
    '--quiet',
    '-m',
    'docs(workflow): preserve detached history',
  );
  const detachedHead = fixture
    .git('-C', detachedPath, 'rev-parse', 'HEAD')
    .toString('ascii')
    .trim();

  const inventory = snapshot(fixture.cwd);

  assert.deepEqual(
    inventory.worktrees.find(({ path }) => path === detachedPath),
    {
      path: detachedPath,
      head: detachedHead,
      branch: null,
      statusPorcelain: '',
    },
  );
  assert.deepEqual(
    inventory.commits.find(({ oid }) => oid === detachedHead).containingRefs,
    [],
  );
});

test('snapshot rejects a ref that cannot be peeled to a commit', (t) => {
  const fixture = repositoryFixture(t);
  fixture.commit('feat(workflow): add root');
  const blob = fixture
    .git('rev-parse', 'HEAD:fixture-1.txt')
    .toString('ascii')
    .trim();
  fixture.git('update-ref', 'refs/archive/blob', blob);

  assert.throws(
    () => snapshot(fixture.cwd),
    /cannot inventory ref refs\/archive\/blob: object type blob cannot be peeled to a commit/,
  );
});

test('snapshot rejects paths that are not valid UTF-8', (t) => {
  if (process.platform === 'win32') {
    t.skip('Windows paths cannot contain arbitrary invalid UTF-8 bytes');
    return;
  }
  const fixture = repositoryFixture(t);
  const parent = fixture.commit('feat(workflow): add root');
  const blob = git(
    fixture.cwd,
    ['hash-object', '-w', '--stdin'],
    Buffer.from('invalid path bytes\n'),
  )
    .toString('ascii')
    .trim();
  const treeInput = Buffer.concat([
    git(fixture.cwd, ['ls-tree', '-z', parent]),
    Buffer.from(`100644 blob ${blob}\tinvalid-`),
    Buffer.from([0xff]),
    Buffer.from('.txt\0'),
  ]);
  const tree = git(fixture.cwd, ['mktree', '-z'], treeInput)
    .toString('ascii')
    .trim();
  const commit = git(
    fixture.cwd,
    ['commit-tree', tree, '-p', parent],
    Buffer.from('test(workflow): add invalid path bytes\n'),
  )
    .toString('ascii')
    .trim();
  fixture.git('update-ref', 'refs/heads/main', commit);

  assert.throws(
    () => snapshot(fixture.cwd),
    /cannot inventory non-UTF-8 path losslessly/,
  );
});

test('snapshot records root paths, merge paths per parent, and special commit headers', (t) => {
  const fixture = repositoryFixture(t);
  const root = fixture.commit('feat(workflow): add root');
  fixture.git('branch', 'side');
  const mainParent = fixture.commit('feat(workflow): add main path');
  fixture.git('switch', '--quiet', 'side');
  const sideParent = fixture.commit('feat(workflow): add side path');
  fixture.git('switch', '--quiet', 'main');
  fixture.git(
    'merge',
    '--quiet',
    '--no-ff',
    '-m',
    'merge: combine fixture paths',
    'side',
  );
  const merge = fixture.git('rev-parse', 'HEAD').toString('ascii').trim();
  const tree = fixture
    .git('show', '-s', '--format=%T', merge)
    .toString('ascii')
    .trim();
  const raw = Buffer.from(
    `tree ${tree}\n` +
      `parent ${merge}\n` +
      'author Signed Fixture <fixture@example.invalid> 0 +0000\n' +
      'committer Signed Fixture <fixture@example.invalid> 0 +0000\n' +
      'gpgsig -----BEGIN PGP SIGNATURE-----\n' +
      ' fake-signature\n' +
      ' -----END PGP SIGNATURE-----\n' +
      'mergetag object 1111111111111111111111111111111111111111\n' +
      ' type commit\n' +
      ' tag fixture-tag\n' +
      ' tagger José Fixture <fixture@example.invalid> 0 +0000\n' +
      '\n' +
      'feat(workflow): inspect signed metadata\n',
  );
  const special = git(
    fixture.cwd,
    ['hash-object', '-t', 'commit', '-w', '--stdin'],
    raw,
  )
    .toString('ascii')
    .trim();
  fixture.git('update-ref', 'refs/heads/special', special);

  const inventory = snapshot(fixture.cwd);
  const rootRecord = inventory.commits.find(({ oid }) => oid === root);
  const mergeRecord = inventory.commits.find(({ oid }) => oid === merge);
  const specialRecord = inventory.commits.find(({ oid }) => oid === special);

  assert.deepEqual(rootRecord.paths, [
    { parent: null, paths: ['fixture-1.txt'] },
  ]);
  assert.deepEqual(mergeRecord.paths, [
    { parent: mainParent, paths: ['fixture-3.txt'] },
    { parent: sideParent, paths: ['fixture-2.txt'] },
  ]);
  assert.equal(specialRecord.signed, true);
  assert.deepEqual(
    specialRecord.specialHeaders.map(({ name }) => name),
    ['gpgsig', 'mergetag'],
  );
  assert.equal(
    Buffer.from(specialRecord.specialHeaders[1].valueBase64, 'base64').toString(
      'utf8',
    ),
    'object 1111111111111111111111111111111111111111\n' +
      ' type commit\n' +
      ' tag fixture-tag\n' +
      ' tagger José Fixture <fixture@example.invalid> 0 +0000',
  );
  assert.deepEqual(specialRecord.paths, [{ parent: merge, paths: [] }]);
});

test('CLI exposes only inventory and fail-closed ledger checks', (t) => {
  const fixture = repositoryFixture(t);
  const cli = fileURLToPath(new URL('./cli.mjs', import.meta.url));

  const help = spawnSync(process.execPath, [cli, '--help']);
  assert.equal(help.status, 0);
  assert.match(help.stdout.toString('utf8'), /inventory --source PATH/);
  assert.match(
    help.stdout.toString('utf8'),
    /check-ledger --inventory FILE --ledger FILE/,
  );

  const inventoryResult = spawnSync(process.execPath, [
    cli,
    'inventory',
    '--source',
    fixture.cwd,
  ]);
  assert.equal(
    inventoryResult.status,
    0,
    inventoryResult.stderr.toString('utf8'),
  );
  const inventory = JSON.parse(inventoryResult.stdout.toString('utf8'));
  assert.equal(inventory.schemaVersion, 1);
  assert.deepEqual(inventory.commits, []);

  const inventoryPath = join(fixture.cwd, 'inventory.json');
  const ledgerPath = join(fixture.cwd, 'ledger.json');
  writeFileSync(inventoryPath, `${JSON.stringify(inventory)}\n`);
  writeFileSync(ledgerPath, '[]\n');
  const checked = spawnSync(process.execPath, [
    cli,
    'check-ledger',
    '--inventory',
    inventoryPath,
    '--ledger',
    ledgerPath,
  ]);
  assert.equal(checked.status, 0, checked.stderr.toString('utf8'));
  assert.equal(checked.stdout.toString('utf8'), 'ledger valid: 0 decisions\n');

  const unknown = spawnSync(process.execPath, [cli, 'rewrite']);
  assert.equal(unknown.status, 1);
  assert.match(unknown.stderr.toString('utf8'), /unknown command/);
});
