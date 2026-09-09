import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { runCli, syncArtifact } from './sync-github-pages-artifact.mjs';

const deployedRecordName = '.github-pages-release.json';

function releaseRecord({
  sourceSha = 'a'.repeat(40),
  previousVersion = '0.0.0',
  version = '1.0.0',
  digest = 'b'.repeat(64),
} = {}) {
  return {
    schemaVersion: 1,
    project: 'github.io',
    sourceSha,
    previousVersion,
    version,
    tag: `github.io@${version}`,
    bootstrap: false,
    commits: [
      {
        sha: sourceSha,
        subject: 'feat(github.io): publish site',
        bump: 'minor',
      },
    ],
    artifact: {
      name: 'github-io-pages.tgz',
      sha256: digest,
    },
  };
}

function createFixture(t) {
  const fixtureDirectory = mkdtempSync(
    join(tmpdir(), 'github-pages-artifact-'),
  );
  const buildDirectory = join(fixtureDirectory, 'build');
  const targetDirectory = join(fixtureDirectory, 'target');
  const releaseRecordPath = join(fixtureDirectory, 'release-record.json');

  t.after(() => rmSync(fixtureDirectory, { recursive: true, force: true }));
  mkdirSync(buildDirectory, { recursive: true });
  mkdirSync(join(targetDirectory, '.git'), { recursive: true });

  return {
    fixtureDirectory,
    buildDirectory,
    targetDirectory,
    releaseRecordPath,
  };
}

function writeRecord(path, record) {
  writeFileSync(path, `${JSON.stringify(record, null, 2)}\n`);
}

function git(cwd, ...args) {
  try {
    return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
  } catch (error) {
    if (error.code === 'EPERM' && error.status === 0) {
      return error.stdout.trim();
    }
    throw error;
  }
}

function createSourceHistory(t) {
  const sourceDirectory = mkdtempSync(join(tmpdir(), 'github-pages-source-'));
  t.after(() => rmSync(sourceDirectory, { recursive: true, force: true }));

  git(sourceDirectory, 'init', '--initial-branch=main');
  git(sourceDirectory, 'config', 'core.hooksPath', '/dev/null');
  git(sourceDirectory, 'config', 'user.name', 'Test User');
  git(sourceDirectory, 'config', 'user.email', 'test@example.com');
  git(sourceDirectory, 'commit', '--allow-empty', '-m', 'feat: first');
  const first = git(sourceDirectory, 'rev-parse', 'HEAD');
  git(sourceDirectory, 'commit', '--allow-empty', '-m', 'feat: second');
  const second = git(sourceDirectory, 'rev-parse', 'HEAD');
  git(sourceDirectory, 'checkout', '-b', 'divergent', first);
  git(sourceDirectory, 'commit', '--allow-empty', '-m', 'feat: divergent');
  const divergent = git(sourceDirectory, 'rev-parse', 'HEAD');

  return { sourceDirectory, first, second, divergent };
}

test('syncArtifact replaces stale artifacts and writes canonical release metadata while preserving Git metadata', (t) => {
  const { buildDirectory, targetDirectory, releaseRecordPath } =
    createFixture(t);
  const candidate = {
    ignored: 'not deployed',
    ...releaseRecord(),
  };

  mkdirSync(join(buildDirectory, 'assets'), { recursive: true });
  mkdirSync(join(buildDirectory, '.git'), { recursive: true });
  writeFileSync(join(buildDirectory, 'index.html'), '<h1>Pages</h1>');
  writeFileSync(
    join(buildDirectory, 'package.json'),
    '{"name":"@benkim0414/github-io","private":true}',
  );
  writeFileSync(
    join(buildDirectory, 'assets', 'app.js'),
    'console.log("Pages");',
  );
  writeFileSync(
    join(buildDirectory, '.git', 'HEAD'),
    'ref: refs/heads/source\n',
  );
  writeFileSync(join(targetDirectory, 'obsolete.txt'), 'stale');
  writeFileSync(
    join(targetDirectory, '.git', 'HEAD'),
    'ref: refs/heads/main\n',
  );
  writeRecord(releaseRecordPath, candidate);

  const result = syncArtifact(buildDirectory, targetDirectory, {
    releaseRecordPath,
    bootstrap: true,
  });

  assert.deepEqual(result, { action: 'deploy' });
  assert.equal(
    readFileSync(join(targetDirectory, 'index.html'), 'utf8'),
    '<h1>Pages</h1>',
  );
  assert.equal(
    readFileSync(join(targetDirectory, 'assets', 'app.js'), 'utf8'),
    'console.log("Pages");',
  );
  assert.equal(readFileSync(join(targetDirectory, '.nojekyll'), 'utf8'), '');
  assert.equal(existsSync(join(targetDirectory, 'obsolete.txt')), false);
  assert.equal(existsSync(join(targetDirectory, 'package.json')), false);
  assert.equal(
    readFileSync(join(targetDirectory, '.git', 'HEAD'), 'utf8'),
    'ref: refs/heads/main\n',
  );
  assert.deepEqual(
    JSON.parse(readFileSync(join(targetDirectory, deployedRecordName), 'utf8')),
    releaseRecord(),
  );
});

test('syncArtifact leaves an identical deployment byte-for-byte unchanged', (t) => {
  const { buildDirectory, targetDirectory, releaseRecordPath } =
    createFixture(t);
  const candidate = releaseRecord();
  const deployedBytes = `${JSON.stringify(candidate, null, 4)}\n`;

  writeFileSync(join(buildDirectory, 'index.html'), '<h1>New build</h1>');
  writeFileSync(join(targetDirectory, 'index.html'), '<h1>Deployed</h1>');
  writeFileSync(join(targetDirectory, deployedRecordName), deployedBytes);
  writeRecord(releaseRecordPath, candidate);

  const result = syncArtifact(buildDirectory, targetDirectory, {
    releaseRecordPath,
  });

  assert.deepEqual(result, { action: 'identical' });
  assert.equal(
    readFileSync(join(targetDirectory, 'index.html'), 'utf8'),
    '<h1>Deployed</h1>',
  );
  assert.equal(
    readFileSync(join(targetDirectory, deployedRecordName), 'utf8'),
    deployedBytes,
  );
  assert.equal(existsSync(join(targetDirectory, '.nojekyll')), false);
});

test('syncArtifact deploys a newer release', (t) => {
  const { sourceDirectory, first, second } = createSourceHistory(t);
  const { buildDirectory, targetDirectory, releaseRecordPath } =
    createFixture(t);
  const deployed = releaseRecord({ sourceSha: first });
  const candidate = releaseRecord({
    sourceSha: second,
    previousVersion: '1.0.0',
    version: '1.1.0',
    digest: 'c'.repeat(64),
  });

  writeFileSync(join(buildDirectory, 'index.html'), '<h1>Newer</h1>');
  writeFileSync(join(targetDirectory, 'obsolete.txt'), 'stale');
  writeRecord(join(targetDirectory, deployedRecordName), deployed);
  writeRecord(releaseRecordPath, candidate);

  const result = syncArtifact(buildDirectory, targetDirectory, {
    releaseRecordPath,
    cwd: sourceDirectory,
  });

  assert.deepEqual(result, { action: 'deploy' });
  assert.equal(
    readFileSync(join(targetDirectory, 'index.html'), 'utf8'),
    '<h1>Newer</h1>',
  );
  assert.equal(existsSync(join(targetDirectory, 'obsolete.txt')), false);
  assert.deepEqual(
    JSON.parse(readFileSync(join(targetDirectory, deployedRecordName), 'utf8')),
    candidate,
  );
});

test('syncArtifact skips an older retry without mutating the newer deployment', (t) => {
  const { sourceDirectory, first, second } = createSourceHistory(t);
  const { buildDirectory, targetDirectory, releaseRecordPath } =
    createFixture(t);
  const deployed = releaseRecord({
    sourceSha: second,
    previousVersion: '1.0.0',
    version: '1.1.0',
    digest: 'c'.repeat(64),
  });
  const candidate = releaseRecord({ sourceSha: first });
  const deployedBytes = `${JSON.stringify(deployed, null, 4)}\n`;

  writeFileSync(join(buildDirectory, 'index.html'), '<h1>Older retry</h1>');
  writeFileSync(join(targetDirectory, 'index.html'), '<h1>Newer live</h1>');
  writeFileSync(join(targetDirectory, deployedRecordName), deployedBytes);
  writeRecord(releaseRecordPath, candidate);

  const result = syncArtifact(buildDirectory, targetDirectory, {
    releaseRecordPath,
    cwd: sourceDirectory,
  });

  assert.deepEqual(result, { action: 'superseded' });
  assert.equal(
    readFileSync(join(targetDirectory, 'index.html'), 'utf8'),
    '<h1>Newer live</h1>',
  );
  assert.equal(
    readFileSync(join(targetDirectory, deployedRecordName), 'utf8'),
    deployedBytes,
  );
});

test('syncArtifact rejects a same-source release with a different digest before mutation', (t) => {
  const { buildDirectory, targetDirectory, releaseRecordPath } =
    createFixture(t);
  const deployed = releaseRecord();
  const candidate = releaseRecord({ digest: 'c'.repeat(64) });
  const deployedBytes = `${JSON.stringify(deployed)}\n`;

  writeFileSync(join(buildDirectory, 'index.html'), '<h1>Conflict</h1>');
  writeFileSync(join(targetDirectory, 'index.html'), '<h1>Live</h1>');
  writeFileSync(join(targetDirectory, deployedRecordName), deployedBytes);
  writeRecord(releaseRecordPath, candidate);

  assert.throws(
    () => syncArtifact(buildDirectory, targetDirectory, { releaseRecordPath }),
    /deployment conflict/i,
  );
  assert.equal(
    readFileSync(join(targetDirectory, 'index.html'), 'utf8'),
    '<h1>Live</h1>',
  );
  assert.equal(
    readFileSync(join(targetDirectory, deployedRecordName), 'utf8'),
    deployedBytes,
  );
});

test('syncArtifact rejects divergent source history before mutation', (t) => {
  const { sourceDirectory, second, divergent } = createSourceHistory(t);
  const { buildDirectory, targetDirectory, releaseRecordPath } =
    createFixture(t);
  const deployed = releaseRecord({
    sourceSha: second,
    previousVersion: '1.0.0',
    version: '1.1.0',
  });
  const candidate = releaseRecord({
    sourceSha: divergent,
    previousVersion: '1.1.0',
    version: '1.2.0',
  });

  writeFileSync(join(buildDirectory, 'index.html'), '<h1>Divergent</h1>');
  writeFileSync(join(targetDirectory, 'index.html'), '<h1>Live</h1>');
  writeRecord(join(targetDirectory, deployedRecordName), deployed);
  writeRecord(releaseRecordPath, candidate);

  assert.throws(
    () =>
      syncArtifact(buildDirectory, targetDirectory, {
        releaseRecordPath,
        cwd: sourceDirectory,
      }),
    /divergent/i,
  );
  assert.equal(
    readFileSync(join(targetDirectory, 'index.html'), 'utf8'),
    '<h1>Live</h1>',
  );
});

test('syncArtifact accepts missing deployment metadata only during bootstrap', (t) => {
  const { buildDirectory, targetDirectory, releaseRecordPath } =
    createFixture(t);
  const candidate = releaseRecord();

  writeFileSync(join(buildDirectory, 'index.html'), '<h1>Bootstrap</h1>');
  writeFileSync(join(targetDirectory, 'index.html'), '<h1>Existing</h1>');
  writeRecord(releaseRecordPath, candidate);

  assert.throws(
    () => syncArtifact(buildDirectory, targetDirectory, { releaseRecordPath }),
    /deployment conflict/i,
  );
  assert.equal(
    readFileSync(join(targetDirectory, 'index.html'), 'utf8'),
    '<h1>Existing</h1>',
  );

  assert.deepEqual(
    syncArtifact(buildDirectory, targetDirectory, {
      releaseRecordPath,
      bootstrap: true,
    }),
    { action: 'deploy' },
  );
  assert.equal(
    readFileSync(join(targetDirectory, 'index.html'), 'utf8'),
    '<h1>Bootstrap</h1>',
  );
});

test('syncArtifact rejects a missing build directory', (t) => {
  const { fixtureDirectory, targetDirectory, releaseRecordPath } =
    createFixture(t);
  writeRecord(releaseRecordPath, releaseRecord());

  assert.throws(
    () =>
      syncArtifact(join(fixtureDirectory, 'missing-build'), targetDirectory, {
        releaseRecordPath,
        bootstrap: true,
      }),
    /build directory/i,
  );
});

test('syncArtifact rejects a target without Git metadata', (t) => {
  const { fixtureDirectory, buildDirectory, releaseRecordPath } =
    createFixture(t);
  const targetDirectory = join(fixtureDirectory, 'target-without-git');
  mkdirSync(targetDirectory, { recursive: true });
  writeRecord(releaseRecordPath, releaseRecord());

  assert.throws(
    () =>
      syncArtifact(buildDirectory, targetDirectory, {
        releaseRecordPath,
        bootstrap: true,
      }),
    /\.git/i,
  );
});

test('the CLI requires --release-record', (t) => {
  const { buildDirectory, targetDirectory } = createFixture(t);

  assert.throws(
    () => runCli([buildDirectory, targetDirectory]),
    /--release-record is required/i,
  );
});

test('the CLI synchronizes a bootstrap artifact and reports its action', (t) => {
  const { buildDirectory, targetDirectory, releaseRecordPath } =
    createFixture(t);
  writeFileSync(join(buildDirectory, 'index.html'), '<h1>CLI Pages</h1>');
  writeRecord(releaseRecordPath, releaseRecord());

  const result = runCli([
    buildDirectory,
    targetDirectory,
    '--release-record',
    releaseRecordPath,
    '--bootstrap',
  ]);

  assert.deepEqual(result, { action: 'deploy' });
  assert.equal(
    readFileSync(join(targetDirectory, 'index.html'), 'utf8'),
    '<h1>CLI Pages</h1>',
  );
  assert.equal(readFileSync(join(targetDirectory, '.nojekyll'), 'utf8'), '');
  assert.deepEqual(
    JSON.parse(readFileSync(join(targetDirectory, deployedRecordName), 'utf8')),
    releaseRecord(),
  );
});
