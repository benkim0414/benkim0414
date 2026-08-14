# Task 1 report: centered route-aware top navigation links

## What changed

- Added `Home`, `Roadmap`, and `Skills` `TopNavItem` links to `TopNav.centerContent`, preserving the command palette and right-aligned Search action.
- Selected state uses exact matching for `/` and `/roadmap`; Skills matches `/skills` and `/skills/*`.
- Added route-aware coverage of destinations and selected states, a `/roadmap` story, and updated stale app integration assertions that contradicted the approved visible links.

## Files changed

- `apps/github.io/src/app/global-navigation-layout.tsx`
- `apps/github.io/src/app/global-navigation-layout.spec.tsx`
- `apps/github.io/src/app/global-navigation-layout.stories.tsx`
- `apps/github.io/src/app/app.spec.tsx`

## TDD evidence

### RED

After adding the navigation tests and before production changes, `pnpm nx test github.io -- src/app/global-navigation-layout.spec.tsx` failed: 5 failures of `Unable to find an accessible element with the role "link" and name "Home"`. This was expected because `GlobalNavigationLayout` rendered only Search and no primary links.

The brief's literal command, `pnpm nx test github.io -- apps/github.io/src/app/global-navigation-layout.spec.tsx`, resolves the Vitest filter relative to `apps/github.io` and therefore reports `No test files found`. The equivalent project-relative filter above is the command that exercised the requested spec.

### GREEN

`pnpm nx test github.io -- src/app/global-navigation-layout.spec.tsx`

Result: 1 test file passed, 7 tests passed.

## Full verification

- `pnpm nx test github.io` — passed: 65 test files, 611 tests.
- `pnpm nx lint github.io` — passed (exit 0); 28 existing warnings in unrelated test files.
- `pnpm nx build github.io` — passed. Existing CSS at-rule and chunk-size warnings were emitted.
- `git diff --check` — passed with no whitespace errors.

## Diff and self-review

- Reviewed unstaged `git diff`; `git diff --cached` was empty before staging.
- Scope is limited to the four approved task files plus this required report.
- The center slot is Astryx's true-centered slot; order is Home, Roadmap, Skills.
- Tests assert literal hrefs and exactly one `aria-current="page"` across home, roadmap, skills, and skill-detail routes.
- Existing search behavior test remains and passes, covering the unchanged Search action and command palette navigation.

## Concerns

- No functional concerns.
- Tooling emits existing test-environment, lint, CSS-minifier, and chunk-size warnings as noted above; all required commands exit successfully.
