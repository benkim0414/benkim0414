## 1. Test First

- [ ] 1.1 Add failing tests for allowed skill level bounds.
- [ ] 1.2 Add failing tests for approved skill categories.
- [ ] 1.3 Add failing tests for required usage descriptions and project references.
- [ ] 1.4 Add failing tests proving the data module works without network access.

## 2. Implement Data Model

- [ ] 2.1 Define TypeScript types for skills, levels, categories, projects, tags, and usage notes.
- [ ] 2.2 Add level display labels for the 1 through 5 scale.
- [ ] 2.3 Add the approved DevOps-oriented category list.
- [ ] 2.4 Add placeholder skills and projects that exercise every category needed by v1.
- [ ] 2.5 Export data in a shape that later search and UI changes can consume directly.

## 3. Verify

- [ ] 3.1 Run `pnpm install --frozen-lockfile`.
- [ ] 3.2 Run `pnpm nx test github.io`.
- [ ] 3.3 Run `pnpm nx build github.io`.
- [ ] 3.4 Run `pnpm nx report`.
- [ ] 3.5 Run `git diff --check`.
- [ ] 3.6 Run `pnpm openspec validate model-github-io-skills-data`.
