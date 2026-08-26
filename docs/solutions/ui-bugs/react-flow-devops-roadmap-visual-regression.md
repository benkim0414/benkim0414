---
title: React Flow DevOps roadmap visual regression
date: 2026-07-25
last_updated: 2026-08-26
category: ui-bugs
module: apps/github.io devops-roadmap
problem_type: ui_bug
component: tooling
symptoms:
  - React Flow node card widths and connection lines appeared misaligned in the GitHub.io DevOps roadmap
  - Connection gaps varied because timeline positions were based on estimated node heights instead of rendered heights
  - fitView padding created an apparent extra card-shaped space after the final node
  - Zero fit padding cropped final nodes in the static roadmap
  - The optional React Flow background pattern obscured the page surface while the full-width flow wrapper left the single-column roadmap aligned to the left
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
  - full-width
  - storybook
  - worktree
---

# React Flow DevOps roadmap visual regression

## Problem

During browser review, the GitHub.io DevOps roadmap showed visual regressions in its static React Flow timeline because the visible node cards, React Flow node wrappers, and connecting edges did not share one reliable geometry model. Estimated card heights appeared as inconsistent gaps for chip-heavy and certification-heavy nodes, while React Flow `fitView` behavior produced viewport artifacts: padding looked like an extra card-shaped space after the final node, but zero padding could crop final content.

## Symptoms

- Connection lines appeared offset from the visible card center or failed to bridge cleanly between cards because the React Flow wrapper width did not necessarily match the card width.
- Nodes with many skill chips or certification citations had different real heights than the estimated timeline math, so vertical gaps varied as content wrapped.
- The final rendered roadmap could show an apparent empty card-shaped area after the last node when fitted with padding; removing all fit padding avoided that empty space but risked cropping the final nodes.

## What Didn't Work

- Height estimates alone were not robust. The implementation still keeps estimate constants for the initial render in [devops-roadmap.tsx](../../../apps/github.io/src/app/devops-roadmap/devops-roadmap.tsx), but the resolved behavior measures actual rendered node height before finalizing positions.
- Treating `fitView` padding as a layout fix moved the symptom into viewport whitespace. The regression test now asserts that `fitView` and `fitViewOptions.padding` are both absent, and that the native viewport is `0:0:1`, in [devops-roadmap.spec.tsx](../../../apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx).
- Setting fit padding to zero was also insufficient because the roadmap is a static document surface, not an interactive diagram that needs automatic fitting. The component now supplies `defaultViewport={{ x: 0, y: 0, zoom: 1 }}` and disables dragging, panning, and zoom gestures in [devops-roadmap.tsx](../../../apps/github.io/src/app/devops-roadmap/devops-roadmap.tsx).
- Removing the optional React Flow `Background` alone changed the surface treatment but did not center nodes that remain at `x: 0`. Keeping the flow wrapper full width likewise left the single-column graph aligned to the wrapper's inline start.
- Runtime viewport measurement was unnecessary for horizontal centering. The node widths already form a responsive layout contract, so duplicating that calculation in component state would add resize behavior without changing the graph model.

## Solution

Measure rendered node heights, then rebuild the timeline using those actual heights plus a fixed `48px` gap. `NODE_GAP = 48` is defined in [devops-roadmap.tsx](../../../apps/github.io/src/app/devops-roadmap/devops-roadmap.tsx), and the timeline builder advances each node by the current node height plus that gap in [devops-roadmap.tsx](../../../apps/github.io/src/app/devops-roadmap/devops-roadmap.tsx).

```tsx
currentY += getNodeHeight(item) + NODE_GAP;
```

The roadmap starts with estimated positions, queries rendered `.react-flow__node[data-id]` elements, reads `offsetHeight` or `getBoundingClientRect().height`, requires every ordered item to have a measurement, and then calls `buildTimelineElements` with measured heights in [devops-roadmap.tsx](../../../apps/github.io/src/app/devops-roadmap/devops-roadmap.tsx).

Keep measuring current after content changes by running the measurement in a layout effect and observing rendered nodes with `ResizeObserver` in [devops-roadmap.tsx](../../../apps/github.io/src/app/devops-roadmap/devops-roadmap.tsx).

Align the React Flow wrapper width to the visible card width. The current roadmap implementation uses a mobile-first full-width node contract on every viewport. The node component exports `DEVOPS_ROADMAP_NODE_WIDTH = '100%'` in [devops-roadmap-node.tsx](../../../apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx), applies that width to the visible card in [devops-roadmap-node.tsx](../../../apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx), and mirrors it onto `.devops-roadmap__flow .react-flow__node` in [styles.css](../../../apps/github.io/src/styles.css).

Center the outer flow coordinate space with the same width contract instead of translating individual nodes. The StyleX rule in [devops-roadmap.tsx](../../../apps/github.io/src/app/devops-roadmap/devops-roadmap.tsx) applies the exported node width to the flow wrapper together with `marginInline: 'auto'`:

```tsx
flow: (height: number) => ({
  height,
  marginInline: 'auto',
  width: DEVOPS_ROADMAP_NODE_WIDTH,
}),
```

Because every roadmap node remains at `x: 0`, matching wrapper and node widths keeps the complete graph aligned without modifying node coordinates or edge routing. The wrapper keeps its calculated timeline height and React Flow still receives the native viewport and read-only interaction settings in [devops-roadmap.tsx](../../../apps/github.io/src/app/devops-roadmap/devops-roadmap.tsx).

Keep the contract singular while the current implementation uses full-width roadmap nodes across every viewport. Do not preserve a mobile-width export or a roadmap-specific `@media (max-width: 640px)` override for node width; those recreate the old split mental model. The focused roadmap spec asserts the single exported width, checks the scoped global React Flow wrapper CSS against that exported value, and rejects a roadmap-specific mobile wrapper override in [devops-roadmap.spec.tsx](../../../apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx).

Omit the optional React Flow `Background` child when the surrounding Astryx page surface should remain visible. The production component imports only `ReactFlow` from `@xyflow/react` and renders it without children in [devops-roadmap.tsx](../../../apps/github.io/src/app/devops-roadmap/devops-roadmap.tsx).

Render the flow at native viewport scale instead of using React Flow fitting. The component sets `defaultViewport={{ x: 0, y: 0, zoom: 1 }}` and omits `fitView` in [devops-roadmap.tsx](../../../apps/github.io/src/app/devops-roadmap/devops-roadmap.tsx); the test locks that behavior in [devops-roadmap.spec.tsx](../../../apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx).

## Why This Works

The roadmap's connection handles live inside the React Flow node wrapper, so that wrapper must match the visible card geometry. The card renders top and bottom handles in [devops-roadmap-node.tsx](../../../apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx), while global CSS hides them visually without removing their elements in [styles.css](../../../apps/github.io/src/styles.css). Matching wrapper width to card width aligns the handle-bearing wrapper with the visible card.

Actual rendered heights remove the mismatch between calculated rows and browser layout. Once every node has a measured height, the next node starts after the previous measured height plus exactly `48px`; the regression test demonstrates measured heights of `100`, `260`, and `140` producing positions `short:0|tall:148|last:456` and total wrapper height `596px` in [devops-roadmap.spec.tsx](../../../apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx).

Native viewport scale removes viewport padding from the content model. The wrapper's height comes from the timeline calculation and is applied to `.devops-roadmap__flow` in [devops-roadmap.tsx](../../../apps/github.io/src/app/devops-roadmap/devops-roadmap.tsx), so there is no fitted canvas padding that can visually resemble another roadmap card after the last node.

Centering the coordinate space keeps page composition in CSS while leaving React Flow's local geometry unchanged. The wrapper and visible nodes resolve from the same exported full-width contract, logical auto margins divide the remaining inline space, and the node positions stay anchored at `x: 0`. This avoids resize state and keeps the approach compatible with left-to-right and right-to-left inline layout.

The background choice is independently testable. The React Flow test double intentionally retains a mock `Background` export in [devops-roadmap.spec.tsx](../../../apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx), while the read-only roadmap test asserts that no background instance renders. This catches an accidental pattern reintroduction without coupling the test to React Flow's generated DOM.

## Prevention

- Keep tests that protect the geometry contract: wrapper width must mirror the exported card width constant in [devops-roadmap.spec.tsx](../../../apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx), native viewport must stay unfitted in [devops-roadmap.spec.tsx](../../../apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx), and measured placement must use real heights plus the fixed gap in [devops-roadmap.spec.tsx](../../../apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx).
- Keep the `Background` mock and absence assertion so the graph pattern cannot return silently. Also assert that the flow wrapper emits the exported full-width contract while retaining a definite timeline height in [devops-roadmap.spec.tsx](../../../apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx).
- Use real-browser geometry for final centering evidence. JSDOM can inspect the generated StyleX values but does not prove that responsive CSS produces equal rendered margins; Storybook review should confirm full-width roadmap nodes, equal inline alignment with the page banner, and no horizontal overflow. If `agent-browser` has no Chrome binary available, record that limitation instead of claiming automated visual inspection passed.
- When adding roadmap content variants, include tests for content that changes card height. Current coverage includes chip-heavy nodes in [devops-roadmap.spec.tsx](../../../apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx) and certification rows in [devops-roadmap.spec.tsx](../../../apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx).
- Keep the static roadmap locked down as non-interactive React Flow. The readonly behavior is asserted in [devops-roadmap.spec.tsx](../../../apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx), and the component disables node dragging, connecting, focus, panning, and zooming in [devops-roadmap.tsx](../../../apps/github.io/src/app/devops-roadmap/devops-roadmap.tsx).

## Related Issues

- [Astryx StyleX Tailwind Boundaries](../best-practices/astryx-stylex-tailwind-boundaries.md) covers the broader styling-boundary rule for `github.io`, StyleX, Tailwind, and scoped global CSS overrides.
- [Verify Storybook From a Linked Worktree](../workflow-issues/verify-storybook-from-linked-worktree.md) covers the separate dependency-resolution and Tailscale preview workflow used for mobile browser validation.
- [Public Evidence Portfolio Visualizations](../design-patterns/public-evidence-portfolio-visualizations.md) documents the evidence-backed DevOps capability radar and its public portfolio evidence model.
- [Scaffold Nx React Astryx With pnpm](../workflow-issues/scaffold-nx-react-astryx-with-pnpm.md) provides broader Nx, Astryx, and pnpm workflow context relevant to Storybook worktree dependency serving.
- [Atomic Review Fixup Commits](../workflow-issues/atomic-review-fixup-commits.md) is relevant to keeping follow-up review fixes like Storybook allowlist hardening atomic.
