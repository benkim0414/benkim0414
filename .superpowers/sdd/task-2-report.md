# Task 2 Report: Add Astryx Foundation

Status: DONE_WITH_CONCERNS

## Summary

- Installed `@astryxdesign/core`, `@astryxdesign/theme-neutral`, and `@astryxdesign/cli` at `0.1.4`.
- Loaded Astryx reset, base CSS, and neutral theme CSS once from `apps/github.io/src/main.tsx`, followed by the generated app stylesheet.
- Replaced the generated welcome root with the minimal Astryx `Theme` wrapper and `Layout skeleton` content in `apps/github.io/src/app/app.tsx`.
- Used the installed docs output to confirm `Theme`, `neutralTheme`, `AppShell`, and `TopNav` import patterns. Because `theme.css` is imported, `neutralTheme` uses the documented optimized `@astryxdesign/theme-neutral/built` subpath.

## Commands Run

```bash
corepack pnpm add -w @astryxdesign/core @astryxdesign/theme-neutral
corepack pnpm --store-dir /tmp/pnpm-store add -w @astryxdesign/core @astryxdesign/theme-neutral
corepack pnpm --store-dir /tmp/pnpm-store add -Dw @astryxdesign/cli
corepack pnpm exec astryx docs theme --dense
corepack pnpm exec astryx component Theme --dense
corepack pnpm exec astryx component AppShell --dense
corepack pnpm exec astryx component TopNav --dense
NX_DAEMON=false corepack pnpm nx build github.io
corepack pnpm peers check
```

## Verification

- `NX_DAEMON=false corepack pnpm nx build github.io` initially failed in the sandbox with `NX Failed to start plugin worker`.
- Reran the same build outside the sandbox with approval. It completed successfully:

```text
NX   Successfully ran target build for project github.io
```

## Concerns

- `corepack pnpm peers check` reports unmet Astryx peer dependencies because installed Astryx `0.1.4` wants React/React DOM `>=19`, while the generated Task 1 app currently uses React/React DOM `18.3.1`.
- `corepack pnpm peers check` also reports an unmet `@swc/core` peer for `@swc-node/core@1.14.1`, with installed `@swc/core` at `1.5.29`.
- The build succeeds despite these peer warnings.
