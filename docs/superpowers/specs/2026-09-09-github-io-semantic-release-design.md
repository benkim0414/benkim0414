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
- A push containing no qualifying change produces neither a release nor a
  deployment.
- The release build receives the candidate version explicitly and the built
  artifact is deployed without rebuilding.
- `apps/github.io/package.json` omits `version` and retains `private: true`.

## Version semantics

The repository-owned coordinator parses Conventional Commit messages and maps
them as follows:

| Commit | Bump |
| --- | --- |
| `fix(github.io): ...` | patch |
| `feat(github.io): ...` | minor |
| `fix(github.io)!: ...` or `feat(github.io)!: ...` | major |
| A scoped commit with a `BREAKING CHANGE:` footer | major |
| Other types or scopes | none |

Breaking syntax is eligible only when the commit itself has the exact
`github.io` scope. A breaking footer on an unrelated or unscoped commit must not
release this application.

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

1. Locate the commit that introduced `apps/github.io`.
2. Begin at `0.0.0`.
3. Traverse first-parent integration points from that boundary through the
   selected target commit in chronological order.
4. Apply the normal scope and bump rules to the commit set introduced at every
   integration point.
5. Emit the contributing commits and calculated version in a reviewable dry
   run.
6. Create the first `github.io@<version>` tag only through a separate explicit
   bootstrap operation.

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

1. resolves the latest project tag and the target commit;
2. enumerates first-parent integration points within that range and resolves
   the commits introduced by each squash or true merge;
3. parses and classifies those commit messages without double counting;
4. computes the ordered sequence of bumps;
5. exits successfully with `released: false` when none qualify;
6. invokes the Nx Release programmatic API for the explicit project/version;
7. emits structured output containing `project`, `previousVersion`,
   `newVersion`, `tag`, `bump`, and contributing commit SHAs.

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
resolve history and tags
  -> classify commits
  -> no-op, or calculate candidate version
  -> lint and test
  -> build once with candidate version
  -> assert artifact version
  -> create project tag and GitHub Release
  -> hand immutable artifact to deployment
```

The workflow checks out full Git history and tags. A later queued run always
scans from the last published project tag through its own target SHA, so
coalesced or superseded workflow runs cannot lose release-worthy commits.

### Deployment boundary

The existing synchronization into `benkim0414/benkim0414.github.io` remains the
deployment boundary. It receives the already-built, verified artifact and must
not recalculate the version or rebuild the source.

Deployment credentials remain isolated to the deployment job. The calculation
and build jobs receive no cross-repository write credential. The deployed
commit message records the source release tag and commit for traceability.

## Failure handling and idempotency

- Missing or malformed baseline tags fail before version calculation.
- A missing or invalid production build version fails before tagging.
- Lint, test, build, or artifact assertions fail before irreversible release
  publication.
- An existing tag is accepted only when it resolves to the expected source
  commit and version; conflicts fail closed.
- An existing matching GitHub Release is reused or verified rather than
  duplicated.
- Publication failure prevents deployment.
- Deployment retries synchronize the same immutable artifact and do not create
  a new application version.
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
3. Bootstrap and verify the first authoritative `github.io@<version>` tag.
4. Replace the package-manifest footer import with required build injection.
5. Replace the Changesets version-PR and release-PR workflows with the
   serialized main-push release workflow.
6. Remove `.changeset` configuration and `@changesets/cli` only after no
   pending release metadata remains.
7. Change the Pages deployment workflow to consume the released artifact and
   skip non-release pushes.

The transition must not leave the old and new release authorities active at the
same time.

## Validation

### Coordinator tests

- patch, minor, and major classification;
- exact `github.io` scope matching;
- ignored types and unrelated scopes;
- `!` and `BREAKING CHANGE:` parsing;
- malformed messages;
- multiple commits within one merge;
- chronological replay across multiple merges;
- no qualifying commits;
- missing, valid, duplicate, and conflicting tags;
- historical bootstrap from the introduction boundary.

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
- `pnpm nx lint github.io`, `pnpm nx test github.io --run`, and
  `pnpm nx build github.io` pass;
- workflow contract tests cover concurrency, full history, no-op behavior,
  publication ordering, immutable artifact transfer, and safe retry behavior;
- a nonqualifying `main` push creates neither a tag, GitHub Release, Pages
  commit, nor deployment.

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
