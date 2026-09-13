---
type: workflow
title: Validation workflow
description: Select checks for application behavior, compiled layout, agent documentation, and the local OpenWiki installer.
tags: [testing, nx, vitest, validation]
sources:
  - id: openwiki-source-cded3bee0a4a4ba7e5c5f9f0
    resource: repo://.github/workflows/commit-scopes.yml
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
  - id: openwiki-source-3d04b17fb8b6c27eb59cd798
    resource: repo://apps/github.io/src/app/skills/skill-table.spec.tsx
  - id: openwiki-source-4fbf5ecc6f0c1fc5eff98141
    resource: repo://apps/github.io/src/app/skills/skills-page.spec.tsx
  - id: openwiki-source-a69a6ae44356584e51853db4
    resource: repo://apps/github.io/src/app/skills/skills-page.stories.spec.ts
  - id: openwiki-source-7c231b2ec321d7ab8ca1554f
    resource: repo://apps/github.io/src/app/skills/skills-page.stories.tsx
  - id: openwiki-source-fcfa3ced1d03143bb27d5018
    resource: repo://apps/github.io/vite.config.ts
  - id: openwiki-source-af76a0570259ad84dd4c02ea
    resource: repo://docs/agents/commit-scopes.md
  - id: openwiki-source-cdda5d4e7c9cf1bdd3f5a61c
    resource: repo://docs/runbooks/historical-commit-scope-repair.md
  - id: openwiki-source-9e111948bc98f8feeab61028
    resource: repo://docs/solutions/workflow-issues/verify-storybook-from-linked-worktree.md
  - id: openwiki-source-6ba748254f38112b13d529da
    resource: repo://nx.json
  - id: openwiki-source-5b54a58d1b51cd490b0e7162
    resource: repo://package.json
  - id: openwiki-source-cd91660a594184921462a53c
    resource: repo://scripts/check-commit-scopes.mjs
  - id: openwiki-source-324c3fb37ca901567896163b
    resource: repo://scripts/commit-scope-policy.mjs
  - id: openwiki-source-354ae3b17c2952154324b9e4
    resource: repo://scripts/commit-scope-workflow.test.mjs
  - id: openwiki-source-6498c12d54fa48fbe250bfda
    resource: repo://scripts/github-io-build-version.test.mjs
  - id: openwiki-source-434f3fc007f0b8f286d47431
    resource: repo://scripts/github-io-nx-release.test.mjs
  - id: openwiki-source-b5b471d0c1179e011acc7c64
    resource: repo://scripts/github-io-release-recovery.test.mjs
  - id: openwiki-source-e62ed3cfd7e6ce98024ea30c
    resource: repo://scripts/github-io-release.test.mjs
  - id: openwiki-source-871ac2bb60a2ea411c19a76e
    resource: repo://scripts/setup-openwiki.test.mjs
  - id: openwiki-source-165465422a61a00b62b0f6d3
    resource: repo://scripts/sync-github-pages-artifact.test.mjs
generated: { by: "codex", at: "2026-09-13T08:16:21.924Z" }
verified:
  - by: openwiki/0.5.0
    at: 2026-09-13T08:16:21.924Z
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
node --test scripts/github-io-release.test.mjs \
  scripts/github-io-release-workflows.test.mjs \
  scripts/github-pages-workflow.test.mjs \
  scripts/sync-github-pages-artifact.test.mjs
APP_RELEASE=true APP_VERSION=9.8.7 pnpm nx build github.io --skip-nx-cache
```

The pure and Git-fixture tests cover exact conventional-commit scope,
first-parent calculation, deterministic records, digest verification, and
deployment ordering. Bootstrap fixtures cover unrelated direct, root, and true-merge
introductions, ambiguous identity histories, and first-parent overrides without
depending on an old repository commit ID or fixed production version.
Real Nx integration tests exercise the pinned Release API
for bootstrap and tag-based releases, while Vite boundary tests prove canonical
SemVer acceptance, invalid-value rejection, and immutable emitted versions.
CLI tests protect JSON-only stdout and diagnostic stderr behavior.

Static workflow tests still protect declarative ordering and permissions. In
addition, the recovery suite extracts the actual workflow shell boundaries and
runs them against temporary Git/filesystem fixtures and a strict fake GitHub
CLI. It exercises failures and retries after persistence, tag creation, Release
creation, each asset upload, publication, Pages synchronization, and delivery,
proving recovery reuses the saved artifact without a rebuild.

The automated GitHub workflow applies the same focused Nx lint and test gates
before its one release build. Local tests establish its declarative contract;
the first real Actions run remains the validation point for GitHub artifact,
Release, and protected Environment behavior.

## Commit scopes and history tooling

Run the focused Node/Git suites for scope policy or history-tooling changes:

```sh
pnpm test:commit-scopes
pnpm test:commit-history
pnpm check:commit-scopes --base <full-baseline-oid> --head <full-head-oid>
```

The commit hook combines commitlint with staged-path ownership checking. The
shared policy covers current and historical apps, packages, and tools; dedicated
root release scripts belong to `github.io`, while Astryx documentation-maintenance
scripts belong to `astryx`. General documentation and mixed-domain changes produce
human-review guidance instead of a forced winner. Generated OpenWiki pages and
OpenSpec proposals follow their subject's domain, while actual tool setup/config
retains tool ownership. An allowed vocabulary entry is not proof that the scope
fits the change; consult the [canonical policy](../../docs/agents/commit-scopes.md).

Read-only CI checks introduced commits and, for pull requests, the proposed squash
title with both commitlint and the ownership policy. Pull-request validation runs
when a PR is opened, synchronized, reopened, or edited, so title-only changes are
covered as well. Titles reach commitlint via stdin, and positional CLI parsing
keeps flag-like title text separate from control options. PR ranges permit diverged
base/head graphs. Pushes require a resolvable
ancestor baseline; the shared range-only preflight runs before either commit
linter. Missing, all-zero, or non-ancestor push boundaries stop with an explicit
baseline diagnostic instead of linting replacement or legacy history. An
executable workflow fixture verifies that a resolved divergent push never invokes
commitlint.

The history suite uses disposable repositories to test inventory/ledger coverage,
byte-preserving transformations, independent graph verification, restore-verified
backups, and approval/path/ref/worktree guards. Passing these tests does not
authorize a real rehearsal. Follow the separate
[history-repair operation](../operations/history-repair.md) and retain required
human approvals and recovery evidence.

## Application and agent-document checks

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
page-level test when the component is wired into an application page, proving
its actual accessible and data-derived context. Responsive interactions also
need deterministic visual stories: the Skills page manifest asserts its mobile
cards, desktop selected-detail, and coarse-tablet selected-detail exports, while
the latter two use an accessible Kubernetes row activation and assert the
labeled detail surface.

`SkillTable`'s colocated jsdom suite verifies the four columns and display
components, content-derived pixel widths, confidence-descending default order,
all column sort paths, case-insensitive name filtering, OR category selection,
AND composition between search and categories, clearing, result counts, and
both empty states. The confidence test uses shuffled input and checks the
`aria-sort` transitions so source order cannot masquerade as a successful sort.
The page-level responsive detail tests cover controlled selection, desktop
panel/bottom-sheet presentation, independent scroll ownership, dismissal, and
focus restoration. These DOM assertions do not prove rendered fit; inspect the
three Storybook states in a real browser for clipping, overlap, scrolling,
resize affordances, and compact-surface behavior.

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

Linked worktrees can fail pnpm's dependency-state check before Nx, Vitest, or
Vite starts. In that case, preserve the failed Nx output, then invoke the
dependency-bearing checkout's direct runner against the worktree's Vite config
for test/build verification; run Storybook from the worktree app directory so
its Vite config and stories remain branch-local. This fallback proves the same
source only when the runner's working directory preserves any path-sensitive
tests. It does not turn a browser-driver or local-port failure into a visual
pass.

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
