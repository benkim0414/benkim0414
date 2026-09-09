---
type: workflow
title: Validation workflow
description: Select checks for application behavior, compiled layout, agent documentation, and the local OpenWiki installer.
tags: [testing, nx, vitest, validation]
sources:
  - id: openwiki-source-e0c4e21b9bfdc3be09ed876d
    resource: repo://.github/workflows/release-github-io.yml
  - id: openwiki-source-45b1d77b308bd57403f55ff9
    resource: repo://apps/github.io/.storybook/story-taxonomy.spec.ts
  - id: openwiki-source-a099837b8e8614c677082a9d
    resource: repo://apps/github.io/project.json
  - id: openwiki-source-2bfcdfa6f69acb4ddbe6f2af
    resource: repo://apps/github.io/scripts/verify-mobile-layout-browser.mjs
  - id: openwiki-source-47aa440893a5a291d1ad1984
    resource: repo://apps/github.io/src/app/count-badge.spec.tsx
  - id: openwiki-source-7710c13ca861e757d9eac20c
    resource: repo://apps/github.io/src/app/count-badge.stories.spec.ts
  - id: openwiki-source-d97b9e088d941d15580a0bd7
    resource: repo://apps/github.io/src/app/skills/skill-detail-page.spec.tsx
  - id: openwiki-source-fcfa3ced1d03143bb27d5018
    resource: repo://apps/github.io/vite.config.ts
  - id: openwiki-source-6ba748254f38112b13d529da
    resource: repo://nx.json
  - id: openwiki-source-5b54a58d1b51cd490b0e7162
    resource: repo://package.json
  - id: openwiki-source-8e995cb599a34a3b0c5b8cbe
    resource: repo://scripts/github-io-bootstrap.test.mjs
  - id: openwiki-source-e3096823142592901fa19f6b
    resource: repo://scripts/github-io-release-workflows.test.mjs
  - id: openwiki-source-871ac2bb60a2ea411c19a76e
    resource: repo://scripts/setup-openwiki.test.mjs
  - id: openwiki-source-165465422a61a00b62b0f6d3
    resource: repo://scripts/sync-github-pages-artifact.test.mjs
generated: { by: "codex", at: "2026-09-09T05:07:58.190Z" }
verified:
  - by: openwiki/0.5.0
    at: 2026-09-09T05:07:58.190Z
---

# Validation workflow

Start in the intended linked worktree and install its dependencies. Inspect
`pnpm nx show projects` and `pnpm nx show project github.io --json` instead of
assuming that only explicit `project.json` targets exist: Nx plugins infer
Vite, ESLint, Vitest, and Storybook tasks.

For application changes, run:

```sh
pnpm nx lint github.io
pnpm nx test github.io --run
pnpm nx build github.io
```

Semantic release behavior has a separate narrow suite:

```sh
pnpm test:release:github.io
node --test scripts/github-io-bootstrap.test.mjs \
  scripts/github-io-release-workflows.test.mjs \
  scripts/github-pages-workflow.test.mjs \
  scripts/sync-github-pages-artifact.test.mjs
APP_RELEASE=true APP_VERSION=9.8.7 pnpm nx build github.io --skip-nx-cache
```

The pure and Git-fixture tests cover exact conventional-commit scope,
first-parent calculation, deterministic records, digest verification, and
deployment ordering. The bootstrap fixture independently locks the reviewed
history at `0.142.1`. Static workflow tests protect artifact-before-tag order,
recovery without rebuild, permission boundaries, and removal of Changesets.
The release build proves that a supplied version reaches the immutable output;
an `APP_RELEASE=true` build without `APP_VERSION` must fail.

The automated GitHub workflow applies the same focused Nx lint and test gates
before its one release build. Local tests establish its declarative contract;
the first real Actions run remains the validation point for GitHub artifact,
Release, and protected Environment behavior.

Vitest uses jsdom, includes source test/spec files and `.storybook/**/*.spec.ts`,
and disables watch mode. Coverage uses V8 with reports under
`coverage/apps/github.io`. Relevant focused contracts include
`skill-detail-resolver.spec.ts`, `devops-capability-evidence.scoring.spec.ts`,
`theme-mode.spec.tsx`, and `global-navigation-layout.spec.tsx` beside their source.
Choose the test closest to the changed behavior before running the broader suite.

For reusable UI elements, keep a focused component test beside the component and
exercise consumer-visible values, including zero where it changes the displayed
state. Colocate Storybook stories and a small story-module test that fixes the
established title taxonomy and representative args. Pair those tests with the
page-level test that proves the component is wired into its actual accessible
and data-derived context.

For CSS/layout changes, also run:

```sh
pnpm nx run github.io:verify-global-layout-css
pnpm nx run github.io:verify-mobile-layout-browser
```

Both targets depend on build. They complement DOM tests with compiled-CSS and
browser-level checks; a jsdom pass alone does not establish mobile scroll or
visual correctness. Browser prerequisites and failures must be reported, not
converted into an assumed pass. The mobile browser verifier also checks the
skill-detail Experience heading and its neutral count badge as rendered
geometry: both must exist, fit within the main surface without overlap, align
vertically, retain the native `Experience` heading name, and show the expected
primary-experience count.

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
