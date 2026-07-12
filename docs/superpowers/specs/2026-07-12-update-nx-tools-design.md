# Update Nx Tools Design

Date: 2026-07-12

## Summary

Update this Nx monorepo from the current Nx 19.5.6 toolchain to the latest stable Nx release, and apply the migration. The work should use Nx's official migration flow first, then align directly coupled build, test, lint, and TypeScript tooling as needed for compatibility.

## Current Context

The repository is an Nx npm-preset monorepo using pnpm. It currently contains one React/Vite application at `apps/github.io`.

Current Nx packages are pinned at `19.5.6`:

- `nx`
- `@nx/eslint`
- `@nx/eslint-plugin`
- `@nx/js`
- `@nx/react`
- `@nx/vite`
- `@nx/web`

The app uses React 19, Vite, Vitest, ESLint, TypeScript, and Astryx packages. The repository is already ahead of `origin/main` from the recently completed `github.io` app work.

## Goals

- Upgrade all installed Nx packages to the latest stable release available at implementation time.
- Run the official Nx migration flow and apply generated migrations.
- Allow migration-driven formatting, config reshaping, and file organization changes when they are part of keeping the workspace current.
- Align closely coupled packages when needed for latest Nx compatibility:
  - Vite
  - Vitest
  - TypeScript
  - ESLint
  - `@typescript-eslint/*`
  - React Vite plugin packages
- Preserve the `github.io` app's user-facing behavior unless a migration requires a small mechanical compatibility adjustment.
- Keep unrelated packages unchanged unless they block installation or verification.

## Non-Goals

- Do not redesign the `github.io` app.
- Do not add deployment, CI, or GitHub Pages workflows.
- Do not perform a full dependency refresh beyond Nx and coupled toolchain packages.
- Do not upgrade Astryx, commit tooling, Husky, or unrelated libraries unless required by peer dependencies or verification failures.

## Recommended Approach

Use Nx's official migration workflow:

1. Create an isolated linked worktree and branch for the upgrade.
2. Run the latest stable Nx migration command.
3. Install dependencies with pnpm.
4. Run generated Nx migrations.
5. Inspect all package, lockfile, and workspace config changes.
6. Align peer dependencies only where Nx, Vite, Vitest, ESLint, or TypeScript compatibility requires it.
7. Verify the workspace with install, peer checks, build, lint, and test commands.

This approach lets Nx own the breaking-change codemods and keeps manual changes tied to concrete migration or verification output.

## Expected Files And Areas

Likely affected files include:

- `package.json`
- `pnpm-lock.yaml`
- `nx.json`
- `tsconfig.base.json`
- `apps/github.io/project.json`
- `apps/github.io/vite.config.ts`
- Generated migration files such as `migrations.json`, if Nx creates one
- Any lint, test, or TypeScript config files touched by official migrations

## Error Handling

- If the migration command fails, capture the exact command and error before changing strategy.
- If dependency installation fails due to peer conflicts, resolve the smallest set of coupled package versions that satisfies latest Nx.
- If generated migrations fail partway through, inspect the generated migration list and rerun only the failed or remaining migrations when supported by Nx.
- If build, lint, or test fails after migration, treat that as a migration compatibility issue and fix it in the narrowest affected files.

## Verification

The implementation is complete only after these commands pass:

- `corepack pnpm install`
- `corepack pnpm peers check`
- `NX_DAEMON=false corepack pnpm nx build github.io`
- `NX_DAEMON=false corepack pnpm nx lint github.io`
- `NX_DAEMON=false corepack pnpm nx test github.io`

If a command cannot be run because of environment limits, document the exact blocker and the closest completed verification.

## Commit Plan

Use separate conventional commits for logical changes:

- `docs: design nx tools update`
- `docs: plan nx tools update`
- `chore(nx): migrate tooling to latest stable`
- Follow-up `fix(...)` commits only if needed for verification failures

Stage explicit paths only for each commit.
