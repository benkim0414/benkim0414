import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';
import { serializeReleaseRecord } from './github-io-release.mjs';

const workflow = readFileSync(
  '.github/workflows/release-github-io.yml',
  'utf8',
);
const script = (name) => {
  const step = workflow
    .split(`      - name: ${name}\n`)[1]
    ?.split(/\n      - (?:name:|uses:)/)[0];
  assert.ok(step, `Missing step ${name}`);
  const run = step.split('        run: ')[1];
  return run.startsWith('|\n')
    ? run
        .slice(2)
        .split(/\n(?=\S| {1,9}\S)/)[0]
        .replace(/^          /gm, '')
    : run.trim();
};
const realGit = spawnSync('which', ['git'], { encoding: 'utf8' }).stdout.trim();

function fixture(t, { bootstrap = false } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'github-io-workflow-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const cwd = join(root, 'source');
  const stateDir = join(root, 'remote');
  const bin = join(root, 'bin');
  for (const path of [cwd, stateDir, bin]) mkdirSync(path);
  const git = (...args) => {
    const result = spawnSync(realGit, args, { cwd, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    return result.stdout.trim();
  };
  git('init', '-b', 'main');
  git('config', 'user.name', 'Workflow fixture');
  git('config', 'user.email', 'workflow@example.com');
  git('config', 'core.hooksPath', '/dev/null');
  const commit = (subject) => {
    git('commit', '--allow-empty', '-m', subject);
    return git('rev-parse', 'HEAD');
  };
  commit('chore: root');
  mkdirSync(join(cwd, 'apps/github.io'), { recursive: true });
  writeFileSync(
    join(cwd, 'apps/github.io/project.json'),
    '{"name":"github.io"}\n',
  );
  git('add', 'apps/github.io/project.json');
  const baseline = commit('feat(github.io): introduce app');
  if (!bootstrap) git('tag', 'github.io@1.0.0');
  const sourceSha = commit('fix(github.io): accepted fix');
  const target = commit('feat(other): ignored feature');
  git('update-ref', 'refs/remotes/origin/main', target);
  mkdirSync(join(cwd, 'scripts'));
  for (const name of [
    'github-io-release.mjs',
    'github-io-release-core.mjs',
    'sync-github-pages-artifact.mjs',
  ])
    cpSync(resolve('scripts', name), join(cwd, 'scripts', name));
  const boundary = resolve(
    'scripts/test-support/github-io-workflow-boundary.mjs',
  );
  for (const name of ['git', 'gh', 'pnpm']) {
    writeFileSync(
      join(bin, name),
      `#!/bin/sh\nexec '${process.execPath}' '${boundary}' '${name}' "$@"\n`,
      { mode: 0o755 },
    );
  }
  const pages = join(cwd, '.pages-site');
  mkdirSync(pages);
  git('-C', pages, 'init', '-b', 'main');
  git('-C', pages, 'config', 'user.name', 'Pages fixture');
  git('-C', pages, 'config', 'user.email', 'pages@example.com');
  git('-C', pages, 'config', 'core.hooksPath', '/dev/null');
  writeFileSync(join(pages, 'index.html'), 'previous site');
  if (!bootstrap)
    writeFileSync(
      join(pages, '.github-pages-release.json'),
      serializeReleaseRecord({
        schemaVersion: 1,
        project: 'github.io',
        sourceSha: baseline,
        previousVersion: '0.0.0',
        version: '1.0.0',
        tag: 'github.io@1.0.0',
        bootstrap: false,
        commits: [],
        artifact: { name: 'github-io-pages.tgz', sha256: 'a'.repeat(64) },
      }),
    );
  git(
    '-C',
    pages,
    'add',
    'index.html',
    ...(bootstrap ? [] : ['.github-pages-release.json']),
  );
  git('-C', pages, 'commit', '-m', 'chore: seed site');
  const pagesRemote = join(stateDir, 'pages.git');
  git('init', '--bare', pagesRemote);
  git('-C', pages, 'remote', 'add', 'origin', pagesRemote);
  git('-C', pages, 'push', 'origin', 'main');
  const statePath = join(stateDir, 'state.json');
  writeFileSync(
    statePath,
    JSON.stringify({ artifacts: [], releases: {}, builds: 0, events: [] }),
  );
  const state = () => JSON.parse(readFileSync(statePath));
  const save = (value) => writeFileSync(statePath, JSON.stringify(value));
  const env = {
    ...process.env,
    PATH: `${bin}:${process.env.PATH}`,
    REAL_GIT: realGit,
    FIXTURE_STATE: stateDir,
    GITHUB_REPOSITORY: 'fixture/source',
    GITHUB_SHA: target,
    GITHUB_OUTPUT: join(cwd, 'outputs'),
    BOOTSTRAP: String(bootstrap),
    REVIEWED_VERSION: bootstrap ? '0.1.1' : '',
    REQUESTED_SHA: bootstrap ? target : '',
    SOURCE_SHA: target,
    GH_TOKEN: 'fixture-only',
  };
  const execute = (name, extra = {}) => {
    writeFileSync(env.GITHUB_OUTPUT, '');
    const result = spawnSync(
      'bash',
      ['-e', '-o', 'pipefail', '-c', script(name)],
      {
        cwd: name === 'Commit and publish changed artifacts' ? pages : cwd,
        encoding: 'utf8',
        env: { ...env, ...extra },
      },
    );
    assert.equal(
      result.status,
      0,
      `${name}\n${result.stdout}\n${result.stderr}`,
    );
    return Object.fromEntries(
      readFileSync(env.GITHUB_OUTPUT, 'utf8')
        .trim()
        .split('\n')
        .filter(Boolean)
        .map((line) => [
          line.slice(0, line.indexOf('=')),
          line.slice(line.indexOf('=') + 1),
        ]),
    );
  };
  const run = ({ failAt = '', overrides = {} } = {}) => {
    Object.assign(env, overrides, { FAIL_AT: failAt });
    // A rerun has a fresh runner filesystem; only persisted artifacts and remote
    // refs/releases plus the already committed Pages state survive.
    for (const name of ['.release', '.published', 'decision.json', 'dist'])
      rmSync(join(cwd, name), { recursive: true, force: true });
    rmSync(pages, { recursive: true, force: true });
    git('clone', '--branch', 'main', pagesRemote, pages);
    git('-C', pages, 'config', 'core.hooksPath', '/dev/null');
    const source = execute('Validate source input');
    env.SOURCE_SHA = source.sha;
    execute('Fetch release history');
    const found = execute('Discover saved release');
    env.SAVED = found.found;
    const savedDir = join(stateDir, env.SOURCE_SHA);
    if (found.found === 'true')
      cpSync(savedDir, join(cwd, '.release'), { recursive: true });
    const decision = execute('Calculate or resume release');
    if (['noop', 'superseded'].includes(decision.action)) return decision;
    env.VERSION = decision.version;
    env.TAG = decision.tag;
    if (decision.action === 'prepare') {
      execute('Validate and build release');
      execute('Create release record');
    }
    execute('Verify release files');
    if (decision.action === 'prepare') {
      cpSync(join(cwd, '.release'), savedDir, { recursive: true });
      const current = state();
      current.artifacts.push({
        id: current.artifacts.length + 1,
        name: `github-io-${env.SOURCE_SHA}`,
        expired: false,
        workflow_run: { id: 1 },
      });
      current.events.push('persist');
      save(current);
      if (failAt === 'persist')
        throw new Error('Injected failure after persist');
    }
    execute('Create or verify release tag');
    execute('Publish verified release');
    execute('Verify and extract release');
    execute('Synchronize without rollback', { BOOTSTRAP: decision.bootstrap });
    if (failAt === 'sync') throw new Error('Injected failure after sync');
    execute('Commit and publish changed artifacts');
    return {
      ...decision,
      deployment: JSON.parse(readFileSync(join(cwd, 'sync-result.json')))
        .action,
    };
  };
  return {
    cwd,
    stateDir,
    pages,
    git,
    commit,
    target,
    sourceSha,
    state,
    save,
    run,
    execute,
    env,
  };
}

for (const boundary of [
  'persist',
  'tag',
  'create',
  'upload:github-io-pages.tgz',
  'upload:release-record.json',
  'publish',
  'sync',
  'deploy',
]) {
  test(`workflow recovers after ${boundary} with one version and one build`, (t) => {
    const f = fixture(t);
    assert.throws(() => f.run({ failAt: boundary }), /Injected failure/);
    const saved = readFileSync(
      join(f.stateDir, f.target, 'release-record.json'),
    );
    const archive = readFileSync(
      join(f.stateDir, f.target, 'github-io-pages.tgz'),
    );
    const resumed = f.run();
    assert.equal(resumed.action, 'recover');
    assert.equal(resumed.version, '1.0.1');
    assert.equal(f.state().builds, 1);
    assert.deepEqual(
      readFileSync(join(f.stateDir, f.target, 'release-record.json')),
      saved,
    );
    assert.deepEqual(
      readFileSync(join(f.cwd, '.release/github-io-pages.tgz')),
      archive,
    );
    const published = f.state().releases['github.io@1.0.1'];
    assert.equal(published.isDraft, false);
    assert.equal(published.assets.length, 2);
    assert.match(published.body, /fix\(github.io\): accepted fix/);
    assert.doesNotMatch(published.body, /ignored feature/);
    assert.equal(JSON.parse(saved).version, '1.0.1');
    const events = f.state().events;
    assert.ok(events.indexOf('nx') < events.indexOf('build'));
    assert.ok(events.indexOf('persist') < events.indexOf('tag'));
    assert.ok(events.indexOf('tag') < events.indexOf('create'));
    assert.ok(
      events.indexOf('upload:release-record.json') < events.indexOf('publish'),
    );
    assert.ok(events.indexOf('publish') < events.indexOf('deploy'));
    const delivered = f.git('-C', f.pages, 'rev-parse', 'HEAD');
    assert.equal(f.run().deployment, 'identical');
    assert.equal(f.git('-C', f.pages, 'rev-parse', 'HEAD'), delivered);
  });
}

for (const corruption of [
  'missing artifact',
  'corrupt artifact',
  'missing record',
  'expired persistence',
]) {
  test(`recovery fails closed for ${corruption} without rebuilding`, (t) => {
    const f = fixture(t);
    assert.throws(() => f.run({ failAt: 'tag' }), /Injected failure/);
    const path = join(
      f.stateDir,
      f.target,
      corruption === 'missing record'
        ? 'release-record.json'
        : 'github-io-pages.tgz',
    );
    if (corruption.startsWith('missing')) rmSync(path);
    else if (corruption.startsWith('corrupt')) writeFileSync(path, 'corrupt');
    else {
      const state = f.state();
      state.artifacts[0].expired = true;
      f.save(state);
    }
    assert.throws(
      () => f.run(),
      /ENOENT|digest mismatch|Discover saved release/,
    );
    assert.equal(f.state().builds, 1);
    assert.deepEqual(f.state().releases, {});
  });
}

test('deploy A, deploy B, retry A keeps B live and ordinary ignored commits do nothing', (t) => {
  const f = fixture(t);
  f.run();
  const b = f.commit('feat(github.io): release B');
  f.git('update-ref', 'refs/remotes/origin/main', b);
  assert.equal(f.run({ overrides: { GITHUB_SHA: b } }).version, '1.1.0');
  const deployed = f.git('-C', f.pages, 'rev-parse', 'HEAD');
  assert.equal(
    f.run({ overrides: { REQUESTED_SHA: f.target } }).deployment,
    'superseded',
  );
  assert.equal(f.git('-C', f.pages, 'rev-parse', 'HEAD'), deployed);
  assert.match(readFileSync(join(f.pages, 'index.html'), 'utf8'), /v1.1.0/);
  const ignored = f.commit('docs: no new release');
  f.git('update-ref', 'refs/remotes/origin/main', ignored);
  const before = f.state();
  assert.equal(
    f.run({ overrides: { REQUESTED_SHA: '', GITHUB_SHA: ignored } }).action,
    'noop',
  );
  assert.deepEqual(f.state(), before);
});

test('bootstrap dispatch binds the reviewed pair even when main advances', (t) => {
  const f = fixture(t, { bootstrap: true });
  for (const overrides of [
    { REQUESTED_SHA: '' },
    { REVIEWED_VERSION: '' },
    { REVIEWED_VERSION: '0.1.2' },
  ]) {
    assert.throws(() => f.run({ overrides }), /reviewed/);
    assert.equal(f.state().builds, 0);
    Object.assign(f.env, {
      REQUESTED_SHA: f.target,
      REVIEWED_VERSION: '0.1.1',
    });
  }
  const newer = f.commit('feat(github.io): main advanced');
  f.git('update-ref', 'refs/remotes/origin/main', newer);
  const result = f.run({ overrides: { GITHUB_SHA: newer } });
  assert.equal(result.version, '0.1.1');
  assert.equal(f.git('rev-parse', `${result.tag}^{commit}`), f.target);
  assert.equal(
    f.run({ overrides: { BOOTSTRAP: 'false', REVIEWED_VERSION: '' } })
      .deployment,
    'identical',
  );
});

test('an obsolete fresh main target stops before persistence and publication', (t) => {
  const f = fixture(t);
  f.run();
  const obsolete = f.commit('docs: old undispatched main integration');
  const current = f.commit('feat(github.io): newer release');
  f.git('update-ref', 'refs/remotes/origin/main', current);
  f.run({ overrides: { GITHUB_SHA: current } });
  const before = f.state();
  assert.equal(
    f.run({ overrides: { REQUESTED_SHA: obsolete } }).action,
    'superseded',
  );
  assert.deepEqual(f.state(), before);
});

for (const field of ['body', 'asset']) {
  test(`recovery rejects a conflicting published ${field} without deploying`, (t) => {
    const f = fixture(t);
    assert.throws(() => f.run({ failAt: 'publish' }), /Injected failure/);
    const state = f.state();
    const release = state.releases['github.io@1.0.1'];
    if (field === 'body') release.body += '\nUnaccepted commit';
    else
      release.assets[0].bytes =
        Buffer.from('different bytes').toString('base64');
    f.save(state);
    assert.throws(() => f.run(), /Publish verified release/);
    assert.equal(f.state().builds, 1);
    assert.ok(!f.state().events.includes('deploy'));
  });
}

test('a tag without saved evidence fails recovery and a second-parent manual target is rejected', (t) => {
  const f = fixture(t);
  f.git('tag', 'github.io@1.0.1', f.target);
  assert.throws(() => f.run(), /Tagged source has no saved artifact/);
  assert.equal(f.state().builds, 0);
  f.git('switch', '-c', 'side');
  const side = f.commit('feat(github.io): branch-only commit');
  f.git('switch', 'main');
  f.git('merge', '--no-ff', 'side', '-m', 'chore: integrate branch');
  f.git('update-ref', 'refs/remotes/origin/main', f.git('rev-parse', 'HEAD'));
  assert.throws(
    () => f.run({ overrides: { REQUESTED_SHA: side } }),
    /first-parent/,
  );
  assert.equal(f.state().builds, 0);
});
