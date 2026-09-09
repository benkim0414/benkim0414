# Semantic release in an Nx/pnpm monorepo

## Question

Can `semantic-release` safely provide conventional-commit-driven versions for
`github.io` now and remain a good release foundation as this repository gains
more independently versioned applications and libraries?

## Executive finding

**It works for one independently released application, but it is not the best
long-term monorepo foundation for this repository.** Core `semantic-release`
assumes one repository maps to one release stream, and its maintainers state
that monorepos are not officially supported. Multiple project release streams
therefore require third-party orchestration, careful tag namespacing, commit
filtering, dependency propagation, and serialized Git writes.
([core maintainer answer](https://github.com/semantic-release/semantic-release/discussions/2680),
[open monorepo-support request](https://github.com/semantic-release/semantic-release/issues/1688))

For this Nx 23 workspace, **Nx Release is the recommended design**. It natively
supports conventional-commit version inference, project-specific tags,
independent or fixed versioning, release groups, and dependency-aware ordering.
That avoids adopting an unofficial semantic-release monorepo layer which would
probably be replaced once the workspace grows.
([Nx Release overview](https://nx.dev/docs/features/manage-releases),
[release groups](https://nx.dev/docs/guides/nx-release/release-groups),
[independent projects](https://nx.dev/docs/guides/nx-release/release-projects-independently))

## Current repository fit

The repository currently has one releasable private application,
`@benkim0414/github-io` at `0.1.0`. Its footer imports that manifest version.
The workspace is Nx `23.0.2` with pnpm workspaces covering `apps/*` and
`packages/*`. Changesets currently versions private packages and creates a
version PR; a second workflow recognizes that PR merge and creates the
`github.io@<version>` tag and GitHub Release.

The desired behavior differs in three ways:

- only `fix(github.io)`, `feat(github.io)`, and breaking `github.io` commits
  should release;
- a qualifying merge to `main` should release and deploy automatically;
- the version shown by the deployed build should come from the release tag,
  without committing a manifest version bump back to `main`.

With only this application, a single semantic-release configuration can model
one stream using `tagFormat: "github.io@${version}"`; `tagFormat` may contain
one `version` interpolation and semantic-release uses matching tags to locate
the prior release.
([semantic-release configuration](https://semantic-release.gitbook.io/semantic-release/usage/configuration))

Scope-based bump rules are possible because commit-analyzer rules match parsed
commit properties such as `type` and `scope`, support globs, and allow
`release: false`. Care is required: commits that do not match custom rules fall
back to default rules (`feat`, `fix`, `perf`, and breaking changes). A complete
configuration must explicitly suppress every non-`github.io` scope rather than
only add positive `github.io` rules.
([commit-analyzer release rules](https://github.com/semantic-release/commit-analyzer#releaserules))

## What changes when the monorepo grows

### Core semantic-release model

Core semantic-release has one release history per invocation: it finds the last
matching tag, analyzes subsequent commits, chooses one next version, and creates
one tag/release. Its default tag is `v${version}` and a custom tag format has
only the `version` variable. It has no native project graph, workspace package
selection, fixed/independent release groups, or internal-dependency propagation.
([configuration](https://semantic-release.gitbook.io/semantic-release/usage/configuration),
[official monorepo position](https://github.com/semantic-release/semantic-release/discussions/2680))

Running one independent semantic-release invocation per app/library can create
separate streams, but the caller must supply a unique format such as
`github.io@${version}` for every project and ensure each invocation sees only
that project's commits. Conventional-commit scope is a human-authored routing
signal; it does not understand Nx dependencies. A shared library change would
not automatically release affected apps unless the workflow adds that policy.

### `semantic-release-monorepo`

`pmowrer/semantic-release-monorepo` extends semantic-release, runs once per
package, assigns commits by files touched below the package root, and namespaces
tags by package name. Its documented pnpm command explicitly sets
`--workspace-concurrency=1`.
([project README](https://github.com/pmowrer/semantic-release-monorepo#readme))

Advantages:

- small conceptual extension to semantic-release;
- independent package tags and releases;
- automatic path-based commit attribution.

Costs and limitations:

- path attribution differs from the requested `github.io` commit-scope policy;
- a shared library commit is attributed to the library path, not automatically
  to applications that depend on it;
- it must be configured through `extends`, not the normal plugin list;
- each package runs a separate release process, so release writes need serial
  execution;
- compatibility risk remains outside semantic-release's supported surface.

The project is usable, but its own repository currently shows no GitHub
Releases, while its issue tracker includes compatibility reports. That is not
proof of abandonment, but it argues against making it the workspace's durable
release core.
([repository](https://github.com/pmowrer/semantic-release-monorepo),
[issues](https://github.com/pmowrer/semantic-release-monorepo/issues))

### `multi-semantic-release`

`multi-semantic-release` coordinates all workspace packages together and can
update local dependency versions. It discovers pnpm workspaces and addresses
the dependency-ordering problem that independent semantic-release loops leave
to the caller.
([project README](https://github.com/dhoulb/multi-semantic-release#readme))

However, its own documentation calls it a “proof of concept,” “hacky,” and not
fundamentally stable enough for important production use because it depends on
semantic-release internals. It also documents concurrency-related Git problems
and a sequential initialization option. Those explicit maintenance warnings
make it a poor new dependency for production deployment.
([stability warning and implementation notes](https://github.com/dhoulb/multi-semantic-release#overview),
[troubleshooting](https://github.com/dhoulb/multi-semantic-release#troubleshooting))

## Fixed versus independent versions

There are two valid future policies, and the repository should not accidentally
choose one through tooling constraints:

- **Independent:** each deployable app or publishable library has its own
  version and tag. This best matches separately deployed apps. A dependency
  release policy is required when a library changes.
- **Fixed:** a group shares one version and releases in lockstep. This is easier
  when several packages form one externally consumed product, but it creates
  releases for unchanged members.

Changesets supports both models: fixed groups share a version and always publish
together, while linked groups coordinate version ranges without necessarily
publishing every member. It also handles internal dependencies, but contributors
normally declare bump intent in changeset files rather than deriving it from
commit messages.
([Changesets fixed packages](https://github.com/changesets/changesets/blob/main/docs/fixed-packages.md),
[Changesets dictionary](https://github.com/changesets/changesets/blob/main/docs/dictionary.md),
[Changesets README](https://github.com/changesets/changesets#readme))

Nx Release directly supports both independent and fixed project relationships,
allows different release groups to use different policies, and processes groups
and projects in dependency-topological order. It can also update dependents
across group boundaries.
([release groups](https://nx.dev/docs/guides/nx-release/release-groups))

## CI concurrency and atomicity

Only one workflow should be allowed to calculate and publish versions for a
given release stream at a time. Two runs can both read the same latest tag,
calculate the same next version, and race to push Git refs or releases.
Semantic-release users have reported concurrent monorepo runs failing on Git
fetches, tags, and Git notes; the monorepo extension therefore documents
single-worker pnpm execution.
([semantic-release concurrency issue](https://github.com/semantic-release/semantic-release/issues/1545),
[Git-notes race report](https://github.com/semantic-release/semantic-release/issues/1628),
[semantic-release-monorepo pnpm command](https://github.com/pmowrer/semantic-release-monorepo#with-pnpm))

The release workflow should use one non-cancelling GitHub Actions concurrency
group for all release calculations and publication. A run already publishing a
tag must not be cancelled halfway through. Build and verification should happen
before the irreversible tag/release step; deployment should consume the exact
artifact built for that computed version. Per-project parallelism can be added
later for read-only build/test jobs, but Git tag and release publication should
remain centrally serialized.

## Recommendation

### Now

Use **Nx Release configured only for `github.io`**, with conventional commits
and the project tag pattern `github.io@{version}`. Run it in one serialized
release workflow after checks pass, obtain the computed tag/version for build
injection, create the GitHub Release, and deploy only when Nx reports a release.
Nx's defaults already map `feat` to minor, `fix` to patch, and breaking commits
to major, and skip when there are no relevant commits.
([Nx conventional commits](https://nx.dev/docs/guides/nx-release/customize-conventional-commit-types))

The requested *scope-only* rule still needs explicit validation. Nx's project
release selection is naturally based on project changes, whereas the user chose
commit scope as the contract. The release script should first select only
commits whose parsed scope is exactly `github.io`, or enforce that all
release-worthy changes to this app use that scope and test the behavior with a
dry run. Do not silently substitute path detection for the agreed scope policy.

### Growth path

1. Give every deployable app and publishable library an Nx project and unique
   tag pattern containing `{projectName}` and `{version}`.
2. Default deployable apps to independent versions.
3. Introduce release groups only when packages genuinely need shared release
   policy; choose fixed groups for one product shipped in lockstep.
4. Define how shared-library changes affect dependents using Nx's release graph
   and `updateDependents`, instead of encoding dependency impact in commit
   scopes.
5. Keep all release publication under one serialized workflow, while using Nx
   affected/project filtering for build and test work.

Nx supports independent project tags and project filtering, and it updates
dependencies/dependents using the project graph.
([independent releases](https://nx.dev/docs/guides/nx-release/release-projects-independently),
[release groups and dependent updates](https://nx.dev/docs/guides/nx-release/release-groups))

### If semantic-release is nevertheless preferred

Use core semantic-release for `github.io` only, not a monorepo wrapper yet.
Namespace the tag, disable npm publication for this private app, explicitly
filter/suppress scopes, and serialize the workflow. When a second release stream
arrives, reassess before adding either wrapper; migrating then to Nx Release is
safer than committing now to `multi-semantic-release` or a per-package plugin
whose behavior does not match Nx's dependency graph.

## Decision summary

| Choice | Single app now | Multiple apps/libs later | Verdict |
| --- | --- | --- | --- |
| Core semantic-release | Good | Manual per-project orchestration | Viable tactical option |
| semantic-release-monorepo | Good with path-based releases | Independent packages; weak dependency propagation | Usable, higher maintenance risk |
| multi-semantic-release | Capable but unnecessary | Coordinates local dependencies | Avoid for new production use due to its own stability warning |
| Changesets | Already installed; requires bump files | Strong monorepo/version-group support | Keep only if explicit release files are acceptable |
| Nx Release | Native to current workspace | Independent/fixed groups and dependency graph | **Recommended** |
