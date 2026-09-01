# GitHub Pages artifact publishing and semantic releases

## Goal

Publish the `github.io` Nx/Vite application at the account-site URL
`https://benkim0414.github.io/` while retaining this repository as the source of
truth. Automate artifact promotion with GitHub Actions and use Changesets to
create semantic version PRs, Git tags, and GitHub Releases without publishing
an npm package.

## Scope

- Create an artifacts-only `benkim0414.github.io` user-site repository.
- Build, validate, and synchronize the static output from this monorepo to that
  repository after every push to `main`.
- Make Vite assets, the HTML base, React Router, and the SPA fallback work at
  the account-site root and for direct route requests.
- Version the private `github.io` application using Changesets.
- Create a version PR for pending changesets, then create an application tag
  and GitHub Release when that PR is merged.

## Out of scope

- Publishing any package to npm or another package registry.
- Preview deployments for pull requests.
- Moving the application source into the user-site repository.
- A custom domain.

## Architecture

`benkim0414` remains the source monorepo. It owns the application code, build,
tests, Changesets configuration, release history, and all workflow logic.

`benkim0414.github.io` is a separate GitHub user-site repository that contains
only the generated production site. GitHub Pages is configured there to deploy
from the root of its `main` branch. This grants the root URL without a
repository-name path segment.

The source repository owns a write-enabled SSH deploy key as an Actions secret.
The public half is registered only as a write-enabled deploy key on
`benkim0414.github.io`. The deploy workflow checks out the target repository
through that key, replaces its working-tree files with the vetted build output,
adds `.nojekyll`, and makes a normal non-force push. Neither repository stores
the private key in tracked files.

## Components and workflows

### Application package and Changesets

Add a minimal private package manifest to `apps/github.io` with a stable package
name and initial semantic version. Configure Changesets at the workspace root
to use `main` as its base branch and to version and tag private packages. Add
the Changesets CLI as a root development dependency.

Contributors add a changeset for user-visible application changes. The release
automation runs on pushes to `main`, creates or updates one version PR, and has
only `contents: write` and `pull-requests: write` permissions. It does not run
an npm publish command.

### Artifact deployment

The deploy workflow is triggered by every push to `main` and by
`workflow_dispatch`. It checks out the source, sets up the pinned Node and pnpm
environment, installs from the lockfile, and runs the focused `github.io` lint,
test, and build targets. It uses the built directory
`dist/apps/github.io` as the sole artifact input.

After validation, the workflow checks out `benkim0414.github.io` into a separate
directory using the deploy key and retains that checkout's SSH credentials for
the later push. The source checkout does not persist credentials. It synchronizes
the build output into the target repository root, excludes `.git` and the private
application `package.json`, writes `.nojekyll`, and commits only when the artifact
differs. It uses a deployment concurrency group so a later `main`
commit supersedes an in-progress older deployment. Pushes are normal
fast-forward pushes; a conflict or failed push fails visibly and must be retried
instead of being overwritten.

### Semantic release

A release workflow runs only for a merged, identified Changesets version PR
whose base branch is `main`. It reads the resulting `github.io` package version,
creates the `github.io@X.Y.Z` tag at the merge commit, and creates the matching
GitHub Release. It first checks whether the tag or release already exists, so
reruns are safe. A dedicated concurrency group prevents duplicate releases.

## Routing and output contract

The account-site deployment uses Vite's `/` base. Update the Vite configuration,
HTML base references, asset references, React Router basename, and `404.html`
fallback together so the production site does not retain the project-site
`/benkim0414/` assumption. The fallback remains a client-side SPA entry: a
direct GitHub Pages request such as `/skills` or a skill-detail path may receive
the static fallback document, but React must render the requested route.

## Failure handling and security

- An install, lint, test, build, checkout, or synchronization failure must not
  mutate the artifact repository.
- Identical output must result in no target-repository commit.
- The workflow never force-pushes or deletes target history.
- Build promotion copies no source metadata, credentials, or `.git` content.
- The produced site is public-facing; no secrets may be included in generated
  files.
- Actions are pinned to reviewed immutable revisions and granted only the
  permissions they need.

## Validation

- Run the focused Nx lint, unit-test, and production-build targets for
  `github.io` before every artifact promotion.
- Assert the root-base production output loads static assets correctly.
- Run browser verification for `/`, `/skills`, and a representative skill-detail
  deep link through the fallback entry.
- Validate workflow syntax and dry-run the synchronization logic against a
  local disposable checkout before enabling the target-repository deploy key.
- Confirm the first version PR updates the app version and changelog; after its
  merge, verify exactly one source tag and GitHub Release, plus a successful
  Pages deployment at the root URL.

## Required GitHub configuration

Before enabling workflows, create the `benkim0414.github.io` repository, seed
its `main` branch with an initial commit, and configure its Pages source as
`main` / root. Register the generated public SSH key as a write-enabled deploy
key there, and store the private key as an Actions secret in this source
repository. In the source repository, allow GitHub Actions to create pull
requests so Changesets can maintain the version PR.

## Sources

- [GitHub Pages site types](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
- [GitHub Pages publishing sources](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [Changesets action](https://github.com/changesets/action)
- [Changesets application versioning](https://github.com/changesets/changesets/blob/main/docs/versioning-apps.md)
- [Vite GitHub Pages deployment](https://vite.dev/guide/static-deploy.html)
