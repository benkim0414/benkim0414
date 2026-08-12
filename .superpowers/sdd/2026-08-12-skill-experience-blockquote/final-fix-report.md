# Skill Detail Resolver Integrity Fix Report

## Status

Completed. The resolver now rejects duplicate `skillId` detail records before
one can shadow another record's evidence or project references.

## Files Changed

- `apps/github.io/src/app/skills/skill-detail-resolver.ts`
- `apps/github.io/src/app/skills/skill-detail-resolver.spec.ts`

## Fix Commit

- `8b14a14 fix(skills): reject duplicate detail records`

## Failing-Test Evidence

Test added before production-code changes:

```text
pnpm nx test github.io -- --run src/app/skills/skill-detail-resolver.spec.ts

FAIL  rejects duplicate detail records before a later record can bypass validation
AssertionError: expected [Function] to throw an error
```

The test supplied two `kubernetes` records where the later record referenced
private evidence. The previous `.find()` resolver selected the first record and
returned successfully, leaving the later record unvalidated.

## Verification

- `pnpm nx test github.io -- --run src/app/skills/skill-detail-resolver.spec.ts`
  - Passed: 1 file, 7 tests.
- `pnpm nx test github.io`
  - Passed: 56 files, 560 tests.
- `pnpm nx lint github.io`
  - Passed with 25 existing warnings in unrelated spec files.
- `pnpm nx build github.io`
  - Passed with existing Vite CSS at-rule and chunk-size warnings.
- `git diff --check`
  - Passed.

## Self-Review

- Duplicate matching records are detected before reference resolution, so a
  later malformed record cannot be hidden by an earlier valid one.
- The focused regression test exercises the real resolver with public source
  data and a private later duplicate.
- Valid enriched records keep their explicit evidence and project ordering.
- Basic known and unknown-skill results retain their previous paths and result
  types. No UI, routing, copy, or Astryx files changed.

## Concerns

No fix-specific concerns. The full suite and build emit pre-existing warnings:
jsdom canvas/scroll limitations, a React optimistic-update warning, lint
warnings in unrelated specs, and Vite CSS/chunk-size warnings.
