---
type: operations
title: Release and session handoff
description: Existing artifact deployment and release automation versus local OpenWiki maintenance.
tags: [release, github-actions, handoff, openwiki]
sources:
  - id: openwiki-source-e0c4e21b9bfdc3be09ed876d
    resource: repo://.github/workflows/release-github-io.yml
  - id: openwiki-source-e9bb13afb6b400d29b3f8512
    resource: repo://docs/agents/openwiki.md
  - id: openwiki-source-8b0ac8066b150cc5fe3fd0ff
    resource: repo://docs/runbooks/github-pages-artifact-release.md
  - id: openwiki-source-cdda5d4e7c9cf1bdd3f5a61c
    resource: repo://docs/runbooks/historical-commit-scope-repair.md
  - id: openwiki-source-4a53ad4534df683607cf302f
    resource: repo://docs/superpowers/plans/2026-09-09-historical-commit-scope-repair.md
  - id: openwiki-source-234366370818f39ce649e8e3
    resource: repo://scripts/github-io-nx-release.mjs
  - id: openwiki-source-6077ffb7151edbd55ee9736a
    resource: repo://scripts/github-io-release-core.mjs
  - id: openwiki-source-2987102e69de21dc21c6b7d8
    resource: repo://scripts/github-io-release.mjs
  - id: openwiki-source-692e6bda673663422a5ce28b
    resource: repo://scripts/sync-github-pages-artifact.mjs
generated: { by: "codex", at: "2026-09-09T15:24:02.550Z" }
verified:
  - by: openwiki/0.5.0
    at: 2026-09-15T04:30:09.723Z
---

# Release and session handoff

One serialized workflow now owns the complete `github.io` release on pushes to
`main`; manual dispatch supports an explicit first bootstrap or recovery for a
specific reviewed first-parent source SHA and version. Its non-cancelling `release` concurrency group covers
calculation, publication, and deployment. With no baseline tag, an ordinary
push fails and instructs an operator to dispatch the reviewed bootstrap. Later
runs scan from the latest `github.io@<version>` tag and ignore histories without
an exact-scope qualifying conventional commit.

The release coordinator classifies exact `github.io` scope only. Breaking
changes win major, `feat` produces minor, and `fix` produces patch. Bootstrap
replays from `0.0.0`, including the first-parent integration that introduces a
valid `apps/github.io/project.json` named `github.io`. Discovery reads historical
Git blobs and supports a root, direct commit, or true-merge introduction without
depending on a fixed old commit ID. Missing, conflicting, or removed/reintroduced
project identity fails closed. An explicit reviewed `--start` must lie on the
target's first-parent history. Review the resulting exact source/version pair;
neither an old documented version nor the app manifest supplies the result.

History changes can alter release eligibility and all descendant identities.
The [guarded history-repair workflow](history-repair.md) therefore separates
message review, isolated graph verification, release replay comparison, and
publication approval. Available tooling does not establish that a real rewrite
or release has been approved or executed.

A prepared release is built once. After lint and test, the workflow supplies
the calculated version to an uncached production build, verifies that exact
value in emitted JavaScript, creates a deterministic archive and SHA-256 release
record, and uploads both as a 90-day Actions artifact named for the source SHA.
Only after persistence succeeds does it create or verify the tag, attach the
same bytes to a GitHub Release, and publish it. Recovery finds that saved
artifact across runs, validates its workflow provenance, metadata, tag, source,
and digest, and continues without rebuilding. Ambiguous, expired, corrupt, or
tagged-but-unrecorded state fails explicitly. Release notes are rendered only
from accepted commits in the saved record and must match on retries. Before a
fresh build, the coordinator also asks Nx Release to verify the selected
project, baseline, candidate, and tag in mutation-disabled dry-run mode.

Deployment receives the verified archive instead of source build credentials.
It checks out the separate user-site repository only in the environment-gated
deployment job. Before mutation, the synchronizer compares the candidate with
`.github-pages-release.json`: identical delivery is a no-op, an older ancestor
is superseded, newer history must also increase version, and divergence or
identity conflicts fail. Bootstrap alone may initialize a site without that
metadata. A changed target is committed with both release tag and source SHA.
Obsolete first-parent release targets stop successfully before build or
publication. The operator setup, first-deployment checks, and recovery limits
are detailed in `docs/runbooks/github-pages-artifact-release.md`.

These describe existing automation, not authorization to invoke it from a local
coding session. [AGENTS.md](../../AGENTS.md) owns the explicit handoff/shipping
gate. Run relevant [validation](../workflows/validation.md), report results and
remaining blockers, and await the user's shipping instruction.

OpenWiki maintenance is intentionally local. Follow
[the canonical session procedure](../../docs/agents/openwiki.md) before handing
off relevant implementation work. It uses the active authenticated host session,
not a standalone provider API key. OpenWiki 0.5.0 is pinned, and the repository
installer configures `pnpm exec openwiki mcp --host codex`. Use native **update**
mode for bootstrap as well as maintenance: init would add a scheduled workflow.
No OpenWiki CI workflow is part of this integration. The upstream managed agent
snippet's generic scheduled-workflow sentence is not local policy.

Finish the native lifecycle before reporting **updated**; report **unchanged**
for an evaluated no-op or **blocked** with a resume step if interrupted. The
[quickstart](../quickstart.md) lists setup and viewing commands.
