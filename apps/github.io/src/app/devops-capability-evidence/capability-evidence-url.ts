const GITHUB_HOSTS = new Set(['github.com', 'www.github.com']);
const RESERVED_GITHUB_OWNER_ROUTES = new Set([
  'about',
  'account',
  'apps',
  'blog',
  'business',
  'collections',
  'contact',
  'customers',
  'enterprise',
  'events',
  'explore',
  'features',
  'issues',
  'login',
  'marketplace',
  'new',
  'notifications',
  'orgs',
  'organizations',
  'pricing',
  'pulls',
  'search',
  'settings',
  'site',
  'sponsors',
  'stars',
  'topics',
  'trending',
  'users',
]);

function githubRepositoryUrl(url: string | undefined): URL | undefined {
  if (!url) {
    return undefined;
  }

  try {
    const parsed = new URL(url);
    const pathParts = parsed.pathname.split('/').filter(Boolean);
    const owner = pathParts[0]?.toLowerCase();

    return parsed.protocol === 'https:'
      ? GITHUB_HOSTS.has(parsed.hostname.toLowerCase()) &&
        pathParts.length === 2 &&
        owner != null &&
        !RESERVED_GITHUB_OWNER_ROUTES.has(owner)
        ? parsed
        : undefined
      : undefined;
  } catch {
    return undefined;
  }
}

export function isGithubRepositoryUrl(url: string | undefined): boolean {
  return githubRepositoryUrl(url) !== undefined;
}

export function getGithubRepositoryLabel(
  url: string | undefined,
): string | undefined {
  const repositoryUrl = githubRepositoryUrl(url);

  if (!repositoryUrl) {
    return undefined;
  }

  return repositoryUrl.pathname.split('/').filter(Boolean)[1];
}
