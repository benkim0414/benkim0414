## 1. Test First

- [x] 1.1 Add failing workflow validation or static checks for the deployment YAML.
- [x] 1.2 Add failing verification that the workflow uses the `github.io` Nx build target.
- [x] 1.3 Add failing documentation check or review item for target repo and deploy key prerequisites.

## 2. Implement Deployment

- [x] 2.1 Add a GitHub Actions workflow that installs with pnpm and builds `github.io`.
- [x] 2.2 Add publish steps that push the built static output to `benkim0414/benkim0414.github.io` `main` root.
- [x] 2.3 Configure the workflow to use an SSH deploy key secret scoped to the target repository.
- [x] 2.4 Document target repository creation, Pages source, deploy key setup, and secret name.
- [x] 2.5 Ensure the workflow does not store secret values or generated keys in tracked files.

## 3. Verify

- [x] 3.1 Run `pnpm install --frozen-lockfile`.
- [x] 3.2 Run `pnpm nx test github.io`.
- [x] 3.3 Run `pnpm nx e2e github.io-e2e`.
- [x] 3.4 Run `pnpm nx build github.io`.
- [x] 3.5 Run `pnpm nx report`.
- [x] 3.6 Run `git diff --check`.
- [x] 3.7 Run `pnpm openspec validate deploy-github-io-pages`.
