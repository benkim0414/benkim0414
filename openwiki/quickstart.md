---
type: guide
title: Workspace quickstart
description: Set up the pnpm/Nx monorepo, run github.io, and find the right architecture or workflow guide.
tags: [quickstart, workspace, pnpm, nx]
sources:
  - id: openwiki-source-e0c4e21b9bfdc3be09ed876d
    resource: repo://.github/workflows/release-github-io.yml
  - id: openwiki-source-8037e2358a2c4f9b2c722a11
    resource: repo://AGENTS.md
  - id: openwiki-source-7960267d064bb36aab7607cb
    resource: repo://apps/github.io/package.json
  - id: openwiki-source-a099837b8e8614c677082a9d
    resource: repo://apps/github.io/project.json
  - id: openwiki-source-fcfa3ced1d03143bb27d5018
    resource: repo://apps/github.io/vite.config.ts
  - id: openwiki-source-af76a0570259ad84dd4c02ea
    resource: repo://docs/agents/commit-scopes.md
  - id: openwiki-source-e9bb13afb6b400d29b3f8512
    resource: repo://docs/agents/openwiki.md
  - id: openwiki-source-8b0ac8066b150cc5fe3fd0ff
    resource: repo://docs/runbooks/github-pages-artifact-release.md
  - id: openwiki-source-cdda5d4e7c9cf1bdd3f5a61c
    resource: repo://docs/runbooks/historical-commit-scope-repair.md
  - id: openwiki-source-5b54a58d1b51cd490b0e7162
    resource: repo://package.json
  - id: openwiki-source-40275cb92c3610938f16ade3
    resource: repo://pnpm-workspace.yaml
generated: { by: "codex", at: "2026-09-09T15:24:02.550Z" }
verified:
  - by: openwiki/0.5.0
    at: 2026-09-15T04:37:16.458Z
---

# Workspace quickstart

This private pnpm workspace contains the `github.io` React application. Workspace
globs cover `apps/*` and `packages/*`; a glob is not proof that a package exists.
The application package is `@benkim0414/github-io`, while its Nx project name is
`github.io`. The root package is `benkim0414`.

Use a linked worktree for changes, following [AGENTS.md](../AGENTS.md). Match the
existing deployment environment with Node 24 and the repository-pinned pnpm
11.16.0, then run from the worktree root:

```sh
pnpm install --frozen-lockfile
pnpm nx show projects
pnpm nx show project github.io --json
pnpm nx serve github.io
```

Vite serves on localhost port 4200; preview uses port 4300. Production output
goes to `dist/apps/github.io`, with both the main and 404 HTML entries built.
Nx plugins provide inferred targets in addition to the explicit layout checks.
See [validation](workflows/validation.md) before handing off changes.

For release calculation and its focused tests, use `pnpm release:github.io`
and `pnpm test:release:github.io`. These are inspection and validation entrypoints;
do not substitute a local production build for the serialized GitHub release
workflow, and do not invoke publishing or deployment without the explicit
handoff gate. The complete state machine is in
[release and session handoff](operations/releases.md). Operators preparing the
first release or a recovery should also follow
[`docs/runbooks/github-pages-artifact-release.md`](../docs/runbooks/github-pages-artifact-release.md)
for the reviewed SHA/version inputs, target repository setup, and live checks.

For commit ownership, use `pnpm test:commit-scopes` and the
[scope policy](../docs/agents/commit-scopes.md); documentation and mixed-root
changes still need human domain judgment. `pnpm test:commit-history` exercises
the guarded repair tooling in disposable fixtures. A successful test run does
not approve a real history rewrite: follow the
[history-repair guide](operations/history-repair.md) for inventory, backup,
exact-package approval, and isolated verification boundaries.

## Find the right guide

| Task | Start here |
| --- | --- |
| Add a route or understand shared providers | [Application architecture](architecture/github-io.md) |
| Change skills, evidence, or scores | [Skills and capability evidence](concepts/evidence.md) |
| Change themes, components, or scroll layout | [Design system and layout](architecture/design-system.md) |
| Select tests and checks | [Validation workflow](workflows/validation.md) |
| Choose a commit scope or investigate a CI range diagnostic | [Scope ownership](../docs/agents/commit-scopes.md) and [validation](workflows/validation.md) |
| Review historical messages or prepare an isolated repair | [Guarded history repair](operations/history-repair.md) |
| Calculate versions or understand release, recovery, deployment, and handoff boundaries | [Release and session handoff](operations/releases.md) |

## Maintain this wiki

OpenWiki 0.5.0 is a pinned dev dependency, not a required global binary:

```sh
pnpm openwiki:setup
pnpm openwiki:status
pnpm openwiki:visualize
```

Restart Codex after integration installation or repair so it reloads the local
skill and MCP configuration. Ask the active host to update the repository wiki
using **update mode**, including the first run. Native page jobs and Claims
record source evidence; do not edit their generated metadata by hand.
Follow [the session procedure](../docs/agents/openwiki.md) for scope, exclusions,
interruption recovery, and the required updated/unchanged/blocked handoff result.
This maintenance step does not authorize a push or deployment.
