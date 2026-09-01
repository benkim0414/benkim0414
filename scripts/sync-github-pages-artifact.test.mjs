import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
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
import { fileURLToPath } from 'node:url';

import { syncArtifact } from './sync-github-pages-artifact.mjs';

test('syncArtifact replaces stale artifacts while preserving Git metadata', (t) => {
  const fixtureDirectory = mkdtempSync(
    join(tmpdir(), 'github-pages-artifact-'),
  );
  const buildDirectory = join(fixtureDirectory, 'build');
  const targetDirectory = join(fixtureDirectory, 'target');

  t.after(() => rmSync(fixtureDirectory, { recursive: true, force: true }));

  mkdirSync(join(buildDirectory, 'assets'), { recursive: true });
  mkdirSync(join(buildDirectory, '.git'), { recursive: true });
  mkdirSync(join(targetDirectory, '.git'), { recursive: true });
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

  syncArtifact(buildDirectory, targetDirectory);

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
});

test('syncArtifact rejects a missing build directory', (t) => {
  const fixtureDirectory = mkdtempSync(
    join(tmpdir(), 'github-pages-artifact-'),
  );
  const targetDirectory = join(fixtureDirectory, 'target');

  t.after(() => rmSync(fixtureDirectory, { recursive: true, force: true }));
  mkdirSync(join(targetDirectory, '.git'), { recursive: true });

  assert.throws(
    () =>
      syncArtifact(join(fixtureDirectory, 'missing-build'), targetDirectory),
    /build directory/i,
  );
});

test('syncArtifact rejects a target without Git metadata', (t) => {
  const fixtureDirectory = mkdtempSync(
    join(tmpdir(), 'github-pages-artifact-'),
  );
  const buildDirectory = join(fixtureDirectory, 'build');
  const targetDirectory = join(fixtureDirectory, 'target');

  t.after(() => rmSync(fixtureDirectory, { recursive: true, force: true }));
  mkdirSync(buildDirectory, { recursive: true });
  mkdirSync(targetDirectory, { recursive: true });

  assert.throws(() => syncArtifact(buildDirectory, targetDirectory), /\.git/i);
});

test('the CLI synchronizes its two path arguments', (t) => {
  const fixtureDirectory = mkdtempSync(
    join(tmpdir(), 'github-pages-artifact-'),
  );
  const buildDirectory = join(fixtureDirectory, 'build');
  const targetDirectory = join(fixtureDirectory, 'target');

  t.after(() => rmSync(fixtureDirectory, { recursive: true, force: true }));
  mkdirSync(buildDirectory, { recursive: true });
  mkdirSync(join(targetDirectory, '.git'), { recursive: true });
  writeFileSync(join(buildDirectory, 'index.html'), '<h1>CLI Pages</h1>');

  const result = spawnSync(
    process.execPath,
    [
      fileURLToPath(
        new URL('./sync-github-pages-artifact.mjs', import.meta.url),
      ),
      buildDirectory,
      targetDirectory,
    ],
    { encoding: 'utf8' },
  );

  assert.equal(result.status, 0, result.stderr);
  assert.equal(
    readFileSync(join(targetDirectory, 'index.html'), 'utf8'),
    '<h1>CLI Pages</h1>',
  );
  assert.equal(readFileSync(join(targetDirectory, '.nojekyll'), 'utf8'), '');
});
