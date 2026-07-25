---
title: Build Standalone MUI X Radar Charts With Astryx Tokens
date: 2026-07-25
category: design-patterns
module: github.io DevOpsCapabilityRadar
problem_type: design_pattern
component: tooling
severity: medium
applies_when:
  - Embedding a third-party MUI X chart inside the Astryx-styled github.io React app
  - Preserving Astryx design-system tokens while styling chart labels, fills, stripes, and tooltips
  - Keeping radar metrics on a correct 0-5 radial scale with stable Storybook visibility
related_components:
  - github.io Astryx styling
  - MUI X RadarChart
  - Storybook
tags: [github-io, react, mui-x, radar-chart, astryx, storybook, design-system]
---

# Build Standalone MUI X Radar Charts With Astryx Tokens

## Context

The `github.io` DevOps capability radar is a standalone React component, not a card, page, or dashboard panel. The component exports `DevOpsCapabilityRadar` from `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.tsx:43`, while its label, axes, ranges, scores, and non-visual summary live in the adjacent data module at `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.data.ts:1`, `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.data.ts:9`, `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.data.ts:18`, and `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.data.ts:20`.

The useful pattern is the bridge between a third-party generated chart DOM and the Astryx design system. MUI X owns the radar chart geometry, but Astryx tokens still own text, border, surface, and accent color choices. This keeps the chart visually consistent with components such as SkillToken without replacing the chart library's rendering model.

## Guidance

Keep the chart component small and let the data module hold the domain facts. The radar component imports MUI X `RadarChart` and `radarClasses`, wraps the chart in a local MUI `ThemeProvider`, and feeds it normalized metric data from `devops-capability-radar.data.ts` (`apps/github.io/src/app/devops-capability-radar/devops-capability-radar.tsx:2`, `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.tsx:3`, `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.tsx:6`, `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.tsx:47`, and `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.tsx:56`).

Use Astryx token variables as the chart color contract. The component imports `colorVars`, defines radar foreground and background from `--color-text-purple` and `--color-background-purple`, maps MUI tooltip palette values to Astryx surface, border, and primary text tokens, and then uses scoped `sx` selectors for the MUI radar internals (`apps/github.io/src/app/devops-capability-radar/devops-capability-radar.tsx:4`, `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.tsx:14`, `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.tsx:15`, `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.tsx:16`, `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.tsx:28`, and `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.tsx:77`). Axis labels use primary text fill, inherited font, a compact 12px size, medium weight, and zero letter spacing (`apps/github.io/src/app/devops-capability-radar/devops-capability-radar.tsx:79` through `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.tsx:84`). The series area uses the purple background token, while the stroke and marks use the purple text token (`apps/github.io/src/app/devops-capability-radar/devops-capability-radar.tsx:94` through `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.tsx:103`).

Make the chart geometry explicit. The component uses a fixed 360 by 360 viewport, five divisions, circular shape, skipped animation, and explicit margins (`apps/github.io/src/app/devops-capability-radar/devops-capability-radar.tsx:12`, `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.tsx:13`, `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.tsx:53`, `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.tsx:55`, `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.tsx:69`, `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.tsx:70`, and `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.tsx:106`). Each metric also declares `min: 0` and `max: 5`, and the test suite verifies that the Security score of `3` plots at three fifths of the radial scale (`apps/github.io/src/app/devops-capability-radar/devops-capability-radar.data.ts:9` through `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.data.ts:18`, and `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.spec.tsx:86` through `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.spec.tsx:97`).

Treat accessibility as two surfaces. The SVG chart is visual-only with `aria-hidden="true"` and disabled keyboard navigation, while the same data is summarized in an Astryx `VisuallyHidden` node (`apps/github.io/src/app/devops-capability-radar/devops-capability-radar.tsx:1`, `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.tsx:44`, `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.tsx:48`, `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.tsx:50`, and `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.tsx:52`).

## Why This Matters

MUI X chart output is not automatically governed by the Astryx visual contract. The bridge makes the intended contract explicit: primary text for labels and tooltips, Astryx border tokens for the grid, purple background for the filled area, purple text for marks and lines, and declared metric bounds for score geometry. Keeping MUI's geometry while routing visual styling through Astryx tokens gives the chart the same readability contract as the surrounding UI.

The tests protect the meaningful contracts without snapshotting the whole SVG. They assert the approved label, ordered axes, `0` to `5` ranges, scores, and generated summary (`apps/github.io/src/app/devops-capability-radar/devops-capability-radar.spec.tsx:11` through `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.spec.tsx:40`). They also verify that the standalone visual has no wrapper card, no visible title, all six axis labels, a stable `0 0 360 360` viewBox, hidden chart semantics, correct Security mark coordinates, purple token styling, alternating stripe fills, and no tabbable content in the hidden chart (`apps/github.io/src/app/devops-capability-radar/devops-capability-radar.spec.tsx:45` through `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.spec.tsx:144`).

## When to Apply

- A `github.io` React component needs to show a compact capability, maturity, score, or competency radar as the component itself.
- The chart should be reviewable in Storybook without surrounding card chrome or duplicated headings.
- Third-party chart internals need Astryx colors, typography, and contrast while keeping the library's chart geometry.
- The data range is meaningful and should be tested as part of the visual contract.

Do not use this exact pattern when the chart needs keyboard interaction, editable data, drill-down, or visible legends. This implementation deliberately hides the SVG chart from assistive technologies, disables keyboard navigation, skips animation, and renders a single filled series (`apps/github.io/src/app/devops-capability-radar/devops-capability-radar.tsx:50`, `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.tsx:52`, `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.tsx:63`, `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.tsx:66`, and `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.tsx:70`).

## Examples

Keep metric ranges in the data source:

```ts
export const devOpsCapabilityRadarMetrics = [
  { name: 'Automation', min: 0, max: 5 },
  { name: 'Delivery', min: 0, max: 5 },
  { name: 'Cloud', min: 0, max: 5 },
  { name: 'Containers', min: 0, max: 5 },
  { name: 'Reliability', min: 0, max: 5 },
  { name: 'Security', min: 0, max: 5 },
] as const satisfies readonly DevOpsCapabilityRadarMetric[];

export const devOpsCapabilityRadarScores = [4, 5, 4, 4, 4, 3] as const;
```

The current source defines those values in `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.data.ts:9` through `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.data.ts:18`.

Wire MUI X through Astryx tokens at the component boundary:

```tsx
<RadarChart
  aria-hidden="true"
  colors={[RADAR_BACKGROUND]}
  disableKeyboardNavigation
  divisions={5}
  radar={{
    metrics: devOpsCapabilityRadarMetrics.map((metric) => ({
      name: metric.name,
      min: metric.min,
      max: metric.max,
    })),
  }}
  series={[{ data: [...devOpsCapabilityRadarScores], fillArea: true }]}
  shape="circular"
  skipAnimation
/>
```

The component currently follows that structure at `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.tsx:49` through `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.tsx:70`.

Expose the standalone artifact directly in Storybook. The story points at `DevOpsCapabilityRadar`, centers the canvas, and registers the title as `GitHub.io/DevOps Capability Radar` (`apps/github.io/src/app/devops-capability-radar/devops-capability-radar.stories.tsx:3` through `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.stories.tsx:16`).

## Related

- `docs/solutions/best-practices/astryx-stylex-tailwind-boundaries.md` covers the broader Astryx, StyleX, Tailwind, and third-party styling boundary this chart applies.
- `docs/solutions/workflow-issues/scaffold-nx-react-astryx-with-pnpm.md` covers the broader Nx React and Astryx setup context.
- `docs/solutions/workflow-issues/atomic-review-fixup-commits.md` covers the review habit of landing small fixup commits after visual or Storybook feedback.
