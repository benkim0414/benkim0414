## 1. Test First

- [x] 1.1 Add failing unit tests for theme preference storage and system-mode resolution.
- [x] 1.2 Add a failing UI test for changing theme mode through the visible control.
- [x] 1.3 Add a failing build or component smoke assertion that depends on Tailwind styles loading.

## 2. Configure Design System

- [x] 2.1 Install and configure Tailwind v4 for `apps/github.io`.
- [x] 2.2 Initialize shadcn/ui with `new-york` style and app-local component paths.
- [x] 2.3 Add the minimal shadcn components needed for buttons, controls, and theme selection.
- [x] 2.4 Implement quiet professional theme tokens for light and dark modes.
- [x] 2.5 Implement the light/dark/system theme provider and visible toggle.

## 3. Verify

- [x] 3.1 Run `pnpm install --frozen-lockfile`.
- [x] 3.2 Run `pnpm nx test github.io`.
- [x] 3.3 Run `pnpm nx e2e github.io-e2e`.
- [x] 3.4 Run `pnpm nx build github.io`.
- [x] 3.5 Run `pnpm nx report`.
- [x] 3.6 Run `git diff --check`.
- [x] 3.7 Run `pnpm openspec validate configure-github-io-design-system`.
