---
title: Scaffold Nx React Astryx Apps With pnpm
date: 2026-07-12
category: workflow-issues
module: Nx React app scaffolding
problem_type: workflow_issue
component: development_workflow
severity: medium
applies_when:
  - "Adding a React app to this Nx pnpm monorepo"
  - "Integrating Astryx packages into a generated Nx React app"
  - "Running pnpm 11 in a sandbox that blocks package build scripts by default"
tags: [nx, react, astryx, pnpm, corepack, peer-dependencies]
---

# Scaffold Nx React Astryx Apps With pnpm

## Context

Scaffolding the first `github.io` app showed that this workspace needs a few explicit steps beyond the default Nx generator flow. The repo is a pnpm workspace with both `apps/*` and `packages/*` registered in `pnpm-workspace.yaml:1`, and pnpm 11 records approved dependency build scripts in the same file at `pnpm-workspace.yaml:5`.

The app also uses Astryx, which currently requires a React 19-compatible runtime. The final branch pins React and React DOM to `19.2.7` in `package.json:58`, and pins `@swc/core` to `~1.15.43` in `package.json:29` so `pnpm peers check` stays green.

## Guidance

When adding another Nx React app in this repo, use Corepack-backed pnpm commands and keep dependency health part of the scaffold, not a cleanup step.

Start by making sure the app workspace is visible to pnpm:

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

If pnpm blocks required postinstall scripts, approve the specific packages rather than turning off script protection globally. This branch needed `nx`, `esbuild`, `@swc/core`, and the final workspace state records those approvals in `pnpm-workspace.yaml:5`:

```yaml
onlyBuiltDependencies:
  - nx
allowBuilds:
  '@swc/core': true
  esbuild: true
  nx: true
```

After generating the app, integrate Astryx deliberately:

```tsx
import '@astryxdesign/core/reset.css';
import '@astryxdesign/core/astryx.css';
import '@astryxdesign/theme-neutral/theme.css';
import './styles.css';
```

The app root should keep the Astryx theme wrapper close to the top-level UI. In this branch, `apps/github.io/src/app/app.tsx:1` imports `Theme`, `apps/github.io/src/app/app.tsx:2` imports `neutralTheme`, and `apps/github.io/src/app/app.tsx:29` wraps the shell with `<Theme theme={neutralTheme}>`.

Finish the scaffold by running all dependency and project checks:

```bash
corepack pnpm peers check
NX_DAEMON=false corepack pnpm nx build github.io
NX_DAEMON=false corepack pnpm nx lint github.io
NX_DAEMON=false corepack pnpm nx test github.io
```

In this environment, Nx plugin workers may fail inside the sandbox. If that happens, rerun the same Nx command with approval instead of changing project configuration to work around the sandbox.

## Why This Matters

The generator can leave the repo in a state where build and test pass while `pnpm peers check` still fails. That happened here until React was aligned with Astryx and `@swc/core` was upgraded to satisfy the generated SWC tooling. Treating peer checks as part of the scaffold prevents a newly generated app from carrying dependency debt into later work.

Approving only named build-script packages also keeps pnpm's supply-chain guardrails intact. The repo documents exactly which generated dependencies are allowed to run install scripts, rather than relying on an interactive local prompt.

## When to Apply

- Adding a new app under `apps/` in this monorepo.
- Adding Astryx to an Nx-generated React app.
- Seeing pnpm errors about ignored builds or unexpected peer dependency failures after generator output.
- Seeing sandbox-only Nx failures such as plugin-worker startup errors while the same command is otherwise valid for the repo.

## Examples

Before peer alignment, the scaffold can have passing app checks but a red peer check:

```text
@astryxdesign/core requires React >=19
@swc-node/core requires @swc/core >=1.13.3
```

The durable fix is to align the dependency graph, not to ignore the peer report:

```bash
corepack pnpm --store-dir /tmp/pnpm-store/v11 add -Dw @swc/core@^1.13.3
corepack pnpm peers check
```

The resulting app remains generic and scope-limited. `apps/github.io/src/app/app.tsx:4` defines static nav labels, and `apps/github.io/src/app/app.tsx:6` defines placeholder sections rather than real portfolio content.

## Related

- `docs/superpowers/specs/2026-07-12-github-io-app-design.md`
- `docs/superpowers/plans/2026-07-12-github-io-app.md`
