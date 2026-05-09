## 1. Test First

- [ ] 1.1 Add failing unit tests for theme preference storage and system-mode resolution.
- [ ] 1.2 Add a failing UI test for changing theme mode through the visible control.
- [ ] 1.3 Add a failing build or component smoke assertion that depends on Tailwind styles loading.

## 2. Configure Design System

- [ ] 2.1 Install and configure Tailwind v4 for `apps/github.io`.
- [ ] 2.2 Initialize shadcn/ui with `new-york` style and app-local component paths.
- [ ] 2.3 Add the minimal shadcn components needed for buttons, controls, and theme selection.
- [ ] 2.4 Implement quiet professional theme tokens for light and dark modes.
- [ ] 2.5 Implement the light/dark/system theme provider and visible toggle.

## 3. Verify

- [ ] 3.1 Run `pnpm install --frozen-lockfile`.
- [ ] 3.2 Run `pnpm nx test github.io`.
- [ ] 3.3 Run `pnpm nx e2e github.io-e2e`.
- [ ] 3.4 Run `pnpm nx build github.io`.
- [ ] 3.5 Run `pnpm nx report`.
- [ ] 3.6 Run `git diff --check`.
- [ ] 3.7 Run `pnpm openspec validate configure-github-io-design-system`.
