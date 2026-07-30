---
title: Verify Storybook From Linked Worktrees
date: 2026-07-30
category: workflow-issues
module: apps/github.io
problem_type: workflow_issue
component: development_workflow
severity: medium
applies_when:
  - "Verifying github.io changes from a linked git worktree"
  - "Worktree-local pnpm or Nx commands fail before their runner starts"
  - "Serving Storybook from a linked worktree for Tailscale device review"
symptoms:
  - "Worktree-local pnpm commands fail with ERR_SQLITE_ERROR before Vitest or Nx starts"
  - "Storybook resolves vite.config.ts from the wrong launch context"
  - "pnpm exec storybook from apps/github.io reports no package found in the workspace"
root_cause: incomplete_setup
resolution_type: workflow_improvement
tags: [github-io, linked-worktree, pnpm, storybook, vitest, vite, tailscale]
---

# Verify Storybook From Linked Worktrees

## Context

The `github.io` app is an Nx project defined at `apps/github.io/project.json:2`, but the project file currently declares no Nx targets at `apps/github.io/project.json:8`. Verification therefore depends on repo-level installed binaries and direct Vite or Vitest entrypoints rather than project-local package commands.

Linked worktrees keep feature source isolated, but their dependency setup can differ from the main checkout. When a worktree-local `pnpm nx ...` command tries to inspect dependency state or install metadata before Nx starts, it can fail before reaching the test or build runner. In this environment, that surfaced as `ERR_SQLITE_ERROR` from pnpm's external store.

Storybook has a different launch constraint. The app Storybook config explicitly points to `vite.config.ts` at `apps/github.io/.storybook/main.ts:18`, so the current directory controls which Vite config Storybook resolves. Starting Storybook from the main checkout while passing the worktree config can accidentally bind the wrong source context. Starting it from the worktree app directory keeps the stories, source files, and Vite config aligned.

## Guidance

When a worktree lacks or cannot use its own dependency install, run non-interactive test and build checks from a dependency-bearing checkout, but point them at the linked worktree's config and files:

```bash
ROOT=/home/benkim0414/workspace/benkim0414
WORKTREE="$ROOT/.worktrees/<branch-slug>"

cd "$ROOT"
pnpm exec vitest run --config "$WORKTREE/apps/github.io/vite.config.ts" \
  "$WORKTREE/apps/github.io/src/app/<changed-area>/*.spec.ts" \
  "$WORKTREE/apps/github.io/src/app/<changed-area>/*.spec.tsx"
pnpm exec vite build --config "$WORKTREE/apps/github.io/vite.config.ts"
```

Run Storybook from the linked worktree app directory, using the hoisted binary from the worktree root:

```bash
cd "$WORKTREE/apps/github.io"
../../node_modules/.bin/storybook dev --host 0.0.0.0 --port 6006 --no-open --ci
```

For visual review over Tailscale, open the machine's Tailscale IP with the Storybook story path:

```text
http://<tailscale-ip>:6006/?path=/story/<story-id>
```

This branch also required StyleX to keep source transformation active during Vitest while avoiding Vite server-only hooks. `apps/github.io/vite.config.ts:7` creates the StyleX plugin, `apps/github.io/vite.config.ts:9` switches only the StyleX development mode for tests, and `apps/github.io/vite.config.ts:45` keeps the plugin in the Vite plugin list used by tests.

## Why This Matters

The test command must execute the linked worktree's source, not the same paths in the main checkout. The Storybook command must also resolve the worktree's `apps/github.io/vite.config.ts`, otherwise the preview can pass while showing a different branch.

Keeping dependency resolution in the main checkout avoids treating pnpm store access failures as app regressions. Keeping Storybook launch context in the worktree preserves the branch under review and allows another device on Tailscale, such as an iPad, to inspect the exact component stories before handoff.

## When to Apply

- Working from `.worktrees/<branch-slug>` on `apps/github.io`.
- Seeing pnpm or Nx fail before Vite, Vitest, or Storybook starts.
- Needing a local Storybook URL that another device can reach over Tailscale.
- Verifying source files from a linked worktree while sharing the main checkout's installed dependencies.

## Examples

Use the main checkout for direct Vitest and Vite commands:

```bash
cd /home/benkim0414/workspace/benkim0414
pnpm exec vitest run --config "$PWD/.worktrees/dora-capability-card/apps/github.io/vite.config.ts" \
  "$PWD/.worktrees/dora-capability-card/apps/github.io/src/app/devops-capability-evidence/*.spec.ts" \
  "$PWD/.worktrees/dora-capability-card/apps/github.io/src/app/devops-capability-evidence/*.spec.tsx"
pnpm exec vite build --config "$PWD/.worktrees/dora-capability-card/apps/github.io/vite.config.ts"
```

Use the linked worktree app directory for Storybook:

```bash
cd /home/benkim0414/workspace/benkim0414/.worktrees/dora-capability-card/apps/github.io
../../node_modules/.bin/storybook dev --host 0.0.0.0 --port 6006 --no-open --ci
```

## Related

- `docs/solutions/ui-bugs/react-flow-devops-roadmap-visual-regression.md`
- `docs/solutions/workflow-issues/scaffold-nx-react-astryx-with-pnpm.md`
- `docs/solutions/workflow-issues/atomic-review-fixup-commits.md`
- `docs/solutions/best-practices/astryx-stylex-tailwind-boundaries.md`
