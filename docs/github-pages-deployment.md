# GitHub Pages Deployment

The `github.io` source app lives in this Nx monorepo. The published user site is expected to live in a separate public repository:

- Target repository: `benkim0414/benkim0414.github.io`
- Target branch: `main`
- Pages source: root of `main`
- Site URL: `https://benkim0414.github.io/`

## Required Secret

Create an SSH deploy key for the target repository and store the private key in this source repository as:

```text
GH_PAGES_DEPLOY_KEY
```

The public key must be added to `benkim0414/benkim0414.github.io` as a deploy key with write access. Do not commit either key to this repository.

## Workflow

`.github/workflows/deploy-github-io.yml` runs on `main` changes that affect the app, tests, or workspace build configuration. It installs dependencies with pnpm, installs Chromium for Playwright, runs unit tests, runs browser smoke tests, builds `github.io`, then pushes the generated static files to the target repository root.
