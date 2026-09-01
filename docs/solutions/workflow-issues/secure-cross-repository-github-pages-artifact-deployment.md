---
title: Secure Cross-Repository GitHub Pages Artifact Deployment
date: 2026-09-01
category: workflow-issues
module: apps/github.io
problem_type: workflow_issue
component: development_workflow
severity: high
applies_when:
  - "Deploying a root GitHub Pages user site from a source monorepo into a separate artifact-only repository"
  - "Releasing apps/github.io through a Changesets version pull request"
  - "Creating an idempotent Git tag and GitHub Release after the trusted release PR merges"
related_components: [github-actions, github-pages, release-automation]
tags: [github-pages, github-actions, github-io, changesets, deploy-key, artifact-sync, semantic-versioning]
---

# Secure Cross-Repository GitHub Pages Artifact Deployment

## Context

`apps/github.io` is built in the source monorepo, while the separate artifact
repository is intentionally limited to the GitHub Pages output. Deployment
therefore crosses repository boundaries: the
source workflow must validate the app, obtain narrowly scoped write access to
the target repository, replace only publishable output, and push a normal
update to the target's seeded `main` branch.

Changesets calculates semantic versions in a source-repository pull request.
Only the trusted merged Changesets pull request may create the
`github.io@X.Y.Z` tag and GitHub Release. This branch is not merged at the
time of writing.

## Guidance

1. Seed the artifact-only user-site repository's `main` branch before the first
   deployment. Check out that exact branch and use ordinary `git push origin
   main`; never create or force-push target history. [Deployment workflow](../../../.github/workflows/deploy-github-pages-artifact.yml#L33-L53)

2. Validate in the source repository before checking out the target: use a
   frozen install, then lint, test, and build. Keep the source checkout
   credential-free; only the target checkout receives the dedicated write
   deploy key, and it persists that SSH credential for the subsequent push.
   [Deployment workflow](../../../.github/workflows/deploy-github-pages-artifact.yml#L19-L41)

3. Use a dedicated, target-scoped SSH deploy key rather than a personal key.
   Store its private half in the source repository as `PAGES_DEPLOY_KEY`.
   During this setup GitHub rejected `GITHUB_PAGES_DEPLOY_KEY`, because Actions
   secret names may not begin with `GITHUB_`. [Runbook](../../runbooks/github-pages-artifact-release.md#L30-L50)

4. Make synchronization explicit: require the target `.git` directory; remove
   target-root entries except `.git`; copy the build except generated
   `package.json`; and create `.nojekyll`. This removes stale hashed assets
   without corrupting repository metadata. [Synchronizer](../../../scripts/sync-github-pages-artifact.mjs#L11-L30)

5. Treat a no-change deployment as success. Serialize deploys with one
   concurrency group, and commit only when the staged target diff is nonempty.
   [Deployment workflow](../../../.github/workflows/deploy-github-pages-artifact.yml#L8-L10)

6. Separate version calculation from release publication. Let Changesets open
   the deterministic version PR; then accept only the expected merged,
   bot-created PR from `changeset-release/main`. Read the version at its merge
   commit, and make tag and release creation idempotent. If an existing tag
   resolves to a different commit, fail instead of accepting history drift.
   [Changesets workflow](../../../.github/workflows/changesets-version.yml#L7-L31)
   [Release workflow](../../../.github/workflows/release-github-io.yml#L15-L69)

## Why This Matters

An artifact-only user-site repository keeps source history, dependency files,
and build tooling out of the Pages branch. The separation is safe only when
the credential boundary is deliberate and stale output cannot survive a later
build.

The version PR is also a trust boundary. Requiring a merged, same-repository,
bot-authored `changeset-release/main` pull request prevents unrelated pull
requests from minting releases. Comparing an existing tag with the merge commit
makes retries safe while detecting collisions or altered history.

## When to Apply

- A static app lives in a monorepo but must publish at
  `https://<owner>.github.io/`.
- The source and Pages artifacts should have separate repositories.
- Releases need semantic versions, Git tags, and GitHub Releases without npm
  publication.

Do not use this exact flow if the target branch rejects a deploy key's normal
push, the host needs an API upload, or the app is served under a project-site
base path.

## Examples

- A source `main` commit runs the verified build, checks out the artifact
  repository using `PAGES_DEPLOY_KEY`, synchronizes static output, and pushes
  only when it changed.
- A patch changeset opens `chore(release): version github.io`; after that exact
  bot PR merges, the release workflow creates `github.io@X.Y.Z` and its GitHub
  Release. [Release workflow tests](../../../scripts/github-io-release-workflows.test.mjs#L12-L84)

## Related

- No related solution or GitHub issue was found during this capture.
