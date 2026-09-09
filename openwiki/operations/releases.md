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
  - id: openwiki-source-6077ffb7151edbd55ee9736a
    resource: repo://scripts/github-io-release-core.mjs
  - id: openwiki-source-2987102e69de21dc21c6b7d8
    resource: repo://scripts/github-io-release.mjs
  - id: openwiki-source-692e6bda673663422a5ce28b
    resource: repo://scripts/sync-github-pages-artifact.mjs
generated: { by: "codex", at: "2026-09-09T05:07:58.190Z" }
verified:
  - by: openwiki/0.5.0
    at: 2026-09-09T05:07:58.190Z
---

# Release and session handoff

One serialized workflow now owns the complete `github.io` release on pushes to
`main`; manual dispatch supports an explicit first bootstrap or recovery for a
specific full source SHA. Its non-cancelling `release` concurrency group covers
calculation, publication, and deployment. With no baseline tag, an ordinary
push fails and instructs an operator to dispatch the reviewed bootstrap. Later
runs scan from the latest `github.io@<version>` tag and ignore histories without
an exact-scope qualifying conventional commit.

The release coordinator classifies exact `github.io` scope only. Breaking
changes win major, `feat` produces minor, and `fix` produces patch. Bootstrap
replays first-parent integrations from `8acdd81` at `0.0.0`; the repository test
locks the reviewed result at `0.142.1`. The app manifest is not a version source.

A prepared release is built once. After lint and test, the workflow supplies
the calculated version to an uncached production build, verifies that exact
value in emitted JavaScript, creates a deterministic archive and SHA-256 release
record, and uploads both as a 90-day Actions artifact named for the source SHA.
Only after persistence succeeds does it create or verify the tag, attach the
same bytes to a GitHub Release, and publish it. Recovery finds that saved
artifact across runs, validates its workflow provenance, metadata, tag, source,
and digest, and continues without rebuilding. Ambiguous, expired, corrupt, or
tagged-but-unrecorded state fails explicitly.

Deployment receives the verified archive instead of source build credentials.
It checks out the separate user-site repository only in the environment-gated
deployment job. Before mutation, the synchronizer compares the candidate with
`.github-pages-release.json`: identical delivery is a no-op, an older ancestor
is superseded, newer history must also increase version, and divergence or
identity conflicts fail. Bootstrap alone may initialize a site without that
metadata. A changed target is committed with both release tag and source SHA.

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
