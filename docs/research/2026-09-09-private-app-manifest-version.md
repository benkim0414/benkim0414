# Source manifest version for a tag-versioned private application

## Decision

**Remove the `version` field from `apps/github.io/package.json` and retain
`"private": true`.**

The source manifest should be:

```json
{
  "name": "@benkim0414/github-io",
  "private": true
}
```

Production version authority should remain the project Git tag
`github.io@<version>`. The release coordinator should pass the calculated
version into the Vite production build, and Nx Release should write a version
only to an ignored staging/dist manifest if its version action needs a manifest
target. The application must stop importing `version` from its source
`package.json`.

This is not merely permitted; it is the convention Nx documents for a
tag-authoritative, dist-only release. Nx's example source manifest explicitly
has no `version` because it is never updated, configures
`currentVersionResolver: "git-tag"`, and applies the real version to the dist
manifest.
([Nx: updating version references, scenario 3](https://nx.dev/docs/guides/nx-release/updating-version-references#scenario-3-i-want-to-publish-from-a-custom-dist-directory-and-not-update-references-in-my-source-packagejson-files))

## Why omission is the best contract

### npm permits it for a non-published package

npm documents `name` and `version` as required when a package will be
published, but optional when it will not be published. This application is a
deployed website, not an npm artifact.
([npm `package.json` documentation](https://docs.npmjs.com/cli/v8/configuring-npm/package-json/#name))

`"private": true` is the separate safety control: npm documents that it
prevents the package from being published at all. Omitting `version` expresses
the source-of-truth decision; `private` prevents accidental registry
publication. Keep both semantics distinct.
([npm registry documentation](https://docs.npmjs.com/using-npm/registry.html#how-can-i-prevent-my-package-from-being-published-in-the-official-registry))

### Nx explicitly supports tag authority

Nx Release can resolve a project's current version from its matching Git tag.
For independent projects its standard tag format includes both project and
version, such as `{projectName}@{version}`. This matches
`github.io@<version>` and avoids collisions when more applications or libraries
are added.
([Nx independent releases](https://nx.dev/docs/guides/nx-release/release-projects-independently#create-a-git-tag-for-each-project),
[Nx automatic versioning](https://nx.dev/docs/guides/nx-release/automatically-version-with-conventional-commits))

Nx also documents how to avoid changing source manifests: set
`manifestRootsToUpdate` to generated output and set
`currentVersionResolver` to `git-tag`. Its example says the tracked source
manifest is no longer the version source and may contain no `version` field.
([Nx dist-only manifest configuration](https://nx.dev/docs/guides/nx-release/updating-version-references#scenario-3-i-want-to-publish-from-a-custom-dist-directory-and-not-update-references-in-my-source-packagejson-files))

### It is clearest to humans and tools

A real-looking value in source invites readers and tools to treat it as current.
Omission states that this manifest has no release version. The production value
must then come through the release interface, which makes a stale footer
impossible unless the build injection itself fails.

The build should fail in production when no release version is supplied. Local
development may display an explicit non-production label such as `dev` or omit
the footer version; that fallback belongs in application/build configuration,
not in `package.json` as a pretend release.

## Evaluation of the candidate values

| Source value | Technically valid? | Meaning and risk | Verdict |
| --- | --- | --- | --- |
| omit `version` | Yes for a package not intended for publication | Accurately says source is not version authority; directly matches Nx's documented tag/dist pattern | **Recommended** |
| `0.0.0` | Valid SemVer | Looks like a real stable version and can leak into UI, metadata, or tool output | Do not use as a sentinel |
| `0.0.0-development` | Valid SemVer prerelease | Signals unreleased development better than `0.0.0`, but remains a package version and can mask missing build injection | Only as a compatibility fallback |
| last real release, e.g. `0.1.0` | Valid SemVer | Becomes stale immediately while appearing authoritative—the current bug | Reject |
| another constant, e.g. `0.0.0-private` | Usually valid SemVer if formatted correctly | Invents a local convention without improving on omission | Reject unless a tool requires it |

## Semantic-version details

SemVer requires a version to have numeric major, minor, and patch components;
therefore `0.0.0` is valid. A hyphen introduces prerelease identifiers, so
`0.0.0-development` is also valid. A prerelease has lower precedence than the
otherwise equal normal version, making `0.0.0-development < 0.0.0`.
([Semantic Versioning 2.0.0](https://semver.org/#spec-item-9),
[precedence rules](https://semver.org/#spec-item-11))

That validity does not make either value appropriate. SemVer defines how
published versions identify and order releases; it does not define a special
“not versioned here” sentinel. Using a syntactically valid fake value creates
semantic ambiguity that omission avoids.

`0.0.0-development` also differs from a moving prerelease such as
`1.2.0-development.3`: the former does not communicate the next production
line, build identity, or deployed release. It should not be shown to users as a
production version.

## Private-package behavior and publication safety

Keep `"private": true` even after omitting `version`. npm's documentation says
this prevents publication, whereas package scope or registry access settings do
not mean the same thing. A scoped package may be published as restricted or
public depending on registry/configuration; `private: true` is the repository's
direct “never publish this package” guard.
([npm registry publication guard](https://docs.npmjs.com/using-npm/registry.html#how-can-i-prevent-my-package-from-being-published-in-the-official-registry),
[npm access configuration](https://docs.npmjs.com/cli/v11/using-npm/config/#access))

For defense in depth:

- do not give the deployed-app release group an npm publish target;
- never pass `apps/github.io` to `nx release publish`;
- keep npm credentials out of the application deployment job;
- retain `private: true` in both source and any generated package metadata
  unless a generated dist manifest is intentionally used for a different
  publishing purpose.

Omitting `version` alone is not the security boundary. npm says the fields are
optional for non-published packages, but `private: true` is what explicitly
blocks publication.

## Nx and workspace compatibility

The repository uses pnpm workspace globs for `apps/*` and `packages/*`. A
workspace package does not need to be publishable merely because it has a
`package.json`; its manifest can continue to provide project identity while Nx
infers the application project and its targets.

The proposed Nx Release configuration must not use the source manifest as its
version target. Nx normally writes the calculated version to the configured
manifest and, by default, stages release changes before tagging. The documented
dist-only configuration changes this behavior by pointing
`manifestRootsToUpdate` at generated output and resolving the current version
from Git tags.
([Nx source/dist manifest scenarios](https://nx.dev/docs/guides/nx-release/updating-version-references),
[Nx release Git operations](https://nx.dev/docs/kb/release-npm-packages#manage-git-operations))

Before implementation, prove on Nx `23.0.2` that:

1. `pnpm install --frozen-lockfile`, project discovery, lint, test, build, and
   Storybook work with the source version omitted;
2. the release group resolves `0.1.0` from `github.io@0.1.0` rather than disk;
3. its version action writes only to the configured ignored staging/dist root;
4. the programmatic API returns `newVersion` for build injection;
5. no source manifest or lockfile is modified;
6. the deployment path never invokes npm publication for the private app.

If Nx's JavaScript version action unexpectedly requires a source version before
it honors the Git-tag resolver, that is a tooling constraint to address through
release configuration or an ignored generated manifest—not a reason to display
a fake production value.

## Build and runtime contract

Replace the package-manifest import with a dedicated injected constant, for
example `__APP_VERSION__` or `VITE_APP_VERSION`. The contract should be:

- production release build: required exact SemVer supplied by the coordinator;
- local development: a visibly non-release value such as `dev`;
- tests: explicit fixture values, including a production SemVer and the local
  fallback;
- built artifact: assertion that the rendered footer equals `v<newVersion>`;
- release tag: assertion that it equals `github.io@<newVersion>`.

Do not use the source manifest as a fallback in production. Failing closed makes
a missing CI handoff visible before tag creation or deployment.

The coordinator can obtain `newVersion` from Nx Release's returned
`projectsVersionData`; Nx documents that this result includes each project's
current and new versions and can be passed between release phases.
([Nx Release programmatic API](https://nx.dev/docs/guides/nx-release/programmatic-api#releaseversion))

## When this recommendation changes

Add and maintain a real source `version` only if one of these conditions becomes
true:

1. **The package becomes publishable from its source directory.** npm then
   requires `name` and `version`, and the source manifest becomes part of the
   published artifact contract.
2. **The team deliberately returns to manifest-authoritative releases.** The
   release workflow must update and commit the real version atomically; the
   field must never remain a placeholder.
3. **A required workspace tool demonstrably cannot operate without it and has no
   supported dist/generated-manifest configuration.** Use
   `0.0.0-development` as the least misleading compatibility sentinel, document
   that it is never production authority, and make production builds reject it.

If a library is later published from generated `dist`, its source manifest may
still omit the version under Nx's documented scenario; the generated manifest
receives the release version. If it is published directly from source, maintain
the actual release version there instead.

## Final recommendation

Use omission, not a sentinel:

```json
{
  "name": "@benkim0414/github-io",
  "private": true
}
```

This gives each datum one owner:

- package identity and non-publishability: source `package.json`;
- current/previous production version: `github.io@<version>` Git tags;
- candidate release version: the scope-policy/Nx release coordinator;
- displayed version: required production build injection;
- generated publish metadata, if ever needed: ignored dist manifest.

It is the clearest human contract, valid npm metadata for a non-published
application, and the closest match to Nx's supported tag-authoritative release
architecture.
