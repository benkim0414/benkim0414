## 1. Test First

- [ ] 1.1 Run the Nx React generator dry-run and record the generated project names and targets before applying it.
- [ ] 1.2 Add or adjust the initial Vitest app render test so it fails if the generated app does not render the expected shell.
- [ ] 1.3 Add or adjust the initial Playwright smoke test so it fails if the app cannot load in a browser.

## 2. Generate App Shell

- [ ] 2.1 Run the Nx React app generator for `apps/github.io` with Vite, TypeScript, Vitest, and Playwright.
- [ ] 2.2 Inspect generated Nx project metadata and keep the project name `github.io` consistent across commands.
- [ ] 2.3 Configure Vite for root hosting compatibility without adding deployment automation.

## 3. Verify

- [ ] 3.1 Run `pnpm install --frozen-lockfile`.
- [ ] 3.2 Run `pnpm nx show project github.io --json`.
- [ ] 3.3 Run `pnpm nx test github.io`.
- [ ] 3.4 Run `pnpm nx e2e github.io-e2e`.
- [ ] 3.5 Run `pnpm nx build github.io`.
- [ ] 3.6 Run `pnpm nx report`.
- [ ] 3.7 Run `git diff --check`.
- [ ] 3.8 Run `pnpm openspec validate create-github-io-app-shell`.
