#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

import {
  calculateVersion,
  highestBump,
  incrementVersion,
} from './github-io-release-core.mjs';

const PROJECT = 'github.io';
const PROJECT_CONFIG = 'apps/github.io/project.json';
const TAG_PREFIX = `${PROJECT}@`;
const LOG_FORMAT = '%H%x00%s%x00%b%x00';

export function isCompletedSandboxProcess(error) {
  return (
    error?.code === 'EPERM' &&
    error.status === 0 &&
    typeof error.stdout === 'string'
  );
}

function git(args, cwd = process.cwd()) {
  try {
    return execFileSync('git', args, { cwd, encoding: 'utf8' });
  } catch (error) {
    // The Codex sandbox can attach EPERM to a completed nested process. Preserve
    // the real exit status so tests exercise the same Git behavior as CI.
    if (isCompletedSandboxProcess(error)) return error.stdout;
    throw error;
  }
}

function resolveCommit(revision, cwd) {
  return git(['rev-parse', '--verify', `${revision}^{commit}`], cwd).trim();
}

function isAncestor(ancestor, descendant, cwd) {
  try {
    git(['merge-base', '--is-ancestor', ancestor, descendant], cwd);
    return true;
  } catch (error) {
    if (error.status === 1) return false;
    throw error;
  }
}

function validateVersion(version) {
  incrementVersion(version, 'patch');
  return version.split('.').map(BigInt);
}

function compareVersions(left, right) {
  const leftParts = validateVersion(left);
  const rightParts = validateVersion(right);
  for (let index = 0; index < leftParts.length; index += 1) {
    if (leftParts[index] > rightParts[index]) return 1;
    if (leftParts[index] < rightParts[index]) return -1;
  }
  return 0;
}

function latestProjectTag(cwd) {
  const tags = git(['tag', '--list', `${TAG_PREFIX}*`], cwd)
    .split('\n')
    .filter(Boolean);
  if (tags.length === 0) {
    throw new Error(`no ${PROJECT} release tag exists; use bootstrap`);
  }

  return tags.reduce((latest, tag) => {
    const version = tag.slice(TAG_PREFIX.length);
    validateVersion(version);
    if (!latest || compareVersions(version, latest.version) > 0)
      return { tag, version };
    return latest;
  }, null);
}

function parseLog(output) {
  if (!output) return [];
  const fields = output.split('\0');
  const commits = [];
  for (let index = 0; index + 2 < fields.length; index += 3) {
    const sha = fields[index].replace(/^\n+/, '').trim();
    if (!sha) continue;
    commits.push({
      sha,
      subject: fields[index + 1],
      body: fields[index + 2],
    });
  }
  return commits;
}

function firstParentCommits(range, cwd) {
  return parseLog(
    git(
      ['log', '--first-parent', '--reverse', `--format=${LOG_FORMAT}`, range],
      cwd,
    ),
  );
}

function firstParentOids(target, cwd) {
  return git(['rev-list', '--first-parent', '--reverse', target], cwd)
    .split('\n')
    .filter(Boolean);
}

function isFirstParent(ancestor, descendant, cwd) {
  return git(['rev-list', '--first-parent', descendant], cwd)
    .split('\n')
    .includes(ancestor);
}

function projectIdentityAt(commit, cwd, cache) {
  const entry = git(['ls-tree', '-z', commit, '--', PROJECT_CONFIG], cwd);
  if (!entry) return 'absent';

  const match = /^\d+ blob ([a-f0-9]+)\t[^\0]+\0$/.exec(entry);
  if (!match) return 'conflicting';
  const blobOid = match[1];
  if (cache.has(blobOid)) return cache.get(blobOid);

  let project;
  try {
    project = JSON.parse(git(['cat-file', 'blob', blobOid], cwd));
  } catch {
    cache.set(blobOid, 'conflicting');
    return 'conflicting';
  }
  const identity =
    project &&
    typeof project === 'object' &&
    !Array.isArray(project) &&
    project.name === PROJECT
      ? 'github.io'
      : 'conflicting';
  cache.set(blobOid, identity);
  return identity;
}

export function findGithubIoIntroduction({ target, cwd = process.cwd() }) {
  const sourceSha = resolveCommit(target, cwd);
  const identityCache = new Map();
  let introduction;
  let projectPresent = false;
  let removed = false;

  for (const commit of firstParentOids(sourceSha, cwd)) {
    const identity = projectIdentityAt(commit, cwd, identityCache);
    if (identity === 'conflicting') {
      throw new Error(
        `${PROJECT_CONFIG} has a conflicting historical identity; use an explicit reviewed --start`,
      );
    }
    if (identity === 'github.io') {
      if (!projectPresent) {
        if (introduction || removed) {
          throw new Error(
            `${PROJECT_CONFIG} was removed or reintroduced; use an explicit reviewed --start`,
          );
        }
        introduction = commit;
      }
      projectPresent = true;
      continue;
    }
    if (projectPresent) removed = true;
    projectPresent = false;
  }

  if (!introduction) {
    throw new Error(
      `no valid ${PROJECT_CONFIG} introduction found on ${sourceSha}'s first-parent history`,
    );
  }
  if (removed || !projectPresent) {
    throw new Error(
      `${PROJECT_CONFIG} was removed after introduction; use an explicit reviewed --start`,
    );
  }
  return introduction;
}

export function verifyMainTarget({
  target,
  main = 'origin/main',
  cwd = process.cwd(),
}) {
  const sourceSha = resolveCommit(target, cwd);
  if (!isFirstParent(sourceSha, resolveCommit(main, cwd), cwd)) {
    throw new Error(
      `${sourceSha} must belong to ${main}'s first-parent history`,
    );
  }
  return sourceSha;
}

export function verifyBootstrapApproval(decision, { sourceSha, version } = {}) {
  if (
    !/^[a-f0-9]{40}$/.test(sourceSha ?? '') ||
    sourceSha !== decision.sourceSha
  ) {
    throw new Error(
      'bootstrap requires the full reviewed source SHA matching the replay',
    );
  }
  if (
    !version ||
    version !== decision.newVersion ||
    decision.action !== 'prepare' ||
    !decision.bootstrap
  ) {
    throw new Error(
      'bootstrap requires the reviewed version matching the replay',
    );
  }
  validateVersion(version);
  return decision;
}

function introducedCommits(integration, cwd) {
  const parents = git(['show', '-s', '--format=%P', integration.sha], cwd)
    .trim()
    .split(' ')
    .filter(Boolean);
  if (parents.length < 2) return [integration];

  return parseLog(
    git(
      [
        'log',
        '--reverse',
        '--topo-order',
        `--format=${LOG_FORMAT}`,
        `${parents[0]}..${integration.sha}`,
      ],
      cwd,
    ),
  ).filter((commit) => commit.sha !== integration.sha);
}

function firstParentIntegrations(range, cwd) {
  const seen = new Set();
  return firstParentCommits(range, cwd).map((integration) =>
    introducedCommits(integration, cwd).filter((commit) => {
      if (seen.has(commit.sha)) return false;
      seen.add(commit.sha);
      return true;
    }),
  );
}

function replay({ integrations, previousVersion, sourceSha, bootstrap }) {
  let version = previousVersion;
  const contributingCommits = [];
  const bumps = [];

  for (const commits of integrations) {
    const calculation = calculateVersion({ currentVersion: version, commits });
    if (!calculation) continue;
    version = calculation.version;
    bumps.push(calculation.bump);
    contributingCommits.push(...calculation.contributingCommits);
  }

  if (contributingCommits.length === 0) {
    return {
      action: 'noop',
      project: PROJECT,
      sourceSha,
      previousVersion,
      bootstrap,
      commits: [],
    };
  }

  return {
    action: 'prepare',
    project: PROJECT,
    sourceSha,
    previousVersion,
    newVersion: version,
    tag: `${TAG_PREFIX}${version}`,
    bump: highestBump(bumps),
    bootstrap,
    commits: contributingCommits,
  };
}

export function calculateRelease({
  target,
  main = 'main',
  cwd = process.cwd(),
}) {
  const sourceSha = resolveCommit(target, cwd);
  const baseline = latestProjectTag(cwd);
  const baselineSha = resolveCommit(baseline.tag, cwd);
  verifyMainTarget({ target: sourceSha, main, cwd });
  if (!isFirstParent(baselineSha, resolveCommit(main, cwd), cwd)) {
    throw new Error(
      `${baseline.tag} is not an ancestor on ${main}'s first-parent history`,
    );
  }
  if (!isFirstParent(baselineSha, sourceSha, cwd)) {
    if (isFirstParent(sourceSha, baselineSha, cwd)) {
      return {
        action: 'superseded',
        project: PROJECT,
        sourceSha,
        previousVersion: baseline.version,
        bootstrap: false,
        commits: [],
      };
    }
    throw new Error(
      `${baseline.tag} is not an ancestor on the first-parent history of ${sourceSha}`,
    );
  }
  return replay({
    integrations: firstParentIntegrations(`${baselineSha}..${sourceSha}`, cwd),
    previousVersion: baseline.version,
    sourceSha,
    bootstrap: false,
  });
}

export function bootstrapRelease({ target, start, cwd = process.cwd() }) {
  const sourceSha = resolveCommit(target, cwd);
  const startSha =
    start === undefined
      ? findGithubIoIntroduction({ target: sourceSha, cwd })
      : resolveCommit(start, cwd);
  if (!isFirstParent(startSha, sourceSha, cwd)) {
    throw new Error(
      `${start ?? startSha} is not on ${sourceSha}'s first-parent history`,
    );
  }
  const parents = git(['show', '-s', '--format=%P', startSha], cwd)
    .trim()
    .split(' ')
    .filter(Boolean);
  return replay({
    integrations: firstParentIntegrations(
      parents.length === 0 ? sourceSha : `${parents[0]}..${sourceSha}`,
      cwd,
    ),
    previousVersion: '0.0.0',
    sourceSha,
    bootstrap: true,
  });
}

function requireObject(value, name) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${name} must be an object`);
  }
  return value;
}

function canonicalRecord(record) {
  requireObject(record, 'release record');
  if (record.schemaVersion !== 1)
    throw new Error('release record schemaVersion must be 1');
  if (record.project !== PROJECT)
    throw new Error(`release record project must be ${PROJECT}`);
  if (typeof record.sourceSha !== 'string' || !record.sourceSha) {
    throw new Error('release record source SHA is required');
  }
  validateVersion(record.previousVersion);
  validateVersion(record.version);
  if (record.tag !== `${TAG_PREFIX}${record.version}`) {
    throw new Error('release record tag does not match its version');
  }
  if (typeof record.bootstrap !== 'boolean')
    throw new Error('release record bootstrap must be boolean');
  if (!Array.isArray(record.commits))
    throw new Error('release record commits must be an array');
  const commits = record.commits.map((commit) => {
    requireObject(commit, 'release record commit');
    if (typeof commit.sha !== 'string' || typeof commit.subject !== 'string') {
      throw new Error('release record commit requires sha and subject');
    }
    if (!['major', 'minor', 'patch'].includes(commit.bump)) {
      throw new Error('release record commit bump is invalid');
    }
    return { sha: commit.sha, subject: commit.subject, bump: commit.bump };
  });
  requireObject(record.artifact, 'release record artifact');
  if (typeof record.artifact.name !== 'string' || !record.artifact.name) {
    throw new Error('release record artifact name is required');
  }
  if (!/^[a-f0-9]{64}$/.test(record.artifact.sha256 ?? '')) {
    throw new Error(
      'release record artifact digest must be a lowercase SHA-256',
    );
  }

  return {
    schemaVersion: 1,
    project: PROJECT,
    sourceSha: record.sourceSha,
    previousVersion: record.previousVersion,
    version: record.version,
    tag: record.tag,
    bootstrap: record.bootstrap,
    commits,
    artifact: {
      name: record.artifact.name,
      sha256: record.artifact.sha256,
    },
  };
}

export function serializeReleaseRecord(record) {
  return `${JSON.stringify(canonicalRecord(record))}\n`;
}

export function renderReleaseNotes(record) {
  const saved = canonicalRecord(record);
  return [
    `## ${saved.tag}`,
    '',
    ...saved.commits.map((commit) => `- ${commit.subject} (\`${commit.sha}\`)`),
  ].join('\n');
}

export function verifyReleaseRecord(
  record,
  { artifactPath, project = PROJECT, sourceSha, tag } = {},
) {
  const verified = canonicalRecord(record);
  if (verified.project !== project)
    throw new Error('release record project mismatch');
  if (sourceSha && verified.sourceSha !== sourceSha)
    throw new Error('release record source SHA mismatch');
  if (tag && verified.tag !== tag)
    throw new Error('release record tag mismatch');
  if (artifactPath) {
    const digest = createHash('sha256')
      .update(readFileSync(artifactPath))
      .digest('hex');
    if (digest !== verified.artifact.sha256)
      throw new Error('release record artifact digest mismatch');
  }
  return verified;
}

export function verifyDeployment({
  candidate,
  deployed,
  bootstrap = false,
  cwd = process.cwd(),
}) {
  const next = canonicalRecord(candidate);
  if (!deployed) return { action: bootstrap ? 'deploy' : 'conflict' };
  const current = canonicalRecord(deployed);

  if (next.sourceSha === current.sourceSha) {
    return {
      action:
        serializeReleaseRecord(next) === serializeReleaseRecord(current)
          ? 'identical'
          : 'conflict',
    };
  }

  const currentBeforeNext = isAncestor(current.sourceSha, next.sourceSha, cwd);
  const nextBeforeCurrent = isAncestor(next.sourceSha, current.sourceSha, cwd);
  if (!currentBeforeNext && !nextBeforeCurrent) return { action: 'divergent' };

  const versionOrder = compareVersions(next.version, current.version);
  if (currentBeforeNext)
    return { action: versionOrder > 0 ? 'deploy' : 'conflict' };
  return { action: versionOrder < 0 ? 'superseded' : 'conflict' };
}

function parseArguments(argv) {
  const [command, ...rest] = argv;
  const options = {};
  for (let index = 0; index < rest.length; index += 2) {
    const name = rest[index];
    if (!name?.startsWith('--'))
      throw new Error(`unexpected argument: ${name}`);
    if (name === '--bootstrap') {
      options.bootstrap = true;
      index -= 1;
      continue;
    }
    const value = rest[index + 1];
    if (value === undefined || value.startsWith('--'))
      throw new Error(`${name} requires a value`);
    options[name.slice(2)] = value;
  }
  return { command, options };
}

function required(options, name) {
  if (!options[name]) throw new Error(`--${name} is required`);
  return options[name];
}

function readRecord(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function runCli(argv) {
  const { command, options } = parseArguments(argv);
  if (command === 'calculate') {
    return calculateRelease({
      target: required(options, 'target'),
      main: options.main ?? 'origin/main',
    });
  }
  if (command === 'bootstrap') {
    return bootstrapRelease({
      target: required(options, 'target'),
      start: options.start,
    });
  }
  if (command === 'verify-main-target') {
    return {
      action: 'verified',
      sourceSha: verifyMainTarget({ target: required(options, 'target') }),
    };
  }
  if (command === 'approve-bootstrap') {
    return verifyBootstrapApproval(readRecord(required(options, 'decision')), {
      sourceSha: required(options, 'source'),
      version: required(options, 'version'),
    });
  }
  if (command === 'verify-record') {
    const verified = verifyReleaseRecord(
      readRecord(required(options, 'record')),
      {
        artifactPath: required(options, 'artifact'),
        project: options.project ?? PROJECT,
        sourceSha: options.target,
        tag: options.tag,
      },
    );
    return { action: 'verified', record: verified };
  }
  if (command === 'notes') {
    return {
      notes: renderReleaseNotes(readRecord(required(options, 'record'))),
    };
  }
  if (command === 'verify-deployment') {
    const candidate = readRecord(required(options, 'candidate'));
    const deployed = options.deployed ? readRecord(options.deployed) : null;
    return verifyDeployment({
      candidate,
      deployed,
      bootstrap: options.bootstrap,
    });
  }
  throw new Error(
    'command must be calculate, bootstrap, approve-bootstrap, verify-main-target, notes, verify-record, or verify-deployment',
  );
}

const isMain =
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  try {
    process.stdout.write(`${JSON.stringify(runCli(process.argv.slice(2)))}\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
