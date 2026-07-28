const GITHUB_HOSTS = new Set(['github.com', 'www.github.com']);

export function isGithubRepositoryUrl(url: string | undefined): boolean {
  if (!url) {
    return false;
  }

  try {
    const parsed = new URL(url);
    const pathParts = parsed.pathname.split('/').filter(Boolean);

    return (
      GITHUB_HOSTS.has(parsed.hostname.toLowerCase()) && pathParts.length === 2
    );
  } catch {
    return false;
  }
}

export function getGithubRepositoryLabel(
  url: string | undefined,
): string | undefined {
  if (!isGithubRepositoryUrl(url)) {
    return undefined;
  }

  return new URL(url).pathname.split('/').filter(Boolean)[1];
}
