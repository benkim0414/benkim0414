## 1. Test First

- [x] 1.1 Add failing Playwright coverage for first-screen search visibility.
- [x] 1.2 Add failing tests that skill cards render level, category, usage, tags, and related projects.
- [x] 1.3 Add failing tests for email and LinkedIn contact links.
- [x] 1.4 Add failing responsive smoke coverage for desktop and mobile viewports.

## 2. Compose Showcase UI

- [x] 2.1 Replace temporary rendering with the final single-page showcase structure.
- [x] 2.2 Build the search/filter toolbar with shadcn-styled controls.
- [x] 2.3 Build skill result cards with level, category, tags, usage descriptions, and related projects.
- [x] 2.4 Add concise personal header copy and contact links using existing README contact information.
- [x] 2.5 Add accessible empty, loading-free, and all-results states for the static app.
- [x] 2.6 Verify the layout uses responsive constraints and does not rely on router navigation.

## 3. Verify

- [x] 3.1 Run `pnpm install --frozen-lockfile`.
- [x] 3.2 Run `pnpm nx test github.io`.
- [x] 3.3 Run `pnpm nx e2e github.io-e2e`.
- [x] 3.4 Run `pnpm nx build github.io`.
- [x] 3.5 Run `pnpm nx report`.
- [x] 3.6 Run `git diff --check`.
- [x] 3.7 Run `pnpm openspec validate compose-github-io-showcase-ui`.
