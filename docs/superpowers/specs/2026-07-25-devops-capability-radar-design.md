# DevOps Capability Radar Design

## Goal

Create a standalone `DevOpsCapabilityRadar` React component for `apps/github.io` that visualizes the six recommended DevOps engineer capabilities as a radar chart.

The component should use MUI X Charts' `RadarChart` and follow the existing Astryx styling boundary: Astryx components and tokens for local component structure and styling, StyleX for component-specific overrides, Tailwind only for wrapper utilities when useful, and scoped CSS only for third-party chart internals that cannot be controlled through props.

## Context

The `github.io` app is an Nx React/Vite app using React 19, Astryx Design, StyleX, Tailwind v4, Vitest, Testing Library, and Storybook. Existing app UI work keeps Astryx as the design-system layer and avoids broad global CSS for component visuals.

`@mui/x-charts` is not currently listed in `package.json`. Implementation must add the dependency before importing `RadarChart` from `@mui/x-charts/RadarChart`.

The MUI X Radar documentation supports the required chart behavior:

- `shape="circular"` for a circular grid.
- `divisions={5}` for five grid divisions.
- `fillArea` on the radar series to fill the area.
- marks are visible by default when `hideMark` is not set.
- `radar.metrics` defines one axis per capability.

## Component

Add a feature folder:

```text
apps/github.io/src/app/devops-capability-radar/
```

Files:

- `devops-capability-radar.data.ts`
- `devops-capability-radar.tsx`
- `devops-capability-radar.spec.tsx`
- `devops-capability-radar.stories.tsx`

The component name is `DevOpsCapabilityRadar`.

The component should be standalone. Do not wire it into `AppShell`, the visible Skills page, the DevOps roadmap, or any route in this change.

## Data Model

Use one-word capability labels:

1. `Automation`
2. `Delivery`
3. `Cloud`
4. `Containers`
5. `Reliability`
6. `Security`

Use the approved scores in axis order:

```ts
export const devOpsCapabilityRadarMetrics = [
  { name: 'Automation', max: 5 },
  { name: 'Delivery', max: 5 },
  { name: 'Cloud', max: 5 },
  { name: 'Containers', max: 5 },
  { name: 'Reliability', max: 5 },
  { name: 'Security', max: 5 },
] as const;

export const devOpsCapabilityRadarScores = [4, 5, 4, 4, 4, 3] as const;
```

Keep the data separate from the component so tests and future consumers can validate labels and scores without coupling to MUI's SVG output.

## Visual Design

The chart should render as a compact, professional capability profile rather than a marketing card.

Use:

- circular radar shape
- five divisions
- one series
- filled area
- visible marks
- a 1-5 scale
- fixed responsive dimensions so the SVG chart does not resize surrounding layout unexpectedly

The wrapper should use Astryx tokens through StyleX for:

- text color
- surface/background only if a framed surface is needed
- spacing
- border/radius only if the chart is placed inside a standalone framed component
- typography

Prefer restrained neutral styling with a single accent for the radar series. Do not introduce a dominant purple or one-note palette. Do not create a custom SVG chart.

MUI should own chart internals. If chart-specific styling is required, prefer MUI chart props and documented slots/classes first. Use scoped global CSS only for internals that are not reachable through component props.

## Accessibility

Render the component inside a labelled section or figure with accessible name `DevOps capability radar`.

Expose nearby text or hidden text summarizing the scores:

`Automation 4 of 5, Delivery 5 of 5, Cloud 4 of 5, Containers 4 of 5, Reliability 4 of 5, Security 3 of 5.`

This makes the chart understandable if the generated SVG paths are not meaningful to assistive technology.

## Testing

Add focused Vitest and Testing Library coverage:

- renders a standalone region or figure named `DevOps capability radar`
- renders all six capability labels
- verifies the approved scores through exported data or stable accessible text
- avoids brittle assertions on generated SVG paths or MUI class names

Add a Storybook story for visual review:

- default story with approved labels and scores
- no app-shell integration required

## Out Of Scope

- integrating the component into `AppShell`
- changing the existing Skills page
- changing the DevOps roadmap
- building a generic reusable radar abstraction
- replacing MUI X Charts with a custom SVG implementation
- adding interactions beyond MUI's default tooltip/highlight behavior
- changing Astryx theme files or global app theme setup

## Validation

Implementation should run the focused project checks that are available locally:

- `pnpm nx test github.io`
- `pnpm nx build github.io`
- Storybook verification where feasible

If `pnpm nx show projects` or other pnpm commands fail because sandbox policy blocks pnpm store access or non-GitHub network access, document that limitation and rely on local project files for project discovery.
