import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  bootstrapRelease,
  calculateRelease,
  serializeReleaseRecord,
  verifyDeployment,
  verifyReleaseRecord,
} from './github-io-release.mjs';
import * as release from './github-io-release.mjs';
const { isCompletedSandboxProcess, verifyMainTarget, verifyBootstrapApproval } =
  release;

test('release notes contain only the accepted ordered commit set, including on recovery', (t) => {
  const cwd = repository(t);
  commit(cwd, 'chore: seed');
  git(cwd, 'tag', 'github.io@1.0.0');
  const accepted = commit(cwd, 'fix(github.io): accepted change');
  const target = commit(cwd, 'feat(other): ignored change');
  const decision = calculateRelease({ cwd, target });
  const saved = record(target, '1.0.1', {
    previousVersion: '1.0.0',
    commits: decision.commits,
  });
  const expected = `## github.io@1.0.1\n\n- fix(github.io): accepted change (\`${accepted}\`)`;
  assert.equal(release.renderReleaseNotes(saved), expected);
  assert.equal(
    release.renderReleaseNotes(JSON.parse(serializeReleaseRecord(saved))),
    expected,
  );
});

function git(cwd, ...args) {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

function repository(t) {
  const cwd = mkdtempSync(join(tmpdir(), 'github-io-release-'));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  git(cwd, 'init', '-b', 'main');
  git(cwd, 'config', 'user.name', 'Release Test');
  git(cwd, 'config', 'user.email', 'release@example.com');
  git(cwd, 'config', 'core.hooksPath', '/dev/null');
  return cwd;
}

function commit(cwd, subject, body = '') {
  const filename = `fixture-${Date.now()}-${Math.random()}.txt`;
  writeFileSync(join(cwd, filename), subject);
  git(cwd, 'add', filename);
  const args = ['commit', '-m', subject];
  if (body) args.push('-m', body);
  git(cwd, ...args);
  return git(cwd, 'rev-parse', 'HEAD');
}

function record(sourceSha, version, overrides = {}) {
  return {
    schemaVersion: 1,
    project: 'github.io',
    sourceSha,
    previousVersion: '0.0.0',
    version,
    tag: `github.io@${version}`,
    bootstrap: false,
    commits: [],
    artifact: {
      name: 'github-io-pages.tgz',
      sha256: 'a'.repeat(64),
    },
    ...overrides,
  };
}

test('calculate scans only the target first-parent range and replays bumps in order', (t) => {
  const cwd = repository(t);
  commit(cwd, 'chore: seed');
  git(cwd, 'tag', 'github.io@1.2.3');
  const patch = commit(cwd, 'fix(github.io): repair footer');

  git(cwd, 'switch', '-c', 'unmerged', 'github.io@1.2.3');
  commit(cwd, 'feat(github.io): do not include this branch');
  git(cwd, 'switch', 'main');
  const target = commit(cwd, 'feat(github.io): add release footer');

  const result = calculateRelease({ cwd, target });

  assert.deepEqual(result, {
    action: 'prepare',
    project: 'github.io',
    sourceSha: target,
    previousVersion: '1.2.3',
    newVersion: '1.3.0',
    tag: 'github.io@1.3.0',
    bump: 'minor',
    bootstrap: false,
    commits: [
      { sha: patch, subject: 'fix(github.io): repair footer', bump: 'patch' },
      {
        sha: target,
        subject: 'feat(github.io): add release footer',
        bump: 'minor',
      },
    ],
  });
});

test('rejects a second-parent release baseline and manual target', (t) => {
  const cwd = repository(t);
  commit(cwd, 'chore: seed');
  git(cwd, 'switch', '-c', 'feature');
  const side = commit(cwd, 'feat(github.io): side branch');
  git(cwd, 'tag', 'github.io@1.0.0');
  git(cwd, 'switch', 'main');
  git(cwd, 'merge', '--no-ff', 'feature', '-m', 'chore: integration');
  const target = git(cwd, 'rev-parse', 'HEAD');
  git(cwd, 'update-ref', 'refs/remotes/origin/main', target);
  assert.throws(() => calculateRelease({ cwd, target }), /first-parent/);
  assert.throws(() => verifyMainTarget({ cwd, target: side }), /first-parent/);
  assert.equal(verifyMainTarget({ cwd, target }), target);
});

test('an obsolete first-parent target is superseded while divergent history fails', (t) => {
  const cwd = repository(t);
  const target = commit(cwd, 'chore: seed');
  commit(cwd, 'feat(github.io): current release');
  git(cwd, 'tag', 'github.io@1.0.0');
  assert.deepEqual(calculateRelease({ cwd, target }), {
    action: 'superseded',
    project: 'github.io',
    sourceSha: target,
    previousVersion: '1.0.0',
    bootstrap: false,
    commits: [],
  });
  git(cwd, 'switch', '-c', 'divergent', target);
  const other = commit(cwd, 'fix(github.io): divergent');
  assert.throws(() => calculateRelease({ cwd, target: other }), /first-parent/);
});

test('a tag on a branch descended from an old main target is divergent, not superseded', (t) => {
  const cwd = repository(t);
  const target = commit(cwd, 'chore: shared main integration');
  commit(cwd, 'chore: current main');
  git(cwd, 'switch', '-c', 'wrong-release-branch', target);
  commit(cwd, 'feat(github.io): not integrated');
  git(cwd, 'tag', 'github.io@2.0.0');
  assert.throws(
    () => calculateRelease({ cwd, target, main: 'main' }),
    /first-parent/,
  );
});

test('fresh calculation rejects a feature-branch target even with a valid baseline', (t) => {
  const cwd = repository(t);
  commit(cwd, 'chore: seed');
  git(cwd, 'tag', 'github.io@1.0.0');
  git(cwd, 'switch', '-c', 'unintegrated');
  const target = commit(cwd, 'fix(github.io): branch target');
  assert.throws(() => calculateRelease({ cwd, target }), /first-parent/);
});

test('bootstrap approval binds a full reviewed SHA and exact calculated version', () => {
  const decision = {
    action: 'prepare',
    bootstrap: true,
    sourceSha: 'a'.repeat(40),
    newVersion: '0.1.1',
  };
  assert.deepEqual(
    verifyBootstrapApproval(decision, {
      sourceSha: decision.sourceSha,
      version: '0.1.1',
    }),
    decision,
  );
  for (const approval of [
    {},
    { sourceSha: 'aaaaaaa', version: '0.1.1' },
    { sourceSha: 'b'.repeat(40), version: '0.1.1' },
    { sourceSha: decision.sourceSha, version: '0.1.2' },
  ]) {
    assert.throws(
      () => verifyBootstrapApproval(decision, approval),
      /reviewed/,
    );
  }
});

test('sandbox completion compatibility accepts only a successful EPERM with text stdout', () => {
  assert.equal(
    isCompletedSandboxProcess({ code: 'EPERM', status: 0, stdout: 'ok' }),
    true,
  );
  for (const value of [
    null,
    {},
    { code: 'EIO', status: 0, stdout: 'ok' },
    { code: 'EPERM', status: 1, stdout: 'ok' },
    { code: 'EPERM', status: 0 },
    { code: 'EPERM', status: 0, stdout: Buffer.from('ok') },
  ]) {
    assert.equal(isCompletedSandboxProcess(value), false);
  }
});

test('CLI emits exactly one JSON value on success and only diagnostics on failure', (t) => {
  const cwd = repository(t);
  commit(cwd, 'chore: seed');
  git(cwd, 'tag', 'github.io@1.0.0');
  const target = commit(cwd, 'fix(github.io): CLI fixture');
  git(cwd, 'update-ref', 'refs/remotes/origin/main', target);
  const cli = (args) =>
    spawnSync(
      process.execPath,
      [new URL('./github-io-release.mjs', import.meta.url).pathname, ...args],
      { cwd, encoding: 'utf8' },
    );
  const success = cli(['calculate', '--target', target]);
  assert.equal(success.status, 0, success.stderr);
  assert.equal(success.stderr, '');
  assert.equal(success.stdout.trim().split('\n').length, 1);
  assert.equal(JSON.parse(success.stdout).newVersion, '1.0.1');
  const artifactPath = join(cwd, 'artifact.tgz');
  writeFileSync(artifactPath, 'bytes');
  const saved = record(target, '1.0.1', {
    artifact: {
      name: 'artifact.tgz',
      sha256: createHash('sha256').update('bytes').digest('hex'),
    },
  });
  const recordPath = join(cwd, 'record.json');
  writeFileSync(recordPath, serializeReleaseRecord(saved));
  const verified = cli([
    'verify-record',
    '--record',
    recordPath,
    '--artifact',
    artifactPath,
    '--target',
    target,
  ]);
  assert.equal(verified.status, 0, verified.stderr);
  assert.equal(verified.stderr, '');
  assert.equal(JSON.parse(verified.stdout).action, 'verified');
  writeFileSync(artifactPath, 'corruption');
  for (const [args, diagnostic] of [
    [['calculate'], /--target is required/],
    [['calculate', '--target'], /requires a value/],
    [
      ['verify-record', '--record', recordPath, '--artifact', artifactPath],
      /digest mismatch/,
    ],
  ]) {
    const failure = cli(args);
    assert.equal(failure.status, 1);
    assert.equal(failure.stdout, '');
    assert.match(failure.stderr, diagnostic);
  }
});

test('calculate rejects the latest project tag when it is not target ancestry', (t) => {
  const cwd = repository(t);
  commit(cwd, 'chore: seed');
  git(cwd, 'tag', 'github.io@1.0.0');
  const target = commit(cwd, 'fix(github.io): main fix');
  git(cwd, 'switch', '-c', 'divergent', 'github.io@1.0.0');
  commit(cwd, 'feat(github.io): divergent release');
  git(cwd, 'tag', 'github.io@2.0.0');

  assert.throws(
    () => calculateRelease({ cwd, target }),
    /github\.io@2\.0\.0 is not an ancestor/,
  );
});

test('calculate classifies all commits introduced by a true merge as one integration', (t) => {
  const cwd = repository(t);
  commit(cwd, 'chore: seed');
  git(cwd, 'tag', 'github.io@1.0.0');
  git(cwd, 'switch', '-c', 'feature');
  const fix = commit(cwd, 'fix(github.io): repair navigation');
  const feature = commit(cwd, 'feat(github.io): add profile');
  git(cwd, 'switch', 'main');
  git(cwd, 'merge', '--no-ff', 'feature', '-m', 'chore: merge profile');
  const target = git(cwd, 'rev-parse', 'HEAD');

  const result = calculateRelease({ cwd, target });

  assert.deepEqual(result, {
    action: 'prepare',
    project: 'github.io',
    sourceSha: target,
    previousVersion: '1.0.0',
    newVersion: '1.1.0',
    tag: 'github.io@1.1.0',
    bump: 'minor',
    bootstrap: false,
    commits: [
      { sha: fix, subject: 'fix(github.io): repair navigation', bump: 'patch' },
      { sha: feature, subject: 'feat(github.io): add profile', bump: 'minor' },
    ],
  });
});

test('bootstrap includes the introduction commit and replays from 0.0.0', (t) => {
  const cwd = repository(t);
  commit(cwd, 'chore: seed');
  const start = commit(cwd, 'feat(github.io): introduce app');
  commit(cwd, 'docs(github.io): explain app');
  const target = commit(cwd, 'fix(github.io): stabilize app');

  const result = bootstrapRelease({ cwd, start, target });

  assert.deepEqual(result, {
    action: 'prepare',
    project: 'github.io',
    sourceSha: target,
    previousVersion: '0.0.0',
    newVersion: '0.1.1',
    tag: 'github.io@0.1.1',
    bump: 'minor',
    bootstrap: true,
    commits: [
      { sha: start, subject: 'feat(github.io): introduce app', bump: 'minor' },
      { sha: target, subject: 'fix(github.io): stabilize app', bump: 'patch' },
    ],
  });
});

test('calculate returns a no-op for histories without qualifying commits', (t) => {
  const cwd = repository(t);
  commit(cwd, 'chore: seed');
  git(cwd, 'tag', 'github.io@3.2.1');
  const target = commit(cwd, 'docs(github.io): document release');

  const result = calculateRelease({ cwd, target });

  assert.deepEqual(result, {
    action: 'noop',
    project: 'github.io',
    sourceSha: target,
    previousVersion: '3.2.1',
    bootstrap: false,
    commits: [],
  });
});

test('release records use deterministic canonical serialization', () => {
  const sourceSha = '1'.repeat(40);
  const input = record(sourceSha, '1.2.3', {
    commits: [
      {
        bump: 'minor',
        subject: 'feat(github.io): add app',
        sha: '2'.repeat(40),
      },
    ],
  });

  assert.equal(
    serializeReleaseRecord(input),
    '{"schemaVersion":1,"project":"github.io","sourceSha":"1111111111111111111111111111111111111111","previousVersion":"0.0.0","version":"1.2.3","tag":"github.io@1.2.3","bootstrap":false,"commits":[{"sha":"2222222222222222222222222222222222222222","subject":"feat(github.io): add app","bump":"minor"}],"artifact":{"name":"github-io-pages.tgz","sha256":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"}}\n',
  );
});

test('release record verification rejects mismatched identity and digest fields', (t) => {
  const cwd = repository(t);
  const artifactPath = join(cwd, 'artifact.tgz');
  writeFileSync(artifactPath, 'immutable artifact');
  const digest = createHash('sha256')
    .update('immutable artifact')
    .digest('hex');
  const sourceSha = '1'.repeat(40);
  const valid = record(sourceSha, '1.2.3', {
    artifact: { name: 'artifact.tgz', sha256: digest },
  });

  assert.deepEqual(
    verifyReleaseRecord(valid, {
      artifactPath,
      project: 'github.io',
      sourceSha,
      tag: 'github.io@1.2.3',
    }),
    valid,
  );

  const cases = [
    [record(sourceSha, '1.2.3', { project: 'other' }), /project/],
    [valid, /source SHA/, { sourceSha: '2'.repeat(40) }],
    [record(sourceSha, '1.2.3', { tag: 'github.io@1.2.4' }), /tag/],
    [record(sourceSha, '1.2.3'), /digest/],
  ];
  for (const [candidate, expected, optionOverrides = {}] of cases) {
    assert.throws(
      () =>
        verifyReleaseRecord(candidate, {
          artifactPath,
          project: 'github.io',
          sourceSha,
          tag: 'github.io@1.2.3',
          ...optionOverrides,
        }),
      expected,
    );
  }
});

test('deployment verification distinguishes progress, retries, rollback, divergence, and conflicts', (t) => {
  const cwd = repository(t);
  const first = commit(cwd, 'chore: first');
  const second = commit(cwd, 'chore: second');
  git(cwd, 'switch', '-c', 'divergent', first);
  const other = commit(cwd, 'chore: divergent');

  const deployedFirst = record(first, '1.0.0');
  const candidateSecond = record(second, '1.1.0', { previousVersion: '1.0.0' });
  const deployedSecond = record(second, '1.1.0', { previousVersion: '1.0.0' });
  const divergent = record(other, '0.5.0');
  const conflicting = record(first, '1.0.0', {
    artifact: { name: 'github-io-pages.tgz', sha256: 'b'.repeat(64) },
  });

  assert.deepEqual(
    verifyDeployment({
      candidate: candidateSecond,
      deployed: deployedFirst,
      cwd,
    }),
    { action: 'deploy' },
  );
  assert.deepEqual(
    verifyDeployment({
      candidate: candidateSecond,
      deployed: deployedSecond,
      cwd,
    }),
    { action: 'identical' },
  );
  assert.deepEqual(
    verifyDeployment({
      candidate: deployedFirst,
      deployed: deployedSecond,
      cwd,
    }),
    { action: 'superseded' },
  );
  assert.deepEqual(
    verifyDeployment({ candidate: candidateSecond, deployed: divergent, cwd }),
    { action: 'divergent' },
  );
  assert.deepEqual(
    verifyDeployment({ candidate: conflicting, deployed: deployedFirst, cwd }),
    { action: 'conflict' },
  );
});

test('only explicit bootstrap initializes a deployment without metadata', () => {
  const candidate = record('1'.repeat(40), '1.0.0', { bootstrap: true });

  assert.deepEqual(
    verifyDeployment({ candidate, deployed: null, bootstrap: true }),
    { action: 'deploy' },
  );
  assert.deepEqual(
    verifyDeployment({ candidate, deployed: null, bootstrap: false }),
    { action: 'conflict' },
  );
});
