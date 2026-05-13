## Why

The `github.io` app already has shadcn/ui configured, but future design work needs a clear boundary for how to reuse those app-local primitives without turning every control into a custom component. This change keeps UI implementation consistent with shadcn while avoiding new component generation unless it is explicitly requested later.

## What Changes

- Define the rule that existing app-local shadcn components should be used wherever they fit the interaction.
- Keep non-existing shadcn primitives out of scope: do not create, generate, or vendor new shadcn components in this change.
- Preserve semantic HTML for controls and surfaces that do not already have app-local shadcn components.
- Keep search behavior, theme behavior, skill data, and deployment out of scope.

## Capabilities

### New Capabilities

- `github-io-shadcn-usage`: Covers how the `github.io` app uses existing shadcn/ui primitives and semantic HTML without adding new component files.

### Modified Capabilities

None.

## Impact

- Affects `apps/github.io` UI composition patterns and future implementation tasks.
- Does not add package dependencies, shadcn registry output, or generated component files.
- Implementation must still follow the repository worktree, selective staging, Nx, and OpenSpec validation workflow.
