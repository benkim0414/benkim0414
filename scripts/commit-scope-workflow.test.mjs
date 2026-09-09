import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';

const workflow = readFileSync(
  new URL('../.github/workflows/commit-scopes.yml', import.meta.url),
  'utf8',
);

test('workflow is read-only, pinned, and checks PR and push events', () => {
  assert.match(workflow, /pull_request:/);
  assert.match(workflow, /push:/);
  assert.match(workflow, /permissions:\n  contents: read/);
  assert.doesNotMatch(workflow, /pull_request_target|secrets\./);
  assert.match(
    workflow,
    /actions\/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1/,
  );
  assert.match(
    workflow,
    /actions\/setup-node@820762786026740c76f36085b0efc47a31fe5020/,
  );
  assert.match(
    workflow,
    /pnpm\/action-setup@008330803749db0355799c700092d9a85fd074e9/,
  );
  assert.match(workflow, /fetch-depth: 0/);
  assert.match(workflow, /persist-credentials: false/);
});

test('workflow reads event JSON and passes arguments without expression interpolation', () => {
  assert.match(workflow, /GITHUB_EVENT_PATH/);
  assert.match(workflow, /spawnSync/);
  assert.doesNotMatch(workflow, /--pr-title\s+["']?\$\{\{/);
  assert.match(workflow, /--pr-title/);
  assert.match(workflow, /--base/);
  assert.match(workflow, /--head/);
  assert.match(workflow, /input:.*pull_request\.title/);
  assert.match(workflow, /pnpm install --frozen-lockfile/);
});

test('a resolved divergent push base fails before commitlint is invoked', (t) => {
  const cwd = mkdtempSync(join(tmpdir(), 'scope-workflow-'));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  const git = (...args) =>
    execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
  git('init', '-q');
  git('config', 'user.name', 'Test');
  git('config', 'user.email', 'test@example.com');
  git('config', 'core.hooksPath', '/dev/null');
  writeFileSync(join(cwd, 'root'), 'root');
  git('add', '--', 'root');
  git('commit', '-q', '-m', 'chore: initialize repository');
  const root = git('rev-parse', 'HEAD');
  git('checkout', '-q', '-b', 'replacement');
  writeFileSync(join(cwd, 'replacement'), 'replacement');
  git('add', '--', 'replacement');
  git('commit', '-q', '-m', 'chore: replacement history');
  const head = git('rev-parse', 'HEAD');
  git('checkout', '-q', '-b', 'old', root);
  writeFileSync(join(cwd, 'old'), 'old');
  git('add', '--', 'old');
  git('commit', '-q', '-m', 'chore: old history');
  const before = git('rev-parse', 'HEAD');

  const sourceScripts = dirname(
    new URL('./check-commit-scopes.mjs', import.meta.url).pathname,
  );
  symlinkSync(sourceScripts, join(cwd, 'scripts'), 'dir');
  const bin = join(cwd, 'bin');
  mkdirSync(bin);
  const invocationLog = join(cwd, 'pnpm-invoked');
  const fakePnpm = join(bin, 'pnpm');
  writeFileSync(fakePnpm, '#!/bin/sh\nprintf invoked > "$INVOCATION_LOG"\n');
  chmodSync(fakePnpm, 0o755);
  const eventPath = join(cwd, 'event.json');
  writeFileSync(eventPath, JSON.stringify({ before, after: head }));

  const match = workflow.match(
    /node --input-type=module <<'NODE'\n([\s\S]*?)\n          NODE/,
  );
  assert.ok(match, 'workflow must contain its event runner');
  const program = match[1]
    .split('\n')
    .map((line) => line.replace(/^ {10}/, ''))
    .join('\n');
  const result = spawnSync(process.execPath, ['--input-type=module'], {
    cwd,
    input: program,
    encoding: 'utf8',
    env: {
      ...process.env,
      GITHUB_EVENT_NAME: 'push',
      GITHUB_EVENT_PATH: eventPath,
      INVOCATION_LOG: invocationLog,
      PATH: `${bin}:${process.env.PATH}`,
    },
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /explicit documented baseline/);
  assert.equal(existsSync(invocationLog), false, 'commitlint must be skipped');
});

test('installed commitlint validates PR titles from stdin including breaking syntax', () => {
  const commitlint = new URL('../node_modules/.bin/commitlint', import.meta.url)
    .pathname;
  const cwd = new URL('..', import.meta.url).pathname;
  const invalid = spawnSync(commitlint, [], {
    cwd,
    input: 'bogus(github.io): change app\n',
    encoding: 'utf8',
  });
  assert.equal(invalid.status, 1);
  assert.match(invalid.stdout + invalid.stderr, /type-enum/);
  const breaking = spawnSync(commitlint, [], {
    cwd,
    input: 'feat(github.io)!: change app API\n',
    encoding: 'utf8',
  });
  assert.equal(breaking.status, 0, breaking.stdout + breaking.stderr);
});
