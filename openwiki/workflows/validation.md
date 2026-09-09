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
  - id: openwiki-source-5f2ef006d9eda2b471c35da0
    resource: repo://apps/github.io/scripts/verify-global-layout-css.mjs
  - id: openwiki-source-2bfcdfa6f69acb4ddbe6f2af
    resource: repo://apps/github.io/scripts/verify-mobile-layout-browser.mjs
  - id: openwiki-source-6120c05e6c28f6f4f5433722
    resource: repo://apps/github.io/src/app/app.spec.tsx
  - id: openwiki-source-237f7adb9abebb15f51f4ef5
    resource: repo://apps/github.io/src/app/devops-roadmap/devops-roadmap-stepper.spec.tsx
  - id: openwiki-source-9945d2358006f012fbfbe4af
    resource: repo://apps/github.io/src/app/devops-roadmap/devops-roadmap-stepper.stories.spec.ts
  - id: openwiki-source-fcfa3ced1d03143bb27d5018
    resource: repo://apps/github.io/vite.config.ts
  - id: openwiki-source-6ba748254f38112b13d529da
    resource: repo://nx.json
  - id: openwiki-source-871ac2bb60a2ea411c19a76e
    resource: repo://scripts/setup-openwiki.test.mjs
generated: { by: "codex", at: "2026-09-09T10:46:58.649Z" }
verified:
  - by: openwiki/0.5.0
    at: 2026-09-09T10:46:58.649Z
---

# Validation workflow

Start in the intended linked worktree and install its dependencies. Inspect
`pnpm nx show projects` and `pnpm nx show project github.io --json` instead of
assuming that only explicit `project.json` targets exist: Nx plugins infer
Vite, ESLint, Vitest, and Storybook tasks.

For application changes, the release workflow validates with:

```sh
pnpm nx lint github.io
pnpm nx test github.io --run
pnpm nx build github.io
```

Vitest uses jsdom, includes source test/spec files and `.storybook/**/*.spec.ts`,
and disables watch mode. Coverage uses V8 with reports under
`coverage/apps/github.io`. Relevant focused contracts include
`skill-detail-resolver.spec.ts`, `devops-capability-evidence.scoring.spec.ts`,
`theme-mode.spec.tsx`, `global-navigation-layout.spec.tsx`, and
`devops-roadmap-stepper.spec.tsx` beside their source. Choose the test closest
to the changed behavior before running the broader suite.

For reusable UI elements, keep a focused component test beside the component and
exercise consumer-visible values, including zero where it changes the displayed
state. Colocate Storybook stories and a small story-module test that fixes the
established title taxonomy and representative args. Pair those tests with the
page-level test that proves the component is wired into its actual accessible
and data-derived context.

Roadmap changes use three layers of evidence. The Stepper component test fixes
the 22-topic order, numbered indicators, descriptions, completion and disabled
semantics, certification citations, skill links, and concept tokens. Its story
module test protects the default and representative-state catalog entries. The
real `/roadmap` route test then proves those states survive provider and page
integration and that the legacy React Flow viewport is not rendered.

For CSS/layout changes, also run:

```sh
pnpm nx run github.io:verify-global-layout-css
pnpm nx run github.io:verify-mobile-layout-browser
```

Both targets depend on build. They complement DOM tests with compiled-CSS and
browser-level checks; a jsdom pass alone does not establish mobile scroll or
visual correctness. Browser prerequisites and failures must be reported, not
converted into an assumed pass. The mobile browser verifier also checks the
roadmap at 375×667, 820×1180, and 1280×800 in both light and dark themes:
completed descriptions must remain visually secondary to their titles,
completed vertical bars must match title color, and the description-to-token
gap must be smaller than the token-to-next-title gap.
It also checks the
skill-detail Experience heading and its neutral count badge as rendered
geometry: both must exist, fit within the main surface without overlap, align
vertically, retain the native `Experience` heading name, and show the expected
primary-experience count.

The compiled global-layout verifier matches every emitted class declaration
for an expected layout property, because StyleX may emit duplicate declarations
whose classes split the required properties. It accepts both production and
development StyleX markers, but still requires each expected declaration to
intersect the compiled classes. Keep its self-tests green when changing the
StyleX or Vite compilation pipeline.

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
