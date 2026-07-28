---
title: React Flow DevOps roadmap visual regression
date: 2026-07-25
category: ui-bugs
module: apps/github.io devops-roadmap
problem_type: ui_bug
component: tooling
symptoms:
  - React Flow node card widths and connection lines appeared misaligned in the GitHub.io DevOps roadmap
  - Connection gaps varied because timeline positions were based on estimated node heights instead of rendered heights
  - fitView padding created an apparent extra card-shaped space after the final node
  - Zero fit padding cropped final nodes in the static roadmap
root_cause: logic_error
resolution_type: code_fix
severity: medium
related_components:
  - testing_framework
  - development_workflow
  - tooling
tags:
  - github-io
  - devops-roadmap
  - react-flow
  - visual-regression
  - storybook
  - worktree
---

# React Flow DevOps roadmap visual regression

## Problem

The GitHub.io DevOps roadmap used React Flow for a static vertical roadmap, but the visible node cards, React Flow node wrappers, and connecting edges did not share one reliable geometry model. Estimated card heights made gaps inconsistent for chip-heavy and certification-heavy nodes, while React Flow `fitView` behavior introduced viewport artifacts: padding looked like an extra card-shaped space after the final node, but zero padding could crop final content.

## Symptoms

- Connection lines appeared offset from the visible card center or failed to bridge cleanly between cards because the React Flow wrapper width did not necessarily match the card width.
- Nodes with many skill chips or certification citations had different real heights than the estimated timeline math, so vertical gaps varied as content wrapped.
- The final rendered roadmap could show an apparent empty card-shaped area after the last node when fitted with padding; removing all fit padding avoided that empty space but risked cropping the final nodes.

## What Didn't Work

- Height estimates alone were not robust. The implementation still keeps estimate constants for the initial render and fallback in [devops-roadmap.tsx](../../../apps/github.io/src/app/devops-roadmap/devops-roadmap.tsx) at line 12, but the resolved behavior measures actual rendered node height before finalizing positions.
- Treating `fitView` padding as a layout fix moved the symptom into viewport whitespace. The regression test now asserts that `fitView` and `fitViewOptions.padding` are both absent, and that the native viewport is `0:0:1`, in [devops-roadmap.spec.tsx](../../../apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx) at line 376.
- Setting fit padding to zero was also insufficient because the roadmap is a static document surface, not an interactive diagram that needs automatic fitting. The component now supplies `defaultViewport={{ x: 0, y: 0, zoom: 1 }}` and disables dragging, panning, and zoom gestures in [devops-roadmap.tsx](../../../apps/github.io/src/app/devops-roadmap/devops-roadmap.tsx) at line 218.

## Solution

Measure rendered node heights, then rebuild the timeline using those actual heights plus a fixed `48px` gap. `NODE_GAP = 48` is defined in [devops-roadmap.tsx](../../../apps/github.io/src/app/devops-roadmap/devops-roadmap.tsx) at line 13, and the timeline builder advances each node by the current node height plus that gap in [devops-roadmap.tsx](../../../apps/github.io/src/app/devops-roadmap/devops-roadmap.tsx) at line 55.

```tsx
currentY += getNodeHeight(item) + NODE_GAP;
```

The roadmap starts with estimated positions, queries rendered `.react-flow__node[data-id]` elements, reads `offsetHeight` or `getBoundingClientRect().height`, requires every ordered item to have a measurement, and then calls `buildTimelineElements` with measured heights in [devops-roadmap.tsx](../../../apps/github.io/src/app/devops-roadmap/devops-roadmap.tsx) at line 143.

Keep measuring current after content changes by running the measurement in a layout effect and observing rendered nodes with `ResizeObserver` in [devops-roadmap.tsx](../../../apps/github.io/src/app/devops-roadmap/devops-roadmap.tsx) at line 183.

Align the React Flow wrapper width to the visible card width. The node component exports `DEVOPS_ROADMAP_NODE_WIDTH = 'min(100%, 320px)'` and `DEVOPS_ROADMAP_NODE_MOBILE_WIDTH = 'min(100%, 280px)'` in [devops-roadmap-node.tsx](../../../apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx) at line 20, applies those widths to the visible card in [devops-roadmap-node.tsx](../../../apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx) at line 23, and mirrors them onto `.devops-roadmap__flow .react-flow__node` in [styles.css](../../../apps/github.io/src/styles.css) at line 34.

Render the flow at native viewport scale instead of using React Flow fitting. The component sets `defaultViewport={{ x: 0, y: 0, zoom: 1 }}` and omits `fitView` in [devops-roadmap.tsx](../../../apps/github.io/src/app/devops-roadmap/devops-roadmap.tsx) at line 218; the test locks that behavior in [devops-roadmap.spec.tsx](../../../apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx) at line 376.

Harden Storybook in linked worktrees without broad filesystem exposure. Storybook computes the workspace root from `apps/github.io/.storybook/main.ts`, detects when the current path is inside `.worktrees`, and adds only the parent dependency root when present in [main.ts](../../../apps/github.io/.storybook/main.ts) at line 6 and [main.ts](../../../apps/github.io/.storybook/main.ts) at line 47. Vite's filesystem allowlist is built from the existing allow entries, the workspace root, and that optional linked-worktree dependency root in [main.ts](../../../apps/github.io/.storybook/main.ts) at line 22.

## Why This Works

React Flow positions edges from its node wrappers, so wrapper geometry must match visible card geometry. The card renders hidden top and bottom handles in [devops-roadmap-node.tsx](../../../apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx) at line 64, while global CSS hides those handles from view without disabling layout participation in [styles.css](../../../apps/github.io/src/styles.css) at line 29. Matching wrapper width to card width keeps those handles and edges centered on the same visible object.

Actual rendered heights remove the mismatch between calculated rows and browser layout. Once every node has a measured height, the next node starts after the previous measured height plus exactly `48px`; the regression test demonstrates measured heights of `100`, `260`, and `140` producing positions `short:0|tall:148|last:456` and total wrapper height `596px` in [devops-roadmap.spec.tsx](../../../apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx) at line 495.

Native viewport scale removes viewport padding from the content model. The wrapper's height comes from the timeline calculation and is applied to `.devops-roadmap__flow` in [devops-roadmap.tsx](../../../apps/github.io/src/app/devops-roadmap/devops-roadmap.tsx) at line 207, so there is no fitted canvas padding that can visually resemble another roadmap card after the last node.

## Prevention

- Keep tests that protect the geometry contract: wrapper width must mirror exported card width constants in [devops-roadmap.spec.tsx](../../../apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx) at line 227, native viewport must stay unfitted in [devops-roadmap.spec.tsx](../../../apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx) at line 376, and measured placement must use real heights plus the fixed gap in [devops-roadmap.spec.tsx](../../../apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx) at line 495.
- When adding roadmap content variants, include tests for content that changes card height. Current coverage includes chip-heavy nodes in [devops-roadmap.spec.tsx](../../../apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx) at line 416 and certification rows in [devops-roadmap.spec.tsx](../../../apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx) at line 449.
- Keep the static roadmap locked down as non-interactive React Flow. The readonly behavior is asserted in [devops-roadmap.spec.tsx](../../../apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx) at line 334, and the component disables node dragging, connecting, focus, panning, and zooming in [devops-roadmap.tsx](../../../apps/github.io/src/app/devops-roadmap/devops-roadmap.tsx) at line 218.
- For Storybook worktree support, only allow the exact roots needed for dependency resolution. The current config preserves existing `server.fs.allow` entries, adds `workspaceRoot`, and conditionally adds the linked worktree dependency root rather than opening an arbitrary parent tree in [main.ts](../../../apps/github.io/.storybook/main.ts) at line 22.

## Related Issues

- [Astryx StyleX Tailwind Boundaries](../best-practices/astryx-stylex-tailwind-boundaries.md) covers the broader styling-boundary rule for `github.io`, StyleX, Tailwind, and scoped global CSS overrides.
- [Public Evidence Portfolio Visualizations](../design-patterns/public-evidence-portfolio-visualizations.md) documents the evidence-backed DevOps capability radar and its public portfolio evidence model.
- [Scaffold Nx React Astryx With pnpm](../workflow-issues/scaffold-nx-react-astryx-with-pnpm.md) provides broader Nx, Astryx, and pnpm workflow context relevant to Storybook worktree dependency serving.
- [Atomic Review Fixup Commits](../workflow-issues/atomic-review-fixup-commits.md) is relevant to keeping follow-up review fixes like Storybook allowlist hardening atomic.
