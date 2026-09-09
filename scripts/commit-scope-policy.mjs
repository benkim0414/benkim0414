export const SCOPES = [
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
];

const normalize = (path) => path.replaceAll('\\', '/').replace(/^\.\//, '');

function owner(path) {
  path = normalize(path);
  if (path === 'README.md') return 'profile';
  if (path.startsWith('apps/github.io/')) return 'github.io';
  if (path.startsWith('apps/github-pages/')) return 'github-pages';
  if (path.startsWith('apps/gh-pages/')) return 'gh-pages';
  if (path.startsWith('packages/date-interval/')) return 'date-interval';
  if (
    /^scripts\/(github-io-|github-pages-|sync-github-pages-)/.test(path) ||
    path === '.github/workflows/release-github-io.yml'
  )
    return 'github.io';
  if (/^scripts\/(check|refresh)-astryx-agent-docs(?:\.test)?\.mjs$/.test(path))
    return 'astryx';
  if (path === 'nx.json' || path.startsWith('.nx/')) return 'nx';
  if (
    path === '.openwikiignore' ||
    path.startsWith('openwiki/') ||
    /^scripts\/setup-openwiki(?:\.test)?\.mjs$/.test(path)
  )
    return 'openwiki';
  if (
    path === 'openspec' ||
    path.startsWith('openspec/') ||
    path.startsWith('.openspec/')
  )
    return 'openspec';
  if (path.startsWith('.codex/')) return 'codex';
  if (
    path === 'commitlint.config.mjs' ||
    path === '.husky/commit-msg' ||
    path.startsWith('scripts/commit-scope-') ||
    path === 'scripts/check-commit-scopes.mjs' ||
    path === 'scripts/check-commit-scopes.test.mjs' ||
    path === '.github/workflows/commit-scopes.yml' ||
    path === 'docs/agents/commit-scopes.md'
  )
    return 'commitlint';
  if (/commitizen|cz-commitlint/.test(path)) return 'commitizen';
  if (path === 'pnpm-lock.yaml') return 'dependency';
  if (path.startsWith('docs/')) return 'documentation';
  if (path.startsWith('.github/workflows/')) return 'workflow';
  return null;
}

export function checkScope({ subject, paths }) {
  const errors = [];
  const review = [];
  if (/^(Merge |Revert ")/.test(subject)) return { errors, review };
  const match =
    /^(?<type>[a-z][a-z0-9-]*)(?:\((?<scope>[^)]+)\))?!?:\s+\S/.exec(subject);
  if (!match)
    return {
      errors: ['Use a Conventional Commit header: type(scope): description.'],
      review,
    };

  const scope = match.groups.scope;
  if (scope && !SCOPES.includes(scope)) {
    errors.push(
      `Scope ${JSON.stringify(scope)} is not approved; choose the affected product or tool.`,
    );
  }

  const classified = paths.map(owner);
  const owners = new Set(classified.filter(Boolean));
  const hasUnownedRoot = classified.some((value) => value === null);
  const hasDocs = owners.delete('documentation');
  const dependencyOnly = owners.size === 1 && owners.has('dependency');
  if (dependencyOnly) {
    owners.clear();
    if (!['deps', 'deps-dev'].includes(scope))
      errors.push('Dependency-only changes require scope deps or deps-dev.');
  }

  if (owners.size === 1) {
    const [expected] = owners;
    if (scope !== expected)
      errors.push(
        `Paths have unambiguous ${expected} ownership; use ${match.groups.type}(${expected}): description.`,
      );
  } else if (owners.size > 1) {
    review.push(
      `Changes span multiple ownership domains (${[...owners].sort().join(', ')}); a reviewer must confirm the dominant scope.`,
    );
  }
  if (hasDocs && owners.size === 0) {
    review.push(
      'Documentation purpose is ambiguous from its path; a reviewer must confirm its domain scope.',
    );
  } else if (hasDocs) {
    review.push(
      'Documentation is mixed with another domain; a reviewer must confirm the dominant scope.',
    );
  }
  if (hasUnownedRoot && owners.size > 0) {
    review.push(
      'Root files are mixed with an owned domain; a reviewer must confirm the dominant scope.',
    );
  }
  return { errors, review };
}
