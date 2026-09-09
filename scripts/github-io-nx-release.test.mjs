import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';

test('real Nx 23 validates the explicit version, resolves the project tag, and leaves source and refs untouched', (t) => {
  const cwd = mkdtempSync(join(tmpdir(), 'github-io-nx-release-'));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  const git = (...args) => {
    const result = spawnSync('git', args, { cwd, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    return result.stdout;
  };
  mkdirSync(join(cwd, 'apps/github.io'), { recursive: true });
  mkdirSync(join(cwd, 'scripts'));
  const nx = JSON.parse(readFileSync('nx.json', 'utf8'));
  delete nx.plugins;
  writeFileSync(join(cwd, 'nx.json'), JSON.stringify(nx));
  writeFileSync(join(cwd, '.gitignore'), 'node_modules\n.nx\ndist\n');
  writeFileSync(join(cwd, 'package.json'), '{"name":"fixture","private":true}');
  writeFileSync(
    join(cwd, 'pnpm-lock.yaml'),
    'lockfileVersion: "9.0"\nimporters:\n  .: {}\npackages: {}\nsnapshots: {}\n',
  );
  writeFileSync(
    join(cwd, 'apps/github.io/project.json'),
    '{"name":"github.io","projectType":"application"}',
  );
  writeFileSync(
    join(cwd, 'apps/github.io/package.json'),
    '{"name":"@fixture/github-io","private":true}',
  );
  symlinkSync(resolve('node_modules'), join(cwd, 'node_modules'));
  for (const name of [
    'github-io-nx-release.mjs',
    'github-io-version-actions.cjs',
    'github-io-release.mjs',
    'github-io-release-core.mjs',
  ]) {
    // A missing adapter must fail with an actionable assertion in the red phase.
    assert.ok(readFileSync(`scripts/${name}`));
    copyFileSync(`scripts/${name}`, join(cwd, 'scripts', name));
  }
  git('init', '-b', 'main');
  git('config', 'user.name', 'Nx fixture');
  git('config', 'user.email', 'nx@example.com');
  git('config', 'core.hooksPath', '/dev/null');
  git(
    'add',
    '.gitignore',
    'nx.json',
    'package.json',
    'pnpm-lock.yaml',
    'apps/github.io/project.json',
    'apps/github.io/package.json',
    'scripts/github-io-nx-release.mjs',
    'scripts/github-io-version-actions.cjs',
    'scripts/github-io-release.mjs',
    'scripts/github-io-release-core.mjs',
  );
  git('commit', '-m', 'chore: fixture');
  const sourceSha = git('rev-parse', 'HEAD').trim();
  const invoke = (bootstrap) => {
    const decision = {
      action: 'prepare',
      project: 'github.io',
      sourceSha,
      previousVersion: bootstrap ? '0.0.0' : '1.2.3',
      newVersion: bootstrap ? '0.1.0' : '1.3.0',
      tag: bootstrap ? 'github.io@0.1.0' : 'github.io@1.3.0',
      bootstrap,
      commits: [],
    };
    mkdirSync(join(cwd, 'dist'), { recursive: true });
    writeFileSync(join(cwd, 'dist/decision.json'), JSON.stringify(decision));
    const before = {
      refs: git('show-ref'),
      status: git('status', '--porcelain'),
      diff: git('diff', '--binary'),
    };
    const run = spawnSync(
      process.execPath,
      ['scripts/github-io-nx-release.mjs', 'dist/decision.json'],
      {
        cwd,
        encoding: 'utf8',
        env: {
          ...process.env,
          CI: 'true',
          NX_DAEMON: 'false',
          NX_ISOLATE_PLUGINS: 'false',
        },
        timeout: 90000,
      },
    );
    assert.equal(run.status, 0, `${run.stdout}\n${run.stderr}`);
    const result = JSON.parse(run.stdout);
    assert.equal(result.newVersion, decision.newVersion);
    assert.equal(result.tag, decision.tag);
    assert.equal(result.previousVersion, decision.previousVersion);
    assert.deepEqual(result.projects, ['github.io']);
    assert.deepEqual(
      {
        refs: git('show-ref'),
        status: git('status', '--porcelain'),
        diff: git('diff', '--binary'),
      },
      before,
    );
    assert.equal(
      JSON.parse(readFileSync(join(cwd, 'apps/github.io/package.json')))
        .version,
      undefined,
    );
  };
  invoke(true);
  git('tag', 'github.io@1.2.3');
  invoke(false);
});
