---
title: DevOps Capability Evidence Radar iPad Label Clipping
date: 2026-07-29
category: ui-bugs
module: devops-capability-evidence
problem_type: ui_bug
component: frontend_stimulus
symptoms:
  - DevOpsCapabilityEvidenceRadar axis labels were clipped in iPad Storybook after axes were ordered by DevOps flow.
  - Longer short labels such as Infrastructure and Observability did not have enough SVG breathing room.
root_cause: config_error
resolution_type: code_fix
severity: medium
tags: [devops-capability-evidence, radar-chart, storybook, ipad, mui-x-charts, label-clipping]
---

# DevOps Capability Evidence Radar iPad Label Clipping

## Problem

During manual iPad Storybook review, `DevOpsCapabilityEvidenceRadar` label placement regressed after the radar axes were ordered by DevOps flow. The visible problem was that long axis labels near the horizontal edges, notably `Observability` and `Infrastructure`, were clipped by the MUI X `RadarChart` SVG bounds.

The component passes score labels directly into `radar.metrics` as axis names in `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.tsx:60`. Storybook exposes the component in a centered layout and keeps a narrow viewport story in `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.stories.tsx:12` and `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.stories.tsx:22`.

## Symptoms

- During manual iPad Storybook review, leading characters of edge labels were cut off.
- The chart remained functional, but the clipped labels made the capability axes look broken.
- Unit tests did not catch the visual clipping because they assert rendered labels, accessible summary, empty states, zero-score filtering, and visual-only semantics, not SVG label bounds or viewport screenshots in `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.spec.tsx:8`.

## What Didn't Work

A margin-only fix would reserve label space, but it also consumes plot area. During this session, that tradeoff showed up in manual visual review: the labels became readable while the radar itself became too small to scan comfortably.

That failure mode matters because MUI X radar labels live inside the chart SVG. Side margins reserve label space, but they also reduce the drawable plot box.

## Solution

Use plot-first sizing: widen and heighten the chart enough that label margins do not cannibalize the radar plot, while keeping a responsive lower bound for smaller screens.

The current component defines a `620px` max width, `320px` min width, and `520px` chart height in `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.tsx:11`. Its wrapper applies those bounds with `width: '100%'` in `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.tsx:46`, and the `RadarChart` uses balanced margins of `top/right/bottom/left = 48/92/48/92` in `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.tsx:59`.

```tsx
const CHART_MAX_WIDTH = 620;
const CHART_MIN_WIDTH = 320;
const CHART_HEIGHT = 520;

<div style={{ maxWidth: CHART_MAX_WIDTH, minWidth: CHART_MIN_WIDTH, width: '100%' }}>
  <RadarChart
    height={CHART_HEIGHT}
    margin={{ top: 48, right: 92, bottom: 48, left: 92 }}
  />
</div>
```

## Why This Works

MUI X radar axis labels are drawn inside the chart SVG, so available label space is controlled by both the outer chart dimensions and the internal margins. Margins alone reserve label breathing room but reduce the plot radius. Widening and heightening the chart first, then using moderate margins, is the intended way to keep the plot recognizable while giving edge labels enough room to render inside the SVG viewport.

The durable rule is not "add more left/right margin"; it is "size the chart for the plot, then reserve label margin."

## Prevention

- Treat radar and polar chart labels as part of the chart sizing contract, not as text that can overflow naturally outside the SVG.
- Check Storybook on tablet and narrow viewports when axis ordering, labels, chart width, or chart margins change.
- Keep long labels in representative test and story data. The radar test includes `Infrastructure` and `Observability` in `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.spec.tsx:23`, and the story uses curated production-like scores in `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.stories.tsx:9`.
- When adjusting MUI X `RadarChart` margins, compare both label visibility and radar plot size; margin-only fixes can pass a clipping check while degrading chart readability.

## Related Issues

- [Public evidence portfolio visualizations](../design-patterns/public-evidence-portfolio-visualizations.md) documents the broader DevOps Capability Evidence visualization surface.
- [React Flow DevOps roadmap visual regression](react-flow-devops-roadmap-visual-regression.md) captures a related lesson: visualization geometry needs realistic viewport checks, not only DOM assertions.
- [Standalone GitHub.io DevOps capability radar](../design-patterns/standalone-github-io-devops-capability-radar.md) is historical background for the superseded standalone radar surface.
