# Nx monorepo release and deployment best practices

## Executive recommendation

Adopt **Nx Release as the monorepo release engine**, but put a small
repository-owned release coordinator in front of it for the one requirement Nx
does not natively implement: **eligibility by conventional-commit scope**.

For `github.io`, the coordinator should inspect commits after the latest
`github.io@<version>` tag, accept only `feat(github.io)`, `fix(github.io)`, or a
breaking `github.io` commit, calculate the highest semantic bump, and then use
Nx Release's programmatic API for the selected project and explicit bump. If
there is no qualifying commit, it exits successfully before build, GitHub
Release creation, or deployment.

Use Git tags as version authority and version only generated/dist metadata.
Inject the resulting candidate version into the Vite build, verify that exact
artifact, publish the tag and project-level GitHub Release, then deploy that
same artifact. Never commit a source `package.json` version update merely to
drive the footer.

This reconciles all selected behavior:

- qualifying releases happen automatically after merges to `main`;
- unrelated or non-release commits do not deploy;
- the footer displays the computed/tag version;
- applications and libraries can gain independent streams later;
- dependency effects are handled by the Nx project/release graph rather than
  by hand-written commit scopes.

Nx Release is already present in the repository's pinned Nx `23.0.2`. It
supports separate version, changelog, and publish phases through both CLI and a
first-class API, including project filters and returned per-project version
data.
([Nx Release overview](https://nx.dev/docs/features/manage-releases),
[programmatic API](https://nx.dev/docs/guides/nx-release/programmatic-api))

## Current-state implications

The repository currently has one release unit, the private
`@benkim0414/github-io` application. Its footer imports version `0.1.0` from its
source manifest. Changesets is configured to version/tag private packages; one
workflow maintains a Changesets version PR, a second identifies the merge of
that specific PR and creates `github.io@<version>`, and a separate workflow
builds and synchronizes the Pages artifact.

That design intentionally makes the source manifest and a human-approved
version PR authoritative. The newly selected design instead makes conventional
commits and Git tags authoritative and deploys only a qualifying release.
Therefore the old version-PR trigger, release-PR identity checks, and source
manifest footer import should be removed together rather than left as competing
release authorities.

## Project boundaries and tags

Treat every independently buildable, deployable, or publishable unit as an Nx
project. Keep application orchestration in `apps/*` and reusable capabilities in
`packages/*`; a reusable library should be its own project when it has a stable
API, independent tests/builds, or may be published separately.

Use multidimensional Nx tags for architecture and release selection, for
example:

- `type:app`, `type:lib`;
- `release:deployable`, `release:publishable`, `release:internal`;
- `scope:github-io`, `scope:shared`.

Nx can select release-group projects by explicit name, glob, or project tag.
The same tag system can enforce dependency constraints through
`@nx/enforce-module-boundaries`, preventing accidental cross-domain imports as
the workspace grows.
([release-group project selection](https://nx.dev/docs/guides/nx-release/release-groups#project-selection),
[module boundaries and tags](https://nx.dev/docs/features/enforce-module-boundaries))

Do not confuse Nx project tags with Conventional Commit scopes. Project tags
describe durable architecture; commit scopes classify a change. They may share
names for readability but have different enforcement and lifecycle.

## Project graph and affected work

Use the Nx project graph as the machine-readable source for dependency impact.
`nx affected` combines Git file changes with that graph and includes dependent
projects, which is appropriate for PR and pre-release lint/test/build selection.
CI should use full Git history and explicit base/head SHAs; Nx recommends the
latest successful `main` commit as the base so a failed prior run does not hide
unverified changes.
([affected projects](https://nx.dev/docs/features/ci-features/affected),
[CI setup](https://nx.dev/docs/getting-started/setup-ci),
[project and task graphs](https://nx.dev/docs/features/explore-graph))

Affected calculation and release eligibility answer different questions:

- **Affected:** what must be verified because files or dependencies changed?
- **Release eligibility:** did an accepted public-impact commit request a new
  version for a release unit?

For the current policy, a path change under `github.io` with only
`docs(github.io)` may make checks necessary but must not deploy. Conversely, a
qualifying `feat(github.io)` is the release contract even though Nx later uses
the project graph to determine dependent effects.

## Independent versions, fixed versions, and release groups

Default deployable applications and separately published libraries to
**independent** versioning. Nx then maintains a separate version/tag per project
and can release only selected projects. The default independent tag is
`{projectName}@{version}`, matching the existing desired
`github.io@<version>` convention.
([independent releases](https://nx.dev/docs/guides/nx-release/release-projects-independently))

Use a **fixed** group only when its members are one product with a shared public
version and must ship in lockstep. In a fixed group, a bump to one member bumps
all members. Nx release groups allow fixed and independent policies in the same
workspace and allow group-specific version, changelog, tag, and publish rules.
([release groups](https://nx.dev/docs/guides/nx-release/release-groups))

Suggested future structure:

| Group | Members | Relationship | Release meaning |
| --- | --- | --- | --- |
| `deployed-apps` | `release:deployable` apps | independent | each deployment has its own version |
| `public-packages` | registry-published libraries | independent by default | each package has its own API lifecycle |
| product-specific group | tightly coupled packages only | fixed when justified | one externally visible product version |
| internal tooling | `release:internal` | excluded | verified but not versioned/published |

Do not pre-create fixed groups. They cause unchanged members to version together
and should represent a product contract, not directory proximity.

## Conventional commits and project selection

Nx Release can infer versions from commits since the previous release:
`feat` is minor, `fix` is patch, breaking changes are major, and no relevant
commits means no release. With independent projects, it determines each bump
separately.
([automatic conventional-commit versioning](https://nx.dev/docs/guides/nx-release/automatically-version-with-conventional-commits),
[type customization](https://nx.dev/docs/guides/nx-release/customize-conventional-commit-types))

The critical limitation is explicit in Nx's documentation: **Nx attributes a
commit to a project using files changed, not the commit-message scope**. A
`feat(github.io)` that edits another project can release that other project, and
a `feat(shared)` touching the app can release the app under native inference.
([Nx attribution rule](https://nx.dev/docs/guides/nx-release/automatically-version-with-conventional-commits#determining-if-a-commit-affects-a-project))

Therefore use a coordinator with these rules:

1. Find the latest tag matching `github.io@*` and enumerate later commits on
   the first-parent `main` history.
2. Parse Conventional Commits; accept only exact scope `github.io` and types
   `feat`/`fix`, plus breaking syntax belonging to that scope.
3. Select the highest bump: major > minor > patch.
4. If none qualify, emit `released=false` and stop.
5. Call Nx Release for `github.io` with that explicit specifier, retaining Nx's
   release graph and project-filter behavior for downstream steps.

The parser and bump calculation should have fixture tests for squash merges,
`!`, `BREAKING CHANGE:`, multiple qualifying commits, unrelated scopes,
non-release types, and the absence of a previous tag.

As the repository grows, prefer one scope per independently releasable unit.
For shared libraries, decide whether commit scope names the library only and let
`updateDependents` handle consumers; do not require authors to enumerate every
affected app in a commit header.

## Git-tag version authority without source version commits

Nx supports source manifests that are not version authority. Its documented
pattern sets `currentVersionResolver: "git-tag"` and limits
`manifestRootsToUpdate` to built output, so source `package.json` files are not
updated. For pnpm, `workspace:` references are supported in this model.
([updating version references, scenario 3](https://nx.dev/docs/guides/nx-release/updating-version-references#scenario-3-i-want-to-publish-from-a-custom-dist-directory-and-not-update-references-in-my-source-packagejson-files))

For `github.io`:

- retain the source manifest only as package identity/configuration, not the
  displayed version;
- use `github.io@{version}` as the release tag pattern;
- configure Git tags as the current-version resolver;
- direct version writes, if Nx requires a manifest, to an ignored staging/dist
  manifest;
- take `newVersion` from `releaseVersion().projectsVersionData.github.io` and
  expose it as a Vite build-time constant;
- test that the built footer contains exactly that value.

Nx's programmatic `releaseVersion` returns `currentVersion`, `newVersion`, the
release graph, and dependent-project data, and those results can be passed to
changelog and publish phases.
([programmatic API](https://nx.dev/docs/guides/nx-release/programmatic-api#releaseversion))

### First release

Bootstrap one explicit baseline tag at the commit representing the existing
`0.1.0` release, or run a reviewed first-release operation that establishes the
same tag. Thereafter tags are authoritative. The coordinator must fail clearly
if no baseline exists unless an explicit first-release version is supplied; it
must never guess between `0.1.0` and `1.0.0` in production.

The exact Nx 23 API/config combination for a private Vite application with no
npm publish target should be proven with `--dry-run` in a temporary tag history
before workflow replacement. Official examples focus mainly on package
manifests and publishing, so this is an implementation validation point rather
than a documentation-guaranteed detail.

## Dependency propagation

For independent projects, configure `version.updateDependents` deliberately:

- `auto` is the normal starting point for publishable packages; dependents bump
  when their declared version range no longer accepts the dependency release;
- `always` is appropriate only when consumers must release on every dependency
  change, even if the declared range remains valid;
- avoid dependency-driven app releases until product semantics require them.

Nx constructs a release graph, processes groups/projects topologically, and can
propagate dependency updates across release-group boundaries.
([release-group processing and dependents](https://nx.dev/docs/guides/nx-release/release-groups#processing-order),
[update dependents](https://nx.dev/docs/guides/nx-release/release-projects-independently#update-dependents))

Applications differ from libraries: an application consumes internal code in a
deployment artifact, so a shared-library change may require rebuilding/testing
the app but not necessarily a new app version under the chosen scope-only
policy. A public library has consumers constrained by package ranges, so its
manifest and dependent ranges matter. Keep this difference explicit in release
groups rather than applying one propagation rule workspace-wide.

## Changelogs and GitHub Releases

Use **project-level GitHub Releases** for independent release streams. Disable
tracked changelog files unless the repository wants changelog commits; Nx can
create GitHub Releases from generated changelog content while setting the local
file to `false`. Nx does not support creating both workspace-level and
project-level GitHub Releases in the same run, so choose project-level releases
for this architecture.
([GitHub Releases](https://nx.dev/docs/kb/automate-github-releases))

This preserves a clean tag-to-release relationship:

- `github.io@1.2.0` identifies the deployed app artifact;
- its GitHub Release contains only that project's accepted release commits;
- future `another-app@2.0.1` and `shared-lib@3.1.0` streams remain independent.

If scope-filtered commits are passed as an explicit bump, verify that generated
release notes exclude non-qualifying commits. If Nx's built-in changelog phase
uses its path attribution independently, the coordinator should supply or
post-process release-note content from the same accepted commit set. Eligibility
and published notes must not disagree.

## Release and deployment separation

Model one workflow as a transactional sequence with an explicit boundary:

```text
serialize -> resolve prior tag -> classify commits -> no-op or candidate version
          -> affected verification -> versioned build -> artifact assertion
          -> publish tag + GitHub Release -> deploy exact immutable artifact
```

Release and deployment remain separate responsibilities even if implemented as
jobs in one workflow:

- **Release** decides the version, verifies/builds, creates tag and GitHub
  Release, and records artifact identity.
- **Deploy** receives only the released artifact and version; it never
  recalculates a version or rebuilds source.

This prevents a footer/tag mismatch and prevents deployment of non-release
maintenance commits. Nx itself separates version, changelog, and publish phases,
and its API lets one release graph/version result flow through them.
([programmatic API](https://nx.dev/docs/guides/nx-release/programmatic-api))

For later npm libraries, keep registry publication in the release/publish phase;
application deployment remains a project-specific consumer of the release
artifact. `--skip-publish` or the separate `release publish` command avoids
conflating npm publication with deployment.
([publishing in CI](https://nx.dev/docs/guides/nx-release/publish-in-ci-cd))

## CI serialization and idempotency

Use one repository-wide release concurrency group with **no cancellation of an
active release**. GitHub Actions normally allows concurrent runs, and grouped
runs can cancel pending work; current GitHub Actions also supports a queued mode
when multiple main-branch releases must execute in order.
([GitHub Actions concurrency](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency))

Prefer a queue so every qualifying merge is considered. If the available
repository plan/syntax cannot preserve all pending runs, a later run must scan
from the last release tag through its own SHA, thereby coalescing skipped pushes
without losing release-worthy commits.

Idempotency requirements:

- rerunning after tag creation recognizes the existing tag and does not create
  a second version;
- rerunning after GitHub Release creation updates/verifies the same release;
- deployment records the released commit/tag and is safe to retry;
- a tag must not be published before build and artifact checks pass;
- publication failure must not deploy;
- full Git/tag history must be checked out.

Avoid relying on one workflow run per tag for future large independent releases:
GitHub does not create tag-push events when more than three tags are pushed at
once, a limitation Nx calls out in its CI guidance.
([Nx independent-release CI consideration](https://nx.dev/docs/guides/nx-release/publish-in-ci-cd#considerations-for-independent-versioning))

## Concrete target architecture

### Repository configuration

1. `nx.json` defines independent release groups and
   `github.io@{version}`/`{projectName}@{version}` tag patterns.
2. Releaseable projects carry `release:deployable` or
   `release:publishable`; internal projects carry `release:internal` and are
   excluded.
3. Git tags are the current version resolver; source manifests are not updated
   for deployed applications.
4. Project-level GitHub Releases are enabled and local changelog files disabled.
5. Dependency update policy is group-specific.

### Repository-owned coordinator

A small, tested Node module owns commit-scope eligibility, first-release
validation, and orchestration of Nx's `releaseVersion`/`releaseChangelog`
functions. It emits structured outputs such as `released`, `project`,
`previousVersion`, `newVersion`, `tag`, and accepted commit SHAs. Nx explicitly
provides its programmatic API for release workflows that need behavior beyond
CLI configuration.
([Nx programmatic API rationale](https://nx.dev/docs/guides/nx-release/programmatic-api))

### GitHub Actions

One main-push release workflow:

1. checks out full history and tags;
2. enters the non-cancelling release queue;
3. installs with frozen pnpm lockfile;
4. runs the coordinator's eligibility/dry calculation;
5. exits successfully when `released=false`;
6. runs affected/focused lint, test, and build checks;
7. builds with the returned version and asserts footer/artifact metadata;
8. creates the tag and project GitHub Release;
9. hands the immutable artifact to the existing cross-repository deployment
   mechanism.

Keep deployment credentials out of the calculation/build job and retain the
current narrow machine-to-machine deployment permission boundary.

## Alternatives

| Capability | Nx Release | Changesets | semantic-release |
| --- | --- | --- | --- |
| Nx project/dependency graph | native | workspace manifests, not Nx graph | absent from core |
| Conventional-commit bump | native by type, project attribution by changed files | changeset files are bump authority | native commit analyzer |
| Exact scope-only eligibility | coordinator needed | custom conversion/check needed | custom rules possible |
| Independent/fixed grouping | native release groups | native independent/fixed/linked models | third-party monorepo layer needed |
| Internal dependency propagation | native/topological | strong monorepo support | third-party orchestration |
| Tag-authoritative source manifests | supported via git-tag resolver and dist-only manifests | normally writes versions | tags are core authority |
| GitHub Releases | native changelog integration | action/custom publish flow | native GitHub plugin |
| Long-term fit here | **best** | good if humans author bump files | good for one stream; unofficial monorepo support |

Changesets remains a strong choice when contributors should explicitly author
and review release intent in files. That contradicts the selected automatic
conventional-commit policy. Semantic-release aligns with automatic commits for
one app, but core maintainers do not officially support multi-package monorepos;
the companion research details third-party wrapper risks.
([Changesets README](https://github.com/changesets/changesets#readme),
[semantic-release monorepo position](https://github.com/semantic-release/semantic-release/discussions/2680),
[companion research](./2026-09-09-semantic-release-monorepo.md))

## Risks and unknowns

1. **Scope versus Nx attribution:** this is a real semantic mismatch. The
   coordinator and changelog path need tests proving the accepted commit set is
   used consistently.
2. **Private Vite app version actions:** prove Nx 23 can target an ignored
   staging/dist manifest and return a candidate version without unwanted source
   writes or npm publish assumptions.
3. **Publication order:** validate that no tag or GitHub Release is created
   before the versioned artifact passes checks. Use API phases rather than a
   single opaque CLI call if needed.
4. **First tag placement:** the repository needs an explicit decision about
   which commit represents `github.io@0.1.0`.
5. **Squash merge format:** GitHub's resulting commit must retain the accepted
   Conventional Commit header/footer; enforce this in PR title/merge policy.
6. **Dependency semantics:** choose app/library `updateDependents` rules before
   the first shared publishable package is released.
7. **Project deletion/rename:** Nx historical attribution uses the current
   project graph. Treat project retirement as a release migration with explicit
   final tags rather than an ordinary deletion.

## Staged adoption

### Stage 1: prove the release calculation

- Add tests for commit parsing, scope eligibility, bump precedence, no-op, and
  first release.
- Configure only `github.io` in an independent release group.
- Run Nx Release dry-runs against a temporary local tag history.
- Prove dist-only/tag-resolved versioning and capture the API output contract.

### Stage 2: replace current Changesets automation

- Remove the Changesets version-PR workflow and the workflow coupled to its PR
  title/branch.
- Remove Changesets configuration/dependency only after no pending changeset or
  release PR remains.
- Introduce the serialized main-push release workflow.
- Bootstrap/verify `github.io@0.1.0`.
- Inject and assert the computed version in the built footer.

### Stage 3: connect immutable deployment

- Publish the tag and project-level GitHub Release only after verification.
- Pass the already-built artifact to the current deployment boundary.
- Confirm non-qualifying pushes produce neither release nor deployment.
- Exercise retry behavior after simulated failures at each boundary.

### Stage 4: prepare for additional projects

- Apply project/release tags and module-boundary constraints.
- Add new deployable apps as independent releases.
- Add public libraries to a separate independent group and define
  `updateDependents` plus registry publication.
- Create fixed groups only for products that must share one version.
- Move verification toward `nx affected` while keeping release eligibility
  scope-driven until the user deliberately changes that policy.

## Decision

The sustainable design is **Nx-native release modeling plus a thin scope-policy
adapter**, not semantic-release embedded into Nx and not commit-to-Changeset
generation. It preserves the user's commit convention today while giving future
apps and libraries first-class release groups, tag streams, project-graph
dependency handling, and affected verification without another migration of the
release engine.
