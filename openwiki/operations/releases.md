---
type: operations
title: Release and session handoff
description: Existing artifact deployment and release automation versus local OpenWiki maintenance.
tags: [release, github-actions, handoff, openwiki]
verified:
  - by: openwiki/0.5.0
    at: 2026-09-08T02:12:24.965Z
sources:
  - id: openwiki-source-5e43930e59b5dcfc5caf9f90
    resource: repo://.github/workflows/changesets-version.yml
  - id: openwiki-source-6bbddd28d28fab914230cb02
    resource: repo://.github/workflows/deploy-github-pages-artifact.yml
  - id: openwiki-source-e0c4e21b9bfdc3be09ed876d
    resource: repo://.github/workflows/release-github-io.yml
  - id: openwiki-source-e9bb13afb6b400d29b3f8512
    resource: repo://docs/agents/openwiki.md
generated: { by: "codex", at: "2026-09-08T02:12:24.965Z" }
---

# Release and session handoff

The source monorepo and the Artifact-Only User-Site Repository have different
jobs. A push to `main` or manual dispatch starts the existing artifact workflow.
It installs with the frozen lockfile on Node 24 and pnpm 11.16.0, then lints,
tests, and builds `github.io`. Only after those checks does it check out
`benkim0414/benkim0414.github.io`, synchronize `dist/apps/github.io`, and commit
and push changed artifacts. Unchanged output exits without a deployment commit.
Concurrency cancels a superseded artifact-sync run.

Versioning is separate. The Changesets workflow responds to pushes on `main`
and maintains the `chore(release): version github.io` PR. The release workflow
requires a merged PR into `main`, that exact title, the GitHub Actions bot
author, and the same-repository `changeset-release/main` branch. It derives
`github.io@<version>` from the app package, rejects an existing tag pointing to
a different merge commit, and avoids recreating an existing release.

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
