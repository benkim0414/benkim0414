import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

const cli = new URL('./check-commit-scopes.mjs', import.meta.url).pathname;
const run = (args, cwd) =>
  spawnSync(process.execPath, [cli, ...args], { cwd, encoding: 'utf8' });
const git = (cwd, ...args) =>
  execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();

function repo() {
  const cwd = mkdtempSync(join(tmpdir(), 'scope-check-'));
  git(cwd, 'init', '-q');
  git(cwd, 'config', 'user.name', 'Test');
  git(cwd, 'config', 'user.email', 'test@example.com');
  git(cwd, 'config', 'core.hooksPath', '/dev/null');
  return cwd;
}

function commit(cwd, subject, files) {
  for (const [path, value] of Object.entries(files)) {
    const full = join(cwd, path);
    execFileSync('mkdir', ['-p', full.slice(0, full.lastIndexOf('/'))]);
    writeFileSync(full, value);
    git(cwd, 'add', '--', path);
  }
  git(cwd, 'commit', '-q', '-m', subject);
  return git(cwd, 'rev-parse', 'HEAD');
}

test('range checks root commits, introduced commits, and both sides of renames', () => {
  const cwd = repo();
  const base = commit(cwd, 'feat(github.io): begin app', {
    'apps/github.io/a.js': 'a',
  });
  execFileSync('git', ['mv', 'apps/github.io/a.js', 'README.md'], { cwd });
  git(cwd, 'commit', '-q', '-m', 'feat(github.io): move page');
  const head = git(cwd, 'rev-parse', 'HEAD');
  const result = run(['--base', base, '--head', head], cwd);
  assert.equal(result.status, 0);
  assert.match(result.stderr, /multiple ownership domains|profile/);

  const root = run(['--base', '0'.repeat(40), '--head', head], cwd);
  assert.equal(root.status, 1);
  assert.match(root.stderr, /explicit documented baseline/);
});

test('PR title and staged modes use the shared checker without shell interpolation', () => {
  const cwd = repo();
  const base = commit(cwd, 'chore: initialize repository', {
    '.gitignore': 'x',
  });
  const head = commit(cwd, 'feat(github.io): add app', {
    'apps/github.io/a.js': 'a',
  });
  const title = run(
    ['--pr-title', 'feat(nx): $(touch pwned)', '--base', base, '--head', head],
    cwd,
  );
  assert.equal(title.status, 1);
  assert.equal(spawnSync('git', ['cat-file', '-e', 'HEAD'], { cwd }).status, 0);
  assert.equal(spawnSync('test', ['-e', join(cwd, 'pwned')]).status, 1);

  writeFileSync(join(cwd, 'README.md'), 'profile');
  git(cwd, 'add', '--', 'README.md');
  writeFileSync(
    join(cwd, 'message'),
    'docs(profile): update profile\n\nbody\n',
  );
  assert.equal(
    run(['--staged', '--message-file', join(cwd, 'message')], cwd).status,
    0,
  );
});

test('rejects abbreviated and unreachable range OIDs', () => {
  const cwd = repo();
  const head = commit(cwd, 'chore: initialize repository', {
    '.gitignore': 'x',
  });
  assert.match(
    run(['--base', head.slice(0, 8), '--head', head], cwd).stderr,
    /full hexadecimal commit OID/,
  );
  assert.match(
    run(['--base', 'f'.repeat(40), '--head', head], cwd).stderr,
    /cannot resolve|baseline/,
  );
});

test('PR mode checks a diverged base/head graph without treating divergence as a rewrite', () => {
  const cwd = repo();
  const root = commit(cwd, 'chore: initialize repository', {
    '.gitignore': 'x',
  });
  git(cwd, 'checkout', '-q', '-b', 'topic');
  const head = commit(cwd, 'feat(github.io): add app', {
    'apps/github.io/a.js': 'a',
  });
  git(cwd, 'checkout', '-q', '-b', 'base', root);
  const base = commit(cwd, 'docs(profile): update profile', {
    'README.md': 'profile',
  });
  const result = run(
    ['--pr-title', 'feat(github.io): add app', '--base', base, '--head', head],
    cwd,
  );
  assert.equal(result.status, 0, result.stderr);
});
