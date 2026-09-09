import test from 'node:test';
import assert from 'node:assert/strict';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, join, resolve } from 'node:path';
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
      approvalDigest: packageRecord.approvalDigest,
      kind: 'direct-user-approval',
      statement: 'Approved exact synthetic fixture rehearsal package.',
    },
  };
}

function invocationFor(packageRecord, replacements = {}) {
  const argv = [...packageRecord.argv];
  for (const [flag, path] of Object.entries(replacements)) {
    const index = argv.indexOf(flag);
    assert.notEqual(index, -1, `missing invocation flag ${flag}`);
    argv[index + 1] = resolve(path);
  }
  return { executable: packageRecord.executable, argv };
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
  assert.match(approvalPackage.approvalDigest, /^[0-9a-f]{64}$/);
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

test('prepare permits the approved source-local history repair directory', (t) => {
  const state = graphFixture(t);
  writeFileSync(
    join(state.fixture.cwd, '.git', 'info', 'exclude'),
    '.history-repair/\n',
  );
  state.inventory = snapshot(state.fixture.cwd);
  state.ledger = ledgerFor(state.inventory, state.root);
  const runDirectory = join(
    state.fixture.cwd,
    '.history-repair',
    'synthetic-run',
  );

  const approval = prepareRehearsal({
    source: state.fixture.cwd,
    runDirectory,
    inventory: state.inventory,
    ledger: state.ledger,
  });

  assert.equal(approval.runDirectory, resolve(runDirectory));
  assert.ok(existsSync(approval.backupPath));
});

test('prepare rejects Git-storage descendants and symlink aliases before writing', async (t) => {
  for (const alias of [false, true]) {
    await t.test(alias ? 'symlink alias' : '.git descendant', () => {
      const state = graphFixture(t);
      const runDirectory = alias
        ? join(state.fixture.cwd, '.history-repair', 'synthetic-run')
        : join(state.fixture.cwd, '.git', 'history-repair-run');
      if (alias) {
        symlinkSync('.git', join(state.fixture.cwd, '.history-repair'));
      }

      assert.throws(
        () =>
          prepareRehearsal({
            source: state.fixture.cwd,
            runDirectory,
            inventory: state.inventory,
            ledger: state.ledger,
          }),
        /Git storage|protected path/,
      );
      assert.equal(existsSync(runDirectory), false);
    });
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
    invocation: invocationFor(state.approvalPackage),
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
        invocation: invocationFor(state.approvalPackage),
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
        invocation: invocationFor(state.approvalPackage),
      }),
    /source refs changed|frozen tip/,
  );
});

test('rehearse retains the already-validated ref buffer as its race baseline', (t) => {
  const state = prepareFixture(t);
  const wrapperDirectory = scratchDirectory(t);
  const wrapper = join(wrapperDirectory, 'git');
  const realGit = process.env.PATH.split(delimiter)
    .map((directory) => join(directory, 'git'))
    .find((candidate) => existsSync(candidate));
  assert.ok(realGit, 'real git executable not found');
  writeFileSync(
    wrapper,
    `#!/bin/sh
if [ "$1" = "for-each-ref" ] && [ ! -e "$RACE_MARKER" ]; then
  "$REAL_GIT_UNDER_TEST" "$@" > "$RACE_OUTPUT"
  status=$?
  if [ "$status" -eq 0 ]; then
    : > "$RACE_MARKER"
    "$REAL_GIT_UNDER_TEST" update-ref refs/remotes/origin/main "$RACE_NEW_OID"
  fi
  cat "$RACE_OUTPUT"
  exit "$status"
fi
exec "$REAL_GIT_UNDER_TEST" "$@"
`,
    { mode: 0o755 },
  );
  const oldEnvironment = {
    PATH: process.env.PATH,
    REAL_GIT_UNDER_TEST: process.env.REAL_GIT_UNDER_TEST,
    RACE_MARKER: process.env.RACE_MARKER,
    RACE_OUTPUT: process.env.RACE_OUTPUT,
    RACE_NEW_OID: process.env.RACE_NEW_OID,
  };
  process.env.PATH = `${wrapperDirectory}${delimiter}${process.env.PATH}`;
  process.env.REAL_GIT_UNDER_TEST = realGit;
  process.env.RACE_MARKER = join(wrapperDirectory, 'marker');
  process.env.RACE_OUTPUT = join(wrapperDirectory, 'refs');
  process.env.RACE_NEW_OID = state.root;

  try {
    assert.throws(
      () =>
        rehearse({
          backup: state.approvalPackage.backupPath,
          destination: state.approvalPackage.destination,
          inventory: state.inventory,
          ledger: state.ledger,
          approval: approve(state.approvalPackage),
          invocation: invocationFor(state.approvalPackage),
        }),
      /source refs changed during rehearsal operation/,
    );
  } finally {
    for (const [name, value] of Object.entries(oldEnvironment)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});

test('rehearse detects a detached worktree added during the operation', (t) => {
  const state = prepareFixture(t);
  const wrapperDirectory = scratchDirectory(t);
  const lateWorktree = join(scratchDirectory(t), 'late-detached');
  const wrapper = join(wrapperDirectory, 'git');
  const realGit = process.env.PATH.split(delimiter)
    .map((directory) => join(directory, 'git'))
    .find((candidate) => existsSync(candidate));
  assert.ok(realGit, 'real git executable not found');
  writeFileSync(
    wrapper,
    `#!/bin/sh
if [ "$1" = "update-ref" ] && [ "$2" = "--stdin" ] && [ ! -e "$WORKTREE_RACE_MARKER" ]; then
  "$REAL_GIT_UNDER_TEST" "$@"
  status=$?
  if [ "$status" -eq 0 ]; then
    : > "$WORKTREE_RACE_MARKER"
    "$REAL_GIT_UNDER_TEST" -C "$WORKTREE_RACE_SOURCE" worktree add --quiet --detach "$WORKTREE_RACE_PATH" "$WORKTREE_RACE_OID"
  fi
  exit "$status"
fi
exec "$REAL_GIT_UNDER_TEST" "$@"
`,
    { mode: 0o755 },
  );
  const variableNames = [
    'PATH',
    'REAL_GIT_UNDER_TEST',
    'WORKTREE_RACE_MARKER',
    'WORKTREE_RACE_SOURCE',
    'WORKTREE_RACE_PATH',
    'WORKTREE_RACE_OID',
  ];
  const oldEnvironment = Object.fromEntries(
    variableNames.map((name) => [name, process.env[name]]),
  );
  process.env.PATH = `${wrapperDirectory}${delimiter}${process.env.PATH}`;
  process.env.REAL_GIT_UNDER_TEST = realGit;
  process.env.WORKTREE_RACE_MARKER = join(wrapperDirectory, 'marker');
  process.env.WORKTREE_RACE_SOURCE = state.fixture.cwd;
  process.env.WORKTREE_RACE_PATH = lateWorktree;
  process.env.WORKTREE_RACE_OID = state.root;

  try {
    assert.throws(
      () =>
        rehearse({
          backup: state.approvalPackage.backupPath,
          destination: state.approvalPackage.destination,
          inventory: state.inventory,
          ledger: state.ledger,
          approval: approve(state.approvalPackage),
          invocation: invocationFor(state.approvalPackage),
        }),
      /worktree set changed/,
    );
  } finally {
    for (const [name, value] of Object.entries(oldEnvironment)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
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
        invocation: invocationFor(state.approvalPackage),
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
        invocation: invocationFor(state.approvalPackage),
      }),
    /direct user approval evidence/,
  );
});

test('rehearse binds direct approval evidence to the immutable package digest', (t) => {
  const state = prepareFixture(t);
  const approval = approve(state.approvalPackage);
  approval.warnings.push('mutable field changed after direct approval');

  assert.throws(
    () =>
      rehearse({
        backup: state.approvalPackage.backupPath,
        destination: state.approvalPackage.destination,
        inventory: state.inventory,
        ledger: state.ledger,
        approval,
        invocation: invocationFor(state.approvalPackage),
      }),
    /approval package digest/,
  );
});

test('rehearse rejects alternate identical-content invocation paths', async (t) => {
  for (const [flag, filename, value] of [
    ['--inventory', 'alternate-inventory.json', 'inventory'],
    ['--ledger', 'alternate-ledger.json', 'ledger'],
    ['--approval', 'alternate-approval.json', 'approval'],
  ]) {
    await t.test(flag, () => {
      const state = prepareFixture(t);
      const alternatePath = join(state.runDirectory, filename);
      const approval = approve(state.approvalPackage);
      const contents =
        value === 'inventory'
          ? state.inventory
          : value === 'ledger'
            ? state.ledger
            : approval;
      writeFileSync(alternatePath, `${JSON.stringify(contents, null, 2)}\n`);
      writeFileSync(
        state.approvalPackage.approvalPath,
        `${JSON.stringify(approval, null, 2)}\n`,
      );
      const invocation = invocationFor(state.approvalPackage, {
        [flag]: alternatePath,
      });
      const result = spawnSync(invocation.executable, invocation.argv);

      assert.notEqual(result.status, 0);
      assert.match(
        result.stderr.toString('utf8'),
        /actual invocation differs from approved arguments/,
      );
    });
  }
});

test('rehearse rejects a newly added detached worktree', (t) => {
  const state = prepareFixture(t);
  const detached = join(scratchDirectory(t), 'late-detached');
  state.fixture.git(
    'worktree',
    'add',
    '--quiet',
    '--detach',
    detached,
    state.root,
  );

  assert.throws(
    () =>
      rehearse({
        backup: state.approvalPackage.backupPath,
        destination: state.approvalPackage.destination,
        inventory: state.inventory,
        ledger: state.ledger,
        approval: approve(state.approvalPackage),
        invocation: invocationFor(state.approvalPackage),
      }),
    /worktree set changed/,
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
        invocation: invocationFor(state.approvalPackage),
      }),
    /approval package digest/,
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
      assert.throws(
        () =>
          rehearse({
            backup: state.approvalPackage.backupPath,
            destination,
            inventory: state.inventory,
            ledger: state.ledger,
            approval,
            invocation: invocationFor(state.approvalPackage, {
              '--destination': destination,
            }),
          }),
        /destination must differ|protected path/,
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
        invocation: invocationFor(state.approvalPackage),
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
