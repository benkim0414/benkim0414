## 1. Test First

- [x] 1.1 Add failing unit tests for Fuse search across skill, tag, project, and usage text.
- [x] 1.2 Add failing unit tests for category and level filters combined with query text.
- [x] 1.3 Add failing unit tests for URL parameter parsing and serialization.
- [x] 1.4 Add a failing UI or Playwright test for URL-initialized search state and empty results.

## 2. Implement Search

- [x] 2.1 Add Fuse.js as a dependency.
- [x] 2.2 Build a typed search index from the local skills data.
- [x] 2.3 Implement search/filter utilities with normalized URL parameter handling.
- [x] 2.4 Add search controls and temporary result rendering sufficient to exercise behavior.
- [x] 2.5 Ensure unknown or invalid URL filter values are ignored safely.

## 3. Verify

- [x] 3.1 Run `pnpm install --frozen-lockfile`.
- [x] 3.2 Run `pnpm nx test github.io`.
- [x] 3.3 Run `pnpm nx e2e github.io-e2e`.
- [x] 3.4 Run `pnpm nx build github.io`.
- [x] 3.5 Run `pnpm nx report`.
- [x] 3.6 Run `git diff --check`.
- [x] 3.7 Run `pnpm openspec validate implement-github-io-search-experience`.
