## 1. Test First

- [x] 1.1 Run the Nx React generator dry-run/help and record that Nx 22 reports this generator does not support `--dry-run`.
- [x] 1.2 Add or adjust the initial Vitest app render test so it fails if the generated app does not render the expected shell.
- [x] 1.3 Add or adjust the initial Playwright smoke test so it fails if the app cannot load in a browser.

## 2. Generate App Shell

- [x] 2.1 Run the Nx React app generator for `apps/github.io` with Vite, TypeScript, Vitest, and Playwright.
- [x] 2.2 Inspect generated Nx project metadata and keep the project name `github.io` consistent across commands.
- [x] 2.3 Configure Vite for root hosting compatibility without adding deployment automation.

## 3. Verify

- [x] 3.1 Run `pnpm install --frozen-lockfile`.
- [x] 3.2 Run `pnpm nx show project github.io --json`.
- [x] 3.3 Run `pnpm nx test github.io`.
- [x] 3.4 Run `pnpm nx e2e github.io-e2e`.
- [x] 3.5 Run `pnpm nx build github.io`.
- [x] 3.6 Run `pnpm nx report`.
- [x] 3.7 Run `git diff --check`.
- [x] 3.8 Run `pnpm openspec validate create-github-io-app-shell`.
