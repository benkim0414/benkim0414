# Task 1 Report: Conventional-Commit Version Calculation

## Result

Implemented the pure `github.io` release versioning core in
`scripts/github-io-release-core.mjs` with table-driven tests in
`scripts/github-io-release-core.test.mjs`.

## Behavior covered

- Conventional Commit header parsing, including `type(scope)!`.
- Exact `github.io` scope matching, excluding `github-io`, `github.io-ui`, and unscoped commits.
- `feat` → minor, `fix` → patch, scoped breaking markers/trailers → major, and ignored types/scopes.
- Major-over-minor-over-patch precedence.
- Strict `major.minor.patch` parsing and SemVer increments without dependencies.
- Release calculation preserving each contributing commit's SHA, subject, and bump.
- Null result for histories containing no contributing commits.

## Verification

- Red test: `node --test scripts/github-io-release-core.test.mjs` failed with the expected module-not-found error before implementation.
- Green test: `node --test scripts/github-io-release-core.test.mjs` passed.
- `git diff --check` passed.

OpenWiki update completed successfully; generated evidence files are intentionally outside this task's commit.

## Reviewer fix (round 1)

- Added regressions rejecting a trailing newline and verifying precision for a large numeric component.
- Strict version matching now requires the entire input to match, and version arithmetic uses `BigInt` components.
- Verification: `node --test scripts/github-io-release-core.test.mjs` — passed (1 test file, 0 failures).
