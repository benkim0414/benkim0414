## 1. Test First

- [ ] 1.1 Add failing unit tests for Fuse search across skill, tag, project, and usage text.
- [ ] 1.2 Add failing unit tests for category and level filters combined with query text.
- [ ] 1.3 Add failing unit tests for URL parameter parsing and serialization.
- [ ] 1.4 Add a failing UI or Playwright test for URL-initialized search state and empty results.

## 2. Implement Search

- [ ] 2.1 Add Fuse.js as a dependency.
- [ ] 2.2 Build a typed search index from the local skills data.
- [ ] 2.3 Implement search/filter utilities with normalized URL parameter handling.
- [ ] 2.4 Add search controls and temporary result rendering sufficient to exercise behavior.
- [ ] 2.5 Ensure unknown or invalid URL filter values are ignored safely.

## 3. Verify

- [ ] 3.1 Run `pnpm install --frozen-lockfile`.
- [ ] 3.2 Run `pnpm nx test github.io`.
- [ ] 3.3 Run `pnpm nx e2e github.io-e2e`.
- [ ] 3.4 Run `pnpm nx build github.io`.
- [ ] 3.5 Run `pnpm nx report`.
- [ ] 3.6 Run `git diff --check`.
- [ ] 3.7 Run `pnpm openspec validate implement-github-io-search-experience`.
