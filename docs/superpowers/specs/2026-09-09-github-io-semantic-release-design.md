# github.io semantic release design

## Goal

Automatically version and deploy the `github.io` application from Conventional
Commits merged to `main`. The footer must display the exact semantic version of
the deployed artifact instead of the checked-in `0.1.0` value.

The design must also provide a durable release foundation for additional Nx
applications and libraries without making all projects share one version.

## Decisions

- Nx Release is the monorepo release engine.
- Git tags, not source package manifests, are the production version authority.
- `github.io` uses an independent `github.io@<version>` release stream.
- Only `feat(github.io)`, `fix(github.io)`, and breaking `github.io` commits are
  eligible to release the application.
- Every qualifying first-parent merge advances the version once using its
  highest requested bump.
- An ordinary push containing no qualifying change produces neither a new
  release nor a deployment. Explicit bootstrap and recovery of an already
  prepared release use the separate paths defined below.
- The release build receives the candidate version explicitly and the built
  artifact is deployed without rebuilding.
- `apps/github.io/package.json` omits `version` and retains `private: true`.

## Version semantics

The repository-owned coordinator parses Conventional Commit messages and maps
them as follows:

| Commit | Bump |
| --- | --- |
| Any valid type with exact `github.io` scope and `!` or a `BREAKING CHANGE:` footer | major |
| Nonbreaking `feat(github.io): ...` | minor |
| Nonbreaking `fix(github.io): ...` | patch |
| Nonbreaking other types, or any unrelated/missing scope | none |

Breaking syntax is eligible only when the commit itself has the exact
`github.io` scope. A breaking footer on an unrelated or unscoped commit must not
release this application. Evaluate breaking markers before type exclusions:
`refactor(github.io)!: ...` and a `refactor(github.io)` message with a breaking
footer both request a major bump; a nonbreaking refactor requests none.

The coordinator treats each integration point on `main`'s first-parent history
as one potential release. For a squash merge, it parses the first-parent commit
itself. For a true merge commit, it parses the commits newly introduced by that
merge relative to the preceding first-parent commit. It applies at most one bump
per integration point, choosing major over minor over patch when the integrated
change contains multiple qualifying messages. If several integration points
have accumulated since the latest release tag, they are replayed
chronologically so no intended release increment is collapsed or counted
twice.

Commitlint and the repository's merge policy should preserve Conventional
Commit headers and breaking footers in the commit that reaches `main`. Parser
fixtures must cover both squash-merge messages and non-squash first-parent
history.

## Historical bootstrap

The initial authoritative version is reconstructed rather than copied from the
current source manifest.

1. Locate the commit that introduced `apps/github.io` and its first integration
   into `main`. Include that integration in the replay. The inspected history
   identifies `8acdd81` (`feat(github.io): scaffold react app`) as both; the dry
   run must verify this boundary against the selected target's history.
2. Begin at `0.0.0`.
3. Traverse first-parent integration points from that boundary through the
   selected target commit in chronological order.
4. Apply the normal scope and bump rules to the commit set introduced at every
   integration point.
5. Select a target SHA on `main` containing the completed footer injection and
   workflow migration. Emit that SHA, the introduction boundary, contributing
   commits, ordered bumps, and calculated version in a reviewable dry run.
6. After explicit handoff approval of that SHA/version pair, run bootstrap
   through the common verification, artifact persistence, publication, and
   deployment stages. Inject the reconstructed version without adding an extra
   bootstrap bump. The tag points to the same migrated SHA used for the build.
7. Verify that the first live footer, artifact metadata, Git tag, and GitHub
   Release agree. Record successful delivery before considering bootstrap done.

Bootstrap is an explicit first release, not a tag-only seed. It is allowed even
if the migration commit itself has no qualifying scope; historical replay
determines its version. A changed target SHA requires a new dry run and review.
Bootstrap retries use the same recovery rules and artifact as normal releases.

Production release calculation must fail clearly when no baseline tag exists.
It must not guess whether the initial public version should be `0.1.0` or
`1.0.0`. After bootstrap, the latest valid `github.io@*` tag is the sole version
baseline.

## Components

### Nx Release configuration

`nx.json` defines `github.io` as an independently versioned deployable project.
Its tag pattern is `github.io@{version}`, its current-version resolver is
`git-tag`, and any manifest updates target only ignored generated or staging
output.

Releaseable projects use explicit tags such as `release:deployable` or
`release:publishable`; internal projects use `release:internal` and remain
outside release groups. Future deployable applications and separately
published libraries default to independent versions. Fixed release groups are
introduced only for packages that constitute one lockstep product.

### Release coordinator

A small repository-owned Node module provides the policy Nx does not natively
model: exact eligibility by Conventional Commit scope. It:

1. resolves the immutable target SHA and, under the release lock, checks for a
   prepared release record for that project/SHA before looking for new commits;
2. resumes an incomplete recorded release with its saved version and artifact,
   or skips a completed/superseded delivery; it never increments a retry;
3. for a fresh normal release, resolves the latest project tag and verifies
   that its commit belongs to the target's first-parent ancestry; a target
   older than the latest published release is skipped, and divergent or
   conflicting history fails explicitly;
4. enumerates first-parent integration points within that range and resolves
   the commits introduced by each squash or true merge;
5. parses and classifies those commit messages without double counting;
6. computes the ordered sequence of bumps;
7. exits successfully with action `noop` when none qualify and no recovery is
   pending for the target;
8. invokes the Nx Release programmatic API for the explicit project/version;
9. emits structured output containing `action` (`prepare`, `resume`, `noop`, or
   `superseded`), `project`, `sourceSha`, `previousVersion`,
   `newVersion`, `tag`, `bump`, and contributing commit SHAs.

Explicit bootstrap supplies the reviewed SHA/version pair in place of normal
baseline resolution. A new-version decision and completion of release delivery
are separate states; downstream jobs must not use one `released` boolean to
decide both.

The coordinator owns eligibility and version orchestration only. Nx continues
to own release groups, project filtering, dependency-aware ordering, tag
formatting, and changelog/GitHub Release integration.

### Application version boundary

The footer no longer imports `version` from `apps/github.io/package.json`.
Vite exposes a dedicated build-time application-version constant.

- Local development uses the visible non-release label `dev`.
- Tests supply explicit fixture values.
- Production release builds require a valid SemVer value and fail when it is
  absent or invalid.
- The built artifact is checked for `v<newVersion>` before publication.
- The injected version and release/development mode are explicit Nx build task
  inputs. Cached output from a different version or mode must never satisfy a
  release build. Validate cache behavior with unchanged source and two different
  supplied versions, including a missing-version attempt after a valid build.

The source manifest retains package identity and the npm publication guard:

```json
{
  "name": "@benkim0414/github-io",
  "private": true
}
```

It contains no placeholder or stale version. If a proven Nx 23 constraint
requires a source version, `0.0.0-development` is the compatibility fallback,
and production builds must explicitly reject it.

### Release workflow

One workflow responds to pushes to `main` and runs under a repository-wide,
non-cancelling release concurrency group:

```text
lock -> inspect target and saved release state
  -> incomplete release: resume with saved version and verified artifact
  -> fresh release: classify history (or accept reviewed bootstrap result)
       -> no-op, or calculate candidate version
       -> lint, test, build once, and assert artifact version
       -> persist verified artifact and release record
  -> ensure matching tag and GitHub Release exist
  -> check current deployment under lock
  -> deploy exact artifact, or skip completed/superseded delivery
```

The workflow checks out full Git history and tags. A fresh eligible run scans
from the last published project tag through its own target SHA after ancestry
checks. Coalesced runs therefore retain the intervening qualifying increments.
The lock covers publication and deployment, including deployment-only retries.

Before creating a tag, persist the verified artifact and a release record
containing project, source SHA, previous/new versions, tag, contributing commits,
artifact identifier, and content digest. The record must be discoverable by
project/source SHA across workflow reruns, independent of the current run ID.
Persist it with sufficient retention for the supported retry window. A resume
verifies the artifact digest and saved metadata before continuing publication.
If a published tag has no matching record, or its recorded artifact has expired
or is corrupt, fail with an explicit recovery error. Do not silently rebuild,
assign a new version, or claim successful delivery. Selection of the persistence
backend and retention period belongs in the implementation plan.

### Deployment boundary

The existing synchronization into `benkim0414/benkim0414.github.io` remains the
deployment boundary. It receives the already-built, verified artifact and must
not recalculate the version or rebuild the source.

Deployment credentials remain isolated to the deployment job. The calculation
and build jobs receive no cross-repository write credential. The deployed
commit message records the source release tag and commit for traceability.

The Pages artifact also carries machine-readable source SHA, release tag,
version, and artifact identity. Read that deployed state while holding the
release lock immediately before synchronization. An identical deployment is a
successful no-op; a candidate older than the deployed source is skipped as
superseded; divergent history or a version/identity conflict fails. A newer
candidate must advance both source ancestry and version. A deployment-only
retry must perform the same checks, so retrying A after B deployed cannot roll
production back to A. Bootstrap explicitly permits initializing this metadata
on the existing unversioned site; normal deployment treats missing metadata as
a recovery error.

## Failure handling and idempotency

- Missing or malformed baseline tags fail normal version calculation;
  explicitly approved bootstrap uses its reviewed historical result.
- A missing or invalid production build version fails before tagging.
- Lint, test, build, or artifact assertions fail before irreversible release
  publication.
- An existing tag is accepted only when it resolves to the expected source
  commit and version; conflicts fail closed.
- An existing matching GitHub Release is reused or verified rather than
  duplicated.
- Saved release state is checked before the no-op path. Failure after tag
  creation resumes release publication; failure after release creation resumes
  delivery of the persisted artifact, with no additional bump.
- Publication failure prevents deployment.
- Deployment retries synchronize the same immutable artifact and do not create
  a new application version. Completed or superseded deliveries skip safely.
- Missing/corrupt saved artifacts fail recovery without rebuilding, and older
  retries never overwrite a newer deployment.
- Active publication is never cancelled by a newer workflow run.

## Changelogs and future dependencies

Use project-level GitHub Releases for independent streams. Generated release
notes must contain the same accepted commit set used for eligibility; if Nx's
built-in changelog attribution differs, the coordinator supplies or filters the
notes. Tracked changelog files remain disabled unless the repository later
chooses changelog commits.

Future shared libraries use the Nx project and release graph rather than
requiring commit authors to enumerate every consuming app. Published libraries
receive a deliberately selected `updateDependents` policy. Deployable apps may
be rebuilt and tested when a dependency changes without automatically releasing
unless their product policy requests it.

## Migration

1. Prove the coordinator and Nx Release configuration with temporary Git
   histories and dry runs.
2. Reconcile any pending Changeset or Changesets release PR.
3. Prepare the footer injection, Nx cache inputs, source-version omission,
   recoverable release workflow, and prebuilt-artifact Pages deployment on the
   isolated branch. Replace the old workflows together; remove Changesets only
   after pending release metadata is reconciled.
4. At explicit handoff, integrate the migration and select its resulting `main`
   SHA. Normal release calculation without a baseline must stop with a bootstrap
   requirement; it must not recreate an unconditional deployment.
5. Run historical replay through that exact migrated SHA and obtain approval
   of its resulting version. Do not create a baseline tag against pre-migration
   source merely to unblock normal automation.
6. Execute the explicit bootstrap release: build and verify the migrated SHA
   with that version, persist its artifact/record, publish the tag and GitHub
   Release, and deploy the same artifact. Verify the live footer and metadata.
7. Subsequent ordinary pushes use the new baseline and skip non-release changes.

The transition must not leave the old and new release authorities active at the
same time.

## Validation

### Coordinator tests

- patch, minor, and major classification;
- exact `github.io` scope matching;
- ignored types and unrelated scopes;
- `!` and `BREAKING CHANGE:` parsing;
- equivalent major bumps for both markers on `refactor(github.io)` and other
  valid scoped types; unrelated breaking scopes and nonbreaking refactors skip;
- malformed messages;
- multiple commits within one merge;
- chronological replay across multiple merges;
- no qualifying commits;
- missing, valid, duplicate, and conflicting tags;
- historical bootstrap from the introduction boundary.
- baseline ancestry, obsolete targets, and divergent history;
- recovery selected before no-op for an already prepared project/source SHA.

### Nx integration tests

- Nx 23 resolves current version from `github.io@*`;
- the programmatic API returns the candidate project version;
- version actions do not edit source manifests or the lockfile;
- only ignored generated output receives a manifest version, if required;
- dry runs create no tags, releases, commits, or deployments.

### Application and workflow tests

- footer renders `dev` locally and an injected SemVer in production fixtures;
- production builds reject missing, invalid, or sentinel versions;
- built artifacts contain the exact candidate version;
- unchanged source built with different injected versions cannot reuse the
  wrong Nx cache entry; missing version after a valid build still fails;
- `pnpm nx lint github.io`, `pnpm nx test github.io --run`, and
  `pnpm nx build github.io` pass;
- workflow contract tests cover concurrency, full history, no-op behavior,
  publication ordering, immutable artifact transfer, and safe retry behavior;
- injected failures after artifact persistence, tag creation, GitHub Release
  creation, and Pages synchronization resume without a new version;
- retries fail explicitly for missing or corrupt recorded artifacts;
- deploy A, deploy B, retry A leaves B live; an older run's baseline cannot be
  used against a target outside its applicable ancestry;
- bootstrap from the migrated SHA publishes the reconstructed version with
  matching live footer, artifact, tag, and GitHub Release;
- an ordinary nonqualifying `main` push with no pending recovery creates neither
  a tag, GitHub Release, Pages commit, nor deployment.

## Boundaries

This work does not:

- publish `github.io` to npm;
- create release groups for projects that do not yet exist;
- impose fixed versions across future apps or libraries;
- define dependency propagation for hypothetical publishable packages;
- push, deploy, merge, or create the bootstrap tag during implementation;
- retain Changesets as a second release authority.

Bootstrap tag creation, pushing the feature branch, opening a pull request, and
deployment remain explicit handoff operations.

## Risks and validation points

- Nx attributes commits to projects using changed files, while this design
  deliberately uses exact scope eligibility. Tests must keep eligibility and
  release notes aligned.
- Nx's documented tag-authoritative/dist-only pattern must be proven against
  the repository's pinned Nx `23.0.2` and private Vite application.
- The merge strategy must preserve Conventional Commit information on `main`.
- The introduction boundary and reconstructed version must be reviewed before
  the bootstrap tag is created.
- GitHub Actions scheduling can coalesce pending runs; range calculation must
  make later runs account for every commit since the last release tag.

## Research basis

- [`2026-09-09-semantic-release-monorepo.md`](../../research/2026-09-09-semantic-release-monorepo.md)
- [`2026-09-09-nx-monorepo-release-best-practices.md`](../../research/2026-09-09-nx-monorepo-release-best-practices.md)
- [`2026-09-09-private-app-manifest-version.md`](../../research/2026-09-09-private-app-manifest-version.md)
