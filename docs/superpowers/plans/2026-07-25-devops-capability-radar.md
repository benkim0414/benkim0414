# DevOps Capability Radar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone `DevOpsCapabilityRadar` React component that visualizes six DevOps capabilities with a MUI X circular radar chart.

**Architecture:** Add a small feature folder under `apps/github.io/src/app/devops-capability-radar/`. Keep chart data separate from rendering, wrap the third-party MUI chart in Astryx/StyleX-aligned local structure, and add tests plus Storybook without wiring the component into the app shell.

**Tech Stack:** React 19, TypeScript, Nx, Vite, Vitest, Testing Library, Storybook, Astryx Design, StyleX, MUI X Charts.

## Global Constraints

- Component name: `DevOpsCapabilityRadar`.
- Target app: `apps/github.io`.
- Component folder: `apps/github.io/src/app/devops-capability-radar/`.
- Do not wire the component into `AppShell`, the visible Skills page, the DevOps roadmap, or any route in this change.
- Use MUI X Charts' `RadarChart` from `@mui/x-charts/RadarChart`.
- Add the MUI X Charts dependency before importing `RadarChart`.
- Install the documented MUI X Charts peer dependencies: `@mui/material`, `@emotion/react`, and `@emotion/styled`.
- Axes: `Automation`, `Delivery`, `Cloud`, `Containers`, `Reliability`, `Security`.
- Scores in axis order: `4, 5, 4, 4, 4, 3`.
- Scale: 1-5.
- Chart grid: `shape="circular"` and `divisions={5}`.
- Series: one filled area with visible marks. Do not set `hideMark`.
- Styling boundary: Astryx components and tokens for local component structure and styling, StyleX for component-specific overrides, Tailwind only for wrapper utilities when useful, and scoped CSS only for third-party chart internals that cannot be controlled through props.
- Use restrained neutral styling with a single radar accent. Do not introduce a dominant purple or one-note palette.
- Do not build a generic reusable radar abstraction.
- Do not replace MUI X Charts with a custom SVG chart.

---

## File Structure

- Modify `package.json`: add MUI X Charts and required peer dependencies.
- Modify `pnpm-lock.yaml`: update via `pnpm add`.
- Create `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.data.ts`: owns labels, max values, scores, series label, and accessible summary generation.
- Create `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.tsx`: renders the standalone `DevOpsCapabilityRadar` component using MUI `RadarChart`, Astryx `VisuallyHidden`, and StyleX.
- Create `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.spec.tsx`: focused component and data tests.
- Create `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.stories.tsx`: Storybook default story.

---

### Task 1: Add MUI X Charts Dependencies

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

**Interfaces:**
- Consumes: existing React 19 app dependencies.
- Produces: installed packages `@mui/x-charts`, `@mui/material`, `@emotion/react`, and `@emotion/styled` for later imports.

- [ ] **Step 1: Confirm the dependency is absent**

Run:

```bash
rg -n '"@mui/x-charts"|"@mui/material"|"@emotion/react"|"@emotion/styled"' package.json pnpm-lock.yaml
```

Expected: no matches for direct dependencies in `package.json`.

- [ ] **Step 2: Install MUI X Charts and peer dependencies**

Run:

```bash
pnpm add @mui/x-charts @mui/material @emotion/react @emotion/styled
```

Expected: `package.json` and `pnpm-lock.yaml` are updated. MUI's current Charts quickstart documents `@mui/x-charts` plus the Material UI peer dependency package set.

- [ ] **Step 3: Verify direct dependencies were added**

Run:

```bash
rg -n '"@mui/x-charts"|"@mui/material"|"@emotion/react"|"@emotion/styled"' package.json
```

Expected: all four packages appear under `dependencies`.

- [ ] **Step 4: Run dependency-level package check**

Run:

```bash
pnpm list @mui/x-charts @mui/material @emotion/react @emotion/styled --depth 0
```

Expected: all four packages resolve from the workspace root.

- [ ] **Step 5: Inspect the dependency diff**

Run:

```bash
git diff -- package.json pnpm-lock.yaml
```

Expected: only the four intended dependency additions and lockfile resolution changes are present.

- [ ] **Step 6: Commit dependency setup**

Run:

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore(github.io): add mui chart dependencies"
```

Expected: commit succeeds.

---

### Task 2: Add Capability Radar Data

**Files:**
- Create: `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.data.ts`
- Create: `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.spec.tsx`

**Interfaces:**
- Consumes: no previous local feature files.
- Produces:
  - `DEVOPS_CAPABILITY_RADAR_LABEL = 'DevOps capability radar'`
  - `DEVOPS_CAPABILITY_RADAR_SERIES_LABEL = 'DevOps capability'`
  - `devOpsCapabilityRadarMetrics: readonly DevOpsCapabilityRadarMetric[]`
  - `devOpsCapabilityRadarScores: readonly number[]`
  - `getDevOpsCapabilityRadarSummary(): string`

- [ ] **Step 1: Create the failing data tests**

Create `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.spec.tsx` with:

```tsx
import {
  DEVOPS_CAPABILITY_RADAR_LABEL,
  DEVOPS_CAPABILITY_RADAR_SERIES_LABEL,
  devOpsCapabilityRadarMetrics,
  devOpsCapabilityRadarScores,
  getDevOpsCapabilityRadarSummary,
} from './devops-capability-radar.data';

describe('devOpsCapabilityRadar data', () => {
  it('uses the approved accessible label and series label', () => {
    expect(DEVOPS_CAPABILITY_RADAR_LABEL).toBe('DevOps capability radar');
    expect(DEVOPS_CAPABILITY_RADAR_SERIES_LABEL).toBe('DevOps capability');
  });

  it('uses the approved capability axes in order', () => {
    expect(devOpsCapabilityRadarMetrics.map((metric) => metric.name)).toEqual([
      'Automation',
      'Delivery',
      'Cloud',
      'Containers',
      'Reliability',
      'Security',
    ]);
  });

  it('uses a 1-5 scale and the approved scores', () => {
    expect(devOpsCapabilityRadarMetrics.map((metric) => metric.min)).toEqual([
      1, 1, 1, 1, 1, 1,
    ]);
    expect(devOpsCapabilityRadarMetrics.map((metric) => metric.max)).toEqual([
      5, 5, 5, 5, 5, 5,
    ]);
    expect(devOpsCapabilityRadarScores).toEqual([4, 5, 4, 4, 4, 3]);
  });

  it('summarizes scores for non-visual chart access', () => {
    expect(getDevOpsCapabilityRadarSummary()).toBe(
      'Automation 4 of 5, Delivery 5 of 5, Cloud 4 of 5, Containers 4 of 5, Reliability 4 of 5, Security 3 of 5.',
    );
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
pnpm nx test github.io -- --run src/app/devops-capability-radar/devops-capability-radar.spec.tsx
```

Expected: FAIL because `devops-capability-radar.data.ts` does not exist.

- [ ] **Step 3: Add the data module**

Create `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.data.ts` with:

```ts
export const DEVOPS_CAPABILITY_RADAR_LABEL = 'DevOps capability radar';
export const DEVOPS_CAPABILITY_RADAR_SERIES_LABEL = 'DevOps capability';

export interface DevOpsCapabilityRadarMetric {
  name: string;
  min: number;
  max: number;
}

export const devOpsCapabilityRadarMetrics = [
  { name: 'Automation', min: 1, max: 5 },
  { name: 'Delivery', min: 1, max: 5 },
  { name: 'Cloud', min: 1, max: 5 },
  { name: 'Containers', min: 1, max: 5 },
  { name: 'Reliability', min: 1, max: 5 },
  { name: 'Security', min: 1, max: 5 },
] as const satisfies readonly DevOpsCapabilityRadarMetric[];

export const devOpsCapabilityRadarScores = [4, 5, 4, 4, 4, 3] as const;

export function getDevOpsCapabilityRadarSummary(): string {
  return devOpsCapabilityRadarMetrics
    .map(
      (metric, index) =>
        `${metric.name} ${devOpsCapabilityRadarScores[index]} of ${metric.max}`,
    )
    .join(', ')
    .concat('.');
}
```

- [ ] **Step 4: Run the data tests**

Run:

```bash
pnpm nx test github.io -- --run src/app/devops-capability-radar/devops-capability-radar.spec.tsx
```

Expected: PASS for the data tests.

- [ ] **Step 5: Commit the data module**

Run:

```bash
git add apps/github.io/src/app/devops-capability-radar/devops-capability-radar.data.ts apps/github.io/src/app/devops-capability-radar/devops-capability-radar.spec.tsx
git commit -m "feat(github.io): add devops capability radar data"
```

Expected: commit succeeds.

---

### Task 3: Implement DevOpsCapabilityRadar

**Files:**
- Modify: `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.spec.tsx`
- Create: `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.tsx`

**Interfaces:**
- Consumes:
  - `DEVOPS_CAPABILITY_RADAR_LABEL`
  - `DEVOPS_CAPABILITY_RADAR_SERIES_LABEL`
  - `devOpsCapabilityRadarMetrics`
  - `devOpsCapabilityRadarScores`
  - `getDevOpsCapabilityRadarSummary()`
- Produces:
  - `export function DevOpsCapabilityRadar(): JSX.Element`

- [ ] **Step 1: Add failing component tests**

Replace `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.spec.tsx` with:

```tsx
import { render, screen } from '@testing-library/react';

import {
  DEVOPS_CAPABILITY_RADAR_LABEL,
  DEVOPS_CAPABILITY_RADAR_SERIES_LABEL,
  devOpsCapabilityRadarMetrics,
  devOpsCapabilityRadarScores,
  getDevOpsCapabilityRadarSummary,
} from './devops-capability-radar.data';
import { DevOpsCapabilityRadar } from './devops-capability-radar';

describe('devOpsCapabilityRadar data', () => {
  it('uses the approved accessible label and series label', () => {
    expect(DEVOPS_CAPABILITY_RADAR_LABEL).toBe('DevOps capability radar');
    expect(DEVOPS_CAPABILITY_RADAR_SERIES_LABEL).toBe('DevOps capability');
  });

  it('uses the approved capability axes in order', () => {
    expect(devOpsCapabilityRadarMetrics.map((metric) => metric.name)).toEqual([
      'Automation',
      'Delivery',
      'Cloud',
      'Containers',
      'Reliability',
      'Security',
    ]);
  });

  it('uses a 1-5 scale and the approved scores', () => {
    expect(devOpsCapabilityRadarMetrics.map((metric) => metric.min)).toEqual([
      1, 1, 1, 1, 1, 1,
    ]);
    expect(devOpsCapabilityRadarMetrics.map((metric) => metric.max)).toEqual([
      5, 5, 5, 5, 5, 5,
    ]);
    expect(devOpsCapabilityRadarScores).toEqual([4, 5, 4, 4, 4, 3]);
  });

  it('summarizes scores for non-visual chart access', () => {
    expect(getDevOpsCapabilityRadarSummary()).toBe(
      'Automation 4 of 5, Delivery 5 of 5, Cloud 4 of 5, Containers 4 of 5, Reliability 4 of 5, Security 3 of 5.',
    );
  });
});

describe('DevOpsCapabilityRadar', () => {
  it('renders a standalone labelled chart region', () => {
    render(<DevOpsCapabilityRadar />);

    expect(
      screen.getByRole('figure', { name: 'DevOps capability radar' }),
    ).toBeTruthy();
    expect(
      screen.getByText('Automation 4 of 5, Delivery 5 of 5, Cloud 4 of 5, Containers 4 of 5, Reliability 4 of 5, Security 3 of 5.'),
    ).toBeTruthy();
  });

  it('renders all six capability axes', () => {
    render(<DevOpsCapabilityRadar />);

    for (const metric of devOpsCapabilityRadarMetrics) {
      expect(screen.getByText(metric.name)).toBeTruthy();
    }
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
pnpm nx test github.io -- --run src/app/devops-capability-radar/devops-capability-radar.spec.tsx
```

Expected: FAIL because `devops-capability-radar.tsx` does not exist.

- [ ] **Step 3: Add the component implementation**

Create `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.tsx` with:

```tsx
import * as stylex from '@stylexjs/stylex';
import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';
import { RadarChart } from '@mui/x-charts/RadarChart';
import {
  borderVars,
  colorVars,
  radiusVars,
  spacingVars,
  typeScaleVars,
} from '@astryxdesign/core/theme/tokens.stylex';

import {
  DEVOPS_CAPABILITY_RADAR_LABEL,
  DEVOPS_CAPABILITY_RADAR_SERIES_LABEL,
  devOpsCapabilityRadarMetrics,
  devOpsCapabilityRadarScores,
  getDevOpsCapabilityRadarSummary,
} from './devops-capability-radar.data';

const CHART_HEIGHT = 360;

const styles = stylex.create({
  root: {
    display: 'grid',
    gap: spacingVars['--spacing-3'],
    width: '100%',
    maxWidth: `calc(${spacingVars['--spacing-12']} * 9)`,
    padding: spacingVars['--spacing-4'],
    color: colorVars['--color-text-primary'],
    backgroundColor: colorVars['--color-background-surface'],
    borderWidth: borderVars['--border-width'],
    borderStyle: 'solid',
    borderColor: colorVars['--color-border'],
    borderRadius: radiusVars['--radius-element'],
  },
  title: {
    margin: 0,
    fontSize: typeScaleVars['--text-heading-3-size'],
    lineHeight: typeScaleVars['--text-heading-3-leading'],
  },
  chartFrame: {
    width: '100%',
    minWidth: 0,
    minHeight: CHART_HEIGHT,
  },
});

export function DevOpsCapabilityRadar(): JSX.Element {
  const summary = getDevOpsCapabilityRadarSummary();

  return (
    <figure
      {...stylex.props(styles.root)}
      aria-labelledby="devops-capability-radar-title"
    >
      <h2 {...stylex.props(styles.title)} id="devops-capability-radar-title">
        {DEVOPS_CAPABILITY_RADAR_LABEL}
      </h2>
      <VisuallyHidden>{summary}</VisuallyHidden>
      <div {...stylex.props(styles.chartFrame)} aria-hidden="true">
        <RadarChart
          colors={[colorVars['--color-text-blue']]}
          divisions={5}
          height={CHART_HEIGHT}
          margin={{ top: 32, right: 56, bottom: 32, left: 56 }}
          radar={{
            metrics: devOpsCapabilityRadarMetrics.map((metric) => ({
              name: metric.name,
              min: metric.min,
              max: metric.max,
            })),
          }}
          series={[
            {
              label: DEVOPS_CAPABILITY_RADAR_SERIES_LABEL,
              data: [...devOpsCapabilityRadarScores],
              fillArea: true,
            },
          ]}
          shape="circular"
          skipAnimation
          slotProps={{ tooltip: { trigger: 'axis' } }}
        />
      </div>
    </figure>
  );
}
```

- [ ] **Step 4: Run the component tests**

Run:

```bash
pnpm nx test github.io -- --run src/app/devops-capability-radar/devops-capability-radar.spec.tsx
```

Expected: PASS. If `colorVars['--color-text-blue']` is not exported by the installed Astryx token file, inspect `apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx` and `node_modules/@astryxdesign/core/theme/tokens.stylex.*`, then replace only the radar accent token with an exported non-purple accent color token.

- [ ] **Step 5: Check TypeScript through build**

Run:

```bash
pnpm nx build github.io
```

Expected: PASS. If MUI's `slotProps.tooltip.trigger` type rejects `'axis'`, remove the `slotProps` prop; the chart still meets the spec because extra tooltip behavior is out of scope.

- [ ] **Step 6: Commit the component**

Run:

```bash
git add apps/github.io/src/app/devops-capability-radar/devops-capability-radar.tsx apps/github.io/src/app/devops-capability-radar/devops-capability-radar.spec.tsx
git commit -m "feat(github.io): add devops capability radar"
```

Expected: commit succeeds.

---

### Task 4: Add Storybook Coverage And Final Verification

**Files:**
- Create: `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.stories.tsx`

**Interfaces:**
- Consumes: `DevOpsCapabilityRadar`.
- Produces: Storybook story `GitHub.io/DevOps Capability Radar`.

- [ ] **Step 1: Add the Storybook story**

Create `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.stories.tsx` with:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';

import { DevOpsCapabilityRadar } from './devops-capability-radar';

const meta: Meta<typeof DevOpsCapabilityRadar> = {
  component: DevOpsCapabilityRadar,
  parameters: {
    layout: 'centered',
  },
  title: 'GitHub.io/DevOps Capability Radar',
};

export default meta;
type Story = StoryObj<typeof DevOpsCapabilityRadar>;

export const Default: Story = {};
```

- [ ] **Step 2: Run focused tests**

Run:

```bash
pnpm nx test github.io -- --run src/app/devops-capability-radar/devops-capability-radar.spec.tsx
```

Expected: PASS.

- [ ] **Step 3: Run full app tests**

Run:

```bash
pnpm nx test github.io
```

Expected: PASS.

- [ ] **Step 4: Run app build**

Run:

```bash
pnpm nx build github.io
```

Expected: PASS.

- [ ] **Step 5: Run Storybook build if available**

Run:

```bash
pnpm nx build-storybook github.io
```

Expected: PASS. If the target is unavailable, run `pnpm nx show project github.io --web` only if local pnpm store access works; otherwise record that Storybook target discovery was blocked by the same pnpm store restriction observed during planning.

- [ ] **Step 6: Inspect the final diff**

Run:

```bash
git diff -- apps/github.io/src/app/devops-capability-radar package.json pnpm-lock.yaml
```

Expected: changes are limited to the standalone radar component, its tests/story, and MUI dependency additions.

- [ ] **Step 7: Commit Storybook coverage**

Run:

```bash
git add apps/github.io/src/app/devops-capability-radar/devops-capability-radar.stories.tsx
git commit -m "test(github.io): add devops capability radar story"
```

Expected: commit succeeds.

---

## Final Review Checklist

- [ ] `DevOpsCapabilityRadar` is not imported by `AppShell`, Skills, or DevOps roadmap files.
- [ ] `RadarChart` is imported from `@mui/x-charts/RadarChart`.
- [ ] Chart props include `shape="circular"` and `divisions={5}`.
- [ ] Series includes `fillArea: true`.
- [ ] Series does not include `hideMark`.
- [ ] Metrics are `Automation`, `Delivery`, `Cloud`, `Containers`, `Reliability`, `Security`.
- [ ] Scores are `[4, 5, 4, 4, 4, 3]`.
- [ ] Accessible summary matches the approved scores.
- [ ] Tests avoid SVG path snapshots and MUI-generated class assertions.
- [ ] Final verification results are recorded in the implementation handoff.
