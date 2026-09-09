import test from 'node:test';
import assert from 'node:assert/strict';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

import { git } from './git.mjs';
import { snapshot } from './inventory.mjs';
import { prepareRehearsal, rehearse } from './rehearsal.mjs';
import { repositoryFixture } from '../test-support/commit-history-fixture.mjs';

function scratchDirectory(t, prefix = 'commit-history-rehearsal-') {
  const path = mkdtempSync(join(tmpdir(), prefix));
  t.after(() => rmSync(path, { recursive: true, force: true }));
  return path;
}

function ledgerFor(inventory, changedOid = null) {
  return inventory.commits.map((commit) => {
    const changed = commit.oid === changedOid;
    return {
      oid: commit.oid,
      decision: changed ? 'change' : 'keep',
      originalMessageBase64: commit.messageBase64,
      replacementMessageBase64: changed
        ? Buffer.from('feat(github.io): add root\n').toString('base64')
        : null,
      domain: 'workflow',
      reason: changed
        ? 'approved historical scope correction'
        : 'scope is already accurate',
      evidence: [
        {
          path: 'scripts/commit-history/rehearsal.test.mjs',
          explanation: 'synthetic rehearsal fixture',
        },
      ],
      changeKind: changed ? 'scope' : 'none',
      releaseEffect: 'releasing',
      containingRefs: commit.containingRefs,
    };
  });
}

function sourceState(cwd) {
  return {
    status: git(cwd, ['status', '--porcelain=v1', '-z']),
    refs: git(cwd, [
      'for-each-ref',
      '--sort=refname',
      '--format=%(refname)%00%(objectname)%00%(symref)%00',
    ]),
  };
}

function assertSourceState(cwd, expected) {
  const actual = sourceState(cwd);
  assert.deepEqual(actual.status, expected.status);
  assert.deepEqual(actual.refs, expected.refs);
}

function graphFixture(t, { dirty = false, annotatedTag = false } = {}) {
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
  fixture.commit('docs(workflow): document topic');
  fixture.git('switch', '--quiet', 'main');
  writeFileSync(join(fixture.cwd, 'recovery.txt'), 'recovery material\n');
  fixture.git(
    'stash',
    'push',
    '--quiet',
    '--include-untracked',
    '-m',
    'rehearsal stash',
  );
  if (annotatedTag) {
    fixture.git('tag', '-a', 'v1.0.0', '-m', 'annotated fixture tag', main);
  }
  if (dirty) {
    writeFileSync(join(fixture.cwd, 'local-notes.txt'), 'not in bundle\n');
  }
  const inventory = snapshot(fixture.cwd);
  return {
    fixture,
    root,
    inventory,
    ledger: ledgerFor(inventory, root),
  };
}

function approve(packageRecord) {
  return {
    ...structuredClone(packageRecord),
    approvalEvidence: {
      kind: 'direct-user-approval',
      statement: 'Approved exact synthetic fixture rehearsal package.',
    },
  };
}

function prepareFixture(t, options = {}) {
  const state = graphFixture(t, options);
  const runDirectory = scratchDirectory(t);
  const before = sourceState(state.fixture.cwd);
  const approvalPackage = prepareRehearsal({
    source: state.fixture.cwd,
    runDirectory,
    inventory: state.inventory,
    ledger: state.ledger,
  });
  assertSourceState(state.fixture.cwd, before);
  return { ...state, runDirectory, before, approvalPackage };
}

test('prepare creates and verifies a complete recoverable bundle', (t) => {
  const state = prepareFixture(t, { dirty: true });
  const { approvalPackage, inventory } = state;

  assert.ok(existsSync(approvalPackage.backupPath));
  assert.ok(existsSync(approvalPackage.approvalPath));
  assert.equal(approvalPackage.backupVerified, true);
  assert.equal(approvalPackage.approvalEvidence, null);
  assert.equal(approvalPackage.signaturePolicy, 'reject');
  assert.match(approvalPackage.warnings.join('\n'), /uncommitted files/);
  assert.deepEqual(
    JSON.parse(readFileSync(approvalPackage.approvalPath, 'utf8')),
    approvalPackage,
  );

  for (const ref of inventory.refs) {
    assert.equal(
      git(approvalPackage.restoredRepository, ['rev-parse', ref.name])
        .toString('ascii')
        .trim(),
      ref.oid,
    );
  }
  assert.equal(
    git(approvalPackage.restoredRepository, [
      'symbolic-ref',
      'refs/remotes/origin/HEAD',
    ])
      .toString('utf8')
      .trim(),
    'refs/remotes/origin/main',
  );
  for (const commit of inventory.commits) {
    assert.equal(
      git(approvalPackage.restoredRepository, ['cat-file', '-t', commit.oid])
        .toString('ascii')
        .trim(),
      'commit',
    );
  }
});

test('prepare rejects detached-only commits before backup creation', (t) => {
  const fixture = repositoryFixture(t);
  fixture.commit('feat(workflow): add root');
  const detached = join(scratchDirectory(t), 'detached');
  fixture.git('worktree', 'add', '--quiet', '--detach', detached, 'HEAD');
  writeFileSync(join(detached, 'detached.txt'), 'detached history\n');
  fixture.git('-C', detached, 'add', '--', 'detached.txt');
  fixture.git(
    '-C',
    detached,
    'commit',
    '--quiet',
    '-m',
    'docs(workflow): detached history',
  );
  const inventory = snapshot(fixture.cwd);
  const runDirectory = join(scratchDirectory(t), 'run');

  assert.throws(
    () =>
      prepareRehearsal({
        source: fixture.cwd,
        runDirectory,
        inventory,
        ledger: ledgerFor(inventory),
      }),
    /detached-only inventory commits/,
  );
  assert.equal(existsSync(join(runDirectory, 'backup.bundle')), false);
});

test('prepare rejects changed worktree status assumptions', (t) => {
  const fixture = repositoryFixture(t);
  fixture.commit('feat(workflow): add root');
  const inventory = snapshot(fixture.cwd);
  writeFileSync(join(fixture.cwd, 'late-change.txt'), 'not inventoried\n');
  const runDirectory = join(scratchDirectory(t), 'run');

  assert.throws(
    () =>
      prepareRehearsal({
        source: fixture.cwd,
        runDirectory,
        inventory,
        ledger: ledgerFor(inventory),
      }),
    /worktree status changed/,
  );
  assert.equal(existsSync(join(runDirectory, 'backup.bundle')), false);
});

test('rehearse rewrites mapped refs, preserves recovery refs, and leaves source immutable', (t) => {
  const state = prepareFixture(t, { dirty: true });
  const approval = approve(state.approvalPackage);
  const report = rehearse({
    backup: state.approvalPackage.backupPath,
    destination: state.approvalPackage.destination,
    inventory: state.inventory,
    ledger: state.ledger,
    approval,
  });

  assert.equal(report.schemaVersion, 1);
  assert.equal(report.failures.length, 0);
  assert.equal(report.verification.commitCount, state.inventory.commits.length);
  assert.equal(report.signatureHandling.policy, 'reject');
  assert.ok(report.mapping.some(({ oldOid, newOid }) => oldOid !== newOid));
  for (const ref of report.refs) {
    const actual = git(state.approvalPackage.destination, [
      'rev-parse',
      ref.name,
    ])
      .toString('ascii')
      .trim();
    assert.equal(actual, ref.newOid);
    if (ref.role === 'preserve') assert.equal(ref.newOid, ref.oldOid);
  }
  assert.equal(
    git(state.approvalPackage.destination, [
      'symbolic-ref',
      'refs/remotes/origin/HEAD',
    ])
      .toString('utf8')
      .trim(),
    'refs/remotes/origin/main',
  );
  assertSourceState(state.fixture.cwd, state.before);
});

test('rehearse rejects a mismatched ledger digest', (t) => {
  const state = prepareFixture(t);
  const changedLedger = structuredClone(state.ledger);
  changedLedger[0].reason = 'different but still syntactically valid reason';

  assert.throws(
    () =>
      rehearse({
        backup: state.approvalPackage.backupPath,
        destination: state.approvalPackage.destination,
        inventory: state.inventory,
        ledger: changedLedger,
        approval: approve(state.approvalPackage),
      }),
    /ledger digest differs/,
  );
});

test('rehearse rejects moved source tips', (t) => {
  const state = prepareFixture(t);
  state.fixture.commit('fix(workflow): move source tip');

  assert.throws(
    () =>
      rehearse({
        backup: state.approvalPackage.backupPath,
        destination: state.approvalPackage.destination,
        inventory: state.inventory,
        ledger: state.ledger,
        approval: approve(state.approvalPackage),
      }),
    /source refs changed|frozen tip/,
  );
});

test('rehearse rejects a nonempty destination', (t) => {
  const state = prepareFixture(t);
  mkdirSync(state.approvalPackage.destination);
  writeFileSync(join(state.approvalPackage.destination, 'occupied'), 'stop\n');

  assert.throws(
    () =>
      rehearse({
        backup: state.approvalPackage.backupPath,
        destination: state.approvalPackage.destination,
        inventory: state.inventory,
        ledger: state.ledger,
        approval: approve(state.approvalPackage),
      }),
    /destination must be empty/,
  );
});

test('rehearse rejects missing direct approval evidence', (t) => {
  const state = prepareFixture(t);

  assert.throws(
    () =>
      rehearse({
        backup: state.approvalPackage.backupPath,
        destination: state.approvalPackage.destination,
        inventory: state.inventory,
        ledger: state.ledger,
        approval: state.approvalPackage,
      }),
    /direct user approval evidence/,
  );
});

test('rehearse rejects an approval whose exact ref set was altered', (t) => {
  const state = prepareFixture(t);
  const approval = approve(state.approvalPackage);
  approval.refs = approval.refs.filter(({ role }) => role !== 'preserve');

  assert.throws(
    () =>
      rehearse({
        backup: state.approvalPackage.backupPath,
        destination: state.approvalPackage.destination,
        inventory: state.inventory,
        ledger: state.ledger,
        approval,
      }),
    /approved refs differ from exact frozen refs/,
  );
});

test('rehearse rejects a destination equal to the source or common Git directory', async (t) => {
  const state = prepareFixture(t);
  const commonOutput = git(state.fixture.cwd, ['rev-parse', '--git-common-dir'])
    .toString('utf8')
    .trim();
  const commonDirectory = resolve(state.fixture.cwd, commonOutput);

  for (const destination of [state.fixture.cwd, commonDirectory]) {
    await t.test(destination, () => {
      const approval = approve(state.approvalPackage);
      approval.destination = destination;
      const index = approval.argv.indexOf('--destination');
      approval.argv[index + 1] = destination;
      assert.throws(
        () =>
          rehearse({
            backup: state.approvalPackage.backupPath,
            destination,
            inventory: state.inventory,
            ledger: state.ledger,
            approval,
          }),
        /destination must differ from source and common Git directory/,
      );
    });
  }
});

test('rehearse rejects annotated tags under the default policy', (t) => {
  const state = prepareFixture(t, { annotatedTag: true });

  assert.throws(
    () =>
      rehearse({
        backup: state.approvalPackage.backupPath,
        destination: state.approvalPackage.destination,
        inventory: state.inventory,
        ledger: state.ledger,
        approval: approve(state.approvalPackage),
      }),
    /annotated tag/,
  );
});

test('CLI exposes guarded local prepare and rehearse commands without a network option', () => {
  const cli = fileURLToPath(new URL('./cli.mjs', import.meta.url));
  const result = spawnSync(process.execPath, [cli, '--help']);
  const help = result.stdout.toString('utf8');

  assert.equal(result.status, 0, result.stderr.toString('utf8'));
  assert.match(
    help,
    /prepare --source PATH --inventory FILE --ledger FILE --run-directory PATH --output FILE/,
  );
  assert.match(
    help,
    /rehearse --backup FILE --destination PATH --inventory FILE --ledger FILE --approval FILE --output FILE/,
  );
  assert.doesNotMatch(help, /--remote|push/);

  const source = readFileSync(cli, 'utf8');
  assert.doesNotMatch(source, /\bpush\b|--mirror|--force/);
});
