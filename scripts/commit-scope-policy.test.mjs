import assert from 'node:assert/strict';
import test from 'node:test';

import { SCOPES, checkScope } from './commit-scope-policy.mjs';

test('exports the approved scope vocabulary', () => {
  assert.deepEqual(SCOPES, [
    'github.io',
    'github-pages',
    'gh-pages',
    'date-interval',
    'profile',
    'nx',
    'openwiki',
    'openspec',
    'codex',
    'commitizen',
    'commitlint',
    'astryx',
    'deps',
    'deps-dev',
    'release',
    'workflow',
  ]);
});

test('checks ownership in addition to allowed scope syntax', () => {
  assert.ok(
    checkScope({
      subject: 'feat(skills): add search',
      paths: ['apps/github.io/src/app/skills/search.tsx'],
    }).errors.length,
  );
  assert.ok(
    checkScope({
      subject: 'feat(nx): add search',
      paths: ['apps/github.io/src/app/skills/search.tsx'],
    }).errors.length,
  );
  assert.deepEqual(
    checkScope({
      subject: 'feat(github.io): add search',
      paths: ['apps/github.io/src/app/skills/search.tsx'],
    }).errors,
    [],
  );
  assert.deepEqual(
    checkScope({
      subject: 'docs(profile): update introduction',
      paths: ['README.md'],
    }).errors,
    [],
  );
  assert.deepEqual(
    checkScope({
      subject: 'chore(nx): update workspace graph',
      paths: ['nx.json'],
    }).errors,
    [],
  );
  assert.deepEqual(
    checkScope({
      subject: 'chore(openspec): update configuration',
      paths: ['openspec/config.yaml'],
    }).errors,
    [],
  );
});

test('recognizes historical projects, packages, dependencies, and legitimate unscoped cleanup', () => {
  for (const [subject, path] of [
    ['fix(github-pages): repair route', 'apps/github-pages/src/app.tsx'],
    ['fix(gh-pages): repair route', 'apps/gh-pages/src/app.tsx'],
    ['fix(date-interval): handle dates', 'packages/date-interval/src/index.ts'],
    ['chore(deps): update lockfile', 'pnpm-lock.yaml'],
  ])
    assert.deepEqual(checkScope({ subject, paths: [path] }).errors, []);
  assert.deepEqual(
    checkScope({
      subject: 'chore: tidy repository metadata',
      paths: ['.gitignore'],
    }),
    { errors: [], review: [] },
  );
});

test('keeps app release scripts distinct from Astryx maintenance tooling', () => {
  assert.deepEqual(
    checkScope({
      subject: 'fix(github.io): recover release',
      paths: ['scripts/github-io-release.mjs'],
    }).errors,
    [],
  );
  assert.ok(
    checkScope({
      subject: 'fix(astryx): recover release',
      paths: ['scripts/github-io-release.mjs'],
    }).errors.length,
  );
  assert.deepEqual(
    checkScope({
      subject: 'fix(astryx): validate agent docs',
      paths: ['scripts/check-astryx-agent-docs.mjs'],
    }).errors,
    [],
  );
});

test('surfaces ambiguous docs and mixed ownership for human review', () => {
  assert.ok(
    checkScope({
      subject: 'docs(github.io): document a decision',
      paths: ['docs/research/mixed-domain-study.md'],
    }).review.length,
  );
  assert.ok(
    checkScope({
      subject: 'chore(workflow): update guidance',
      paths: ['AGENTS.md', 'nx.json'],
    }).review.length,
  );
});

test('allows merge subjects and rejects malformed headers', () => {
  assert.deepEqual(checkScope({ subject: 'Merge branch feature', paths: [] }), {
    errors: [],
    review: [],
  });
  assert.ok(
    checkScope({ subject: 'not conventional', paths: [] }).errors.length,
  );
});
