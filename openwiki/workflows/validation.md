---
type: workflow
title: Validation workflow
description: Select checks for application behavior, compiled layout, agent documentation, and the local OpenWiki installer.
tags: [testing, nx, vitest, validation]
verified:
  - by: openwiki/0.5.0
    at: 2026-09-08T02:06:28.031Z
sources:
  - id: openwiki-source-6bbddd28d28fab914230cb02
    resource: repo://.github/workflows/deploy-github-pages-artifact.yml
  - id: openwiki-source-a099837b8e8614c677082a9d
    resource: repo://apps/github.io/project.json
  - id: openwiki-source-fcfa3ced1d03143bb27d5018
    resource: repo://apps/github.io/vite.config.ts
  - id: openwiki-source-6ba748254f38112b13d529da
    resource: repo://nx.json
  - id: openwiki-source-871ac2bb60a2ea411c19a76e
    resource: repo://scripts/setup-openwiki.test.mjs
generated: { by: "codex", at: "2026-09-08T02:06:28.031Z" }
---

# Validation workflow

Start in the intended linked worktree and install its dependencies. Inspect
`pnpm nx show projects` and `pnpm nx show project github.io --json` instead of
assuming that only explicit `project.json` targets exist: Nx plugins infer
Vite, ESLint, Vitest, and Storybook tasks.

For application changes, the existing deployment gate runs:

```sh
pnpm nx lint github.io
pnpm nx test github.io --run
pnpm nx build github.io
```

Vitest uses jsdom, includes source test/spec files and `.storybook/**/*.spec.ts`,
and disables watch mode. Coverage uses V8 with reports under
`coverage/apps/github.io`. Relevant focused contracts include
`skill-detail-resolver.spec.ts`, `devops-capability-evidence.scoring.spec.ts`,
`theme-mode.spec.tsx`, and `global-navigation-layout.spec.tsx` beside their source.
Choose the test closest to the changed behavior before running the broader suite.

For CSS/layout changes, also run:

```sh
pnpm nx run github.io:verify-global-layout-css
pnpm nx run github.io:verify-mobile-layout-browser
```

Both targets depend on build. They complement DOM tests with compiled-CSS and
browser-level checks; a jsdom pass alone does not establish mobile scroll or
visual correctness. Browser prerequisites and failures must be reported, not
converted into an assumed pass.

For agent-document or OpenWiki setup changes:

```sh
pnpm test:astryx-agents
pnpm astryx:agents:check
node --test scripts/setup-openwiki.test.mjs
pnpm openwiki:status
git diff --check
```

The setup test runs the installer twice in a temporary Git repository and checks
idempotency, preservation of unrelated Codex configuration, and local pnpm
resolution. Integration status is not wiki freshness: only a successful native
finish, or an evaluated no-op, establishes the result of wiki maintenance.

Follow [session maintenance](../../docs/agents/openwiki.md) and
[release/handoff boundaries](../operations/releases.md). For installation and
navigation, return to [quickstart](../quickstart.md).
