#!/usr/bin/env node
// Test-only external boundary. Git history, archives, saved files, CLI commands,
// workflow shell, and Pages synchronization remain real.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

const [command, ...args] = process.argv.slice(2);
const statePath = join(process.env.FIXTURE_STATE, 'state.json');
const state = JSON.parse(readFileSync(statePath));
const save = () => writeFileSync(statePath, JSON.stringify(state));
const emit = (value) => process.stdout.write(`${JSON.stringify(value)}\n`);
const event = (name) => {
  state.events.push(name);
  save();
  if (process.env.FAIL_AT === name)
    throw new Error(`Injected failure after ${name}`);
};
const option = (name) => {
  assert.ok(args.includes(name), `Missing ${name}: ${args.join(' ')}`);
  return args[args.indexOf(name) + 1];
};

if (command === 'git') {
  if (args[0] === 'fetch') {
    assert.deepEqual(args, ['fetch', 'origin', '--tags']);
  } else if (args[0] === 'push') {
    assert.equal(args[1], 'origin');
    if (args[2].startsWith('refs/tags/')) {
      assert.ok(
        state.artifacts.length,
        'Tag publication must follow artifact persistence',
      );
      event('tag');
    } else {
      assert.deepEqual(args, ['push', 'origin', 'main']);
      // This origin is a local temporary bare repository, never a network URL.
      const remote = spawnSync(
        process.env.REAL_GIT,
        ['remote', 'get-url', 'origin'],
        { encoding: 'utf8' },
      ).stdout.trim();
      assert.equal(remote, join(process.env.FIXTURE_STATE, 'pages.git'));
      const pushed = spawnSync(process.env.REAL_GIT, args, {
        stdio: 'inherit',
      });
      assert.equal(pushed.status, 0);
      event('deploy');
    }
  } else {
    const result = spawnSync(process.env.REAL_GIT, args, { stdio: 'inherit' });
    process.exit(result.status ?? 1);
  }
} else if (command === 'pnpm') {
  if (args[0] === 'install')
    assert.deepEqual(args, ['install', '--frozen-lockfile']);
  else if (args[0] === 'exec') {
    // The real Nx boundary has a separate isolated real-Nx integration test.
    assert.deepEqual(args, [
      'exec',
      'node',
      'scripts/github-io-nx-release.mjs',
      'decision.json',
    ]);
    emit(JSON.parse(readFileSync('decision.json')));
    event('nx');
  } else if (args[1] === 'lint')
    assert.deepEqual(args, ['nx', 'lint', 'github.io']);
  else if (args[1] === 'test')
    assert.deepEqual(args, ['nx', 'test', 'github.io', '--run']);
  else {
    assert.deepEqual(args, ['nx', 'build', 'github.io', '--skip-nx-cache']);
    assert.equal(process.env.APP_RELEASE, 'true');
    const decision = JSON.parse(readFileSync('decision.json'));
    assert.equal(process.env.APP_VERSION, decision.newVersion);
    state.builds += 1;
    mkdirSync('dist/apps/github.io/assets', { recursive: true });
    writeFileSync(
      'dist/apps/github.io/assets/main.js',
      `const version="${decision.newVersion}";`,
    );
    writeFileSync(
      'dist/apps/github.io/index.html',
      `<footer>v${decision.newVersion}</footer>`,
    );
    writeFileSync('dist/apps/github.io/404.html', '404');
    event('build');
  }
} else if (command === 'gh') {
  if (args[0] === 'api') {
    const endpoint = args.find((arg) => arg.startsWith('repos/'));
    if (endpoint.endsWith('/actions/workflows/release-github-io.yml'))
      process.stdout.write('42\n');
    else if (endpoint.includes('/actions/artifacts?')) {
      const name = new URLSearchParams(endpoint.split('?')[1]).get('name');
      for (const artifact of state.artifacts.filter(
        (item) => item.name === name,
      ))
        emit(artifact);
    } else if (endpoint.includes('/actions/runs/'))
      emit({
        workflow_id: 42,
        head_branch: 'main',
        event: 'workflow_dispatch',
      });
    else if (endpoint.includes('/releases?')) {
      for (const [tag, release] of Object.entries(state.releases))
        emit({ tag_name: tag, ...release });
    } else throw new Error(`Unexpected API ${endpoint}`);
  } else {
    assert.equal(args[0], 'release');
    const [, operation, tag] = args;
    if (operation === 'create') {
      assert.ok(args.includes('--verify-tag'));
      assert.ok(args.includes('--draft'));
      assert.ok(
        !args.includes('--generate-notes'),
        'Notes must use accepted commits',
      );
      assert.ok(state.events.includes('tag'));
      assert.equal(state.releases[tag], undefined);
      state.releases[tag] = {
        isDraft: true,
        body: readFileSync(option('--notes-file'), 'utf8'),
        assets: [],
      };
      event('create');
    } else if (operation === 'view') {
      assert.ok(state.releases[tag]);
      emit(state.releases[tag]);
    } else if (operation === 'upload') {
      const release = state.releases[tag];
      assert.equal(release.isDraft, true);
      const name = basename(args[3]);
      assert.ok(
        !release.assets.some((asset) => asset.name === name),
        'Immutable assets cannot be overwritten',
      );
      release.assets.push({
        name,
        bytes: readFileSync(args[3]).toString('base64'),
      });
      event(`upload:${name}`);
    } else if (operation === 'download') {
      const name = option('--pattern');
      const asset = state.releases[tag].assets.find(
        (item) => item.name === name,
      );
      assert.ok(asset, `Missing published asset ${name}`);
      const destination = join(option('--dir'), name);
      assert.ok(
        !existsSync(destination),
        'Download must not overwrite recovery evidence',
      );
      writeFileSync(destination, Buffer.from(asset.bytes, 'base64'));
    } else if (operation === 'edit') {
      assert.ok(args.includes('--draft=false'));
      assert.equal(state.releases[tag].assets.length, 2);
      state.releases[tag].isDraft = false;
      event('publish');
    } else throw new Error(`Unexpected release operation ${operation}`);
  }
} else throw new Error(`Unexpected command ${command}`);
