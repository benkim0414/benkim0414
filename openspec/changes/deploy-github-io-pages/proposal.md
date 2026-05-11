## Why

The completed showcase needs an automated path to the root GitHub Pages URL. Because the source remains in this Nx monorepo, deployment must publish the built static output to the separate `benkim0414/benkim0414.github.io` repository.

## What Changes

- Add GitHub Actions deployment automation for the `github.io` app.
- Build the app in this repository and push static output to the root of the target repo's `main` branch.
- Use an SSH deploy key secret scoped to the target repository.
- Document the prerequisite target repo and deploy key setup.
- Keep source hosting and app implementation changes out of scope.

## Capabilities

### New Capabilities

- `github-io-pages-deployment`: Covers GitHub Actions build/publish behavior, target repository assumptions, and deployment verification.

### Modified Capabilities

None.

## Impact

- Adds a GitHub Actions workflow under `.github/workflows/`.
- Adds deployment documentation for required secrets and target repo setup.
- Uses the existing Nx build target and pnpm package manager.
