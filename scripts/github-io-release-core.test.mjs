import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateVersion,
  classifyGithubIoCommit,
  highestBump,
  incrementVersion,
  parseConventionalCommit,
} from './github-io-release-core.mjs';

test('parses conventional commit headers and body', () => {
  assert.deepEqual(parseConventionalCommit('feat(github.io)!: redesign', 'body'), {
    type: 'feat',
    scope: 'github.io',
    breaking: true,
    description: 'redesign',
  });
  assert.equal(parseConventionalCommit('not conventional', ''), null);
});

test('classifies only the exact github.io scope', () => {
  const cases = [
    ['feat(github.io): add page', ' ', 'minor'],
    ['fix(github.io): repair page', '', 'patch'],
    ['chore(github.io): tidy', '', null],
    ['feat(other): add page', '', null],
    ['feat(github-io): add page', '', null],
    ['feat(github.io-ui): add page', '', null],
    ['feat: unscoped breaking', 'BREAKING CHANGE: API changed', null],
    ['feat(github.io)!: break API', '', 'major'],
    ['fix(github.io): break API', 'BREAKING-CHANGE: API changed', 'major'],
  ];

  for (const [subject, body, expected] of cases) {
    assert.equal(classifyGithubIoCommit({ subject, body }), expected, subject);
  }
});

test('selects the highest bump with major precedence', () => {
  assert.equal(highestBump(['patch', 'minor']), 'minor');
  assert.equal(highestBump([{ bump: 'patch' }, { bump: 'major' }, { bump: 'minor' }]), 'major');
  assert.equal(highestBump([]), null);
});

test('increments strict major.minor.patch versions', () => {
  assert.equal(incrementVersion('1.2.3', 'patch'), '1.2.4');
  assert.equal(incrementVersion('1.2.3', 'minor'), '1.3.0');
  assert.equal(incrementVersion('1.2.3', 'major'), '2.0.0');
  assert.throws(() => incrementVersion('v1.2.3', 'patch'), /strict SemVer/);
  assert.throws(() => incrementVersion('1.2', 'patch'), /strict SemVer/);
  assert.throws(() => incrementVersion('1.2.3\n', 'patch'), /strict SemVer/);
  assert.equal(incrementVersion('9007199254740991.0.0', 'major'), '9007199254740992.0.0');
});

test('calculates a release and preserves contributing commit details', () => {
  const result = calculateVersion({
    currentVersion: '0.4.2',
    commits: [
      { sha: 'a', subject: 'fix(github.io): fix nav', body: '' },
      { sha: 'b', subject: 'feat(github.io): add profile', body: '' },
      { sha: 'c', subject: 'docs(other): docs', body: '' },
      { sha: 'd', subject: 'fix(github.io)!: remove API', body: '' },
    ],
  });

  assert.deepEqual(result, {
    bump: 'major',
    version: '1.0.0',
    contributingCommits: [
      { sha: 'a', subject: 'fix(github.io): fix nav', bump: 'patch' },
      { sha: 'b', subject: 'feat(github.io): add profile', bump: 'minor' },
      { sha: 'd', subject: 'fix(github.io)!: remove API', bump: 'major' },
    ],
  });
});

test('returns null when all commits are ignored', () => {
  assert.equal(calculateVersion({
    currentVersion: '1.2.3',
    commits: [{ sha: 'a', subject: 'chore(other): tidy', body: '' }],
  }), null);
});
