# Task 2 Report: Searchable Astryx Skill List

## Status

DONE_WITH_CONCERNS

## Implementation

- Added `SkillLogo`, backed by Astryx `Avatar`, with the skill icon slug retained as a data attribute.
- Added `SkillList` and `skillMatchesQuery`, filtering skill names, categories, and keywords case-insensitively.
- Rendered Astryx `List`, `ListItem`, and `Badge` rows with existing `SkillRating` content.
- Added responsive layout styles and an empty state.

## Astryx API Verification

Verified the installed component exports and declarations before implementation:

- `Avatar` is available from `@astryxdesign/core/Avatar` and accepts `name`, `className`, and data attributes.
- `Badge` requires `label` rather than children.
- `List` uses `hasDividers` rather than `dividers`.
- `ListItem` requires `label` rather than children.
- `PowerSearch` is a token-based structured-filter component. Its `onChange` only fires when filters are committed and it does not forward native input events, so it cannot implement the brief's synchronous `fireEvent.change` text-search contract. The list therefore uses installed Astryx `TextInput`, the controlled text-input primitive, with the same visible and accessible search interface.

## TDD Evidence

1. RED: created `skill-list.spec.tsx`, then ran:

   ```sh
   PATH=/tmp/corepack-shims:$PATH NX_DAEMON=false corepack pnpm nx test github.io --skip-nx-cache
   ```

   Result: failed before implementation because `./skill-list` did not exist.

2. GREEN: implemented the list, logo adapter, styles, and Astryx API adjustments, then reran the same command.

   Result: passed successfully.

The test assertion for the rating uses `getAllByLabelText` because sample data contains both TypeScript and React at `5 out of 5`; the original singular query incorrectly treats valid duplicate ratings as an error.

## Verification

- PASS: `PATH=/tmp/corepack-shims:$PATH NX_DAEMON=false corepack pnpm nx test github.io --skip-nx-cache`
- PASS: `git diff --check`
- Self-review: no Task 2 correctness or scope issues found in the staged diff.
- BLOCKED (pre-existing configuration): `PATH=/tmp/corepack-shims:$PATH NX_DAEMON=false corepack pnpm nx typecheck github.io --skip-nx-cache` fails because the current TypeScript module-resolution configuration cannot resolve existing `@astryxdesign/theme-neutral/built`, and also cannot resolve Astryx subpath declarations. Vite/Vitest resolves those imports and the required test suite passes.

## Commit

- `d891a94 feat(github.io): add searchable skill list`

## Review Fix

- Replaced the visible `TextInput` with Astryx `PowerSearch`, configured with
  `contentSearchFieldKey` for free-text skill queries.
- Derived the displayed query from the controlled PowerSearch filter state.
- Replaced the fixed section heading ID with React `useId()`.
- Added coverage for the labeled PowerSearch combobox, structured content-search
  selection, and distinct heading IDs across multiple instances.

### Files Changed

- `apps/github.io/src/app/skills/skill-list.tsx`
- `apps/github.io/src/app/skills/skill-list.spec.tsx`
- `.superpowers/sdd/task-2-report.md`

### Verification

```sh
PATH=/tmp/corepack-shims:$PATH NX_DAEMON=false corepack pnpm nx test github.io --skip-nx-cache
```

Result: PASS - Nx successfully ran the `github.io:test` target.
