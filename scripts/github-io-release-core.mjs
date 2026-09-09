const HEADER = /^(?<type>[a-z]+)(?:\((?<scope>[^)]+)\))?(?<breaking>!)?: (?<description>.+)$/;
const VERSION = /^(?<major>0|[1-9]\d*)\.(?<minor>0|[1-9]\d*)\.(?<patch>0|[1-9]\d*)$/;
const BUMP_ORDER = { patch: 1, minor: 2, major: 3 };

/** Parse the header portion of a Conventional Commit subject. */
export function parseConventionalCommit(subject, _body = '') {
  const match = HEADER.exec(subject);
  if (!match) return null;

  return {
    type: match.groups.type,
    scope: match.groups.scope,
    breaking: Boolean(match.groups.breaking),
    description: match.groups.description,
  };
}

export function classifyGithubIoCommit({ subject, body = '' }) {
  const parsed = parseConventionalCommit(subject, body);
  if (!parsed || parsed.scope !== 'github.io') return null;
  if (parsed.breaking || /(^|\n)BREAKING[ -]CHANGE:\s/m.test(body)) return 'major';
  if (parsed.type === 'feat') return 'minor';
  if (parsed.type === 'fix') return 'patch';
  return null;
}

export function highestBump(commits) {
  let highest = null;
  for (const commit of commits) {
    const bump = typeof commit === 'string' ? commit : commit?.bump;
    if (BUMP_ORDER[bump] > (BUMP_ORDER[highest] ?? 0)) highest = bump;
  }
  return highest;
}

function parseVersion(version) {
  const match = VERSION.exec(version);
  if (!match) throw new Error('version must be strict SemVer major.minor.patch');
  return {
    major: Number(match.groups.major),
    minor: Number(match.groups.minor),
    patch: Number(match.groups.patch),
  };
}

export function incrementVersion(version, bump) {
  const parsed = parseVersion(version);
  if (!BUMP_ORDER[bump]) throw new Error(`unknown release bump: ${bump}`);
  if (bump === 'major') parsed.major += 1, parsed.minor = 0, parsed.patch = 0;
  if (bump === 'minor') parsed.minor += 1, parsed.patch = 0;
  if (bump === 'patch') parsed.patch += 1;
  return `${parsed.major}.${parsed.minor}.${parsed.patch}`;
}

export function calculateVersion({ currentVersion, commits }) {
  const contributingCommits = [];
  for (const commit of commits) {
    const bump = classifyGithubIoCommit(commit);
    if (bump) contributingCommits.push({ sha: commit.sha, subject: commit.subject, bump });
  }
  const bump = highestBump(contributingCommits);
  if (!bump) return null;
  return { bump, version: incrementVersion(currentVersion, bump), contributingCommits };
}
