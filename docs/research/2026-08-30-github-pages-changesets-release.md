# GitHub Pages deployment and Changesets release research

## Recommendation

Use two independent workflows on `main`:

1. **Deploy Pages on every successful main-branch change.** Build `github.io` with
   Nx, upload `dist/apps/github.io`, and deploy the artifact with GitHub's Pages
   actions. A deployment represents the current approved site, not a package
   release.
2. **Create/update a release PR when pending changesets exist.** Changesets
   versions the private application and produces its changelog; merging that PR
   is an ordinary `main` push, so it is deployed like every other change. Enable
   tags/GitHub Releases only if a durable public release record is wanted.

This separation is the least surprising model for a portfolio/static site: urgent
content fixes deploy immediately, while semantic versions describe deliberate
release milestones. Do **not** make Pages deployment wait for an npm publish:
there is no publishable package here.

## Repository-specific implications

- This is a pnpm Nx monorepo; `github.io` is a Vite application with its output
  configured as `dist/apps/github.io`. The root package is `private`, version
  `0.0.0`, and no workspace packages currently exist.
- Changesets tracks `package.json` projects. Give `apps/github.io` a minimal
  private package manifest (`name`, `private`, and a real initial version such
  as `0.1.0`) and enable `privatePackages: { "version": true, "tag": true }`.
  Changesets documents this exact application-versioning arrangement and notes
  that private packages are otherwise neither versioned nor tagged.
  ([Changesets: versioning applications](https://github.com/changesets/changesets/blob/main/docs/versioning-apps.md),
  [configuration reference](https://github.com/changesets/changesets/blob/main/docs/config-file-options.md))
- Use `.changeset/config.json` with `baseBranch: "main"`, and add
  `@changesets/cli` at the workspace root. Contributors add a changeset for a
  user-visible app change; maintenance-only PRs use `changeset --empty` or are
  explicitly exempted by review. The Changesets automation guide recommends
  making missing changesets visible on PRs. ([automation guide](https://github.com/changesets/changesets/blob/main/docs/automating-changesets.md))

## Pages workflow shape

Configure **Settings → Pages → Build and deployment → Source → GitHub Actions**.
GitHub recommends a custom Actions workflow when the site needs a build process,
and warns that Pages output is public even when the repository is private.
([GitHub: configuring a publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site))

The deploy workflow should trigger on `push` to `main`, plus `workflow_dispatch`,
and have two jobs:

| Job | Permissions | Key steps |
| --- | --- | --- |
| `build` | `contents: read` | checkout; set up the repository's pinned Node/pnpm; install with `pnpm install --frozen-lockfile`; run `pnpm nx build github.io`; run `actions/configure-pages@v5`; upload `dist/apps/github.io` through `actions/upload-pages-artifact@v4`. |
| `deploy` | `pages: write`, `id-token: write` | `needs: build`; set environment `github-pages` and URL from the deployment output; run `actions/deploy-pages@v4`. |

The required deployment permissions, artifact/deploy relationship, and
`github-pages` environment are specified by GitHub. Add a deployment protection
rule so only the default branch can deploy. ([GitHub: custom Pages
workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages))

Set a deployment-only concurrency group such as `github-pages` with
`cancel-in-progress: true`, so a newer main commit supersedes a stale Pages
deployment. GitHub documents that concurrency prevents multiple same-group
deployments and that `cancel-in-progress` cancels an active prior run.
([GitHub: workflow concurrency](https://docs.github.com/en/actions/concepts/workflows-and-actions/concurrency))

## URL and routing requirements

For this repository's project Pages URL, the production base is expected to be
`/benkim0414/` (`https://benkim0414.github.io/benkim0414/`); Vite requires the
repository path as `base` for that URL form. If the site instead moves to the
account repository `benkim0414.github.io` or a custom domain, use `/`.
([Vite: static deployment](https://vite.dev/guide/static-deploy.html))

The existing Vite config, HTML `<base href="/">`, absolute asset URLs, and
`BrowserRouter` must be made base-aware. Set Vite's `base` at build time and pass
the matching React Router `basename`; test direct navigation to `/skills` and a
skill detail URL. The build currently emits `404.html`, but Pages needs the
base-aware fallback to load the application for deep links.

## Changesets workflow shape

On pushes to `main`, after checkout/install, run `changesets/action@v2` with an
explicit `github-token`. Grant only `contents: write` and `pull-requests: write`;
enable **Actions → General → Allow GitHub Actions to create and approve pull
requests**. The action creates or updates the version PR; its documented
requirements are a checked-out repository, installed CLI, and those permissions.
([Changesets action README](https://github.com/changesets/action/blob/main/README.md))

Because the application is private, do not provide a package-manager publish
script. Configure release/tag creation deliberately: retain version PRs first;
then enable Git tags and GitHub Releases when the team confirms those are the
release record it wants. The action supports independent `push-git-tags` and
`create-github-releases` settings, and its default push mode uses the GitHub API.
([Changesets action inputs](https://github.com/changesets/action/blob/main/README.md))

Do not trigger production deployment exclusively from a tag: commits made with
`GITHUB_TOKEN` do not start other workflows, so a tag-trigger chain can silently
miss a deployment. Deploy from the `main` push; the release-PR merge naturally
causes the release version to be deployed.
([GitHub Pages publishing-source troubleshooting](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site))
