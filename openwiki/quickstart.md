---
type: guide
title: Workspace quickstart
description: Set up the pnpm/Nx monorepo, run github.io, and find the right architecture or workflow guide.
tags: [quickstart, workspace, pnpm, nx]
sources:
  - id: openwiki-source-7960267d064bb36aab7607cb
    resource: repo://apps/github.io/package.json
  - id: openwiki-source-a099837b8e8614c677082a9d
    resource: repo://apps/github.io/project.json
  - id: openwiki-source-fcfa3ced1d03143bb27d5018
    resource: repo://apps/github.io/vite.config.ts
  - id: openwiki-source-e9bb13afb6b400d29b3f8512
    resource: repo://docs/agents/openwiki.md
  - id: openwiki-source-5b54a58d1b51cd490b0e7162
    resource: repo://package.json
  - id: openwiki-source-40275cb92c3610938f16ade3
    resource: repo://pnpm-workspace.yaml
generated: { by: "codex", at: "2026-09-09T04:57:16.606Z" }
verified:
  - by: openwiki/0.5.0
    at: 2026-09-09T10:46:58.649Z
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

## Find the right guide

| Task | Start here |
| --- | --- |
| Add a route or understand shared providers | [Application architecture](architecture/github-io.md) |
| Change skills, evidence, or scores | [Skills and capability evidence](concepts/evidence.md) |
| Change roadmap topics, evidence states, or Stepper presentation | [Application architecture](architecture/github-io.md), [evidence semantics](concepts/evidence.md), then [design system and layout](architecture/design-system.md) |
| Change themes, components, or scroll layout | [Design system and layout](architecture/design-system.md) |
| Select tests and checks | [Validation workflow](workflows/validation.md) |
| Understand deployment and handoff boundaries | [Release and session handoff](operations/releases.md) |

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
