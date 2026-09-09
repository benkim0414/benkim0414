---
title: Secure Cross-Repository GitHub Pages Artifact Deployment
date: 2026-09-01
last_updated: 2026-09-09
category: workflow-issues
module: apps/github.io
problem_type: workflow_issue
component: development_workflow
severity: high
applies_when:
  - "Deploying an independently versioned application from an Nx and pnpm monorepo"
  - "Conventional Commit scope is the release eligibility contract"
  - "A tag, GitHub Release, or deployment may need to resume after partial completion"
  - "The first authoritative tag must be reconstructed from existing first-parent history"
related_components: [github-actions, nx-release, github-pages]
tags: [github-io, semantic-versioning, nx-release, conventional-commits, first-parent, artifact-recovery, github-actions, anti-rollback]
---

# Secure Cross-Repository GitHub Pages Artifact Deployment

## Context

`apps/github.io` is built in the source monorepo, while a separate artifact-only
repository serves the root GitHub Pages site. The release therefore crosses two
boundaries: it must derive an app-specific version from shared repository
history, and it must publish exactly the bytes that were approved even when a
workflow stops after creating a tag, Release, asset, or deployment commit.

The durable design is one repository-owned coordinator for release eligibility,
integration-history replay, and release identity. Nx validates that decision
against the workspace project and tag configuration; it does not independently
decide which commits release the app. The source package is private and
versionless, and the production version exists in the tag, release record,
built artifact, and deployment metadata.

Earlier work used Changesets, a mutable manifest version, and a separate Pages
deployment workflow. That created two potential release authorities and did not
provide enough durable state to recover after an irreversible publication step.
Review-driven testing showed that retries must reuse a persisted record and
artifact instead of recalculating or rebuilding (session history).

## Guidance

### Keep app eligibility exact and pure

Accept only the exact Conventional Commit scope `github.io`. A scoped `feat`
produces a minor bump, a scoped `fix` produces a patch, and a scoped `!` or
breaking-change footer produces a major bump. Unscoped commits, look-alike
scopes, and nonbreaking types other than `feat` or `fix` do not contribute.
[Classifier](../../../scripts/github-io-release-core.mjs)
[Classifier tests](../../../scripts/github-io-release-core.test.mjs)

This exact-scope rule is the monorepo boundary. Changed-file attribution can
identify affected projects, but it cannot replace the author-declared release
scope or determine SemVer impact.

### Replay integrations on first-parent history

Treat the deployment branch's first-parent chain as the ordered release stream.
A squash merge is one integration. For a true merge, inspect the commits it
introduces relative to its first parent and apply one highest bump for that
integration. Require release targets and normal-release baselines to be on the
first-parent chain so branch-only work cannot become a release boundary.
[Release coordinator](../../../scripts/github-io-release.mjs)
[History tests](../../../scripts/github-io-release.test.mjs)

For the first tag, replay that same model from an explicitly reviewed app
introduction boundary, starting at `0.0.0`. Bind bootstrap execution to the full
reviewed source SHA and exact replayed version, and lock the contributing commit
sequence in a repository-history fixture. The current reviewed fixture produces
`0.142.3`; it is a repository-specific bootstrap result, not a reusable seed.
[Bootstrap fixture](../../../scripts/github-io-bootstrap.test.mjs)

### Persist before publishing identity

A prepared release consists of an immutable archive and a canonical record that
binds project, source SHA, previous and next versions, tag, accepted commits,
artifact name, and SHA-256 digest. On a fresh run:

1. Calculate the candidate and have pinned Nx Release validate it with all Git
   mutations disabled.
2. Install, lint, test, and build once for the recorded source and version.
3. Create a deterministic archive, write and verify its release record, then
   upload both as the source-keyed Actions artifact.
4. Only after persistence, create or verify the tag and GitHub Release, upload
   matching assets, and deploy the downloaded archive.

[Nx validator](../../../scripts/github-io-nx-release.mjs)
[Release workflow](../../../.github/workflows/release-github-io.yml)

On retry, discover the saved checkpoint before recalculation. Accept exactly
one unexpired artifact with the expected workflow provenance, then verify its
record and digest. Recovery must not enter the build path. If a source is tagged
but its checkpoint is missing, ambiguous, expired, or corrupt, fail closed
rather than create different bytes under the same identity.
[Recovery tests](../../../scripts/github-io-release-recovery.test.mjs)

### Make every external step idempotent

Serialize release runs without cancelling an in-progress run. Existing tags,
release notes, assets, and deployed metadata are acceptable only when they
match the saved checkpoint. An out-of-order deployment compares source ancestry
before SemVer and distinguishes deploy, identical, superseded, divergent, and
conflict states before mutating the target repository.

Keep the deploy job's source checkout credential-free. Give only the target
checkout the dedicated `PAGES_DEPLOY_KEY`, preserve its `.git` directory, replace published
output, create `.nojekyll`, persist the canonical deployment record, and use an
ordinary non-force push. GitHub Actions secret names must not begin with
`GITHUB_`.
[Artifact synchronizer](../../../scripts/sync-github-pages-artifact.mjs)
[Operator runbook](../../runbooks/github-pages-artifact-release.md)

## Why This Matters

Rebuilding after publication starts can associate different bytes with the same
version because dependency resolution, tools, timestamps, or source state may
have changed. A source-bound record and digest turn recovery into verification
of an earlier decision. The failure-boundary suite exercises retries after
persistence, tagging, Release creation, asset upload, publication,
synchronization, and deployment while asserting one version, one build, and
unchanged saved bytes.

First-parent replay makes versions follow the integration order users receive.
Exact scope matching prevents unrelated monorepo work from advancing this app's
stream. Keeping the coordinator authoritative while Nx performs a mutation-free
agreement check avoids two competing version calculators.

The artifact-only repository remains a useful security and ownership boundary:
source history and build tooling stay out of the Pages repository, while its
write credential is narrowly scoped to the final synchronization step.

## When to Apply

- A deployable app in a monorepo needs an independent semantic-version stream.
- History contains squash merges, true merges, or both.
- A pre-versioning app needs a reviewed version reconstructed from history.
- Publication has several irreversible steps and a retry must preserve bytes.
- An older queued run must not roll back a newer deployment.
- Nx or another release framework is useful for graph and tag validation, while
  repository-specific eligibility and recovery semantics need a coordinator.

Do not copy local policy values blindly. The `github.io` scope, tag pattern,
bootstrap boundary and version, artifact name, and retention period belong to
this repository. The reusable invariants are exact eligibility, integration-
ordered replay, reviewed bootstrap input, persistence before publication,
fail-closed verification, and recovery without rebuilding.

## Examples

### Commit eligibility

```text
feat(github.io): add profile           -> minor
fix(github.io): repair footer          -> patch
fix(github.io)!: remove an API         -> major
feat(github.io-ui): add profile        -> ignored
feat: repository-wide breaking change -> ignored for github.io
chore(github.io): reorganize files     -> ignored
```

### Recoverable workflow

```text
source SHA
  -> saved checkpoint exists
       -> verify record and digest
       -> recover the same tag, version, and artifact
       -> publish or deploy only missing matching steps
  -> no saved checkpoint
       -> if source is already tagged: fail closed
       -> calculate
       -> noop or superseded: stop before build
       -> prepare: validate, build once, persist checkpoint
       -> publish and deploy the exact persisted artifact
```

## Related

- [Versioned footer contract](../design-patterns/github-io-astryx-attribution-footer.md)
- [Nx and pnpm app scaffolding](scaffold-nx-react-astryx-with-pnpm.md)
- No matching GitHub issue was found during this update.
