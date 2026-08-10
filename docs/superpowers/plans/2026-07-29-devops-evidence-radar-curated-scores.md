# DevOps Evidence Radar Curated Scores Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reimplement `DevOpsCapabilityEvidenceRadar` so its default radar uses the approved 10 shortened DevOps capability labels and curated non-perfect scores.

**Architecture:** Keep `DevOpsCapabilityEvidenceRadar` as a leaf chart that consumes `DoraCapabilityScore[]`. Add a clearly named curated score export beside the existing evidence data, then point the radar story and focused tests at that curated radar data while leaving the existing evidence-derived scoring utilities available for their current tests.

**Tech Stack:** React 19, TypeScript, Nx, Vitest, React Testing Library, Storybook React Vite, MUI X Charts, Astryx tokens, pnpm.

## Global Constraints

- Work in `/home/benkim0414/workspace/benkim0414/.worktrees/refactor-devops-evidence-radar`.
- Keep `DevOpsCapabilityEvidenceRadar` radar-only.
- Do not reintroduce non-radar DevOps capability evidence components.
- Use the 10 selected DevOps technical capability axes.
- Visible radar labels must be shortened labels: `Delivery`, `Deploys`, `CI`, `Tests`, `Observability`, `Infrastructure`, `Security`, `Trunk`, `Docs`, `Versioning`.
- Curated scores must be: Delivery `4`, Deploys `4`, CI `4`, Tests `3`, Observability `3`, Infrastructure `4`, Security `2`, Trunk `4`, Docs `4`, Versioning `4`.
- Every curated score must have `maxScore: 5`.
- No curated score may be `5`.
- Do not add evidence item components.
- Do not tokenize or render the user's evidence sentences.
- Do not derive the curated scores from evidence weights.
- Do not add interactive selectors, popovers, detail panels, badges, page wiring, route wiring, or global theme changes.

---

## File Structure

- `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts`
  - Keep existing `doraCapabilityDefinitions` and `devOpsCapabilityEvidenceItems`.
  - Add `curatedDevOpsCapabilityRadarScores`, a radar-ready `readonly DoraCapabilityScore[]` using short labels and approved scores.
- `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.stories.tsx`
  - Replace the default story score args with `curatedDevOpsCapabilityRadarScores`.
  - Remove story-only imports of derived scoring utilities if no longer used.
- `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.spec.tsx`
  - Update focused radar tests to assert the curated short-label score behavior and keep empty/all-zero/visual-only coverage.
- `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts`
  - Add a data-level guard that the curated score table has exactly the approved 10 scores and no perfect `5`.

## Task 1: Add Curated Radar Score Data

**Files:**
- Modify: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts`
- Modify: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts`

**Interfaces:**
- Consumes:
  - `DoraCapabilityScore` from `./devops-capability-evidence.types`
  - existing `doraCapabilityDefinitions`
- Produces:
  - `curatedDevOpsCapabilityRadarScores: readonly DoraCapabilityScore[]`

- [ ] **Step 1: Add the failing data test**

In `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts`, update the import block to include `curatedDevOpsCapabilityRadarScores`:

```ts
import {
  curatedDevOpsCapabilityRadarScores,
  doraCapabilityDefinitions,
  evidenceTypeLabels,
  devOpsCapabilityEvidenceItems,
} from './devops-capability-evidence.data';
```

Then add this test inside `describe('devOpsCapabilityEvidence data', () => { ... })`, after the capability definitions order test:

```ts
  it('defines approved curated radar scores with shortened labels', () => {
    expect(
      curatedDevOpsCapabilityRadarScores.map((score) => ({
        capabilityKey: score.capabilityKey,
        label: score.label,
        score: score.score,
        maxScore: score.maxScore,
      })),
    ).toEqual([
      {
        capabilityKey: 'continuous-delivery',
        label: 'Delivery',
        score: 4,
        maxScore: 5,
      },
      {
        capabilityKey: 'deployment-automation',
        label: 'Deploys',
        score: 4,
        maxScore: 5,
      },
      {
        capabilityKey: 'continuous-integration',
        label: 'CI',
        score: 4,
        maxScore: 5,
      },
      {
        capabilityKey: 'test-automation',
        label: 'Tests',
        score: 3,
        maxScore: 5,
      },
      {
        capabilityKey: 'monitoring-observability',
        label: 'Observability',
        score: 3,
        maxScore: 5,
      },
      {
        capabilityKey: 'flexible-infrastructure',
        label: 'Infrastructure',
        score: 4,
        maxScore: 5,
      },
      {
        capabilityKey: 'pervasive-security',
        label: 'Security',
        score: 2,
        maxScore: 5,
      },
      {
        capabilityKey: 'trunk-based-development',
        label: 'Trunk',
        score: 4,
        maxScore: 5,
      },
      {
        capabilityKey: 'documentation-quality',
        label: 'Docs',
        score: 4,
        maxScore: 5,
      },
      {
        capabilityKey: 'version-control',
        label: 'Versioning',
        score: 4,
        maxScore: 5,
      },
    ]);

    expect(curatedDevOpsCapabilityRadarScores).toHaveLength(
      doraCapabilityDefinitions.length,
    );
    expect(
      curatedDevOpsCapabilityRadarScores.some((score) => score.score === 5),
    ).toBe(false);
  });
```

- [ ] **Step 2: Run the focused data test and verify it fails**

Run:

```bash
pnpm nx test github.io -- --run src/app/devops-capability-evidence/devops-capability-evidence.spec.ts
```

Expected: FAIL because `curatedDevOpsCapabilityRadarScores` is not exported yet.

- [ ] **Step 3: Add the curated score export**

In `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts`, update the type import to include `DoraCapabilityScore`:

```ts
import type {
  CapabilityEvidenceItem,
  DoraCapabilityDefinition,
  DoraCapabilityScore,
  EvidenceType,
} from './devops-capability-evidence.types';
```

Add this export immediately after `doraCapabilityDefinitions`:

```ts
export const curatedDevOpsCapabilityRadarScores = [
  {
    capabilityKey: 'continuous-delivery',
    label: 'Delivery',
    score: 4,
    maxScore: 5,
    evidenceIds: [],
    evidenceCounts: {},
  },
  {
    capabilityKey: 'deployment-automation',
    label: 'Deploys',
    score: 4,
    maxScore: 5,
    evidenceIds: [],
    evidenceCounts: {},
  },
  {
    capabilityKey: 'continuous-integration',
    label: 'CI',
    score: 4,
    maxScore: 5,
    evidenceIds: [],
    evidenceCounts: {},
  },
  {
    capabilityKey: 'test-automation',
    label: 'Tests',
    score: 3,
    maxScore: 5,
    evidenceIds: [],
    evidenceCounts: {},
  },
  {
    capabilityKey: 'monitoring-observability',
    label: 'Observability',
    score: 3,
    maxScore: 5,
    evidenceIds: [],
    evidenceCounts: {},
  },
  {
    capabilityKey: 'flexible-infrastructure',
    label: 'Infrastructure',
    score: 4,
    maxScore: 5,
    evidenceIds: [],
    evidenceCounts: {},
  },
  {
    capabilityKey: 'pervasive-security',
    label: 'Security',
    score: 2,
    maxScore: 5,
    evidenceIds: [],
    evidenceCounts: {},
  },
  {
    capabilityKey: 'trunk-based-development',
    label: 'Trunk',
    score: 4,
    maxScore: 5,
    evidenceIds: [],
    evidenceCounts: {},
  },
  {
    capabilityKey: 'documentation-quality',
    label: 'Docs',
    score: 4,
    maxScore: 5,
    evidenceIds: [],
    evidenceCounts: {},
  },
  {
    capabilityKey: 'version-control',
    label: 'Versioning',
    score: 4,
    maxScore: 5,
    evidenceIds: [],
    evidenceCounts: {},
  },
] as const satisfies readonly DoraCapabilityScore[];
```

Use empty `evidenceIds` and `evidenceCounts` because this pass intentionally does not render evidence item components or derive score values from evidence weights.

- [ ] **Step 4: Run the focused data test and verify it passes**

Run:

```bash
pnpm nx test github.io -- --run src/app/devops-capability-evidence/devops-capability-evidence.spec.ts
```

Expected: PASS.

- [ ] **Step 5: Inspect and commit Task 1**

Inspect:

```bash
git diff -- apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts
git status --short
```

Stage explicit paths only:

```bash
git add apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts
git add apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts
git diff --cached
git commit -m "feat(github.io): add curated evidence radar scores"
```

## Task 2: Point Radar Story And Tests At Curated Short Labels

**Files:**
- Modify: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.stories.tsx`
- Modify: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.spec.tsx`

**Interfaces:**
- Consumes:
  - `curatedDevOpsCapabilityRadarScores: readonly DoraCapabilityScore[]`
  - `DevOpsCapabilityEvidenceRadar({ scores }: DevOpsCapabilityEvidenceRadarProps)`
- Produces:
  - Default Storybook story showing all 10 curated axes
  - Focused radar tests for short labels, no perfect score, visual-only semantics, and null rendering

- [ ] **Step 1: Update the radar test import**

In `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.spec.tsx`, replace the current data/scoring imports:

```ts
import {
  devOpsCapabilityEvidenceItems,
  doraCapabilityDefinitions,
} from './devops-capability-evidence.data';
import { getCapabilityEvidenceScores } from './devops-capability-evidence.scoring';
```

with:

```ts
import { curatedDevOpsCapabilityRadarScores } from './devops-capability-evidence.data';
```

- [ ] **Step 2: Replace the first radar test with curated-axis coverage**

Replace the first `it(...)` block in `devops-capability-evidence-radar.spec.tsx` with:

```ts
  it('renders curated DevOps capability axes as a visual-only chart with an accessible summary', () => {
    const { container } = render(
      <DevOpsCapabilityEvidenceRadar
        scores={curatedDevOpsCapabilityRadarScores}
      />,
    );

    for (const label of [
      'Delivery',
      'Deploys',
      'CI',
      'Tests',
      'Observability',
      'Infrastructure',
      'Security',
      'Trunk',
      'Docs',
      'Versioning',
    ]) {
      expect(screen.getByText(label)).toBeTruthy();
    }

    expect(screen.queryByText('Continuous Delivery')).toBeNull();
    expect(screen.queryByText('Deployment Automation')).toBeNull();
    expect(screen.queryByText('Pervasive Security')).toBeNull();
    expect(
      screen.getByText(
        /Delivery 4 of 5, Deploys 4 of 5, CI 4 of 5, Tests 3 of 5, Observability 3 of 5, Infrastructure 4 of 5, Security 2 of 5, Trunk 4 of 5, Docs 4 of 5, Versioning 4 of 5/,
      ),
    ).toBeTruthy();
    expect(
      curatedDevOpsCapabilityRadarScores.some((score) => score.score === 5),
    ).toBe(false);

    const chart = container.querySelector('[aria-hidden="true"]');

    expect(chart).toBeTruthy();
    expect(chart?.querySelectorAll('[tabindex]').length).toBe(0);
  });
```

- [ ] **Step 3: Keep null and zero filtering tests, but use short labels in caller-provided mixed score test**

In the existing `filters zero-value caller-provided scores before building radar axes` test, change the first score's `label` from `Continuous Delivery` to `Delivery`, and update the assertions:

```ts
    expect(screen.getByText('Delivery')).toBeTruthy();
    expect(screen.queryByText('Security')).toBeNull();
    expect(screen.getByText(/Delivery 3 of 5/)).toBeTruthy();
```

Also change the zero score fixture label from `Pervasive Security` to `Security` so it matches the short-label contract:

```ts
      {
        capabilityKey: 'pervasive-security',
        label: 'Security',
        score: 0,
        maxScore: 5,
        evidenceIds: [],
        evidenceCounts: {},
      },
```

- [ ] **Step 4: Run the focused radar test and verify it fails before story update if needed**

Run:

```bash
pnpm nx test github.io -- --run src/app/devops-capability-evidence/devops-capability-evidence-radar.spec.tsx
```

Expected after only test edits: PASS if Task 1 is complete and the component already supports caller-provided labels. If it fails because labels are not rendered as expected, inspect the MUI chart output before changing implementation.

- [ ] **Step 5: Update the default Storybook story to use curated scores**

In `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.stories.tsx`, replace:

```ts
import {
  devOpsCapabilityEvidenceItems,
  doraCapabilityDefinitions,
} from './devops-capability-evidence.data';
import { getCapabilityEvidenceScores } from './devops-capability-evidence.scoring';
```

with:

```ts
import { curatedDevOpsCapabilityRadarScores } from './devops-capability-evidence.data';
```

Replace the `args` block:

```ts
  args: {
    scores: getCapabilityEvidenceScores(
      devOpsCapabilityEvidenceItems,
      doraCapabilityDefinitions,
    ),
  },
```

with:

```ts
  args: {
    scores: curatedDevOpsCapabilityRadarScores,
  },
```

- [ ] **Step 6: Run focused validation**

Run:

```bash
pnpm nx test github.io -- --run src/app/devops-capability-evidence/devops-capability-evidence-radar.spec.tsx
pnpm nx test github.io -- --run src/app/devops-capability-evidence/devops-capability-evidence.spec.ts
```

Expected: both commands PASS.

- [ ] **Step 7: Inspect Storybook story inventory**

Run:

```bash
rg "title:" apps/github.io/src/app/devops-capability-evidence -g '*.stories.tsx' -n
rg "curatedDevOpsCapabilityRadarScores|getCapabilityEvidenceScores" apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.stories.tsx -n
```

Expected:

```text
apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.stories.tsx:...:  title: 'GitHub.io/DevOps Capability Evidence/Radar',
```

and the story file should contain `curatedDevOpsCapabilityRadarScores` but no `getCapabilityEvidenceScores`.

- [ ] **Step 8: Inspect and commit Task 2**

Inspect:

```bash
git diff -- apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.stories.tsx apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.spec.tsx
git status --short
```

Stage explicit paths only:

```bash
git add apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.stories.tsx
git add apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.spec.tsx
git diff --cached
git commit -m "test(github.io): cover curated evidence radar labels"
```

## Task 3: Verify Component Responsiveness And Build

**Files:**
- Verify: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.tsx`
- No code changes expected unless verification finds the current wrapper no longer supports the 10-axis chart.

**Interfaces:**
- Consumes:
  - `DevOpsCapabilityEvidenceRadar({ scores })`
  - `curatedDevOpsCapabilityRadarScores`
- Produces:
  - Verified radar-only implementation passing focused tests and project build

- [ ] **Step 1: Inspect the radar component for scoped behavior**

Run:

```bash
sed -n '1,180p' apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.tsx
```

Confirm the component still:

- filters `scores` with `score.score > 0`;
- returns `null` when no visible scores remain;
- uses `score.label` for metric `name`;
- uses `score.maxScore` for metric `max`;
- renders the MUI chart with `aria-hidden="true"`;
- has a wrapper with `maxWidth: CHART_MAX_WIDTH`, `minWidth: CHART_MIN_WIDTH`, and `width: '100%'`.

- [ ] **Step 2: Run all required validation commands**

Run:

```bash
pnpm nx test github.io -- --run src/app/devops-capability-evidence/devops-capability-evidence-radar.spec.tsx
pnpm nx test github.io -- --run src/app/devops-capability-evidence/devops-capability-evidence.spec.ts
pnpm nx build github.io
```

Expected: all commands PASS. A non-failing `nxViteTsPaths` deprecation warning is acceptable if present.

- [ ] **Step 3: Optionally run Storybook for visual review**

If visual review is needed, run:

```bash
pnpm nx storybook github.io --host 0.0.0.0 --port 6007
```

If Nx prompts for analytics, answer `n`. If Nx writes `"analytics": false` into `nx.json`, remove that side effect before committing unless it was already present before this task.

Expected direct story URL when using the existing Tailscale setup:

```text
http://TAILSCALE_IP:6007/?path=/story/github-io-devops-capability-evidence-radar--default
```

- [ ] **Step 4: Search for accidental scope drift**

Run:

```bash
rg "DevOpsCapabilityEvidenceMatrix|DevOpsCapabilityBarList|DevOpsEvidenceTypeDonut|DevOpsEvidenceTimeline|DevOpsCertificationCapabilityMap|CapabilityEvidence|popover|selector|badge" apps/github.io/src/app/devops-capability-evidence -n
rg "score: 5,|score: 5$" apps/github.io/src/app/devops-capability-evidence -n
```

Expected:

- no active non-radar component matches;
- no curated `score: 5` matches.

The app code may mention `maxScore: 5`, which is allowed.

- [ ] **Step 5: Commit only if Task 3 required code changes**

If Step 1 or Step 2 required changing `devops-capability-evidence-radar.tsx`, inspect, stage, and commit:

```bash
git diff -- apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.tsx
git add apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.tsx
git diff --cached
git commit -m "fix(github.io): keep curated evidence radar responsive"
```

If Task 3 required no code changes, do not create a commit.

## Final Review Checklist

- [ ] `curatedDevOpsCapabilityRadarScores` exists and contains exactly 10 entries.
- [ ] Each curated entry uses the approved short label.
- [ ] Each curated entry has `maxScore: 5`.
- [ ] No curated entry has `score: 5`.
- [ ] Default Storybook story uses the curated scores directly.
- [ ] `DevOpsCapabilityEvidenceRadar` remains radar-only.
- [ ] No evidence item components, popovers, selectors, badges, or route wiring were added.
- [ ] Focused radar tests pass.
- [ ] Focused evidence data/scoring tests pass.
- [ ] `pnpm nx build github.io` passes.
