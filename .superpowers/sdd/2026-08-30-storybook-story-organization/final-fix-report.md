# Final Fix Report: Storybook story organization

## Outcome

This fix wave makes the approved review journey effective in Storybook: root
groups sort as `Pages`, `Navigation`, and `Components`; nested titles and story
names sort alphabetically. The regression test invokes Storybook's exported
V7 sorter against a deliberately scrambled story index, rather than asserting
only the preview configuration.

The route-preview integration test now renders all five canonical `Pages`
stories through `AppRoutes` and the exported global preview decorator. It
asserts existing accessible page content for Home, Skills, Skill Detail,
Roadmap, and Not Found.

## Files changed

- `apps/github.io/.storybook/preview.ts`
  - Adds supported `storySort` options: `method: 'alphabetical'`,
    `includeNames: true`, and the required root order.
- `apps/github.io/.storybook/story-taxonomy.spec.ts`
  - Executes Storybook's `sortStoriesV7` against scrambled entries and asserts
    the complete effective ordering across roots, nested titles, and story
    names.
- `apps/github.io/.storybook/story-routes.spec.ts`
  - Renders Home, Skills, Skill Detail, Roadmap, and Not Found stories through
    `AppRoutes` using the actual global preview decorator.
- `.superpowers/sdd/2026-08-30-storybook-story-organization/task-3-report.md`
  - Corrects the prior scratch report to say that manual sidebar verification
    was skipped; manifest inspection is recorded only as automated evidence.
- `docs/solutions/design-patterns/mirror-app-shell-ownership-in-mobile-storybook-pages.md`
  - Replaces the retired `GitHub.io/Navigation/Global Navigation` example with
    the current `Navigation/Global Navigation` title.

## TDD evidence

### RED

Command:

```text
pnpm nx test github.io -- story-taxonomy.spec.ts story-routes.spec.ts
```

Result: failed as intended: 1 failed test and 9 passed tests. The real
Storybook V7 sorter retained the deliberately scrambled ordering because the
previous configuration had neither alphabetical mode nor story-name sorting.

### GREEN

After adding `method: 'alphabetical'` and `includeNames: true` to the existing
root-order configuration, the same command passed: 2 files and 10 tests.

## Validation

All commands ran from the requested linked worktree:

| Command | Result |
| --- | --- |
| `pnpm nx test github.io -- story-taxonomy.spec.ts story-routes.spec.ts` | Passed: 2 files, 10 tests. |
| `pnpm nx lint github.io` | Passed with 31 pre-existing warnings and no errors. |
| `pnpm nx test github.io` | Passed: 75 files, 724 tests. |
| `pnpm nx build github.io` | Passed. |
| `pnpm nx build-storybook github.io` | Passed. |

## Self-review

- The ordering test calls Storybook's public V7 sorter, so it protects the
  effective output of the configured sort policy rather than its object shape.
- `includeNames: true` is necessary to alphabetize the five exports whose
  common title is `Pages`, as well as multiple states in one component story.
- Route stories continue to use the preview-owned theme, router, and link
  context. No route, production UI, data, or dependency changed.
- Stories remain colocated; no physical `pages/` source directory was added.
- Documentation changes are limited to the in-scope stale verification claim
  and retired title example.

## Unresolved concerns

- Manual browser/sidebar inspection was intentionally not run. The automated
  Storybook sorter test and successful static Storybook build cover ordering
  and build integration, but this is not a visual browser verification.
- Existing tooling warnings remain: `NO_COLOR`/`FORCE_COLOR`, the deprecated
  Nx Vite TS-paths plugin, 31 lint warnings, jsdom canvas/scroll messages in
  the full test suite, Lightning CSS unknown-at-rule warnings, and large-chunk
  warnings from app and Storybook builds. None originated in this fix wave.
