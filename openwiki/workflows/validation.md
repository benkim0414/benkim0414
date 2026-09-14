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
  - id: openwiki-source-5f2ef006d9eda2b471c35da0
    resource: repo://apps/github.io/scripts/verify-global-layout-css.mjs
  - id: openwiki-source-2bfcdfa6f69acb4ddbe6f2af
    resource: repo://apps/github.io/scripts/verify-mobile-layout-browser.mjs
  - id: openwiki-source-47aa440893a5a291d1ad1984
    resource: repo://apps/github.io/src/app/count-badge.spec.tsx
  - id: openwiki-source-7710c13ca861e757d9eac20c
    resource: repo://apps/github.io/src/app/count-badge.stories.spec.ts
  - id: openwiki-source-5dbaa213d52c3aac678d1838
    resource: repo://apps/github.io/src/app/global-navigation-layout.tsx
  - id: openwiki-source-2378d83f7f8fd8fc756c71f4
    resource: repo://apps/github.io/src/app/home/dora-capability-masonry.spec.tsx
  - id: openwiki-source-9a75dff41bf8e0bd1f49b6bc
    resource: repo://apps/github.io/src/app/home/home-page.spec.tsx
  - id: openwiki-source-0e3b0dfb231db070ffd8340f
    resource: repo://apps/github.io/src/app/home/home-page.tsx
  - id: openwiki-source-d97b9e088d941d15580a0bd7
    resource: repo://apps/github.io/src/app/skills/skill-detail-page.spec.tsx
  - id: openwiki-source-0a3e47ce778a625f17d42cfd
    resource: repo://apps/github.io/src/app/skills/skill-detail-page.stories.spec.ts
  - id: openwiki-source-3d8376b39a8411106c980cf0
    resource: repo://apps/github.io/src/app/skills/skill-experience-card-list.spec.tsx
  - id: openwiki-source-048000f67a10f22b6e816b63
    resource: repo://apps/github.io/src/app/skills/skill-experience-card.stories.spec.ts
  - id: openwiki-source-595128ced7876e4f8579bc14
    resource: repo://apps/github.io/src/app/skills/skill-experience-card.stories.tsx
  - id: openwiki-source-1da2c5712de0a298fd2a580a
    resource: repo://apps/github.io/src/app/skills/skill-experience-list.spec.tsx
  - id: openwiki-source-35c77a9dd102047c8a1b9103
    resource: repo://apps/github.io/src/app/skills/skill-table-detail-layout.spec.tsx
  - id: openwiki-source-3cf56b0e79067d306d450611
    resource: repo://apps/github.io/src/app/skills/skill-table-responsive.ts
  - id: openwiki-source-3d04b17fb8b6c27eb59cd798
    resource: repo://apps/github.io/src/app/skills/skill-table.spec.tsx
  - id: openwiki-source-3f3dc1d4c3baeae6c2657a1d
    resource: repo://apps/github.io/src/app/skills/skill-table.stories.spec.tsx
  - id: openwiki-source-a08412c702b94999bfa82651
    resource: repo://apps/github.io/src/app/skills/skill-table.stories.tsx
  - id: openwiki-source-4fbf5ecc6f0c1fc5eff98141
    resource: repo://apps/github.io/src/app/skills/skills-page.spec.tsx
  - id: openwiki-source-fcfa3ced1d03143bb27d5018
    resource: repo://apps/github.io/vite.config.ts
  - id: openwiki-source-af76a0570259ad84dd4c02ea
    resource: repo://docs/agents/commit-scopes.md
  - id: openwiki-source-cdda5d4e7c9cf1bdd3f5a61c
    resource: repo://docs/runbooks/historical-commit-scope-repair.md
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
generated: { by: "codex", at: "2026-09-14T12:03:13.338Z" }
verified:
  - by: openwiki/0.5.0
    at: 2026-09-14T12:03:13.338Z
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
its actual accessible and data-derived context.

The Home-page DORA-card layout test confirms that the rendered masonry wrappers
retain the canonical card order. Its colocated unit test verifies that the
packing algorithm selects the shortest column, applies a uniform 16 px gap,
and switches from one to two columns at the 736 px capacity threshold. Validate
those focused contracts before
running the full `github.io` suite and production build; the desktop masonry
Storybook scenario is the visual-review surface.

`SkillTable` keeps its component-level contract in a colocated jsdom suite. It
verifies the four columns and display
components, content-derived pixel widths, confidence-descending default order,
all column sort paths, case-insensitive name filtering, OR category selection,
AND composition between search and categories, clearing, result counts, and
both empty states, plus pointer and keyboard row activation and active-row
semantics. The confidence test uses shuffled input and checks the
`aria-sort` transitions so source order cannot masquerade as a successful sort.
Page-level tests separately prove the responsive card/table switch, the page
introduction preceding the labelled desktop toolbar, controls preceding the
table, the bounded master-detail layout, same-page detail selection, focus
restoration, and selection cleanup. The detail-layout suite also asserts the
inspector's named same-tab detail link, divider hierarchy, omission of Projects,
and unframed experience entries. Storybook provides explicit desktop-table and
compact-card viewport stories. These DOM assertions still do not prove that
estimated column widths fit rendered content; that remains a visual check.

Skill experience readability is protected at both renderer boundaries. Focused
tests cover all four collection combinations: both labels appear when both
collections exist, each label is omitted when its collection is empty, and
neither collection produces a disclosure or chevron. Skills-only regressions at
both renderer boundaries assert that the same `Relevant skills` label and count
remain the disclosure trigger after expansion and that no duplicate panel
heading appears. With both collections, expansion keeps only
the highlight count in the trigger and moves the visible relevant-skill label
and count above the token list. Coverage also protects absence of the former combined
outcome/skill sentence and the shared compact-surface versus non-compact
defaults, including the coarse-tablet compact case beyond the former phone-only
breakpoint. Round-trip tests cross from non-compact to compact and back,
re-querying the disclosure to prove later viewport changes retain the user's
choice. Coverage also protects user expansion, complete authored and capability
list text, capability-fact deduplication, and omission when there is nothing to
disclose. The authored stories include a mobile viewport for the
long wrapping narrative, selecting Storybook's `mobile1` viewport through the
Storybook 10 `globals.viewport` contract with rotation disabled. Its story-module
test protects both values. The capability story supplies multiple facts for
manual visual review of the same shared disclosure treatment.

The skill-detail page test protects its page-local Outline independently of
responsive CSS: it verifies the labeled navigation, the three stable heading
targets, Experience-only and Projects-only permutations, and omission when
Overview is the sole item. Use the tablet-specific Storybook story to inspect
the visible end rail; its story-module test protects the enriched fixture and
tablet viewport preset. The production browser verifier exercises the same route
at 375, exactly 768, 820, and 1280 CSS pixels. It proves that the Outline is
hidden on the phone and visible from the breakpoint, remains sticky against the
sole shell scroll owner, and updates both the URL fragment and
`aria-current="location"` after navigation settles. These behavioral checks do
not replace visual review of the indicator's appearance.

For CSS/layout changes, also run:

```sh
pnpm nx run github.io:verify-global-layout-css
pnpm nx run github.io:verify-mobile-layout-browser
```

Both targets depend on build. They complement DOM tests with compiled-CSS and
browser-level checks; a jsdom pass alone does not establish mobile scroll or
visual correctness. Browser prerequisites and failures must be reported, not
converted into an assumed pass. The compiled CSS verifier requires the shared
`pageContent` StyleX rule to emit and apply its full width, 1440-pixel cap, and
auto inline margins, so the desktop frame cannot regress to a source-only
contract. The mobile browser verifier also checks the
skill-detail Experience and Projects headings and their neutral count badges as
rendered geometry: each pair must exist, fit within the main surface without
overlap, align vertically, retain the native heading name, and show the expected
collection count. The page-level component test separately ensures the Projects
badge is outside the heading's accessible name and derives from the rendered
projects collection. Its numeric queries are scoped to the corresponding
heading container so the page-level badges remain distinguishable from count
badges inside descendant experience cards.

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
